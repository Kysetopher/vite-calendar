import type { Message } from "@/utils/schema/message";
import { ChatMessage } from "@/components/ui/chat-message";
import { useAuth } from '../../hooks/useAuth';

interface ModerationFeedback {
  id: string;
  type: 'blocked' | 'suggestion' | 'tips' | 'alternatives' | 'pattern_warning';
  content: string;
  timestamp: Date;
  communicationTips?: string[];
  alternatives?: string[];
  patternAnalysis?: {
    detectedPatterns: string[];
    escalationRisk: string;
    communicationTrend: string;
  };
}

interface MessageListProps {
  messages: Message[];
  coParentName?: string;
  coParentAvatar?: string;
}

export function MessageList({ messages, coParentName, coParentAvatar }: MessageListProps) {
  const { profile } = useAuth();

  const groupMessagesByDate = (messages: Message[]) => {
    // Messages are already sorted chronologically from database
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const messageDate = message.created_at ? new Date(message.created_at) : new Date();
      const dateKey = messageDate.toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });
    
    return groups;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (date.toDateString() === today) {
      return "Today";
    } else if (date.toDateString() === yesterday) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  const messageGroups = groupMessagesByDate(messages);


  return (
      <div className=" p-4 space-y-4 pb-6">
      {Object.entries(messageGroups)
        .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
        .map(([date, groupMessages]) => (
        <div key={date}>
          {/* Date separator */}
          <div className="flex items-center justify-center my-4">
            <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-full font-medium">
              {formatDate(date)}
            </div>
          </div>
          
          {/* Messages for this date */}
          {groupMessages.map((message) => (
            <ChatMessage
              key={message.id}
              isOutgoing={profile!.id === message.sender_id}
              message={message}
              coParentName={coParentName}
              coParentAvatar={coParentAvatar}
            />
          ))}
        </div>
      ))}
      
      </div>
    );
  }