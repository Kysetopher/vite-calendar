import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import Layout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, UserPlus, ArrowRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function CompleteConnection() {
  const { isAuthenticated, profile } = useAuth();
  const { toast } = useToast();
  const [connectionCompleted, setConnectionCompleted] = useState(false);

  // Complete the co-parent connection
  const completeConnectionMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/invite/invite_1751053872094_scu8uv69h/accept", {});
    },
    onSuccess: () => {
      setConnectionCompleted(true);
      toast({
        title: "Connection successful!",
        description: "You are now connected with your co-parent and can start collaborating.",
      });
    },
    onError: (error) => {
      toast({
        title: "Connection failed",
        description: "Unable to complete co-parent connection. Please try again or contact support.",
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto p-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <p>Please log in to complete your co-parent connection.</p>
              <Button
                onClick={() => window.location.href = "/api/login"}
                className="mt-4 bg-[#275559] text-white hover:bg-[#1e4448]"
              >
                Log In
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (connectionCompleted) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto p-6">
          <Card>
            <CardHeader className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-2xl text-green-700">Connection Complete!</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                You are now successfully connected with your co-parent on LiaiZen.
              </p>
              <div className="space-y-2">
                  <Button
                    onClick={() => window.location.href = "/schedule"}
                    className="w-full bg-[#275559] text-white hover:bg-[#1e4448]"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Go to Schedule
                  </Button>
                <Button 
                  onClick={() => window.location.href = "/"}
                  variant="outline"
                  className="w-full"
                >
                  Go to Dashboard
                </Button>
              </div>
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
            <UserPlus className="h-16 w-16 text-[#275559] mx-auto mb-4" />
            <CardTitle className="text-2xl">Complete Co-Parent Connection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Hello {profile?.email ?? 'there'}!</h4>
              <p className="text-sm text-blue-800">
                You successfully logged in to LiaiZen, but your co-parent connection needs to be completed. 
                Click the button below to finalize your connection with athenasees@gmail.com.
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900 mb-2">What happens when you connect?</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• You'll be connected as co-parents in LiaiZen</li>
                <li>• You can share calendars and coordinate schedules</li>
                <li>• You'll see events where you're specifically involved</li>
                <li>• You can collaborate on parenting plans and documents</li>
                <li>• All information remains private to your family</li>
              </ul>
            </div>

              <Button
                onClick={() => completeConnectionMutation.mutate()}
                disabled={completeConnectionMutation.isPending}
                className="w-full bg-[#275559] text-white hover:bg-[#1e4448]"
              >
                {completeConnectionMutation.isPending ? "Connecting..." : "Complete Co-Parent Connection"}
              </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );}