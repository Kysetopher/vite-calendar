import { Sparkles, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import liaizenLogo from "@assets/liaizen-logo.svg";
import { useAuth } from "@/hooks/useAuth";
import { UseAIChatReturn } from "@/hooks/useAIChat";

interface AIChatPanelProps {
  coParents: any[];
  aiChat: UseAIChatReturn;
}

export default function AIChatPanel({ coParents, aiChat }: AIChatPanelProps) {
  const { profile } = useAuth();
  const {
    showAIChat,
    setShowAIChat,
    aiMessage,
    setAiMessage,
    sharedAIHistory,
    aiHistoryLoading,
    handleAIChat,
    sharedAIChatMutation,
  } = aiChat;

  if (!showAIChat) return null;

  return (
    <div className="border-t bg-gradient-to-r from-orange-50 to-amber-50 h-[300px] flex-shrink-0">
      <div className="p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-[#275559]" />
            <h4 className="font-semibold text-[#275559]">Co-Parenting AI Guidance</h4>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAIChat(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto mb-3 space-y-2">
          {aiHistoryLoading ? (
            <div className="text-center text-gray-500">Loading guidance history...</div>
          ) : Array.isArray(sharedAIHistory) && sharedAIHistory.length > 0 ? (
            sharedAIHistory.map((chat: any) => (
              <div key={chat.id} className="space-y-2">
                <div className="bg-white rounded-lg p-3 border">
                  <div className="flex items-center space-x-2 mb-1">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                        {Number(chat.user_id) === Number(profile?.id)
                          ? profile?.first_name?.[0]
                          : coParents?.find((cp: any) => cp.coparent_id === chat.user_id)?.coparent_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      {Number(chat.user_id) === Number(profile?.id)
                        ? "You"
                        : coParents?.find((cp: any) => cp.coparent_id === chat.user_id)?.coparent_name}
                    </span>
                    <span className="text-xs text-gray-500">asked</span>
                  </div>
                  <p className="text-sm text-gray-700">{chat.message}</p>
                </div>
                <div className="bg-[#275559] bg-opacity-10 rounded-lg p-3 border">
                  <div className="flex items-center space-x-2 mb-1">
                    <img src={liaizenLogo} alt="LiaiZen AI" className="w-4 h-4" />
                    <span className="text-sm font-medium text-[#275559]">LiaiZen AI Guidance</span>
                  </div>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{chat.response}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              <img src={liaizenLogo} alt="LiaiZen AI" className="w-12 h-12 mx-auto mb-2 opacity-60" />
              <p>Ask for guidance to help with your co-parenting conversation</p>
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          <input
            type="text"
            value={aiMessage}
            onChange={(e) => setAiMessage(e.target.value)}
            placeholder="Ask for co-parenting guidance..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#275559] focus:border-[#275559] text-sm"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAIChat();
              }
            }}
            disabled={sharedAIChatMutation.isPending}
          />
          <Button
            onClick={handleAIChat}
            disabled={!aiMessage.trim() || sharedAIChatMutation.isPending}
            size="sm"
            className="hover:opacity-90 bg-[#275559] text-white hover:bg-[#1e4448]"
          >
            {sharedAIChatMutation.isPending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

