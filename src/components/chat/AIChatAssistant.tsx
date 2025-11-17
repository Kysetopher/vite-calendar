import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, User, Shield } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Link } from "wouter";
import type { AIMessage } from "@/utils/schema/message";

export default function AIChatAssistant() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: chatHistory, isLoading } = useQuery({
    queryKey: ["/api/ai/chat/history"],
    retry: false,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { message: string; message_type: string }) => {
      return await apiRequest("POST", "/api/ai/chat", messageData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/chat/history"] });
      setMessage("");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    sendMessageMutation.mutate({
      message: message.trim(),
      message_type: "general",
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const recentMessages = (chatHistory as any)?.slice(0, 2) || [];

  return (
    <Card className="shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-gray-900">
            <Bot className="w-5 h-5 mr-3 text-[#275559]" />
            AI Assistant
          </CardTitle>
          <Badge className="bg-[#275559] bg-opacity-10 text-[#275559] text-xs">
            Online
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Chat Messages */}
        <div className="space-y-4 mb-4 max-h-64 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-gray-500 text-sm">Loading...</p>
            </div>
          ) : recentMessages.length === 0 ? (
            <div className="text-center py-6">
              <Bot className="w-12 h-12 text-[#275559] mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-900 mb-2">
                Hi {profile?.first_name || 'there'}! I'm here to help.
              </p>
              <p className="text-xs text-gray-600 mb-4">
                Ask me anything about co-parenting, communication, or scheduling.
              </p>
              <Link href="/ai-assistant">
                <Button size="sm" variant="outline" className="text-xs">
                  Start Full Conversation
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentMessages.map((chat: AIMessage) => (
                <div key={chat.id} className="space-y-3">
                  {/* User Message */}
                  <div className="flex items-start space-x-3 justify-end">
                    <div className="bg-[#4DA8B0] rounded-lg p-3 max-w-xs">
                      <p className="text-sm text-white">{chat.message}</p>
                    </div>
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="bg-teal-100 text-[#4DA8B0] text-xs">
                        <User className="w-3 h-3" />
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* AI Response */}
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="bg-[#275559] bg-opacity-10 text-[#275559] text-xs">
                        <Bot className="w-3 h-3" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                      <p className="text-sm text-gray-900">
                        {chat.response.length > 100 
                          ? `${chat.response.substring(0, 100)}...` 
                          : chat.response
                        }
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="border-t border-gray-200 pt-4">
          <form onSubmit={handleSendMessage} className="space-y-3">
            <div className="flex space-x-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask me anything about co-parenting..."
                className="flex-1 text-sm"
                disabled={sendMessageMutation.isPending}
              />
              <Button
                type="submit"
                disabled={!message.trim() || sendMessageMutation.isPending}
                size="sm"
              >
                {sendMessageMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <Link href="/ai-assistant">
                <Button variant="outline" size="sm" className="text-xs">
                  Full Conversation
                </Button>
              </Link>
              
              <p className="text-xs text-gray-500 flex items-center">
                <Shield className="w-3 h-3 mr-1" />
                Private & secure
              </p>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
