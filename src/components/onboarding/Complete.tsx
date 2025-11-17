import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRelationships } from "@/hooks/useRelationships";
import { useFormGallery } from "@/contexts/FormGalleryProvider";
import { useAuth } from "@/hooks/useAuth";
import { useOnboarding } from "@/contexts/OnboardingProvider";

export default function Complete() {
  const { slideData, completed, next } = useFormGallery();
  const { childData = [] } = useRelationships();
  const { completeOnboarding } = useAuth();
  const { hasInvitation, inviterEmail, inviterFirstName, inviterLastName } =
    useOnboarding();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const invite = completed[1] ? slideData[1] : null;

  const inviterName = useMemo(() => {
    const parts = [inviterFirstName, inviterLastName]
      .filter(Boolean)
      .join(" ")
      .trim();
    return parts || null;
  }, [inviterFirstName, inviterLastName]);

  const inviterEmailFromContext = inviterEmail;

  const handleComplete = async () => {
    setLoading(true);
    setError(null);
    try {
      await completeOnboarding();
      next();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">You're all set!</h2>
      {invite ? (
        <p className="text-gray-600">
          We've invited {invite.firstName} {invite.lastName} ({invite.email}) to
          join you on LiaiZen. The following children are associated with your
          account:
        </p>
        ) : hasInvitation && (inviterName || inviterEmailFromContext) ? (
          <p className="text-gray-600">
            {inviterName ?? inviterEmailFromContext}
            {inviterName &&
              inviterEmailFromContext &&
              inviterEmailFromContext !== inviterName && (
                <> ({inviterEmailFromContext})</>
              )}{" "}
            invited you to LiaiZen. The following children are associated with
            your account:
          </p>
        ) : (
          <p className="text-gray-600">
            No co-parent invitation was sent. The following children are
            associated with your account:
          </p>
        )}
      {childData.length > 0 ? (
        <ul className="list-disc list-inside">
          {childData.map((child) => (
            <li key={child.id}>
              {child.first_name} {child.last_name}
            </li>
          ))}
        </ul>
      ) : (
        <p>No children added yet.</p>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex justify-end">
        <Button onClick={handleComplete} disabled={loading}>
          {loading ? "Completing..." : "Complete Onboarding."}
        </Button>
      </div>
    </div>
  );
}

