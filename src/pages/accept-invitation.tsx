import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import Layout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, CheckCircle, XCircle, Clock, Mail } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { InvitationResponse } from "@/utils/schema/relationship";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function AcceptInvitation() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, params] = useRoute("/invite/:token");
  const [invitationStatus, setInvitationStatus] = useState<'loading' | 'valid' | 'invalid' | 'expired' | 'accepted' | 'declined'>('loading');

  const token = params?.token;

  // Fetch invitation details (no authentication required)
  const { data: invitation, isLoading: invitationLoading } = useQuery<InvitationResponse>({
    queryKey: ["/api/invite", token],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/invite/${token}`);
      if (!response.ok) {
        throw new Error('Invitation not found');
      }
      return response.json();
    },
    enabled: !!token,
    retry: false,
  });

  // Accept invitation mutation
  const acceptMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/invite/${token}/accept`, {});
    },
    onSuccess: () => {
      setInvitationStatus('accepted');
      toast({
        title: "Invitation accepted!",
        description: "You are now connected as co-parents. You can start collaborating on schedules and sharing information.",
      });
      // Redirect to dashboard after successful acceptance
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500); // Give user time to see the success message
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          const currentUrl = window.location.pathname;
          window.location.href = `/login?redirect=${encodeURIComponent(currentUrl)}`;
        }, 500);
        return;
      }

      // Extract error message from response
      const errorMessage = error?.message || "Failed to accept invitation";

      toast({
        title: "Cannot Accept Invitation",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Decline invitation mutation
  const declineMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/invite/${token}/decline`, {});
    },
    onSuccess: () => {
      setInvitationStatus('declined');
      toast({
        title: "Invitation declined",
        description: "The invitation has been declined.",
      });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/auth/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to decline invitation. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (invitation) {
      if (invitation.status === 'accepted') {
        setInvitationStatus('accepted');
      } else if (invitation.status === 'declined') {
        setInvitationStatus('declined');
      } else if (new Date() > new Date(invitation.expires_at)) {
        setInvitationStatus('expired');
      } else if (invitation.status === 'pending') {
        setInvitationStatus('valid');
      }
    }
  }, [invitation]);

  // Separate effect for auto-accept to prevent loops
  useEffect(() => {
    // Auto-accept invitation after login (only if still pending)
    if (isAuthenticated && invitation && invitation.status === 'pending' && invitationStatus === 'valid' && !acceptMutation.isPending && !acceptMutation.isError && !acceptMutation.isSuccess) {
      // Small delay to ensure everything is ready
      const timer = setTimeout(() => {
        acceptMutation.mutate();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, invitation, invitationStatus, acceptMutation.isPending, acceptMutation.isError, acceptMutation.isSuccess]); // Include all dependencies

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading || invitationLoading || !token) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto p-6">
          <div className="text-center">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading invitation...</h3>
          </div>
        </div>
      </Layout>
    );
  }

  // Handle accepting invitation - redirect to login if not authenticated
  const handleAcceptClick = () => {
    if (!isAuthenticated) {
      const currentUrl = window.location.pathname;
      window.location.href = `/login?redirect=${encodeURIComponent(currentUrl)}`;
      return;
    }
    acceptMutation.mutate();
  };

  const handleDeclineClick = () => {
    if (!isAuthenticated) {
      const currentUrl = window.location.pathname;
      window.location.href = `/login?redirect=${encodeURIComponent(currentUrl)}`;
      return;
    }
    declineMutation.mutate();
  };

  if (!invitation) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto p-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Invitation Not Found</h2>
              <p className="text-gray-600">
                This invitation link is invalid or has been removed.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <UserPlus className="h-12 w-12 text-[#275559] mx-auto mb-4" />
            <CardTitle className="text-2xl">Co-Parent Invitation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-lg text-gray-700 mb-2">
                You've been invited to join LiaiZen as a co-parent
              </p>
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Invited to: {invitation.invitee_email}</span>
              </div>
            </div>

            {invitation.message && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Personal Message</h4>
                <p className="text-blue-800 italic">"{invitation.message}"</p>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Invitation Details</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div>Sent: {formatDate(invitation.created_at)}</div>
                <div>Expires: {formatDate(invitation.expires_at)}</div>
                <div className="flex items-center space-x-2">
                  <span>Status:</span>
                  {invitationStatus === 'valid' && <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>}
                  {invitationStatus === 'accepted' && <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" />Accepted</Badge>}
                  {invitationStatus === 'declined' && <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="w-3 h-3 mr-1" />Declined</Badge>}
                  {invitationStatus === 'expired' && <Badge variant="outline" className="text-gray-600 border-gray-600">Expired</Badge>}
                </div>
              </div>
            </div>

            {invitationStatus === 'valid' && (
              <div className="space-y-4">
                {!isAuthenticated && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">Authentication Required</h4>
                    <p className="text-sm text-blue-800 mb-2">
                      You'll need to sign in to accept this invitation and access LiaiZen features.
                    </p>
                    <p className="text-xs text-blue-700">
                      Note: Calendar integration requires Google verification setup. General features will work immediately after login.
                    </p>
                  </div>
                )}

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-900 mb-2">What happens when you accept?</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• You'll be connected as co-parents in LiaiZen</li>
                    <li>• You can share calendars and coordinate schedules</li>
                    <li>• You'll only see events where you're specifically involved</li>
                    <li>• You can collaborate on parenting plans and documents</li>
                    <li>• All information remains private to your family</li>
                  </ul>
                </div>

                {!isAuthenticated ? (
                  <div className="space-y-3">
                    <Button
                      onClick={handleAcceptClick}
                      className="w-full bg-[#275559] hover:bg-[#275559]/90"
                    >
                      Sign In to Accept Invitation
                    </Button>
                    <p className="text-xs text-gray-500 text-center">
                      You'll be automatically connected after signing in
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="space-y-2">
                      <div className="animate-spin h-8 w-8 border-4 border-[#275559] border-t-transparent rounded-full mx-auto"></div>
                      <p className="text-gray-600">Connecting with your co-parent...</p>
                      <p className="text-sm text-gray-500">You'll be redirected to the dashboard shortly...</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {invitationStatus === 'accepted' && (
              <div className="text-center space-y-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-medium text-green-900 mb-1">Invitation Accepted!</h4>
                  <p className="text-sm text-green-800">You are now connected as co-parents.</p>
                </div>
                <Button
                  onClick={() => window.location.href = "/"}
                  className="bg-[#275559] hover:bg-[#275559]/90"
                >
                  Go to Dashboard
                </Button>
              </div>
            )}

            {invitationStatus === 'declined' && (
              <div className="text-center">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <XCircle className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900 mb-1">Invitation Declined</h4>
                  <p className="text-sm text-gray-600">You have declined this co-parent invitation.</p>
                </div>
              </div>
            )}

            {invitationStatus === 'expired' && (
              <div className="text-center">
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <Clock className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <h4 className="font-medium text-red-900 mb-1">Invitation Expired</h4>
                  <p className="text-sm text-red-800">This invitation has expired. Please ask for a new invitation.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}