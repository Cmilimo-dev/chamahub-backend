import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, AlertCircle, Clock, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from '@/lib/api';
import { useToast } from "@/hooks/use-toast";

interface InvitationData {
  id: string;
  group_id: string;
  email: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  invitation_token: string;
  status: string;
  invited_role: string;
  expires_at: string;
  group: {
    name: string;
    description: string;
    group_rules: any;
  };
}

interface AcceptanceForm {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  acceptTerms: boolean;
  acceptRules: boolean;
  message: string;
}

const AcceptInvitationPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [error, setError] = useState<string>('');
  const [status, setStatus] = useState<'loading' | 'found' | 'expired' | 'accepted' | 'error'>('loading');

  const [form, setForm] = useState<AcceptanceForm>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    acceptTerms: false,
    acceptRules: false,
    message: ''
  });

  useEffect(() => {
    if (token) {
      loadInvitation();
    } else {
      setStatus('error');
      setError('Invalid invitation link');
    }
  }, [token]);

  const loadInvitation = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const data = await apiClient.get(`/invitations/${token}`);

      if (!data) {
        setStatus('error');
        setError('Invitation not found or invalid');
        return;
      }

      // Check if invitation is expired
      if (new Date(data.expires_at) < new Date()) {
        setStatus('expired');
        setError('This invitation has expired');
        return;
      }

      // Check if already accepted
      if (data.status === 'approved') {
        setStatus('accepted');
        setError('This invitation has already been accepted');
        return;
      }

      setInvitation(data);
      
      // Pre-populate form with invitation data
      setForm(prev => ({
        ...prev,
        firstName: data.first_name || '',
        lastName: data.last_name || '',
        phoneNumber: data.phone_number || '',
        email: data.email || ''
      }));

      setStatus('found');
    } catch (error: any) {
      console.error('Error loading invitation:', error);
      setStatus('error');
      setError('Failed to load invitation details');
    } finally {
      setLoading(false);
    }
  };

  const acceptInvitation = async () => {
    if (!invitation || !user) return;

    // Validate form
    if (!form.firstName || !form.lastName || !form.phoneNumber) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!form.acceptTerms || !form.acceptRules) {
      toast({
        title: "Error",
        description: "Please accept the terms and conditions and group rules",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      // Accept invitation via API
      await apiClient.post(`/invitations/${invitation.id}/accept`, {
        first_name: form.firstName,
        last_name: form.lastName,
        phone_number: form.phoneNumber,
        email: form.email || null,
        message: form.message || null,
        user_id: user.id
      });

      toast({
        title: "Success!",
        description: "Your invitation has been accepted successfully",
      });

      setStatus('accepted');

    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to accept invitation",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatExpiryDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p>Loading invitation details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'error' || status === 'expired' || status === 'accepted') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            {status === 'error' && <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />}
            {status === 'expired' && <Clock className="h-12 w-12 text-yellow-500 mx-auto mb-4" />}
            {status === 'accepted' && <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />}
            
            <h3 className="font-medium text-lg mb-2">
              {status === 'error' && 'Invitation Error'}
              {status === 'expired' && 'Invitation Expired'}
              {status === 'accepted' && 'Invitation Accepted'}
            </h3>
            
            <p className="text-gray-600 mb-4">{error}</p>
            
            <Button onClick={() => window.location.href = '/'}>
              Go to ChamaHub
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <Card>
          <CardHeader className="text-center">
            <Users className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl">Join {invitation.group.name}</CardTitle>
            <p className="text-gray-600">
              You've been invited to join this Chama group
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Group Information */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">About this group</h4>
                {invitation.group.description && (
                  <p className="text-sm text-gray-700 mb-3">{invitation.group.description}</p>
                )}
                <div className="text-sm">
                  <p><strong>Role:</strong> {invitation.invited_role || 'Member'}</p>
                  <p><strong>Invitation expires:</strong> {formatExpiryDate(invitation.expires_at)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Membership Form */}
            <div className="space-y-4">
              <h4 className="font-medium">Complete your membership details</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name *</Label>
                  <Input
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    placeholder="First name"
                    required
                  />
                </div>
                <div>
                  <Label>Last Name *</Label>
                  <Input
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    placeholder="Last name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Phone Number *</Label>
                  <Input
                    type="tel"
                    value={form.phoneNumber}
                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                    placeholder="254712345678"
                    required
                  />
                </div>
                <div>
                  <Label>Email (Optional)</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div>
                <Label>Message (Optional)</Label>
                <Textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Introduce yourself to the group..."
                  rows={3}
                />
              </div>
            </div>

            {/* Group Rules */}
            {invitation.group.group_rules && (
              <Card className="bg-yellow-50 border-yellow-200">
                <CardHeader>
                  <CardTitle className="text-base">Group Rules</CardTitle>
                </CardHeader>
                <CardContent>
                  {invitation.group.group_rules.rules && (
                    <div className="mb-4">
                      <h5 className="font-medium mb-2">Rules:</h5>
                      <p className="text-sm text-gray-700">{invitation.group.group_rules.rules}</p>
                    </div>
                  )}
                  
                  {invitation.group.group_rules.terms_and_conditions && (
                    <div>
                      <h5 className="font-medium mb-2">Terms and Conditions:</h5>
                      <p className="text-sm text-gray-700">{invitation.group.group_rules.terms_and_conditions}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Acceptance Checkboxes */}
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="acceptRules"
                  checked={form.acceptRules}
                  onCheckedChange={(checked) => setForm({ ...form, acceptRules: !!checked })}
                />
                <label htmlFor="acceptRules" className="text-sm leading-relaxed">
                  I have read and agree to the group rules and guidelines
                </label>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="acceptTerms"
                  checked={form.acceptTerms}
                  onCheckedChange={(checked) => setForm({ ...form, acceptTerms: !!checked })}
                />
                <label htmlFor="acceptTerms" className="text-sm leading-relaxed">
                  I agree to the terms and conditions of membership and understand my responsibilities as a member
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="flex-1"
              >
                Decline
              </Button>
              <Button
                onClick={acceptInvitation}
                disabled={submitting || !form.acceptTerms || !form.acceptRules}
                className="flex-1"
              >
                {submitting ? "Accepting..." : "Accept Invitation"}
              </Button>
            </div>

            <div className="text-center text-sm text-gray-500">
              By accepting this invitation, you agree to join {invitation.group.name} and participate according to the group's rules and guidelines.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AcceptInvitationPage;
