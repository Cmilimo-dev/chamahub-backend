
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, DollarSign, Users, BookOpen, AlertCircle, Edit2, Trash2 } from 'lucide-react';
import { useGroupCustomization } from '@/hooks/useGroupCustomization';

// Check if group delete endpoint exists using sessionStorage
const checkGroupDeleteEndpointExists = () => {
  const stored = sessionStorage.getItem('groupDeleteEndpointExists');
  return stored === null ? true : stored === 'true';
};

const setGroupDeleteEndpointExists = (exists: boolean) => {
  sessionStorage.setItem('groupDeleteEndpointExists', exists.toString());
};
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import type { Group } from '@/types';

interface GroupSettingsModalProps {
  group: Group;
  userRole: string;
  onSettingsUpdate?: () => void;
  onGroupDeleted?: () => void;
}

const GroupSettingsModal = ({ group, userRole, onSettingsUpdate, onGroupDeleted }: GroupSettingsModalProps) => {
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: group.name || '',
    description: group.description || '',
    minContributionAmount: group.minContributionAmount || 0,
    maxContributionAmount: group.maxContributionAmount || group.contributionAmount * 2,
    loanInterestRate: group.loanInterestRate || 5.0,
    maxLoanMultiplier: group.maxLoanMultiplier || 3.0,
    allowPartialContributions: group.allowPartialContributions || false,
    contributionGracePeriodDays: group.contributionGracePeriodDays || 0,
    groupRules: group.groupRules || {}
  });
  const [customRules, setCustomRules] = useState('');

  const { updateGroupSettings, loading, error } = useGroupCustomization(group.id);
  const { toast } = useToast();

  const canEditSettings = userRole === 'admin' || userRole === 'treasurer';
  const canDeleteGroup = userRole === 'admin';

  useEffect(() => {
    if (group.groupRules && typeof group.groupRules === 'object') {
      setCustomRules(JSON.stringify(group.groupRules, null, 2));
    }
  }, [group.groupRules]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canEditSettings) {
      toast({
        title: "Permission Denied",
        description: "Only admins and treasurers can modify group settings.",
        variant: "destructive"
      });
      return;
    }

    try {
      let parsedRules = {};
      if (customRules.trim()) {
        parsedRules = JSON.parse(customRules);
      }

      // Update group basic info if in edit mode
      if (editMode) {
        try {
          await apiClient.put(`/groups/${group.id}`, {
            name: formData.name,
            description: formData.description,
            updated_at: new Date().toISOString()
          });
        } catch (updateError: any) {
          if (updateError.message.includes('404')) {
            toast({
              title: "Update Not Supported",
              description: "Group information update is not available on this server. Only settings can be modified.",
              variant: "destructive"
            });
            return;
          } else {
            throw updateError;
          }
        }
      }

      const success = await updateGroupSettings({
        ...formData,
        groupRules: parsedRules
      });

      if (success) {
        toast({
          title: editMode ? "Group Updated" : "Settings Updated",
          description: editMode ? "Group information and settings have been successfully updated." : "Group settings have been successfully updated.",
        });
        onSettingsUpdate?.();
        setEditMode(false);
        setOpen(false);
      }
    } catch (parseError) {
      toast({
        title: "Invalid JSON",
        description: "Please check your custom rules format.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteGroup = async () => {
    if (!canDeleteGroup) {
      toast({
        title: "Permission Denied",
        description: "Only group admins can delete groups.",
        variant: "destructive"
      });
      return;
    }

    setDeleteLoading(true);
    try {
      if (!checkGroupDeleteEndpointExists()) {
        toast({
          title: "Delete Not Supported",
          description: "Group deletion is not available on this server. Please contact your administrator.",
          variant: "destructive"
        });
        return;
      }

      await apiClient.delete(`/groups/${group.id}`);
      toast({
        title: "Group Deleted",
        description: "The group has been successfully deleted.",
      });
      onGroupDeleted?.();
      setOpen(false);
    } catch (error: any) {
      console.error('Error deleting group:', error);
      
      if (error.message.includes('404')) {
        console.warn('Delete endpoint not found, disabling future calls');
        setGroupDeleteEndpointExists(false);
        toast({
          title: "Delete Not Supported",
          description: "Group deletion is not available on this server. Please contact your administrator.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Delete Failed",
          description: "Failed to delete the group. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const resetToDefaults = () => {
    setFormData({
      name: group.name || '',
      description: group.description || '',
      minContributionAmount: group.contributionAmount * 0.5,
      maxContributionAmount: group.contributionAmount * 2,
      loanInterestRate: 5.0,
      maxLoanMultiplier: 3.0,
      allowPartialContributions: false,
      contributionGracePeriodDays: 0,
      groupRules: {}
    });
    setCustomRules('{}');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Group Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {group.name} - Settings
            </div>
            <div className="flex items-center gap-2">
              {canEditSettings && (
                <Button
                  variant={editMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEditMode(!editMode)}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  {editMode ? "Cancel Edit" : "Edit Group"}
                </Button>
              )}
              {canDeleteGroup && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Group</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{group.name}"? This action cannot be undone.
                        All group data, contributions, and member information will be permanently removed.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteGroup}
                        disabled={deleteLoading}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {deleteLoading ? "Deleting..." : "Delete Group"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        {!canEditSettings && (
          <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <p className="text-sm text-yellow-700">
              You can view settings but cannot modify them. Only admins and treasurers can make changes.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue={editMode ? "basic" : "contributions"} className="w-full">
            <TabsList className={`grid w-full ${editMode ? 'grid-cols-4' : 'grid-cols-3'}`}>
              {editMode && <TabsTrigger value="basic">Basic Info</TabsTrigger>}
              <TabsTrigger value="contributions">Contributions</TabsTrigger>
              <TabsTrigger value="loans">Loans</TabsTrigger>
              <TabsTrigger value="rules">Rules</TabsTrigger>
            </TabsList>

            {editMode && (
              <TabsContent value="basic" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Edit2 className="h-4 w-4" />
                      Basic Information
                    </CardTitle>
                    <CardDescription>
                      Update the group's basic information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="groupName">Group Name</Label>
                      <Input
                        id="groupName"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          name: e.target.value
                        }))}
                        disabled={!canEditSettings}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="groupDescription">Description</Label>
                      <Textarea
                        id="groupDescription"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          description: e.target.value
                        }))}
                        placeholder="Enter group description..."
                        disabled={!canEditSettings}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            <TabsContent value="contributions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Contribution Settings
                  </CardTitle>
                  <CardDescription>
                    Customize how contributions work in your group
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minContribution">Minimum Contribution (KES)</Label>
                      <Input
                        id="minContribution"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.minContributionAmount}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          minContributionAmount: parseFloat(e.target.value) || 0
                        }))}
                        disabled={!canEditSettings}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxContribution">Maximum Contribution (KES)</Label>
                      <Input
                        id="maxContribution"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.maxContributionAmount}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          maxContributionAmount: parseFloat(e.target.value) || 0
                        }))}
                        disabled={!canEditSettings}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gracePeriod">Grace Period (Days)</Label>
                    <Input
                      id="gracePeriod"
                      type="number"
                      min="0"
                      value={formData.contributionGracePeriodDays}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        contributionGracePeriodDays: parseInt(e.target.value) || 0
                      }))}
                      disabled={!canEditSettings}
                    />
                    <p className="text-sm text-gray-500">
                      Number of days after due date before late fees apply
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="partialContributions"
                      checked={formData.allowPartialContributions}
                      onCheckedChange={(checked) => setFormData(prev => ({
                        ...prev,
                        allowPartialContributions: checked
                      }))}
                      disabled={!canEditSettings}
                    />
                    <Label htmlFor="partialContributions">Allow Partial Contributions</Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="loans" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Loan Settings
                  </CardTitle>
                  <CardDescription>
                    Configure loan terms and eligibility
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="interestRate">Interest Rate (%)</Label>
                      <Input
                        id="interestRate"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={formData.loanInterestRate}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          loanInterestRate: parseFloat(e.target.value) || 0
                        }))}
                        disabled={!canEditSettings}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="loanMultiplier">Max Loan Multiplier</Label>
                      <Input
                        id="loanMultiplier"
                        type="number"
                        min="0"
                        step="0.1"
                        value={formData.maxLoanMultiplier}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          maxLoanMultiplier: parseFloat(e.target.value) || 0
                        }))}
                        disabled={!canEditSettings}
                      />
                      <p className="text-sm text-gray-500">
                        Maximum loan as multiple of total contributions
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rules" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Custom Rules
                  </CardTitle>
                  <CardDescription>
                    Define custom rules and policies for your group
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customRules">Custom Rules (JSON)</Label>
                    <Textarea
                      id="customRules"
                      value={customRules}
                      onChange={(e) => setCustomRules(e.target.value)}
                      placeholder='{"attendance_required": true, "late_fee": 50, "meeting_frequency": "weekly"}'
                      className="min-h-[200px] font-mono text-sm"
                      disabled={!canEditSettings}
                    />
                    <p className="text-sm text-gray-500">
                      Define custom rules in JSON format. These can be used for advanced group policies.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {error && (
            <div className="text-red-600 text-sm mt-2">
              Error: {error}
            </div>
          )}

          {canEditSettings && (
            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={resetToDefaults}>
                Reset to Defaults
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : (editMode ? "Update Group" : "Save Settings")}
                </Button>
              </div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GroupSettingsModal;
