import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMessageThread } from "@/hooks/useMessageThread.ts";
import CoParentItem from "@/components/chat/CoParentItem.tsx";

interface ChatSidebarProps {
  coParents: any[] | undefined | null;
  selectedCoParent: number | null;
  onSelect: (id: number) => void;
  loading: boolean;
  className?: string;
}

export default function ChatSidebar({
  coParents,
  selectedCoParent,
  onSelect,
  loading,
  className,
}: ChatSidebarProps) {
  return (
      <div className={cn("space-y-4 py-6 h-full flex-shrink-0", className)}>
        <div className='font-semibold text-lg text-neutral-800'>All Messages</div>
        {loading ? (
          <div className="space-y-3">
            <div className="p-3 animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-1" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            </div>
          </div>
        ) : !coParents || coParents.length === 0 ? (
          <div className="text-center ">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-500 mb-2">No co-parents connected</p>
            <p className="text-xs text-gray-400">Send an invitation to connect with your co-parent</p>
          </div>
        ) : (
          <div className="space-y-3 ">
            {coParents.map((coParent: any) => (
              <CoParentItem
              key={coParent.id}
              coParent={coParent}
              isSelected={selectedCoParent === coParent.coparent_id}
              onSelect={() => onSelect(coParent.coparent_id)}
            />
            ))}
          </div>
        )}
  </div>
  );
}

