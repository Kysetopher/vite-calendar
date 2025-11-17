import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Users } from "lucide-react";
import { useLocation } from "wouter";

interface PendingInvitationBannerProps {
  invitation: {
    id: number;
    inviteToken: string;
    inviterEmail: string;
    message?: string;
  };
}

export function PendingInvitationBanner({ invitation }: PendingInvitationBannerProps) {
  const [, setLocation] = useLocation();

  const handleCompleteConnection = () => {
    setLocation(`/invite/${invitation.inviteToken}`);
  };

  return (
    <Card className="bg-blue-50 border-blue-200 mb-6">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <AlertCircle className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-blue-800">
                  Co-Parent Invitation Pending
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  {invitation.inviterEmail} has invited you to connect as co-parents on LiaiZen.
                  {invitation.message && (
                    <span className="block mt-1 italic">"{invitation.message}"</span>
                  )}
                </p>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <Button
                  onClick={handleCompleteConnection}
                  size="sm"
                  className="bg-[#275559] hover:bg-[#275559]/90 text-white"
                >
                  <Users className="h-4 w-4 mr-1" />
                  Complete Connection
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}