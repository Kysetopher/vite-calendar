import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout/AppLayout";
import ChildManager from "@/components/profile/ChildManager";
import AdultManager from "@/components/profile/AdultManager";
import ProfileContextCard from "@/components/profile/ProfileContextCard";
import ProfileInfoCard from "@/components/profile/ProfileInfoCard";

type Tab = "profile" | "context" | "actors";

export default function Profile() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const TabName = (tab: Tab) => `${activeTab === tab ? "block" : "hidden"} lg:block`;

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
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Fill the main area; DO NOT allow page scroll here */}
      <div className="flex-1 h-full w-full flex flex-col min-h-0 overflow-hidden ">
        {/* Mobile tabs header—non-scrolling header within the page */}
        <ul className="flex lg:hidden border-b w-full bg-white shrink-0">
          <li className="flex-1">
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full py-2 ${activeTab === "profile" ? "text-accent font-semibold" : "text-gray-500"}`}
            >
              Profile
            </button>
          </li>
          <li className="flex-1">
            <button
              onClick={() => setActiveTab("context")}
              className={`w-full py-2 ${activeTab === "context" ? "text-accent font-semibold" : "text-gray-500"}`}
            >
              AI Context
            </button>
          </li>
          <li className="flex-1">
            <button
              onClick={() => setActiveTab("actors")}
              className={`w-full py-2 ${activeTab === "actors" ? "text-accent font-semibold" : "text-gray-500"}`}
            >
              Relationships
            </button>
          </li>
        </ul>

        {/* Content area: no page scroll; inner items can scroll if needed */}
        <div className="flex-1 min-h-0 h-full overflow-hidden p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 grid-rows-1 h-full min-h-0 gap-6">
            {/* Left column cards: keep inside available height; allow internal scroll if they overflow */}
            <ProfileInfoCard className={`${TabName("profile")} h-full min-h-0  `} />
            <ProfileContextCard className={`${TabName("context")} h-full min-h-0`} />

            {/* Actors column — two halves that can scroll internally */}
            <div className={`${TabName("actors")} flex flex-col gap-6 min-h-0 h-full`}>
              <ChildManager className=" flex-shrink-0 max-h-[calc(50%-12px)] mb-6" />
              <AdultManager className=" flex-shrink-0 max-h-[calc(50%-12px)]" />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
