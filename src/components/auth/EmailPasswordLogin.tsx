import { useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/safe-button";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/authService";

export default function EmailPasswordLogin() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const inviteToken = authService.getActiveInviteToken();
      await authService.login({ email, password }, inviteToken);
      window.location.href = "/"; // redirect after login
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed. Please check your credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleEmailLogin} className="space-y-4 w-full">
      <div className="text-sm font-medium text-gray-700 mb-2">Sign in with email and password</div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-sm w-full">
          {error}
        </div>
      )}

      <div className="relative">
        <Mail className="absolute z-10 left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="pl-12 py-4 border-gray-200 rounded-xl shadow-sm focus:shadow-md transition-all bg-white/80 backdrop-blur-sm"
          required
        />
      </div>

      <div className="relative">
        <Lock className="absolute z-10 left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type={showPw ? "text" : "password"}
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="pl-12 pr-12 py-4 border-gray-200 rounded-xl shadow-sm focus:shadow-md transition-all bg-white/80 backdrop-blur-sm"
          required
        />
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => setShowPw((s) => !s)}
          className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400"
        >
          {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </Button>
      </div>

      <Button
        type="submit"
        className="w-full flex items-center justify-center gap-3 px-6 py-3 border border-[#275559] rounded-lg bg-[#275559] hover:bg-[#1e4144] transition-all shadow-md hover:shadow-lg active:translate-y-0 active:shadow-sm"
        loading={loading}
      >
        Sign In
      </Button>
    </form>
  );
}
