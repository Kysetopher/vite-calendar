import React from "react";
import ChildManager from "@/components/profile/ChildManager";
import { Button } from "@/components/ui/button";
import { useFormGallery } from "@/contexts/FormGalleryProvider";

export default function ChildManagerOnboarding() {
  const { next } = useFormGallery();
  return (
    <div className="space-y-4">
      <ChildManager />
      <div className="flex justify-end">
        <Button onClick={() => next()}>Continue</Button>
      </div>
    </div>
  );
}
