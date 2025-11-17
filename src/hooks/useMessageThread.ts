import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { websocketService } from "@/services/websocketService";
import { chatModerationService } from "@/services/chatModerationService";

// Hook to handle message thread fetching, polling, and real-time updates
export function useMessageThread(selectedCoParent: number | null) {
  const { profile, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isThreadLoading, setIsThreadLoading] = useState(false);
  const [moderationStatus, setModerationStatus] = useState<
    "processing" | "passed" | "blocked" | null
  >(null);
  const [moderationFeedbackInput, setModerationFeedbackInput] = useState<{
    explanation?: string;
    tips?: string[];
    alternatives?: string[];
  } | undefined>();
  const [moderationFeedback, setModerationFeedback] = useState<
    Array<{
      id: string;
      type: "blocked" | "suggestion" | "tips" | "alternatives" | "pattern_warning";
      content: string;
      timestamp: Date;
      communicationTips?: string[];
      alternatives?: string[];
      patternAnalysis?: {
        detectedPatterns: string[];
        escalationRisk: string;
        communicationTrend: string;
      };
    }>
  >([]);

  // Generate validation-based AI response using LiaiZen framework
  const generateValidationBasedResponse = (errorData: any, blockedMessage: string) => {
    return `**Validate**: I can sense there's strong emotion behind your message, and those feelings are completely valid.\n\n**Mirror**: It sounds like you're feeling frustrated about the situation. I hear that this is really important to you.\n\n**Inquire**: What outcome are you hoping for in this conversation? What would feel most supportive right now?\n\n**Name Needs**: It seems like you might be needing more clarity, respect, or consistency in your co-parenting arrangement.\n\n**Collaborate**: Let's work together to find a way to express this that opens the door for your co-parent to really hear and understand you.\n\n**Offer Space**: Take a moment if you need it. When you're ready, I'm here to help you communicate in a way that builds connection rather than creates distance.`;
  };

  // Fetch thread ID when switching co-parents
  useEffect(() => {
    const getThreadId = async () => {
      if (!selectedCoParent || !isAuthenticated) {
        setCurrentThreadId(null);
        return;
      }

      setIsThreadLoading(true);
      try {
        const response = await apiRequest(
          "GET",
          `/api/messages/thread/between/${selectedCoParent}`
        );
        if (response?.thread_id) {
          setCurrentThreadId(response.thread_id);
          queryClient.invalidateQueries({
            queryKey: [
              "/api/messages/thread",
              selectedCoParent,
              profile?.id,
              response.thread_id,
            ],
          });
        } else {
          setCurrentThreadId(null);
        }
      } catch (error) {
        setCurrentThreadId(null);
      } finally {
        setIsThreadLoading(false);
      }
    };

    getThreadId();
  }, [selectedCoParent, isAuthenticated, queryClient, profile?.id]);

  // Poll for messages in the current thread
  const { data: messages = [] } = useQuery({
    queryKey: [
      "/api/messages/thread",
      selectedCoParent,
      profile?.id,
      currentThreadId,
    ],
    queryFn: async () => {
      if (!selectedCoParent || !profile?.id) return [];

      if (!currentThreadId) {
        return [];
      }

      try {
        const response = await apiRequest(
          "GET",
          `/api/messages/thread/${currentThreadId}`
        );
        return response?.messages || [];
      } catch (error: any) {
        if (error.message?.includes("404")) {
          return [];
        }
        throw error;
      }
    },
    enabled: isAuthenticated && !!selectedCoParent && !!currentThreadId,
    retry: false,
    refetchInterval: 2000,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  // WebSocket setup and real-time messaging
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

    if (isAuthenticated && profile?.id) {
      const handleNewMessage = (message: any) => {
        queryClient.setQueryData(
          ["/api/messages/thread", selectedCoParent, profile.id],
          (oldData: any) => {
            const existingMessages = Array.isArray(oldData) ? oldData : [];
            return [...existingMessages, message];
          }
        );

        if (Number(message.sender_id) !== Number(profile.id)) {
          toast({
            title: "New message received",
            description:
              message.content.substring(0, 50) +
              (message.content.length > 50 ? "..." : ""),
          });
        }
      };

      const handleConnectionChange = (connected: boolean) => {
        setIsConnected(connected);
      };

      setIsConnected(websocketService.isConnected());

      websocketService.addMessageListener(handleNewMessage);
      websocketService.addConnectionListener(handleConnectionChange);

      return () => {
        websocketService.removeMessageListener(handleNewMessage);
        websocketService.removeConnectionListener(handleConnectionChange);
      };
    }
  }, [
    isAuthenticated,
    isLoading,
    toast,
    profile?.id,
    queryClient,
    selectedCoParent,
  ]);

  // Optimized message sending with chat moderation
  const sendMessageMutation = useMutation({
    mutationFn: async (
      messageData: { recipient_id: number; content: string; thread_id?: string }
    ) => {
      setModerationStatus("processing");
      setModerationFeedbackInput(undefined);

      try {
        const moderationResponse =
          await chatModerationService.moderateMessageWithEmergencyBypass({
            message: messageData.content,
            sender_name: profile?.first_name || "User",
            thread_id:
              messageData.thread_id || `${profile?.id}-${messageData.recipient_id}`,
            user_id: profile?.id,
          });

        if (chatModerationService.isMessageBlocked(moderationResponse)) {
          setModerationStatus("blocked");
          setModerationFeedbackInput({
            explanation: moderationResponse.explanation,
            tips: moderationResponse.tips,
            alternatives: moderationResponse.selections
              ? Object.values(moderationResponse.selections).filter(Boolean)
              : [],
          });

          const error = new Error(
            `400: ${JSON.stringify({
              blocked: true,
              originalMessage: messageData.content,
              explanation: moderationResponse.explanation,
              tips: moderationResponse.tips,
              alternatives: moderationResponse.selections
                ? Object.values(moderationResponse.selections)
                : [],
              communicationTips: moderationResponse.tips,
            })}`
          );
          throw error;
        }

        setModerationStatus("passed");

        const response = await apiRequest(
          "POST",
          "/api/messages/send",
          messageData
        );

        setTimeout(() => {
          setModerationStatus(null);
        }, 2000);

        return {
          ...response,
        };
      } catch (error: any) {
        if (!error?.message?.includes("blocked")) {
          setModerationStatus(null);
        }
        throw error;
      }
    },
    onSuccess: (newMessage: any) => {
      if (newMessage.thread_id) {
        setCurrentThreadId(newMessage.thread_id);
      }

      queryClient.setQueryData(
        ["/api/messages/thread", selectedCoParent, profile?.id],
        (oldData: any) => {
          const existingMessages = Array.isArray(oldData) ? oldData : [];
          const newMessageWithDefaults = {
            id: newMessage.message_id || newMessage.id || Date.now(),
            sender_id: profile?.id,
            recipient_id: selectedCoParent,
            content: newMessage.content || "",
            is_read: false,
            created_at:
              newMessage.created_at || new Date().toISOString(),
          };
          return [...existingMessages, newMessageWithDefaults];
        }
      );

      setModerationFeedback([]);

      queryClient.invalidateQueries({
        queryKey: ["/api/messages/thread", selectedCoParent, profile?.id],
      });
    },
    onError: (error: any) => {
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

      if (error.message?.includes("400:") && error.message?.includes("blocked")) {
        try {
          const errorData = JSON.parse(error.message.split("400: ")[1]);
          if (errorData.blocked) {
            const feedbackMessages: Array<{
              id: string;
              type:
                | "blocked"
                | "suggestion"
                | "tips"
                | "alternatives"
                | "pattern_warning";
              content: string;
              timestamp: Date;
              communicationTips?: string[];
              alternatives?: string[];
              patternAnalysis?: {
                detectedPatterns: string[];
                escalationRisk: string;
                communicationTrend: string;
              };
            }> = [];

            const blockedMessage =
              errorData.originalMessage || errorData.content || "Message blocked";

            feedbackMessages.push({
              id: `validation-guidance-${Date.now()}`,
              type: "blocked" as const,
              content: generateValidationBasedResponse(errorData, blockedMessage),
              timestamp: new Date(),
            });

            if (errorData.communicationTips && errorData.communicationTips.length > 0) {
              feedbackMessages.push({
                id: `tips-${Date.now() + 1}`,
                type: "tips" as const,
                content:
                  "Here are 3 tips for more effective co-parenting communication:",
                communicationTips: errorData.communicationTips,
                timestamp: new Date(),
              });
            }

            if (errorData.alternatives && errorData.alternatives.length > 0) {
              feedbackMessages.push({
                id: `alternatives-${Date.now() + 2}`,
                type: "alternatives" as const,
                content: "Try again with one of these alternative messages:",
                alternatives: errorData.alternatives,
                timestamp: new Date(),
              });
            }

            if (errorData.suggestion) {
              feedbackMessages.push({
                id: `suggestion-${Date.now() + 3}`,
                type: "suggestion" as const,
                content: errorData.suggestion,
                timestamp: new Date(),
              });
            }

            if (errorData.patternAnalysis) {
              feedbackMessages.push({
                id: `pattern-${Date.now() + 4}`,
                type: "pattern_warning" as const,
                content: `Communication Pattern Analysis: ${errorData.patternAnalysis.escalationRisk.toUpperCase()} escalation risk detected`,
                timestamp: new Date(),
                patternAnalysis: errorData.patternAnalysis,
              });
            }

            setModerationFeedback(feedbackMessages);

            return;
          }
        } catch (_) {
          // Fall through to generic error if parsing fails
        }
      }

      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || !selectedCoParent || !profile?.id) return;

      const messageData: any = {
        recipient_id: selectedCoParent,
        content: content.trim(),
      };

      if (currentThreadId) {
        messageData.thread_id = currentThreadId;
      }

      await sendMessageMutation.mutateAsync(messageData);
    },
    [selectedCoParent, profile?.id, sendMessageMutation, currentThreadId]
  );

  return {
    messages,
    isConnected,
    handleSendMessage,
    sendMessagePending: sendMessageMutation.isPending,
    isThreadLoading,
    moderationStatus,
    moderationFeedbackInput,
    setModerationStatus,
    setModerationFeedbackInput,
    moderationFeedback,
    setModerationFeedback,
  };
}

