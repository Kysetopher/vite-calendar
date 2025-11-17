import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Plus } from "lucide-react";
import { Link } from "wouter";
import type { Message } from "@/utils/schema/message";

export default function RecentMessages() {
  const { profile, isAuthenticated } = useAuth();
  
  const { data: coParents } = useQuery({
    queryKey: ["/api/coparent/relationships"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: messages, isLoading } = useQuery({
    queryKey: ["/api/messages"],
    enabled: isAuthenticated,
    retry: false,
  });

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return diffInMinutes < 1 ? "Just now" : `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return diffInDays === 1 ? "Yesterday" : `${diffInDays} days ago`;
    }
  };

  return (
    <Card className="shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-serif font-semibold text-gray-900">
            Recent Messages
          </CardTitle>
          <Link href="/messages">
            <span className="text-sm text-[#275559] hover:text-[#1e4448] font-medium transition-colors cursor-pointer">
              View all
            </span>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start space-x-4 p-3 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : !messages || (messages as any)?.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No messages yet</p>
            <p className="text-sm text-gray-400 mb-4">Start a conversation with your co-parent</p>
            <Link href="/messages">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {(messages as any)?.slice(0, 3).map((message: Message) => (
              <Link key={message.id} href="/messages">
                <a className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150" />
                    <AvatarFallback>MP</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {Number(message.sender_id) === Number(profile?.id) ? "You" : "Co-parent"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTimeAgo(message.created_at || new Date().toISOString())}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {message.content}
                    </p>
                  </div>
                  {!message.is_read && Number(message.recipient_id) === Number(profile?.id) && (
                    <div className="w-2 h-2 bg-[#275559] rounded-full flex-shrink-0 mt-2"></div>
                  )}
                </a>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-200">
          <Link href="/messages">
            <Button className="w-full transition-colors font-medium">
              <Plus className="w-4 h-4 mr-2" />
              New Message
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
