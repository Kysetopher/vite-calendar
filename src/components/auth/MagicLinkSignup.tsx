import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Sparkles } from "lucide-react";
import { authService } from "@/services/authService";

export default function MagicLinkSignup() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleMagicLink = async () => {
    setErrorMessage("");
    setIsLoading(true);

    if (!email) {
      setErrorMessage("Please enter your email address");
      setIsLoading(false);
      return;
    }

    try {
      const inviteToken = authService.getActiveInviteToken();
      const response = await authService.requestMagicLink(email, inviteToken);

      if (response.auth_method === "google_oauth" && response.auth_url) {
        window.location.href = response.auth_url;
        return;
      }

      setMagicLinkSent(true);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to send magic link. Please try again.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-sm mb-3">
          {errorMessage}
        </div>
      )}

      {magicLinkSent ? (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl text-sm mb-3">
          <div className="font-semibold mb-1">Check your email!</div>
          <div>We've sent you a magic link to sign in. It will expire in 15 minutes.</div>
          <button onClick={() => setMagicLinkSent(false)} className="mt-2 text-green-600 underline text-sm">
            Back
          </button>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); void handleMagicLink(); }} className="space-y-3 mb-5">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input type="email" placeholder="Enter Email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
          </div>

          <Button type="submit" className="w-full py-2.5 bg-[#275559] text-white rounded-lg" disabled={isLoading}>
            {isLoading ? "Processing..." : (<><Sparkles className="w-4 h-4 mr-2" />Email me a signup link</>)}
          </Button>
        </form>
      )}
    </>
  );
}
