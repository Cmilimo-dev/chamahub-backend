import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus, Mail, Phone, Search, CheckCircle, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from '@/lib/api';
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface JoinGroupModalProps {
  onGroupJoined?: () => void;
}

type Step = 'search' | 'contact' | 'form' | 'waiting' | 'success';

interface MembershipForm {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  message?: string;
}

interface Group {
  id: string;
  name: string;
  description: string;
  member_count: number;
}

const JoinGroupModal = ({ onGroupJoined }: JoinGroupModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>('search');
  const [contactMethod, setContactMethod] = useState<'email' | 'phone'>('email');
  const [contactValue, setContactValue] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [membershipForm, setMembershipForm] = useState<MembershipForm>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: ''
  });
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [token, setToken] = useState('');

  // Load available groups
  useEffect(() => {
    if (open && step === 'search') {
      loadGroups();
    }
  }, [open, step]);

  const loadGroups = async () => {
    try {
      const response = await apiClient.get('/groups');
      setGroups(response.data || []);
    } catch (error) {
      console.error('Error loading groups:', error);
      toast({
        title: "Error",
        description: "Failed to load groups. Please try again.",
        variant: "destructive",
      });
    }
  };

  const generateToken = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const handleGroupSelect = (group: Group) => {
    setSelectedGroup(group);
    setStep('contact');
  };

  const handleContactSubmit = async () => {
    if (!contactValue.trim() || !selectedGroup) return;

    setLoading(true);
    try {
      // Generate invitation token
      const invitationToken = generateToken();
      setToken(invitationToken);

      // Create membership request
      const response = await apiClient.post('/membership_requests', {
        group_id: selectedGroup.id,
        email: contactMethod === 'email' ? contactValue : '',
        phone_number: contactMethod === 'phone' ? contactValue : contactValue, // Always store phone
        invitation_token: invitationToken,
        status: 'pending'
      });

      // Send invitation link (simulate - in real app, integrate with SMS/Email service)
      const baseUrl = window.location.origin;
      const invitationLink = `${baseUrl}/join-group?token=${invitationToken}`;
      
      // For demo purposes, we'll show the link
      toast({
        title: "Invitation Sent!",
        description: `An invitation link has been sent to your ${contactMethod}. Check your ${contactMethod === 'email' ? 'email' : 'messages'}.`,
      });

      // Simulate receiving the link by moving to form step
      setTimeout(() => {
        setStep('form');
        // Pre-populate email/phone in form
        if (contactMethod === 'email') {
          setMembershipForm(prev => ({ ...prev, email: contactValue }));
        } else {
          setMembershipForm(prev => ({ ...prev, phoneNumber: contactValue }));
        }
      }, 2000);

    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async () => {
    if (!membershipForm.firstName || !membershipForm.lastName || !membershipForm.phoneNumber || !token) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Update membership request with form data
      const response = await apiClient.put(`/membership_requests/${token}`, {
        first_name: membershipForm.firstName,
        last_name: membershipForm.lastName,
        phone_number: membershipForm.phoneNumber,
        email: membershipForm.email || null,
        form_submitted: true,
        form_submitted_at: new Date().toISOString(),
        user_id: user?.id || null
      });

      // Send notification to group admins
      await notifyGroupAdmins();

      setStep('waiting');
      
      toast({
        title: "Request Submitted!",
        description: "Your membership request has been submitted for approval. You'll be notified once it's reviewed.",
      });

    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const notifyGroupAdmins = async () => {
    if (!selectedGroup) return;

    try {
      // Send notification to group admins via API
      await apiClient.post('/notifications/group-admins', {
        group_id: selectedGroup.id,
        title: 'New Membership Request',
        message: `${membershipForm.firstName} ${membershipForm.lastName} has requested to join ${selectedGroup.name}`,
        notification_type: 'general',
        metadata: {
          membership_request_token: token,
          action_required: true
        }
      });
    } catch (error) {
      console.error('Error notifying admins:', error);
    }
  };

  const resetModal = () => {
    setStep('search');
    setContactValue('');
    setSelectedGroup(null);
    setMembershipForm({
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: ''
    });
    setToken('');
    setSearchTerm('');
  };

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetModal();
    }
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderStepContent = () => {
    switch (step) {
      case 'search':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Search for a group to join</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by group name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredGroups.map((group) => (
                <Card 
                  key={group.id} 
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleGroupSelect(group)}
                >
                  <CardContent className="p-4">
                    <h4 className="font-medium">{group.name}</h4>
                    {group.description && (
                      <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {group.member_count} members
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {filteredGroups.length === 0 && searchTerm && (
              <p className="text-center text-gray-500 py-4">
                No groups found matching "{searchTerm}"
              </p>
            )}
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="font-medium">Join {selectedGroup?.name}</h3>
              <p className="text-sm text-gray-600 mt-1">
                Enter your contact information to receive an invitation link
              </p>
            </div>

            <div className="space-y-3">
              <Label>How would you like to receive the invitation?</Label>
              <Select value={contactMethod} onValueChange={(value: 'email' | 'phone') => setContactMethod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </div>
                  </SelectItem>
                  <SelectItem value="phone">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone (SMS)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Input
                type={contactMethod === 'email' ? 'email' : 'tel'}
                placeholder={contactMethod === 'email' ? 'Enter your email address' : 'Enter your phone number'}
                value={contactValue}
                onChange={(e) => setContactValue(e.target.value)}
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setStep('search')} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={handleContactSubmit} 
                disabled={loading || !contactValue.trim()} 
                className="flex-1"
              >
                {loading ? "Sending..." : "Send Invitation"}
              </Button>
            </div>
          </div>
        );

      case 'form':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-medium">Complete Your Application</h3>
              <p className="text-sm text-gray-600">
                Fill in your details to join {selectedGroup?.name}
              </p>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>First Name *</Label>
                  <Input
                    value={membershipForm.firstName}
                    onChange={(e) => setMembershipForm(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="First name"
                    required
                  />
                </div>
                <div>
                  <Label>Last Name *</Label>
                  <Input
                    value={membershipForm.lastName}
                    onChange={(e) => setMembershipForm(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Last name"
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Phone Number *</Label>
                <Input
                  type="tel"
                  value={membershipForm.phoneNumber}
                  onChange={(e) => setMembershipForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  placeholder="Your phone number"
                  required
                />
              </div>

              <div>
                <Label>Email (Optional)</Label>
                <Input
                  type="email"
                  value={membershipForm.email}
                  onChange={(e) => setMembershipForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Your email address"
                />
              </div>

              <div>
                <Label>Message (Optional)</Label>
                <Textarea
                  value={membershipForm.message}
                  onChange={(e) => setMembershipForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Why do you want to join this group?"
                  rows={3}
                />
              </div>
            </div>

            <Button 
              onClick={handleFormSubmit} 
              disabled={loading || !membershipForm.firstName || !membershipForm.lastName || !membershipForm.phoneNumber}
              className="w-full"
            >
              {loading ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        );

      case 'waiting':
        return (
          <div className="text-center space-y-4">
            <Clock className="h-12 w-12 text-yellow-500 mx-auto" />
            <div>
              <h3 className="font-medium">Application Submitted</h3>
              <p className="text-sm text-gray-600 mt-2">
                Your request to join <strong>{selectedGroup?.name}</strong> has been sent to the group administrators.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                You'll receive a notification once your application is reviewed. This usually takes 1-3 business days.
              </p>
            </div>
            <Button onClick={() => handleClose(false)} className="w-full">
              Close
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Join Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {step === 'search' && 'Join a Chama Group'}
            {step === 'contact' && 'Request Invitation'}
            {step === 'form' && 'Complete Application'}
            {step === 'waiting' && 'Application Status'}
          </DialogTitle>
        </DialogHeader>
        {renderStepContent()}
      </DialogContent>
    </Dialog>
  );
};

export default JoinGroupModal;
