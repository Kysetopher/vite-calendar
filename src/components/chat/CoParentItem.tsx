import React from 'react';
import {useMessageThread} from "@/hooks/useMessageThread.ts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";


// helper function to format the timestamp
function formatMessageTime(timestamp: string | Date | null | undefined): string {
  if (!timestamp) return "";

  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;

  // Check if date is valid
  if (isNaN(date.getTime())) return "";

  if (isToday(date)) {
    return format(date, 'h:mm a'); // e.g., "2:30 PM"
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else if (Date.now() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
    return format(date, 'EEEE'); // e.g., "Monday"
  } else {
    return format(date, 'MMM d'); // e.g., "Jan 15"
  }
}

function CoParentItem({
    coParent,
    isSelected,
    onSelect,
}: {
    coParent: any;
    isSelected: boolean;
    onSelect: void;
}) {
    const { messages } = useMessageThread(coParent.coparent_id);

    const mostRecentTimestamp = messages && messages.length > 0
        ? messages[messages.length - 1].created_at
        : null;
    return (
        <div
            className={cn(
                "p-4 rounded-xl cursor-pointer transition-all duration-200 border",
                isSelected
                    ? "bg-[#275559] bg-opacity-10 border-[#275559] border-opacity-30 shadow-sm"
                    : "hover:bg-gray-50 border-transparent hover:shadow-sm"
            )}
            onClick={onSelect}
        >
            <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                    <AvatarImage src={coParent.profile_image_url}/>
                    <AvatarFallback>{coParent.coparent_name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                            {coParent.coparent_name}
                        </p>
                        {mostRecentTimestamp && (
                            <span className="text-xs text-gray-500">
                {formatMessageTime(mostRecentTimestamp)}
              </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CoParentItem;