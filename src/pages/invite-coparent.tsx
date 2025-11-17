// pages/coparent/InviteCoParent.tsx (or wherever)
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import InviteCoParentDialog from "@/components/dialog/InviteCoParentDialog";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Mail, Clock, CheckCircle, XCircle, Copy, Users, Trash2, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { InvitationResponse, CoParentRelationship } from "@/utils/schema/relationship";
import Loading from "@/components/Loading.tsx";

export default function InviteCoParent() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Fetch sent invitations
  const { data: invitations = [] } = useQuery<InvitationResponse[]>({
    queryKey: ["/api/invitations/sent"],
    enabled: isAuthenticated,
  });

  // Fetch received invitations
  const { data: receivedInvitations = [] } = useQuery<InvitationResponse[]>({
    queryKey: ["/api/invitations/received"],
    enabled: isAuthenticated,
  });

  // Fetch co-parent relationships
  const { data: relationships = [] } = useQuery<CoParentRelationship[]>({
    queryKey: ["/api/coparent/relationships"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    setIsConnected(false);
  }, [isAuthenticated]);

  // Delete invitation
  const deleteInvitationMutation = useMutation({
    mutationFn: async (invitationId: number) => {
      return await apiRequest("DELETE", `/api/invitations/${invitationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invitations/sent"] });
      toast({ title: "Invitation deleted", description: "The invitation has been removed successfully." });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: "Failed to delete invitation. Please try again.", variant: "destructive" });
    },
  });

  // Resend invitation
  const resendInvitationMutation = useMutation({
    mutationFn: async (invitationId: number) => {
      return await apiRequest("POST", `/api/invitations/invite/${invitationId}/resend`);
    },
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/invitations/sent"] });
      if (response?.emailSent) {
        toast({ title: "Invitation resent!", description: "The invitation email has been resent successfully." });
      } else {
        toast({ title: "Resend failed", description: "Could not resend invitation email. Please check your email settings.", variant: "destructive" });
      }
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: "Failed to resend invitation. Please try again.", variant: "destructive" });
    },
  });

  const copyInviteLink = (inviteUrl: string) => {
    navigator.clipboard.writeText(inviteUrl);
    toast({ title: "Link copied", description: "Invitation link copied to clipboard." });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "accepted":
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" />Accepted</Badge>;
      case "declined":
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="w-3 h-3 mr-1" />Declined</Badge>;
      case "expired":
        return <Badge variant="outline" className="text-gray-600 border-gray-600">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading || !isAuthenticated) {
    return <Loading message="Getting things ready" />;
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Co-Parent Invitations</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-gray-600">Invite your co-parent to join LiaiZen for coordinated parenting</p>
              <div className="flex items-center gap-1 text-xs">
                {isConnected ? (
                  <>
                    <Wifi className="w-3 h-3 text-green-500" />
                    <span className="text-green-600">Live updates</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-500">Connecting...</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Thin dialog — no form props */}
          <InviteCoParentDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
          />
        </div>

        {/* Active Co-Parent Relationships */}
        {relationships.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-[#275559]" />
                Connected Co-Parents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {relationships.map((relationship) => (
                  <div key={relationship.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Co-Parent Relationship</h3>
                      <p className="text-sm text-gray-500">Connected on {formatDate(relationship.created_at)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" /> Active
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Invitations List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2 text-[#275559]" />
              Invitation History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {invitations.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No invitations yet</h3>
                <p className="text-gray-500 mb-4">
                  Invite your co-parent to start coordinating schedules and sharing important information.
                </p>
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-[#275559] hover:bg-[#275559]/90"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Send First Invitation
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {invitations.map((invitation) => (
                  <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <h3 className="font-medium">{invitation.invitee_email}</h3>
                          <p className="text-sm text-gray-500">Sent on {formatDate(invitation.created_at)}</p>
                          {invitation.expires_at && (
                            <p className="text-xs text-gray-400">Expires on {formatDate(invitation.expires_at)}</p>
                          )}
                        </div>
                      </div>
                      {invitation.message && (
                        <p className="text-sm text-gray-600 mt-2 italic">"{invitation.message}"</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(invitation.status)}
                      {invitation.status === "pending" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resendInvitationMutation.mutate(invitation.id)}
                            disabled={resendInvitationMutation.isPending}
                          >
                            <RefreshCw className={`h-4 w-4 mr-1 ${resendInvitationMutation.isPending ? "animate-spin" : ""}`} />
                            Resend
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteInvitationMutation.mutate(invitation.id)}
                            disabled={deleteInvitationMutation.isPending}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyInviteLink(`${window.location.origin}/invite/${invitation.invite_token}`)}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copy Link
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Information Section */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-medium text-blue-900 mb-2">How Co-Parent Access Works</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Your co-parent will only see calendar events where they are listed as a participant</li>
              <li>• They can create new events and invite you to participate</li>
              <li>• Both parents can view and manage shared children's information</li>
              <li>• Document sharing requires explicit permission for each document</li>
              <li>• All communication is secure and private to your family</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
