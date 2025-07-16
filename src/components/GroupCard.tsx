
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, TrendingUp, Calendar, Crown, Percent, DollarSign, UserCheck, CalendarDays, Settings2, UserPlus, FileText, Bell } from "lucide-react";
import ContributionModal from "./ContributionModal";
import GroupSettingsModal from "./GroupSettingsModal";
import GroupMembersManager from "./roles/GroupMembersManager";
import InviteMembersModal from "./InviteMembersModal";
import MembershipRequestsManager from "./MembershipRequestsManager";
import MeetingManagement from "./meetings/MeetingManagement";
import type { Group } from "@/types";

interface GroupCardProps {
  group: Group;
  isSelected: boolean;
  onSelect: () => void;
}

const GroupCard = ({ group, isSelected, onSelect }: GroupCardProps) => {
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [meetingsModalOpen, setMeetingsModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [requestsModalOpen, setRequestsModalOpen] = useState(false);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Ensure role is loaded before showing management buttons
  const hasRole = group.role && group.role !== '';
  const canManageSettings = hasRole && (group.role === 'admin' || group.role === 'treasurer');
  const canManageMembers = hasRole && (group.role === 'admin' || group.role === 'treasurer' || group.role === 'secretary');
  const canManageMeetings = hasRole && (group.role === 'admin' || group.role === 'treasurer' || group.role === 'secretary');
  

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isSelected ? 'ring-2 ring-green-500' : ''
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{group.name}</CardTitle>
          <div className="flex items-center gap-2">
            {group.role === 'admin' && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                <Crown className="h-3 w-3 mr-1" />
                Admin
              </Badge>
            )}
            {group.role === 'treasurer' && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Treasurer
              </Badge>
            )}
          </div>
        </div>
        {group.description && (
          <p className="text-sm text-gray-600">{group.description}</p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">{group.members} members</span>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">{formatCurrency(group.totalSavings)}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">Next: {group.nextContribution}</span>
        </div>

        {/* Customization Info */}
        {(group.minContributionAmount || group.maxContributionAmount || group.loanInterestRate) && (
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 pt-2 border-t">
            {group.minContributionAmount && group.maxContributionAmount && (
              <div className="flex items-center space-x-1">
                <DollarSign className="h-3 w-3" />
                <span>{formatCurrency(group.minContributionAmount)} - {formatCurrency(group.maxContributionAmount)}</span>
              </div>
            )}
            {group.loanInterestRate && (
              <div className="flex items-center space-x-1">
                <Percent className="h-3 w-3" />
                <span>{group.loanInterestRate}% interest</span>
              </div>
            )}
          </div>
        )}
        
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Expected Contribution</span>
            <span className="font-semibold">{formatCurrency(group.contributionAmount)}</span>
          </div>
          
          <div className="space-y-2">
            {/* Management Buttons Row */}
            {!hasRole ? (
              <div className="flex gap-2">
                <div className="h-8 bg-gray-200 animate-pulse rounded flex-1"></div>
                <div className="h-8 bg-gray-200 animate-pulse rounded flex-1"></div>
              </div>
            ) : canManageMembers ? (
              <div className="flex gap-2">
                <Dialog open={membersModalOpen} onOpenChange={setMembersModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1" onClick={(e) => e.stopPropagation()}>
                      <Users className="h-4 w-4 mr-2" />
                      Members
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Member Management - {group.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm">
                              <UserPlus className="h-4 w-4 mr-2" />
                              Invite Members
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <InviteMembersModal groupId={group.id} />
                          </DialogContent>
                        </Dialog>
                        
                        <Dialog open={requestsModalOpen} onOpenChange={setRequestsModalOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Bell className="h-4 w-4 mr-2" />
                              Membership Requests
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Membership Requests</DialogTitle>
                            </DialogHeader>
                            <MembershipRequestsManager groupId={group.id} />
                          </DialogContent>
                        </Dialog>
                      </div>
                      <GroupMembersManager groupId={group.id} groupName={group.name} />
                    </div>
                  </DialogContent>
                </Dialog>
                
                {canManageMeetings && (
                  <Dialog open={meetingsModalOpen} onOpenChange={setMeetingsModalOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1" onClick={(e) => e.stopPropagation()}>
                        <CalendarDays className="h-4 w-4 mr-2" />
                        Meetings
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Meeting Management - {group.name}</DialogTitle>
                      </DialogHeader>
                      <MeetingManagement groupId={group.id} />
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            ) : null}
            
            {/* Contribution and Settings Row */}
            <div className="flex gap-2">
              <div className="flex-1">
                <ContributionModal 
                  groupId={group.id}
                  groupName={group.name}
                  contributionAmount={group.contributionAmount}
                  groups={[group]}
                />
              </div>
              
              {canManageSettings && (
                <GroupSettingsModal 
                  group={group}
                  userRole={group.role}
                  onSettingsUpdate={() => {
                    // Trigger a refresh of group data
                    window.location.reload();
                  }}
                  onGroupDeleted={() => {
                    // Trigger a refresh of group data after deletion
                    window.location.reload();
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupCard;
