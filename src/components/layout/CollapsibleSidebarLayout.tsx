import {useEffect, useState} from "react";
import { Button } from "@/components/ui/button";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleSidebarLayoutProps {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void,
  sidebar: React.ReactNode;
  children: React.ReactNode;
  sidebarWidth?: string;
}

export default function CollapsibleSidebarLayout({
  collapsed,
  setCollapsed,
  sidebar,
  children,
  sidebarWidth = "w-[300px]",
}: CollapsibleSidebarLayoutProps) {

    // toggle the sidebar based on screen size
    useEffect(() => {
        let previousWidth = window.innerWidth;
        const checkScreenSize = () => {
            const currentWidth = window.innerWidth;
            const wasLargeScreen = previousWidth >= 1024;
            const isLargeScreen = currentWidth >= 1024;
            if (wasLargeScreen !== isLargeScreen) {
                setCollapsed(currentWidth < 1024);
            }
            previousWidth = currentWidth;
        };
        setCollapsed(window.innerWidth < 1024); // initial check
        window.addEventListener("resize", checkScreenSize);
        return () => {
            window.removeEventListener("resize", checkScreenSize);
        };
    }, []);

  return (
      <div className="min-h-0 flex w-full h-full">
      {/* BACKDROP */}
        {!collapsed && (
            <div
                className='fixed inset-0 bg-black/50 z-40 lg:hidden'
                onClick={() => setCollapsed(true)}
            />
        )}


      {/* ── SIDEBAR CONTAINER ── */}
      <div
        className={cn(
          // allow shrinking, include padding inside width
          "fixed lg:relative lg:bottom-0 z-50 left-0 lg:flex h-full bg-white transition-transform duration-300 ease-in-out box-border min-w-0",
          `${sidebarWidth} px-4 border-r border-border`, // to maintain width
          collapsed
            ? "-translate-x-full lg:absolute lg:px-0 lg:border-0"                     // fully collapsed
            : "translate-x-0"        // expanded at sidebarWidth + padding
        )}
      >
        {!collapsed && (
          // content scrolls if it outgrows its container
          <div className="h-full w-full flex flex-col overflow-auto">
            {sidebar}
          </div>
        )}

        <Button
          variant="ghost"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "absolute h-full right-0 z-10 rounded-none transition-all",
            collapsed
              ? "p-2 pt-[30px] -right-6 opacity-10 hover:opacity-50 hover:bg-transparent"
              : "w-5 h-full -right-5 opacity-10 p-0 hover:opacity-50 hover:bg-transparent  hover:border-l-[2px]  gray-300"
          )}
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="absolute h-4 w-4" />}
        </Button>
      </div>

      {/* ── MAIN CONTENT ── */}
       <div className="flex-1 min-w-0 min-h-0 overflow-hidden h-full">
        {children}
      </div>
    </div>
  );
}