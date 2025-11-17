import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, fetchWithAuthRefresh } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function useAIChat(selectedCoParent: number | null) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiMessage, setAiMessage] = useState("");

  const { data: sharedAIHistory = [], isLoading: aiHistoryLoading } = useQuery({
    queryKey: ["/api/ai/chat/shared", selectedCoParent],
    queryFn: async () => {
      if (!selectedCoParent) return [];
      const response = await fetchWithAuthRefresh(
        `${API_BASE_URL}/api/ai/chat/shared/${selectedCoParent}`,
        {}
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: !!selectedCoParent && showAIChat,
    retry: false,
  });

  const sharedAIChatMutation = useMutation({
    mutationFn: async (messageData: { message: string; co_parent_id: number }) => {
      return await apiRequest("POST", "/api/ai/chat/shared", messageData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/chat/shared", selectedCoParent] });
      setAiMessage("");
      toast({
        title: "AI Guidance Received",
        description: "Your co-parenting advisor has provided guidance for both of you.",
      });
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
        description: "Failed to get AI guidance. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAIChat = useCallback(async () => {
    if (!aiMessage.trim() || !selectedCoParent) return;

    try {
      await sharedAIChatMutation.mutateAsync({
        message: aiMessage.trim(),
        co_parent_id: selectedCoParent,
      });
    } catch (error) {
      console.error("Error getting AI guidance:", error);
    }
  }, [aiMessage, selectedCoParent, sharedAIChatMutation]);

  return {
    showAIChat,
    setShowAIChat,
    aiMessage,
    setAiMessage,
    sharedAIHistory,
    aiHistoryLoading,
    handleAIChat,
    sharedAIChatMutation,
  };
}

export type UseAIChatReturn = ReturnType<typeof useAIChat>;

