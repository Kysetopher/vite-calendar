import React from "react";
import { useLocation } from "wouter";
import FormGallery from "@/components/ui/form-gallery";
import { Card } from "@/components/ui/card";
import Welcome from "@/components/onboarding/Welcome";
import ProfileContext from "@/components/onboarding/ProfileContext";
import ChildManagerOnboarding from "@/components/onboarding/ChildManager";
import Complete from "@/components/onboarding/Complete";
import { FormGalleryProvider } from "@/contexts/FormGalleryProvider";
import { OnboardingProvider } from "@/contexts/OnboardingProvider";

export default function Onboarding() {
  const [, setLocation] = useLocation();

  const slides = [
    { title: "Welcome", content: <Welcome />, hasInternalNext: true },
    { title: "Profile context", content: <ProfileContext />, hasInternalNext: true },
    {
      title: "Add your children",
      content: <ChildManagerOnboarding />,
      hasInternalNext: true,
    },
    { title: "Complete Onboarding", content: <Complete />, hasInternalNext: true },
  ];

  return (
    <OnboardingProvider>
      <FormGalleryProvider slides={slides} onFinish={() => setLocation("/dashboard")}>
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <Card className="rounded-none sm:rounded-md w-full h-full sm:h-auto max-w-lg p-6 shadow-lg justify-end  bg-gradient-to-b from-indigo-50 to-white ">
            <FormGallery />
          </Card>
        </div>
      </FormGalleryProvider>
    </OnboardingProvider>
  );
}
