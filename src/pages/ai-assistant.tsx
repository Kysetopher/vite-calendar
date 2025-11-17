import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/layout/AppLayout";
import CollapsibleSidebarLayout from "@/components/layout/CollapsibleSidebarLayout";
import ProfileContextCard from "@/components/profile/ProfileContextCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AIMessageForm from "@/components/form/AIMessageForm";
import { Badge } from "@/components/ui/badge";
import { Bot, Lightbulb, MessageCircle, HelpCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { AIMessage, Message } from "@/utils/schema/message";
import { MessageList } from "@/components/chat/MessageList";
import Loading from "@/components/Loading.tsx";

export default function AIAssistant() {
  const { profile, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("general");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  // Redirect to home if not authenticated
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
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: chatHistory, isLoading: historyLoading } = useQuery({
    queryKey: ["/api/ai/chat/history"],
    enabled: isAuthenticated,
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
      message_type: messageType,
    });
  };

  if (isLoading || !isAuthenticated) {
    return <Loading message="Booting up your AI Assistant" />;
  }

  const quickPrompts = [
    {
      text: "How can I improve communication with my co-parent?",
      icon: <MessageCircle className="w-4 h-4" />,
      type: "communication"
    },
    {
      text: "What should I consider when making custody schedule changes?",
      icon: <Lightbulb className="w-4 h-4" />,
      type: "advice"
    },
    {
      text: "Help me handle a disagreement about our child's activities",
      icon: <HelpCircle className="w-4 h-4" />,
      type: "mediation"
    },
  ];

const toIso = (v: unknown): string | null => {
  if (v == null) return null;
  const d = v instanceof Date ? v : new Date(v as any);
  return isNaN(d.getTime()) ? null : d.toISOString();
};

const mappedMessages: Message[] = Array.isArray(chatHistory)
  ? (chatHistory as AIMessage[]).flatMap((chat, index) => {
      // try several fields; adjust names to match your payload
      const iso =
        toIso(chat.timestamp) ??
        toIso((chat as any).created_at) ??
        toIso((chat as any).response_timestamp) ??
        new Date().toISOString(); // final fallback

      return [
        {
          id: index * 2,
          sender_id: chat.user_id,
          recipient_id: 0,
          content: chat.message,
          status: "sent",
          created_at: iso,
        },
        {
          id: index * 2 + 1,
          sender_id: 0,
          recipient_id: chat.user_id,
          content: chat.response,
          status: "sent",
          created_at: iso,
        },
      ];
    })
  : [];

  return (
    <Layout>
             <CollapsibleSidebarLayout
                collapsed={sidebarCollapsed}
                setCollapsed={setSidebarCollapsed}   sidebarWidth = "w-[500px]" sidebar={<ProfileContextCard />}>
        <div className=" mx-auto px-8 py-8">
   

          <Card className="shadow h-[600px] flex flex-col">
            <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-orange-100">
              <CardTitle className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">LiaiZen AI Assistant</h3>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                      Online
                    </Badge>
                    <span className="text-sm text-gray-500">Specialized in co-parenting guidance</span>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>

            {/* Chat Messages */}
            <CardContent className="flex-1 p-6 overflow-y-auto custom-scrollbar">
              {historyLoading ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Loading chat history...</p>
                </div>
              ) : !chatHistory || (chatHistory as any).length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center max-w-md">
                    <Bot className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Hi {profile?.first_name ?? 'there'}! I'm here to help.
                    </h3>
                    <p className="text-gray-600 mb-6">
                      I'm your AI assistant specialized in co-parenting support. Ask me anything about
                      communication, scheduling, conflict resolution, or child well-being.
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Try asking:</p>
                      {quickPrompts.map((prompt, index) => (
                        <Button
                          key={index}
                          onClick={() => {
                            setMessage(prompt.text);
                            setMessageType(prompt.type);
                          }}
                          variant="ghost"
                          className="block w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                        >
                          <div className="flex items-center space-x-2">
                            {prompt.icon}
                            <span>{prompt.text}</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <MessageList messages={mappedMessages} />
              )}
            </CardContent>

            {/* Message Input */}
            <div className="p-6 border-t bg-gray-50">
              <AIMessageForm
                message={message}
                onMessageChange={setMessage}
                messageType={messageType}
                onMessageTypeChange={setMessageType}
                isSubmitting={sendMessageMutation.isPending}
                onSubmit={handleSendMessage}
              />
            </div>
          </Card>
        </div>
      </CollapsibleSidebarLayout>
    </Layout>
  );
}
