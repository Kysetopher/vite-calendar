// components/form/InviteCoParentForm.tsx
import * as React from "react";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";

export const inviteSchema = z.object({
  inviteeEmail: z.string().email("Please enter a valid email address"),
  message: z.string().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});
export type InviteFormData = z.infer<typeof inviteSchema>;

type Props = {
  compact?: boolean;
  defaultValues?: Partial<InviteFormData>;
  /** Close dialog / advance slide, etc. */
  onSuccess?: (response: any, input: InviteFormData) => void;
  /** Allow the parent (e.g., PendingTasks) to hard-refresh invites if it wants */
  onForceRefreshInvites?: () => void;
  /** Optional cancel button (parent controls closing the dialog/page) */
  onCancel?: () => void;
  onError?: (message: string) => void;
  submitLabel?: string;
  cancelLabel?: string;
};

export default function InviteCoParentForm({
  compact,
  defaultValues,
  onSuccess,
  onForceRefreshInvites,
  onCancel,
  onError,
  submitLabel = "Send Invitation",
  cancelLabel = "Cancel",
}: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      inviteeEmail: "",
      message:
        "Join me on LiaiZen to coordinate our co-parenting! We'll be able to share schedules, manage important documents, and stay organized together.",
      firstName: "",
      lastName: "",
      ...defaultValues,
    },
  });

  const createInvitation = useMutation({
    mutationFn: async (data: InviteFormData) =>
      apiRequest("POST", "/api/invitations/invite", {
        invitee_email: data.inviteeEmail,
        message: data.message,
        invitee_first_name: data.firstName,
        invitee_last_name: data.lastName,
      }),

    onSuccess: async (response: any, variables: InviteFormData) => {
      // keep both lists fresh
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/invitations/sent"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/invitations/received"] }),
      ]);

      form.reset();

      // preserve all messaging branches
      if (response?.already_connected) {
        toast({
          title: "Already Connected",
          description: `You are already connected with ${response.invitee_email}. You can still invite other co-parents.`,
        });
      } else if (response?.is_existing_user) {
        if (response?.email_status === "disabled") {
          toast({
            title: "Invitation sent!",
            description: `${response.invitee_email} is already a user. They can see your invitation in their app.`,
          });
        } else {
          toast({
            title: "Invitation sent!",
            description: `${response.invitee_email} will receive an email notification.`,
          });
        }
      } else {
        toast({
          title: "Invitation sent!",
          description: "Your co-parent will receive an email with instructions to join.",
        });
      }

      onSuccess?.(response, variables);
      onForceRefreshInvites?.();
    },

    onError: async (error: any) => {
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

      // robust parsing you had before
      let errorMessage = "Failed to send invitation";
      if (error?.message) {
        try {
          const jsonMatch = error.message.match(/\d+:\s*({.*})/);
          if (jsonMatch) {
            const errorData = JSON.parse(jsonMatch[1]);
            errorMessage = errorData.detail || errorMessage;
          } else {
            errorMessage = error.message;
          }
        } catch {
          errorMessage = error.message;
        }
      }

      onError?.(errorMessage);

      if (errorMessage.includes("external users are not available")) {
        toast({
          title: "Email service not available",
          description:
            "Invitations for new users require email service. Please ask them to sign up directly at app.liaizen.com",
          variant: "destructive",
          duration: 8000,
        });
      } else if (errorMessage.includes("already sent to this email")) {
        toast({
          title: "Invitation already pending",
          description:
            "You have already sent an invitation to this email address. Check your Sent Invitations to view or resend it.",
          duration: 6000,
        });
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["/api/invitations/received"] }),
          queryClient.invalidateQueries({ queryKey: ["/api/invitations/sent"] }),
        ]);
        onForceRefreshInvites?.();
      } else if (errorMessage.includes("already connected")) {
        toast({
          title: "Already Connected",
          description:
            "You are already connected with this co-parent. You can still invite other co-parents.",
          duration: 6000,
        });
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["/api/invitations/received"] }),
          queryClient.invalidateQueries({ queryKey: ["/api/invitations/sent"] }),
        ]);
        onForceRefreshInvites?.();
      } else {
        toast({
          title: "Failed to send invitation",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
  });

  return (
    <Card className={compact ? "border-0 shadow-none" : undefined}>
      <CardContent className={compact ? "p-0" : "pt-6"}>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((d) => createInvitation.mutate(d))}
            className="space-y-4"
          >
            {/* Email first (as in your “nicer” version) */}
            <FormField
              control={form.control}
              name="inviteeEmail"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input type="email" placeholder="Enter their email address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* First / Last name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="First name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Message */}
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Add a personal message to your invitation..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  {cancelLabel}
                </Button>
              )}
              <Button
                type="submit"
                className="bg-[#275559] hover:bg-[#275559]/90"
                disabled={createInvitation.isPending}
              >
                {createInvitation.isPending ? "Sending..." : submitLabel}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
