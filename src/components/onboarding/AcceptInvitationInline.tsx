import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/contexts/OnboardingProvider";
import { useFormGallery } from "@/contexts/FormGalleryProvider";
import { apiRequest } from "@/lib/queryClient";

export default function AcceptInvitationInline() {
  const { inviterEmail, invitationToken, inviterFirstName, inviterLastName } =
    useOnboarding();
  const { next } = useFormGallery();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inviterName = useMemo(() => {
    const parts = [inviterFirstName, inviterLastName]
      .filter(Boolean)
      .join(" ")
      .trim();
    return parts || null;
  }, [inviterFirstName, inviterLastName]);

  const inviterPrimaryEmail = inviterEmail;

  if (!invitationToken) return null;

  const handleAccept = async () => {
    if (!invitationToken) return;
    setIsSubmitting(true);
    try {
      await apiRequest("POST", `/api/invitations/accept/${invitationToken}`);
      next();
    } catch (err) {
      // Silently ignore errors
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-4 flex flex-col items-center space-y-4 text-center">
      {(inviterName || inviterPrimaryEmail) && (
        <div className="max-w-md text-gray-600 leading-relaxed space-y-1">
          <p className="font-medium text-gray-800">
            {inviterName ?? inviterPrimaryEmail} invited you to join LiaiZen.
          </p>
          {inviterName &&
            inviterPrimaryEmail &&
            inviterPrimaryEmail !== inviterName && (
            <p className="text-sm text-gray-500">{inviterPrimaryEmail}</p>
          )}
        </div>
      )}
      <Button onClick={handleAccept} disabled={isSubmitting}>
        Accept Invitation
      </Button>
    </div>
  );
}
