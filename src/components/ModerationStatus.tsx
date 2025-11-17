import { Shield, ShieldCheck, ShieldAlert, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModerationStatusProps {
  status: 'processing' | 'passed' | 'blocked' | null;
  className?: string;
}

export function ModerationStatus({ status, className }: ModerationStatusProps) {
  if (!status) return null;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-300",
        {
          "bg-gray-100 text-gray-600": status === 'processing',
          "bg-green-100 text-green-700": status === 'passed',
          "bg-red-100 text-red-700": status === 'blocked',
        },
        className
      )}
    >
      {status === 'processing' && (
        <>
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Checking message...</span>
        </>
      )}
      {status === 'passed' && (
        <>
          <ShieldCheck className="w-3 h-3" />
          <span>Message approved</span>
        </>
      )}
      {status === 'blocked' && (
        <>
          <ShieldAlert className="w-3 h-3" />
          <span>Message blocked</span>
        </>
      )}
    </div>
  );
}