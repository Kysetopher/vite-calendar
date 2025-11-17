import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TypingIndicatorProps {
  userName?: string;
  userAvatar?: string;
  isTyping: boolean;
}

export function TypingIndicator({ userName, userAvatar, isTyping }: TypingIndicatorProps) {
  if (!isTyping) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarImage src={userAvatar} />
        <AvatarFallback className="text-xs">
          {userName?.charAt(0) || 'U'}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
        </div>
        <span className="text-sm text-gray-500">{userName || 'User'} is typing</span>
      </div>
    </div>
  );
}