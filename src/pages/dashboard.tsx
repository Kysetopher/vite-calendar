import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import Layout from "@/components/layout/AppLayout";

import UpcomingSchedule from "@/components/calendar/UpcomingSchedule";

import PendingTasks from "@/components/PendingTasks";
import SentInvitations from "@/components/SentInvitations";
import CompletedTasks from "@/components/CompletedTasks";

import { Card, CardContent } from "@/components/ui/card";
import { Calendar, FileText } from "lucide-react";
import Loading from "@/components/Loading.tsx";

export default function Dashboard() {
  const { profile, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);
  
  // Handle invitation token in URL or sessionStorage
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const urlParams = new URLSearchParams(window.location.search);
      const inviteToken = urlParams.get('invite') || 
                         sessionStorage.getItem('pendingInvite');
      
      if (inviteToken) {
        // Clean sessionStorage
        sessionStorage.removeItem('pendingInvite');
        
        // Clean URL by removing the invite parameter if it's there
        if (urlParams.get('invite')) {
          urlParams.delete('invite');
          const newUrl = urlParams.toString() ? `${window.location.pathname}?${urlParams.toString()}` : window.location.pathname;
          window.history.replaceState({}, '', newUrl);
        }
        
        // Show toast notification with action button
        toast({
          title: "Invitation Found!",
          description: "You have a pending co-parent invitation.",
          action: (
            <button
              onClick={() => setLocation(`/invite/${inviteToken}`)}
              className="px-3 py-2 text-sm font-medium text-white bg-[#275559] rounded-md hover:bg-[#1e4144] transition-colors"
            >
              View Now
            </button>
          ),
        });
        
        // Auto-navigate after 2 seconds
        setTimeout(() => {
          setLocation(`/invite/${inviteToken}`);
        }, 2000);
      }
    }
  }, [isAuthenticated, isLoading, toast, setLocation]);
  if (isLoading || !isAuthenticated) {
    return <Loading message="Loading your dashboard" />;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    } else {
      return `${date.toLocaleDateString('en-US', { weekday: 'long' })} ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    }
  };

  return (
    <Layout>
      <div className="w-full p-6 w-full mx-auto overflow-auto h-full">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-serif font-semibold text-gray-900 mb-2">
            Good morning, {profile?.first_name || 'there'}! 👋
          </h1>
          <p className="text-gray-600">Here's what's happening with your co-parenting today.</p>
        </div>

        {/* Essential Info */}
     

        {/* Simplified Dashboard */}
        <div className="space-y-8">
          <UpcomingSchedule />
          <PendingTasks />
          <CompletedTasks />
          <SentInvitations />
        </div>
      </div>
    </Layout>
  );
}
