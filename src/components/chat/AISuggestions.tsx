import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Lightbulb, MessageSquare, Calendar, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { AiSuggestion } from "@/utils/schema/message";

export default function AISuggestions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ["/api/ai/suggestions"],
    retry: false,
  });

  const acceptSuggestionMutation = useMutation({
    mutationFn: async (suggestionId: number) => {
      await apiRequest("PATCH", `/api/ai/suggestions/${suggestionId}/accept`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/suggestions"] });
      toast({
        title: "Suggestion accepted",
        description: "The suggestion has been marked as accepted.",
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
        description: "Failed to accept suggestion. Please try again.",
        variant: "destructive",
      });
    },
  });

  const generateSuggestionsMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/ai/suggestions/generate");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/suggestions"] });
      toast({
        title: "Suggestions generated",
        description: "New AI suggestions have been created for you.",
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
        description: "Failed to generate suggestions. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'schedule':
        return <Calendar className="w-4 h-4" />;
      case 'communication':
        return <MessageSquare className="w-4 h-4" />;
      case 'wellbeing':
        return <Users className="w-4 h-4" />;
      default:
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'schedule':
        return 'text-[#275559] bg-[#275559]';
      case 'communication':
        return 'text-[#275559] bg-[#275559]';
      case 'wellbeing':
        return 'text-pink-600 bg-pink-500';
      default:
        return 'text-purple-600 bg-purple-500';
    }
  };

  const handleAcceptSuggestion = (suggestionId: number) => {
    acceptSuggestionMutation.mutate(suggestionId);
  };

  const handleGenerateSuggestions = () => {
    generateSuggestionsMutation.mutate();
  };

  return (
    <Card className="bg-gradient-to-br from-[--liaizen-bg-primary] to-[--liaizen-bg-secondary] border border-teal-200 shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-gray-900">
            <Brain className="w-5 h-5 mr-3 text-[#275559]" />
            AI Suggestions
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-[#275559] bg-opacity-20 text-[#275559]">
              New
            </Badge>
            <Button
              onClick={handleGenerateSuggestions}
              disabled={generateSuggestionsMutation.isPending}
              variant="ghost"
              size="sm"
            >
              {generateSuggestionsMutation.isPending ? "Generating..." : "Refresh"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4 shadow-sm animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-3"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        ) : !suggestions || (suggestions as any)?.length === 0 ? (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-[#275559] mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No AI suggestions available</p>
            <Button
              onClick={handleGenerateSuggestions}
              disabled={generateSuggestionsMutation.isPending}
            >
              {generateSuggestionsMutation.isPending ? "Generating..." : "Generate Suggestions"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {(suggestions as any)?.slice(0, 3).map((suggestion: AiSuggestion) => (
              <div
                key={suggestion.id}
                className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getSuggestionColor(suggestion.suggestionType)}`}>
                    <span className="text-white">
                      {getSuggestionIcon(suggestion.suggestionType)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{suggestion.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                    <div className="flex items-center space-x-2">
                      {!suggestion.isAccepted && (
                        <Button
                          size="sm"
                          onClick={() => handleAcceptSuggestion(suggestion.id)}
                          disabled={acceptSuggestionMutation.isPending}
                          className="text-xs"
                        >
                          Accept
                        </Button>
                      )}
                      <Button variant="outline" size="sm" className="text-xs">
                        Discuss
                      </Button>
                      {suggestion.isAccepted && (
                        <Badge variant="secondary" className="bg-[#275559] bg-opacity-15 text-[#275559] text-xs">
                          Accepted
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
