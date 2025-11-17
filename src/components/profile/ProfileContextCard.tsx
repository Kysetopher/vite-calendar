import * as React from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

import { profileSchema, type ProfileFormData } from "@/components/form/ProfileForm";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface ProfileContextCardProps {
  className?: string;
}

type FieldName =
  | "relationship_history"
  | "communication_goals"
  | "communication_style"
  | "main_concerns"
  | "co_parenting_priorities"
  | "biggest_challenges"
  | "successful_strategies";

// map context profile → form defaults
function profileToDefaults(profile: any | null | undefined): Partial<ProfileFormData> {
  return {
    relationship_history: profile?.relationship_history ?? undefined,
    communication_goals: profile?.communication_goals ?? undefined,
    communication_style: profile?.communication_style ?? undefined,
    main_concerns: profile?.main_concerns ?? undefined,
    co_parenting_priorities: profile?.co_parenting_priorities ?? undefined,
    biggest_challenges: profile?.biggest_challenges ?? undefined,
    successful_strategies: profile?.successful_strategies ?? undefined,
  };
}

// UI config (order + labels + placeholders)
const FIELDS: Array<{
  name: FieldName;
  label: string;
  placeholder: string;
}> = [
  {
    name: "relationship_history",
    label: "Relationship Background",
    placeholder: "Brief overview of your relationship history and separation...",
  },
  {
    name: "communication_goals",
    label: "Co-Parenting Goals",
    placeholder: "What do you hope to achieve through effective co-parenting?",
  },
  {
    name: "communication_style",
    label: "Communication Preferences",
    placeholder: "How do you prefer to communicate?",
  },
  {
    name: "main_concerns",
    label: "Primary Concerns",
    placeholder: "What worries you most about co-parenting?",
  },
  {
    name: "co_parenting_priorities",
    label: "What's Most Important for Your Children",
    placeholder: "What matters most for your children's wellbeing?",
  },
  {
    name: "biggest_challenges",
    label: "Current Challenges",
    placeholder: "What difficulties are you facing now?",
  },
  {
    name: "successful_strategies",
    label: "What's Working Well",
    placeholder: "What strategies or approaches have been successful?",
  },
];

export default function ProfileContextCard({ className }: ProfileContextCardProps) {
  const { profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: profileToDefaults(profile),
    mode: "onBlur",
  });

  // keep form populated if profile arrives/changes later
  useEffect(() => {
    form.reset(profileToDefaults(profile));
  }, [profile, form]);

  const handleError = (error: Error) => {
    if (isUnauthorizedError(error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => (window.location.href = "/api/login"), 500);
      return;
    }
    toast({
      title: "Error",
      description: "Failed to update profile. Please try again.",
      variant: "destructive",
    });
  };

  const saveField = async (payload: Partial<ProfileFormData>) => {
    try {
      setIsSaving(true);
      await updateProfile(payload);
      toast({ title: "Saved", description: "Your changes have been saved." });
    } catch (error) {
      handleError(error as Error);
    } finally {
      setIsSaving(false);
    }
  };

  const registerAutoSave = (name: FieldName) =>
    form.register(name, {
      onBlur: async () => {
        const ok = await form.trigger(name);
        if (!ok) return;
        const value = form.getValues(name);
        await saveField({ [name]: value });
      },
    });

  return (
    <Card className={cn("shadow", className)}>
      <CardHeader>
        <CardTitle>Relationship Details</CardTitle>
        <div className="text-sm text-gray-600">
          Help our AI understand your situation better by sharing some context. This
          information will help provide more personalized guidance and suggestions.
        </div>
      </CardHeader>
      <CardContent>
        

        {/* Single-collapsible list: only one open at a time, but closable */}
        <Accordion type="single" collapsible className="w-full">
          {FIELDS.map(({ name, label, placeholder }) => (
            <AccordionItem key={name} value={name}>
              <AccordionTrigger className="text-left">{label}</AccordionTrigger>
              <AccordionContent>
                  <Textarea
                    id={name}
                    rows={3}
                    placeholder={placeholder}
                    disabled={isSaving}
                    {...registerAutoSave(name)}
                  />
                  {form.formState.errors[name] && (
                    <p className="text-sm text-red-600">
                      {(form.formState.errors as any)[name]?.message as string}
                    </p>
                  )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
