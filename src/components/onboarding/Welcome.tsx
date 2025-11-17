import React from "react";
import LiaizenLogo from "@/assets/liaizen-logo.svg";
import InviteCoParent from "./InviteCoParent";
import AcceptInvitationInline from "./AcceptInvitationInline";
import { useOnboarding } from "@/contexts/OnboardingProvider";

export default function Welcome() {
  const { hasInvitation } = useOnboarding();
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-6 ">
      <img src={LiaizenLogo} alt="LiaiZen logo" className="w-24 h-24" />
      <h1 className="text-3xl font-bold text-gray-800">Welcome to LiaiZen</h1>
      {hasInvitation ? (
        <AcceptInvitationInline />
      ) : (
        <>
          <p className="text-gray-600 max-w-md leading-relaxed">
            To get started invite your co-parent
          </p>
          <InviteCoParent />
        </>
      )}
    </div>
  );
}
