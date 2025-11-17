import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import ProfileForm, { profileSchema, type ProfileFormData } from "@/components/form/ProfileForm";
import { useAuth } from "@/hooks/useAuth";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: ProfileFormData;
}

export default function EditProfileDialog({
  open,
  onOpenChange,
  initialData,
}: EditProfileDialogProps) {
  const { toast } = useToast();
  const { updateProfile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      birthday: "",
      address: "",
      phone: "",
      email: "",
      relationship_history: "",
      communication_goals: "",
      communication_style: "",
      main_concerns: "",
      co_parenting_priorities: "",
      biggest_challenges: "",
      successful_strategies: "",
      ...initialData,
    },
  });

  useEffect(() => {
    form.reset({
      first_name: initialData.first_name ?? "",
      last_name: initialData.last_name ?? "",
      birthday: initialData.birthday ?? "",
      address: initialData.address ?? "",
      phone: initialData.phone ?? "",
      email: initialData.email ?? "",
      relationship_history: initialData.relationship_history ?? "",
      communication_goals: initialData.communication_goals ?? "",
      communication_style: initialData.communication_style ?? "",
      main_concerns: initialData.main_concerns ?? "",
      co_parenting_priorities: initialData.co_parenting_priorities ?? "",
      biggest_challenges: initialData.biggest_challenges ?? "",
      successful_strategies: initialData.successful_strategies ?? "",
    });
  }, [initialData, form]);



  const handleError = (error: Error) => {
    if (isUnauthorizedError(error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
    toast({
      title: "Error",
      description: "Failed to update profile. Please try again.",
      variant: "destructive",
    });
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsSaving(true);
      await updateProfile(data);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      onOpenChange(false);
    } catch (error) {
      handleError(error as Error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <ProfileForm
          form={form}
          onSubmit={onSubmit}
          isSubmitting={isSaving}
        />
      </DialogContent>
    </Dialog>
  );
}

