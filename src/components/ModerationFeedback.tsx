import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Info, Lightbulb, TrendingUp, MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { messageApiService } from "@/services/messageApiService";
import { useToast } from "@/hooks/use-toast";

interface ModerationFeedbackProps {
  messageId: string;
  type: 'blocked' | 'modified' | 'tips' | 'alternatives';
  explanation?: string;
  alternatives?: string[];
  tips?: string[];
  originalContent?: string;
  modifiedContent?: string;
  onSelectAlternative?: (alternative: string) => void;
  onDismiss?: () => void;
}

export function ModerationFeedback({
  messageId,
  type,
  explanation,
  alternatives = [],
  tips = [],
  originalContent,
  modifiedContent,
  onSelectAlternative,
  onDismiss
}: ModerationFeedbackProps) {
  const { toast } = useToast();
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [selectedAlternative, setSelectedAlternative] = useState<number | null>(null);

  const handleFeedback = async (feedbackType: 'helpful' | 'too_strict') => {
    try {
      await messageApiService.submitFeedback({
        message_id: messageId,
        feedback_type: feedbackType,
        feedback_text: feedbackType === 'helpful' 
          ? 'The moderation was helpful' 
          : 'The moderation was too strict'
      });
      
      setFeedbackSent(true);
      toast({
        title: "Thank you!",
        description: "Your feedback helps improve our system.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback.",
        variant: "destructive",
      });
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'blocked':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'modified':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'tips':
        return <Lightbulb className="w-5 h-5 text-blue-500" />;
      case 'alternatives':
        return <MessageSquare className="w-5 h-5 text-purple-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'blocked':
        return 'Message Blocked';
      case 'modified':
        return 'Message Modified';
      case 'tips':
        return 'Communication Tips';
      case 'alternatives':
        return 'Alternative Messages';
      default:
        return 'Moderation Notice';
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'blocked':
        return 'bg-red-50 border-red-200';
      case 'modified':
        return 'bg-green-50 border-green-200';
      case 'tips':
        return 'bg-blue-50 border-blue-200';
      case 'alternatives':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card className={cn("shadow-sm", getBgColor())}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">{getTitle()}</h4>
              {onDismiss && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDismiss}
                  className="h-6 w-6 p-0"
                >
                  <span className="sr-only">Dismiss</span>
                  <span>×</span>
                </Button>
              )}
            </div>

            {explanation && (
              <p className="text-sm text-gray-600">{explanation}</p>
            )}

            {type === 'modified' && originalContent && modifiedContent && (
              <div className="space-y-2">
                <div className="bg-red-100 rounded p-2">
                  <p className="text-xs font-medium text-red-700 mb-1">Original:</p>
                  <p className="text-sm text-red-600 line-through">{originalContent}</p>
                </div>
                <div className="bg-green-100 rounded p-2">
                  <p className="text-xs font-medium text-green-700 mb-1">Modified:</p>
                  <p className="text-sm text-green-600">{modifiedContent}</p>
                </div>
              </div>
            )}

            {alternatives.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-700">Try one of these instead:</p>
                {alternatives.map((alt, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer transition-all",
                      selectedAlternative === index
                        ? "bg-white border-[#275559] shadow-sm"
                        : "bg-white/50 border-gray-200 hover:border-gray-300"
                    )}
                    onClick={() => setSelectedAlternative(index)}
                  >
                    <p className="text-sm text-gray-800">{alt}</p>
                  </div>
                ))}
                {onSelectAlternative && selectedAlternative !== null && (
                  <Button
                    size="sm"
                    onClick={() => onSelectAlternative(alternatives[selectedAlternative])}
                    className="w-full bg-[#275559] hover:bg-[#1e4448]"
                  >
                    Use This Message
                  </Button>
                )}
              </div>
            )}

            {tips.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-700 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Tips for better communication:
                </p>
                <ul className="space-y-1">
                  {tips.map((tip, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-blue-500 font-medium">{index + 1}.</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!feedbackSent && (
              <div className="flex items-center gap-2 pt-2 border-t">
                <p className="text-xs text-gray-500 flex-1">Was this helpful?</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeedback('helpful')}
                  className="h-7 px-2"
                >
                  <ThumbsUp className="w-3 h-3 mr-1" />
                  Yes
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeedback('too_strict')}
                  className="h-7 px-2"
                >
                  <ThumbsDown className="w-3 h-3 mr-1" />
                  No
                </Button>
              </div>
            )}

            {feedbackSent && (
              <div className="flex items-center gap-2 pt-2 border-t">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <p className="text-xs text-green-600">Thank you for your feedback!</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}