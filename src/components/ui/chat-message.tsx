import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow, format } from "date-fns";
import type { Message } from "@/utils/schema/message";

interface ChatMessageProps {
  message: Message;
  coParentName?: string;
  coParentAvatar?: string;
  isOutgoing: boolean;
}

export function ChatMessage({
  message,
  coParentName,
  coParentAvatar,
  isOutgoing,
}: ChatMessageProps) {
  const messageDate = message.created_at ? new Date(message.created_at) : new Date();
  const timeAgo = formatDistanceToNow(messageDate, { addSuffix: true });
  const localTime = format(messageDate, "h:mm a");

  return (
    <div className={`flex items-center mb-4 ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar */}
      <Avatar className={`w-8 h-8 flex-shrink-0 border border-border ${isOutgoing ? 'hidden' : 'mr-2'}`}>
        <AvatarImage src={isOutgoing ? undefined : coParentAvatar} />
        <AvatarFallback className="text-xs">
          {isOutgoing ? "You" : coParentName?.charAt(0) || "CP"}
        </AvatarFallback>
      </Avatar>

      {/* Message bubble */}
      <div className={`flex flex-col max-w-[70%] ${isOutgoing ? 'items-end' : 'items-start'}`}>        
        <div
          className={
            `px-4 py-3 rounded-2xl shadow-sm break-words
            ${message.is_blocked
              ? 'bg-red-100 text-red-800 border border-red-200'
              : isOutgoing
                ? 'bg-[#275559] text-white rounded-br-none'
                : 'bg-white text-gray-900 rounded-bl-none border border-gray-100'}`
          }
        >
          <p className="text-sm leading-relaxed">{message.content}</p>
          {message.is_blocked && (
            <div className="text-xs font-semibold text-red-600 mt-1">BLOCKED</div>
          )}
        </div>

        {/* Timestamps and read receipts */}
        <div className={`mt-1 text-xs text-gray-400 ${isOutgoing ? 'text-right' : 'text-left'}`}>
          <span>{localTime}</span>
          <span className="mx-1">•</span>
          <span>{timeAgo}</span>

          {isOutgoing && (
            <div className="flex items-center justify-end mt-1 space-x-1">
              <span className="font-medium">
                {message.is_blocked ? '✓✓ Read' : '✓ Sent'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
