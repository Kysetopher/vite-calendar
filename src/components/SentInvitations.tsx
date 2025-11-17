import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Clock, CheckCircle, XCircle, Trash2, RefreshCw, Copy } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { websocketService } from "@/services/websocketService";
import type { InvitationResponse } from "@/utils/schema/relationship";

export default function SentInvitations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all sent invitations (pending, accepted, etc.)
  const { data: invitations = [], isLoading } = useQuery<InvitationResponse[]>({
    queryKey: ["/api/invitations/sent"],
  });
  
  // Listen for invitation acceptance via WebSocket
  useEffect(() => {
    const handleWebSocketMessage = (message: any) => {
      if (message.type === 'invitation_accepted') {
        // Refetch pending invitations and co-parent relationships
        queryClient.invalidateQueries({ queryKey: ["/api/invitations/sent"] });
        queryClient.invalidateQueries({ queryKey: ["/api/coparent/relationships"] });
        queryClient.invalidateQueries({ queryKey: ["/api/invitations/accepted/sent"] });
        queryClient.invalidateQueries({ queryKey: ["/api/invitations/accepted/received"] });
        toast({
          title: "Invitation accepted!",
          description: `${message.invitee_email} has accepted your invitation.`,
        });
      }
    };
    
    websocketService.addMessageListener(handleWebSocketMessage);
    
    return () => {
      websocketService.removeMessageListener(handleWebSocketMessage);
    };
  }, [queryClient, toast]);

  // Delete invitation mutation
  const deleteInvitationMutation = useMutation({
    mutationFn: async (invitationId: number) => {
      return await apiRequest("DELETE", `/api/invitations/${invitationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invitations/sent"] });
      toast({
        title: "Invitation deleted",
        description: "The invitation has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete invitation. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Resend invitation mutation
  const resendInvitationMutation = useMutation({
    mutationFn: async (invitationId: number) => {
      return await apiRequest("POST", `/api/invitations/invite/${invitationId}/resend`);
    },
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/invitations/sent"] });
      
      if (response.emailSent) {
        toast({
          title: "Invitation resent!",
          description: "The invitation email has been resent successfully.",
        });
      } else {
        toast({
          title: "Resend failed",
          description: "Could not resend invitation email. Please check your email settings.",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to resend invitation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const copyInviteLink = (inviteUrl: string) => {
    navigator.clipboard.writeText(inviteUrl);
    toast({
      title: "Link copied",
      description: "Invitation link copied to clipboard.",
    });
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
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');

  if (isLoading) {
    return null;
  }

  if (pendingInvitations.length === 0) {
    return null;
  }

  return (
    <Card className="shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-serif font-semibold text-gray-900 flex items-center">
            <Mail className="h-5 w-5 mr-2 text-[#275559]" />
            Sent Invitations
          </CardTitle>
          <Badge variant="outline" className="text-[#275559] border-[#275559]">
            {pendingInvitations.length} pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pendingInvitations.map((invitation) => (
            <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div>
                    <h3 className="font-medium text-sm">{invitation.invitee_email}</h3>
                    <p className="text-xs text-gray-500">
                      Sent {formatDate(invitation.created_at)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(invitation.status)}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => resendInvitationMutation.mutate(invitation.id)}
                  disabled={resendInvitationMutation.isPending}
                  title="Resend invitation"
                >
                  <RefreshCw className={`h-4 w-4 ${resendInvitationMutation.isPending ? 'animate-spin' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyInviteLink(`${window.location.origin}/?invite=${invitation.invite_token}`)}
                  title="Copy invitation link"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteInvitationMutation.mutate(invitation.id)}
                  disabled={deleteInvitationMutation.isPending}
                  className="text-red-600 hover:text-red-700"
                  title="Delete invitation"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}