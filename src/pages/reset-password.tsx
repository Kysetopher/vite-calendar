import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/safe-button.tsx";
import { Input } from "@/components/ui/input";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    await fetch(`${API_BASE_URL}/api/auth/password/forgot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    setMessage("If that email is registered, you'll receive a reset link shortly.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
        <h1 className="text-xl font-bold text-gray-900 text-center mb-2">Reset Password</h1>
        <p className="text-gray-600 text-center mb-6">Enter your email to receive a reset link</p>
        {message && <p className="text-sm text-gray-600 mb-4 text-center">{message}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" loading={loading}>
            Send reset link
          </Button>
        </form>
        <div className="text-center mt-4">
          <Link href="/">
            <span className="text-[#275559] font-semibold hover:text-[#1e4144] cursor-pointer">
              Back to login
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

