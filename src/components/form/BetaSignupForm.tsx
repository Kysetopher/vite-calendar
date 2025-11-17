import { useState } from "react";
import { Button } from "@/components/ui/safe-button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/safe-card";
import { Mail } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface BetaSignupFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  email: string;
  setEmail: (value: string) => void;
  isVisible: boolean;
}

export default function BetaSignupForm({
  onSuccess,
  onCancel,
  email,
  setEmail,
  isVisible,
}: BetaSignupFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    fetch(`${API_BASE_URL}/api/beta_waitlist/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(() => {
        setIsLoading(false);
        onSuccess();
      })
      .catch((error) => {
        console.error("Error:", error);
        setIsLoading(false);
      });
  };

  return (
    <div className="my-16">
      <Card
        className={`pt-8 px-8 pb-4 text-center mb-8 transition-all duration-1000 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <div className={`transition-all duration-1000 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <div className="text-neutral-700 text-2xl md:text-3xl lg:text-4xl pb-2 font-semibold">
            Co-Parent Like Never Before!
          </div>
          <div className="text-base text-neutral-600 mb-8 max-w-2xl mx-auto p-4">
            We're almost ready to launch our beta program! Enter your email below to be
            notified when we go live and get exclusive early access.
          </div>
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="relative w-full">
              <Mail className="absolute z-10 left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="email"
                placeholder="Enter Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12 py-4 border-gray-200 rounded-2xl shadow-sm focus:shadow-md transition-all bg-white/80 backdrop-blur-sm"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-fit whitespace-nowrap py-4 bg-[#275559] hover:bg-[#1e4144] text-white font-medium rounded-2xl transition-all shadow-sm hover:shadow-md"
              loading={isLoading}
            >
              Join Beta
            </Button>
          </form>
          <Button
            size="default"
            variant="link"
            className="text-gray-500 gap-3 mt-4"
            onClick={onCancel}
          >
            go back
          </Button>
        </div>
      </Card>
    </div>
  );
}
