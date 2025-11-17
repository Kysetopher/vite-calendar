import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout/AppLayout";
import ChildManager from "@/components/profile/ChildManager";
import AdultManager from "@/components/profile/AdultManager";
import ProfileContextCard from "@/components/profile/ProfileContextCard";
import ProfileInfoCard from "@/components/profile/ProfileInfoCard";

type Tab = "children" | "co-parent" | "extended";

export default function Cirlce() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("children");
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
              onClick={() => setActiveTab("children")}
              className={`w-full py-2 ${activeTab === "children" ? "text-accent font-semibold" : "text-gray-500"}`}
            >
              Children
            </button>
          </li>
          <li className="flex-1">
            <button
              onClick={() => setActiveTab("co-parent")}
              className={`w-full py-2 ${activeTab === "co-parent" ? "text-accent font-semibold" : "text-gray-500"}`}
            >
              Co-Parents Circle
            </button>
          </li>
          <li className="flex-1">
            <button
              onClick={() => setActiveTab("extended")}
              className={`w-full py-2 ${activeTab === "extended" ? "text-accent font-semibold" : "text-gray-500"}`}
            >
              Extended Circle
            </button>
          </li>
        </ul>

        {/* Content area: no page scroll; inner items can scroll if needed */}
        <div className="flex-1 min-h-0 h-full overflow-hidden p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 grid-rows-1 h-full min-h-0 gap-6">
            {/* Left column cards: keep inside available height; allow internal scroll if they overflow */}
              <ChildManager className={`${TabName("children")} h-full min-h-0`} />
              <ChildManager className={`${TabName("co-parent")} h-full min-h-0`} />
              <AdultManager className={`${TabName("extended")} h-full min-h-0`} />

          </div>
        </div>
      </div>
    </Layout>
  );
}
