import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import liaizenLogo from "@assets/liaizen-logo.svg";

import MagicLinkSignup from "@/components/auth/MagicLinkSignup";
import ProviderAuthButtons from "@/components/auth/ProviderAuthButtons";
import Login from "@/components/form/LoginForm";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

export default function SignUp() {
  const [showLoginButtons, setShowLoginButtons] = useState(false);

  const handleShowLogin = () => setShowLoginButtons(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-green-50">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <Link href="/">
          <Button
            variant="ghost"
            size="icon"
            className="p-3 hover:bg-white/50 rounded-full transition-colors backdrop-blur-sm"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </Button>
        </Link>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      <div className="flex items-center justify-center min-h-[calc(100vh-100px)] px-4">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img src={liaizenLogo} alt="LiaiZen" className="w-20 h-20" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Create Account</h2>
            <p className="text-gray-600">Join LiaiZen today</p>
          </div>

          {/* Social Login Buttons (ProviderAuthButtons handles invite→state via authService) */}
          <div className="space-y-3 mb-6">
            <ProviderAuthButtons />
          </div>

          {/* OR Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
            <span className="text-gray-500 text-xs font-medium bg-white px-3">OR</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent via-gray-300 to-transparent" />
          </div>

          {/* Email Form (Magic Link) */}
          <MagicLinkSignup />

          {/* Login Link */}
          <div className="text-center mt-4">
            <span className="text-gray-600">Already have an account? </span>
            <Button variant="ghost" onClick={handleShowLogin}>
              <span className="text-[#275559] font-semibold hover:text-[#1e4144] transition-colors cursor-pointer">
                Log In
              </span>
            </Button>
          </div>
        </div>

        {/* Backdrop for modal */}
        {showLoginButtons && <div className="fixed inset-0 bg-black/60 z-50" />}

        {/* Login Dialog */}
        <Dialog modal={false} open={showLoginButtons} onOpenChange={setShowLoginButtons}>
          <DialogContent>
            <Login />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
