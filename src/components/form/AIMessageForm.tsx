import { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface AIMessageFormProps {
  message: string;
  onMessageChange: (value: string) => void;
  messageType: string;
  onMessageTypeChange: (type: string) => void;
  isSubmitting?: boolean;
  onSubmit: (e: FormEvent) => void;
}

export default function AIMessageForm({
  message,
  onMessageChange,
  messageType,
  onMessageTypeChange,
  isSubmitting = false,
  onSubmit,
}: AIMessageFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="flex space-x-2">
        <Input
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="Ask me anything about co-parenting..."
          className="flex-1"
          disabled={isSubmitting}
        />
        <Button type="submit" disabled={!message.trim() || isSubmitting}>
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          {[
            { value: "general", label: "General" },
            { value: "advice", label: "Advice" },
            { value: "mediation", label: "Mediation" },
          ].map((type) => (
            <Button
              key={type.value}
              type="button"
              onClick={() => onMessageTypeChange(type.value)}
              variant="ghost"
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                messageType === type.value
                  ? "bg-orange-100 text-orange-800"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
            >
              {type.label}
            </Button>
          ))}
        </div>

        <p className="text-xs text-gray-500 flex items-center">
          <span className="mr-1">🔒</span>
          Your conversations are private and secure
        </p>
      </div>
    </form>
  );
}
