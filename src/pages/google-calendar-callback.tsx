import { useEffect } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/layout/AppLayout";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function GoogleCalendarCallback() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) {
      toast({
        title: "Error",
        description: "Missing authorization code",
        variant: "destructive",
      });
      setTimeout(() => setLocation("/schedule"), 1500);
      return;
    }

    async function sync() {
      try {
        await apiRequest("POST", "/api/schedule/google-calendar/sync", { code });
        toast({
          title: "Calendar synced",
          description: "Google Calendar events were imported successfully.",
        });
      } catch (err: any) {
        toast({
          title: "Sync failed",
          description: err?.message || "Failed to sync calendar",
          variant: "destructive",
        });
      } finally {
        setTimeout(() => setLocation("/schedule"), 1500);
      }
    }

    sync();
  }, []);

  return (
    <Layout>
      <div className="flex items-center justify-center h-[calc(100vh-60px)]">
        <p>Processing Google Calendar authorization…</p>
      </div>
    </Layout>
  );
}
