import { useState } from "react";
import { Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/safe-button";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/authService";

export default function MagicLinkLogin() {
  const [email, setEmail]             = useState("");
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]             = useState("");
  const [sent, setSent]               = useState(false);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email) {
      setError("Please enter your email address for magic link");
      setIsLoading(false);
      return;
    }

    try {
      const inviteToken = authService.getActiveInviteToken();
      const res = await authService.requestMagicLink(email, inviteToken);

      if (res.auth_method === "google_oauth" && res.auth_url) {
        window.location.href = res.auth_url;
        return;
      }

      setSent(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send magic link. Please try again.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl text-sm w-full">
        <div className="font-semibold mb-1">Check your email!</div>
        <div>We've sent you a magic link to sign in. It will expire in 15 minutes.</div>
        <button
          onClick={() => { setSent(false); setEmail(""); }}
          className="mt-2 text-green-600 underline text-sm"
        >
          Send another link
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleMagicLink} className="space-y-4 w-full">
      <div className="text-sm font-medium text-gray-700 mb-2">Sign in with magic link</div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-sm w-full">
          {error}
        </div>
      )}

      <div className="relative">
        <Mail className="absolute z-10 left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="email"
          placeholder="Enter Email for Magic Link"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="pl-12 py-4 border-gray-200 rounded-xl shadow-sm focus:shadow-md transition-all bg-white/80 backdrop-blur-sm"
          required
        />
      </div>

      <Button
        type="submit"
        className="w-full flex items-center justify-center gap-3 px-6 py-3 border border-[#275559] rounded-lg bg-[#275559] hover:bg-[#1e4144] transition-all shadow-md hover:shadow-lg active:translate-y-0 active:shadow-sm"
        loading={isLoading}
      >
        <Sparkles className="w-4 h-4" />
        Email me a login link
      </Button>

      <div className="text-xs text-center text-gray-500">
        We'll send you a secure link to sign in instantly
      </div>
    </form>
  );
}
