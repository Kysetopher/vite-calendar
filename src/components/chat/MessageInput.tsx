import { useState, KeyboardEvent, useEffect, useRef, type RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Send, Loader2, AlertCircle, CheckCircle, X, Shield, ShieldCheck, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import useAutoResize from "@/hooks/useAutoResize";
import type SimpleBarCore from "simplebar-core";

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  onTyping?: (isTyping: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
  moderationStatus?: "processing" | "passed" | "blocked" | null;
  moderationFeedback?: {
    explanation?: string;
    tips?: string[];
    alternatives?: string[];
  };
  onClearFeedback?: () => void;
  className?: string;
  scrollAreaRef?: RefObject<SimpleBarCore | null>;
}

export function MessageInput({
  onSendMessage,
  onTyping,
  disabled = false,
  placeholder = "Type your message...",
  moderationStatus,
  moderationFeedback,
  onClearFeedback,
  className,
  scrollAreaRef,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedAlternative, setSelectedAlternative] = useState<string | null>(null);
  const [moderationProgress, setModerationProgress] = useState("");
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useAutoResize(message);

  const handleTypingStart = () => {
    if (!isTyping && onTyping) {
      setIsTyping(true);
      onTyping(true);
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(handleTypingStop, 2000);
  };

  const handleTypingStop = () => {
    if (isTyping && onTyping) {
      setIsTyping(false);
      onTyping(false);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const handleSend = async () => {
    if (!message.trim() || isSending || disabled) return;
    const toSend = selectedAlternative || message.trim();
    setMessage("");
    setIsSending(true);
    setSelectedAlternative(null);
    setModerationProgress("");
    handleTypingStop();

    const steps = [
      "Analyzing message…",
      "Checking tone and content…",
      "Applying moderation rules…",
      "Preparing to send…",
    ];
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < steps.length) setModerationProgress(steps[idx++]);
    }, 400);

    try {
      await onSendMessage(toSend);
      setModerationProgress("Message sent!");
      setTimeout(() => setModerationProgress(""), 1000);
    } catch (err: any) {
      console.error("Failed to send message:", err);
      if (!err?.message?.includes("blocked")) setMessage(toSend);
      setModerationProgress("Failed to send");
      setTimeout(() => setModerationProgress(""), 2000);
    } finally {
      clearInterval(interval);
      setIsSending(false);
    }
  };

  const handleSelectAlternative = (alt: string) => {
    setMessage(alt);
    setSelectedAlternative(alt);
    onClearFeedback?.();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setMessage(val);
    if (val.trim() && !disabled && !isSending) handleTypingStart();
    else if (!val.trim()) handleTypingStop();
  };

  useEffect(() => () => {
    typingTimeoutRef.current && clearTimeout(typingTimeoutRef.current);
    if (isTyping) onTyping?.(false);
  }, [isTyping, onTyping]);

  const isDisabled = disabled || isSending || !message.trim();

  const handleFocus = () => {
    setTimeout(() => {
      const el = scrollAreaRef?.current?.getScrollElement();
      el?.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }, 100);
  };

  return (
    <div className={cn("relative rounded-b-md", className)}>
      {/* Moderation Feedback */}
      {moderationFeedback && (
        <div className="absolute bottom-full left-0 right-0 mb-2 z-20">
          <Card className="p-4 bg-amber-50 shadow-lg border-amber-200">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-amber-600 text-lg">💡</span>
                <span className="text-amber-800 font-medium text-sm">Let's improve this message</span>
              </div>
              {onClearFeedback && (
                <button
                  onClick={onClearFeedback}
                  className="text-amber-600 hover:text-amber-800 text-sm px-2 py-1 rounded-md hover:bg-amber-100 transition-colors"
                >
                  ✕
                </button>
              )}
            </div>

            {moderationFeedback.explanation && (
              <div className="mb-3 text-sm text-amber-700">
                <span className="font-medium">Here's why:</span> {moderationFeedback.explanation}
              </div>
            )}

            {moderationFeedback.tips && moderationFeedback.tips.length > 0 && (
              <div className="text-sm text-amber-700 mb-3">
                <div className="font-medium text-amber-800 mb-1">Communication tips:</div>
                <ul className="ml-4 list-disc space-y-1">
                  {moderationFeedback.tips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {moderationFeedback.alternatives && moderationFeedback.alternatives.length > 0 && (
              <div className="mb-3">
                <div className="text-sm font-medium text-amber-800 mb-2">Try these instead:</div>
                <div className="space-y-2">
                  {moderationFeedback.alternatives.map((alternative, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectAlternative(alternative)}
                      className="block w-full text-left p-2 text-sm bg-white border border-amber-200 rounded-md hover:bg-amber-50 hover:border-amber-300 transition-colors cursor-pointer"
                    >
                      "{alternative}"
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Moderation Status */}
      {moderationStatus && (
        <div className="absolute -top-8 left-0">
          <div
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-300",
              {
                "bg-gray-100 text-gray-600": moderationStatus === "processing",
                "bg-green-100 text-green-700": moderationStatus === "passed",
                "bg-amber-100 text-amber-700": moderationStatus === "blocked",
              }
            )}
          >
            {moderationStatus === "processing" ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>{moderationProgress || "Analyzing message…"}</span>
              </>
            ) : moderationStatus === "passed" ? (
              <>
                <ShieldCheck className="w-3 h-3" />
                <span>Message approved</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-3 h-3" />
                <span>Message blocked</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="rounded-b-md bg-white border-t border-gray-100 shadow-lg p-4  lg:mb-0 relative  flex-shrink-0 flex flex-col justify-end">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={handleTypingStop}
              placeholder={placeholder}
              disabled={disabled || isSending || moderationStatus === "processing"}
              className={cn(
                "min-h-[48px] max-h-32 resize-none border-gray-200",
                "focus:border-[#275559] focus:ring-2 focus:ring-[#275559]/20",
                "text-base rounded-xl transition-all flex items-center",
                moderationStatus === "blocked" && "border-amber-300 bg-amber-50"
              )}
              rows={1}
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={isDisabled || moderationStatus === "processing"}
            className="h-12 px-4 flex-shrink-0 rounded-xl shadow-sm"
          >
            {isSending || moderationStatus === "processing" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
