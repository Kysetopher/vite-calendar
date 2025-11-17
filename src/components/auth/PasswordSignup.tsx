import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { authService } from "@/services/authService";

export default function PasswordSignup() {
  const [, setLocation] = useLocation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword]       = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setErrorMessage("Please fill in all fields");
      setIsLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      const inviteToken = authService.getActiveInviteToken();
      const response = await authService.signup(
        { email, password, first_name: firstName, last_name: lastName },
        inviteToken
      );

      const tokenToKeep = response.invite_token || inviteToken;
      setLocation(tokenToKeep ? `/?invite=${tokenToKeep}` : "/");
    } catch (err) {
      console.error("Signup error:", err);
      setErrorMessage(
        err instanceof Error ? err.message : "Account creation failed. Please try again."
      );
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

      <form onSubmit={handleSubmit} className="space-y-3 mb-5">
        <div className="grid grid-cols-2 gap-3">
          <Input type="text" placeholder="First Name" value={firstName}
            onChange={(e) => setFirstName(e.target.value)} className="py-2.5 border-gray-200 rounded-lg shadow-sm focus:shadow-md transition-all bg-white text-sm" required />
          <Input type="text" placeholder="Last Name" value={lastName}
            onChange={(e) => setLastName(e.target.value)} className="py-2.5 border-gray-200 rounded-lg shadow-sm focus:shadow-md transition-all bg-white text-sm" required />
        </div>

        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input type="email" placeholder="Enter Email" value={email}
            onChange={(e) => setEmail(e.target.value)} className="pl-10 py-2.5 border-gray-200 rounded-lg shadow-sm focus:shadow-md transition-all bg-white text-sm" required />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input type={showPassword ? "text" : "password"} placeholder="Create Password" value={password}
            onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10 py-2.5 border-gray-200 rounded-lg shadow-sm focus:shadow-md transition-all bg-white text-sm" required />
          <Button type="button" variant="ghost" size="icon"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10 pr-10 py-2.5 border-gray-200 rounded-lg shadow-sm focus:shadow-md transition-all bg-white text-sm" required />
          <Button type="button" variant="ghost" size="icon"
            onClick={() => setShowConfirmPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>

        <Button type="submit" className="w-full py-2.5 bg-[#275559] hover:bg-[#1e4144] text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg text-sm" disabled={isLoading}>
          {isLoading ? "Processing..." : "Create Account"}
        </Button>
      </form>
    </>
  );
}
