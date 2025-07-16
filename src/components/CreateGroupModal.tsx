import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, UserPlus, Mail, Phone, X, Send, Copy, CheckCircle, ArrowLeft, ArrowRight, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from '@/lib/api';
import { useToast } from "@/hooks/use-toast";

interface CreateGroupModalProps {
  onGroupCreated?: () => void;
}

interface GroupFormData {
  name: string;
  description: string;
  contributionAmount: string;
  contributionFrequency: string;
  meetingDay: string;
  meetingTime: string;
  groupRules: string;
  termsAndConditions: string;
}

interface MemberInvite {
  id: string;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  role: 'member' | 'treasurer' | 'secretary';
  inviteMethod: 'email' | 'phone' | 'both';
}

type Step = 'group-details' | 'member-invites' | 'review' | 'success';

const CreateGroupModal = ({ onGroupCreated }: CreateGroupModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>('group-details');
  const [createdGroupId, setCreatedGroupId] = useState<string>('');

  const [formData, setFormData] = useState<GroupFormData>({
    name: "",
    description: "",
    contributionAmount: "",
    contributionFrequency: "monthly",
    meetingDay: "",
    meetingTime: "",
    groupRules: "",
    termsAndConditions: ""
  });

  const [memberInvites, setMemberInvites] = useState<MemberInvite[]>([]);
  const [newMember, setNewMember] = useState<Partial<MemberInvite>>({
    email: "",
    phoneNumber: "",
    firstName: "",
    lastName: "",
    role: "member",
    inviteMethod: "email"
  });

  const generateInviteId = () => Math.random().toString(36).substring(2, 15);

  const addMemberInvite = () => {
    if (!newMember.email && !newMember.phoneNumber) {
      toast({
        title: "Error",
        description: "Please provide at least an email or phone number",
        variant: "destructive",
      });
      return;
    }

    const invite: MemberInvite = {
      id: generateInviteId(),
      email: newMember.email || "",
      phoneNumber: newMember.phoneNumber || "",
      firstName: newMember.firstName || "",
      lastName: newMember.lastName || "",
      role: newMember.role || "member",
      inviteMethod: newMember.inviteMethod || "email"
    };

    setMemberInvites([...memberInvites, invite]);
    setNewMember({
      email: "",
      phoneNumber: "",
      firstName: "",
      lastName: "",
      role: "member",
      inviteMethod: "email"
    });

    toast({
      title: "Member Added",
      description: "Member invite has been added to the list",
    });
  };

  const removeMemberInvite = (id: string) => {
    setMemberInvites(memberInvites.filter(m => m.id !== id));
  };

  const generateInvitationToken = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const createGroupWithMembers = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Step 1: Create the group
      const group = await apiClient.post('/groups', {
        name: formData.name,
        description: formData.description,
        contribution_amount: parseFloat(formData.contributionAmount) || 0,
        contribution_frequency: formData.contributionFrequency,
        meeting_day: formData.meetingDay || null,
        meeting_time: formData.meetingTime || null,
        created_by: user.id,
        // Add default values for required fields
        min_contribution_amount: 0,
        max_contribution_amount: null,
        loan_interest_rate: 5.0,
        max_loan_multiplier: 3.0,
        allow_partial_contributions: false,
        contribution_grace_period_days: 0,
        group_rules: {
          rules: formData.groupRules,
          terms_and_conditions: formData.termsAndConditions
        }
      });

      if (!group.success) {
        throw new Error(group.message || 'Failed to create group');
      }

      setCreatedGroupId(group.id);

      // Step 2: Create member invitations
      if (memberInvites.length > 0) {
        const invitationPromises = memberInvites.map(async (member) => {
          const token = generateInvitationToken();
          
          // Create membership request with pending status
          const response = await apiClient.post('/membership_requests', {
            group_id: group.id,
            email: member.email,
            phone_number: member.phoneNumber,
            first_name: member.firstName,
            last_name: member.lastName,
            invitation_token: token,
            status: 'invited', // New status for admin-invited members
            invited_by: user.id,
            invited_role: member.role,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
          });
          
          // Return the member with the token for later use
          return { ...member, token };
        });

        const membersWithTokens = await Promise.all(invitationPromises);

        // Send notifications to invited members
        await sendMemberInvitations(group.id, formData.name, membersWithTokens);
      }

      setCurrentStep('success');

      toast({
        title: "Success!",
        description: `Group "${formData.name}" created successfully with ${memberInvites.length} member invitations sent.`,
      });

    } catch (error: any) {
      console.error('Error creating group:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create group",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMemberInvitations = async (groupId: string, groupName: string, membersWithTokens: any[]) => {
    try {
      const baseUrl = window.location.origin;
      
      for (const member of membersWithTokens) {
        const invitationLink = `${baseUrl}/accept-invitation?token=${member.token}`;
        
        // Send email invitation if email is provided
        if (member.email && (member.inviteMethod === 'email' || member.inviteMethod === 'both')) {
          try {
            await apiClient.post('/invitations/send', {
              type: 'email',
              to: member.email,
              invitationLink,
              groupId,
              groupName,
            });
            console.log(`Email invitation sent to ${member.email}`);
          } catch (emailError) {
            console.error(`Failed to send email to ${member.email}:`, emailError);
          }
        }
        
        // Send SMS invitation if phone number is provided
        if (member.phoneNumber && (member.inviteMethod === 'phone' || member.inviteMethod === 'both')) {
          try {
            await apiClient.post('/invitations/send', {
              type: 'sms',
              to: member.phoneNumber,
              invitationLink,
              groupId,
              groupName,
            });
            console.log(`SMS invitation sent to ${member.phoneNumber}`);
          } catch (smsError) {
            console.error(`Failed to send SMS to ${member.phoneNumber}:`, smsError);
          }
        }
      }

      toast({
        title: "Invitations Sent",
        description: "Invitation messages have been sent to all members",
      });

    } catch (error) {
      console.error('Error sending invitations:', error);
      toast({
        title: "Error",
        description: "Failed to send some invitations",
        variant: "destructive",
      });
    }
  };

  const nextStep = () => {
    if (currentStep === 'group-details' && !formData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a group name",
        variant: "destructive",
      });
      return;
    }
    
    if (currentStep === 'group-details') setCurrentStep('member-invites');
    else if (currentStep === 'member-invites') setCurrentStep('review');
    else if (currentStep === 'review') createGroupWithMembers();
  };

  const prevStep = () => {
    if (currentStep === 'member-invites') setCurrentStep('group-details');
    else if (currentStep === 'review') setCurrentStep('member-invites');
  };

  const resetModal = () => {
    setCurrentStep('group-details');
    setFormData({
      name: "",
      description: "",
      contributionAmount: "",
      contributionFrequency: "monthly",
      meetingDay: "",
      meetingTime: "",
      groupRules: "",
      termsAndConditions: ""
    });
    setMemberInvites([]);
    setNewMember({
      email: "",
      phoneNumber: "",
      firstName: "",
      lastName: "",
      role: "member",
      inviteMethod: "email"
    });
    setCreatedGroupId('');
  };

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen && currentStep !== 'success') {
      resetModal();
    }
  };

  const handleSuccess = () => {
    resetModal();
    setOpen(false);
    if (onGroupCreated) {
      onGroupCreated();
    }
  };

  const copyInvitationLink = async (token: string) => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/accept-invitation?token=${token}`;
    
    try {
      await navigator.clipboard.writeText(link);
      toast({
        title: "Copied!",
        description: "Invitation link copied to clipboard",
      });
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'group-details':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Group Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter group name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the group"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contributionAmount">Contribution Amount (KES)</Label>
                <Input
                  id="contributionAmount"
                  type="number"
                  value={formData.contributionAmount}
                  onChange={(e) => setFormData({ ...formData, contributionAmount: e.target.value })}
                  placeholder="1000"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contributionFrequency">Frequency</Label>
                <Select
                  value={formData.contributionFrequency}
                  onValueChange={(value) => setFormData({ ...formData, contributionFrequency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="meetingDay">Meeting Day</Label>
                <Select
                  value={formData.meetingDay}
                  onValueChange={(value) => setFormData({ ...formData, meetingDay: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monday">Monday</SelectItem>
                    <SelectItem value="tuesday">Tuesday</SelectItem>
                    <SelectItem value="wednesday">Wednesday</SelectItem>
                    <SelectItem value="thursday">Thursday</SelectItem>
                    <SelectItem value="friday">Friday</SelectItem>
                    <SelectItem value="saturday">Saturday</SelectItem>
                    <SelectItem value="sunday">Sunday</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meetingTime">Meeting Time</Label>
                <Input
                  id="meetingTime"
                  type="time"
                  value={formData.meetingTime}
                  onChange={(e) => setFormData({ ...formData, meetingTime: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="groupRules">Group Rules</Label>
              <Textarea
                id="groupRules"
                value={formData.groupRules}
                onChange={(e) => setFormData({ ...formData, groupRules: e.target.value })}
                placeholder="Enter group rules and guidelines..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="termsAndConditions">Terms and Conditions</Label>
              <Textarea
                id="termsAndConditions"
                value={formData.termsAndConditions}
                onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
                placeholder="Enter terms and conditions for membership..."
                rows={3}
              />
            </div>
          </div>
        );

      case 'member-invites':
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="font-medium">Invite Members</h3>
              <p className="text-sm text-gray-600">Add members who will receive invitation links to join the group</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Add New Member</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>First Name</Label>
                    <Input
                      value={newMember.firstName}
                      onChange={(e) => setNewMember({ ...newMember, firstName: e.target.value })}
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input
                      value={newMember.lastName}
                      onChange={(e) => setNewMember({ ...newMember, lastName: e.target.value })}
                      placeholder="Last name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={newMember.email}
                      onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <Input
                      type="tel"
                      value={newMember.phoneNumber}
                      onChange={(e) => setNewMember({ ...newMember, phoneNumber: e.target.value })}
                      placeholder="254712345678"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Role</Label>
                    <Select
                      value={newMember.role}
                      onValueChange={(value: 'member' | 'treasurer' | 'secretary') => 
                        setNewMember({ ...newMember, role: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="treasurer">Treasurer</SelectItem>
                        <SelectItem value="secretary">Secretary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Invite Method</Label>
                    <Select
                      value={newMember.inviteMethod}
                      onValueChange={(value: 'email' | 'phone' | 'both') => 
                        setNewMember({ ...newMember, inviteMethod: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">SMS</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={addMemberInvite} className="w-full">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </CardContent>
            </Card>

            {memberInvites.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Members to Invite ({memberInvites.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {memberInvites.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-medium">
                            {member.firstName} {member.lastName} 
                            <Badge variant="secondary" className="ml-2">{member.role}</Badge>
                          </div>
                          <div className="text-sm text-gray-600 flex gap-4">
                            {member.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {member.email}
                              </span>
                            )}
                            {member.phoneNumber && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {member.phoneNumber}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMemberInvite(member.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'review':
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="font-medium">Review and Create</h3>
              <p className="text-sm text-gray-600">Review your group details and member invitations</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Group Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div><strong>Name:</strong> {formData.name}</div>
                {formData.description && <div><strong>Description:</strong> {formData.description}</div>}
                {formData.contributionAmount && (
                  <div><strong>Contribution:</strong> KES {parseFloat(formData.contributionAmount).toLocaleString()} ({formData.contributionFrequency})</div>
                )}
                {formData.meetingDay && formData.meetingTime && (
                  <div><strong>Meetings:</strong> {formData.meetingDay}s at {formData.meetingTime}</div>
                )}
              </CardContent>
            </Card>

            {memberInvites.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Member Invitations ({memberInvites.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {memberInvites.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <span className="font-medium">{member.firstName} {member.lastName}</span>
                          <Badge variant="secondary" className="ml-2">{member.role}</Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          {member.inviteMethod === 'email' && <Mail className="h-4 w-4" />}
                          {member.inviteMethod === 'phone' && <Phone className="h-4 w-4" />}
                          {member.inviteMethod === 'both' && (
                            <div className="flex gap-1">
                              <Mail className="h-4 w-4" />
                              <Phone className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-400">
              <p className="text-sm text-blue-800">
                <strong>What happens next:</strong>
              </p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• Your group will be created with you as the admin</li>
                <li>• Invitation links will be sent to all invited members</li>
                <li>• Members must accept the invitation to become active</li>
                <li>• You can manage membership requests from your group dashboard</li>
              </ul>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <div>
              <h3 className="font-medium text-xl">Group Created Successfully!</h3>
              <p className="text-gray-600 mt-2">
                "{formData.name}" has been created with {memberInvites.length} member invitations sent.
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded border-l-4 border-green-400">
              <p className="text-sm text-green-800">
                <strong>Next Steps:</strong>
              </p>
              <ul className="text-sm text-green-700 mt-2 space-y-1">
                <li>• Check your group dashboard to see pending invitations</li>
                <li>• Members will receive invitation links via their preferred method</li>
                <li>• You can send additional invitations anytime from the group settings</li>
                <li>• Approve or reject membership requests as they come in</li>
              </ul>
            </div>

            <Button onClick={handleSuccess} className="w-full">
              <Users className="h-4 w-4 mr-2" />
              Go to Group Dashboard
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
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {currentStep === 'group-details' && 'Create New Chama Group'}
            {currentStep === 'member-invites' && 'Invite Members'}
            {currentStep === 'review' && 'Review and Create'}
            {currentStep === 'success' && 'Group Created!'}
          </DialogTitle>
        </DialogHeader>

        {renderStepContent()}

        {currentStep !== 'success' && (
          <div className="flex gap-3 pt-4">
            {currentStep !== 'group-details' && (
              <Button variant="outline" onClick={prevStep} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
            )}
            {currentStep === 'group-details' && (
              <Button variant="outline" onClick={() => handleClose(false)} className="flex-1">
                Cancel
              </Button>
            )}
            <Button 
              onClick={nextStep} 
              disabled={loading} 
              className="flex-1"
            >
              {currentStep === 'review' ? (
                loading ? "Creating..." : "Create Group"
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupModal;
