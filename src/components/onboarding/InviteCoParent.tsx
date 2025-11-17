import React, { useState } from "react";
import InviteCoParentForm from "@/components/form/InviteCoParentForm";
import { Button } from "@/components/ui/button";
import { useFormGallery } from "@/contexts/FormGalleryProvider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function InviteCoParent() {
  const { next } = useFormGallery();
  const [isSent, setIsSent] = useState(false);
  const [info, setInfo] = useState<{ firstName: string; lastName: string; email: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (isSent) {
    return (
      <div className="mt-4 flex flex-col items-center space-y-4 text-center">
        <p>Invitation sent! Your co-parent will receive an email shortly.</p>
        <Button onClick={() => info && next(info)}>Continue</Button>
      </div>
    );
  }

  return (
    <div className="mt-4 w-full ">
      <InviteCoParentForm
        compact
        onError={setError}
        onSuccess={(response, input) => {
          setIsSent(true);
          setInfo({
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.inviteeEmail,
          });
        }}
      />
      <AlertDialog
        open={!!error}
        onOpenChange={(open) => {
          if (!open) setError(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>{error}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setError(null)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
