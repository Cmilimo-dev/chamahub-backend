import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Clock, User, Mail, Phone, MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from '@/lib/api';
import { useToast } from "@/hooks/use-toast";

interface MembershipRequest {
  id: string;
  group_id: string;
  email: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  invitation_token: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  requested_at: string;
  form_submitted: boolean;
  message?: string;
  group: {
    name: string;
  };
}

interface MembershipRequestsManagerProps {
  groupId?: string;
}

const MembershipRequestsManager = ({ groupId }: MembershipRequestsManagerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<MembershipRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<MembershipRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  useEffect(() => {
    loadMembershipRequests();
  }, [groupId]);

  const loadMembershipRequests = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // TODO: Implement with MySQL backend API
      setRequests([]);
    } catch (error) {
      console.error('Error loading membership requests:', error);
      toast({
        title: "Error",
        description: "Failed to load membership requests.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request: MembershipRequest) => {
    if (!user) return;

    setActionLoading(request.id);
    try {
      // TODO: Implement with MySQL backend API
      console.log("Approving membership request", request.id);
      
      toast({
        title: "Request Approved",
        description: `${request.first_name} ${request.last_name} has been approved and added to the group.`,
      });

      // Refresh requests
      loadMembershipRequests();

    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: "Error",
        description: "Failed to approve membership request.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !user) return;

    setActionLoading(selectedRequest.id);
    try {
      // TODO: Implement with MySQL backend
      console.log("Rejecting membership request", selectedRequest.id);

      toast({
        title: "Request Rejected",
        description: `Membership request from ${selectedRequest.first_name} ${selectedRequest.last_name} has been rejected.`,
      });

      // Refresh requests and close dialog
      loadMembershipRequests();
      setShowRejectDialog(false);
      setSelectedRequest(null);
      setRejectionReason("");

    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: "Error",
        description: "Failed to reject membership request.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Membership Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No pending membership requests</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Membership Requests
            <Badge variant="secondary">{requests.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id} className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {getInitials(request.first_name, request.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <h4 className="font-medium">
                        {request.first_name} {request.last_name}
                      </h4>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {request.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {request.phone_number}
                        </div>
                      </div>
                      
                      {!groupId && (
                        <p className="text-sm text-gray-500 mt-1">
                          Group: {request.group.name}
                        </p>
                      )}
                      
                      <p className="text-xs text-gray-400 mt-1">
                        Requested on {formatDate(request.requested_at)}
                      </p>

                      {request.message && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                          <div className="flex items-center gap-1 mb-1">
                            <MessageSquare className="h-3 w-3" />
                            <span className="font-medium">Message:</span>
                          </div>
                          <p className="text-gray-600">{request.message}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 border-green-600 hover:bg-green-50"
                      onClick={() => handleApprove(request)}
                      disabled={actionLoading === request.id}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowRejectDialog(true);
                      }}
                      disabled={actionLoading === request.id}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Rejection Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Membership Request</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p>
              Are you sure you want to reject the membership request from{" "}
              <strong>
                {selectedRequest?.first_name} {selectedRequest?.last_name}
              </strong>
              ?
            </p>
            
            <div className="space-y-2">
              <Label>Reason for rejection (optional)</Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Provide a reason for rejection..."
                rows={3}
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false);
                  setSelectedRequest(null);
                  setRejectionReason("");
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={actionLoading === selectedRequest?.id}
                className="flex-1"
              >
                {actionLoading === selectedRequest?.id ? "Rejecting..." : "Reject Request"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MembershipRequestsManager;
