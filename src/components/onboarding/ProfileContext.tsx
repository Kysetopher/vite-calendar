import React from "react";
import ProfileContextCard from "@/components/profile/ProfileContextCard";
import { Button } from "@/components/ui/button";
import { useFormGallery } from "@/contexts/FormGalleryProvider";

export default function ProfileContext() {
  const { next } = useFormGallery();
  return (
    <div className="space-y-4">
      <ProfileContextCard />
      <div className="flex justify-end">
        <Button onClick={() => next()}>Continue</Button>
      </div>
    </div>
  );
}

