"use client";

import { UseFormReturn, Controller } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const adultSchema = z.object({
  first_name: z.string().min(1, "Name is required"),
  last_name: z.string().min(1),
  relationship: z.string().min(1, "Relationship is required"),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export type AdultFormData = z.infer<typeof adultSchema>;

interface AdultFormProps {
  form: UseFormReturn<AdultFormData>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AdultFormData) => Promise<void> | void;
  onCancel: () => void;
  editing?: boolean;
  isSubmitting?: boolean;
}

export default function AdultForm({
  form,
  isOpen,
  onOpenChange,
  onSubmit,
  onCancel,
  editing,
  isSubmitting,
}: AdultFormProps) {
  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
  } = form;

  // Close the dialog after a successful submit (mirrors ChildForm behavior).
  const handleSubmitAndClose = handleSubmit(async (data) => {
    try {
      await onSubmit(data);
      onOpenChange(false); // close only on success
    } catch {
      // keep dialog open if parent throws (e.g., API error toast)
    }
  });

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Adult" : "Add Adult"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmitAndClose} className="space-y-4">
          <div>
            <Label htmlFor="name">First Name *</Label>
            <Input
              id="name"
              {...register("first_name")}
              placeholder="Enter full name"
              disabled={isSubmitting}
            />
            {errors.first_name && (
              <p className="text-sm text-red-600 mt-1">{errors.first_name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="name">Last Name</Label>
            <Input
              id="name"
              {...register("last_name")}
              placeholder="Enter full name"
              disabled={isSubmitting}
            />
            {errors.last_name && (
              <p className="text-sm text-red-600 mt-1">{errors.last_name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="relationship">Relationship to Self *</Label>
            <Controller
              control={control}
              name="relationship"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="co-parent">Co-parent</SelectItem>
                    <SelectItem value="romantic">New Partner</SelectItem>
                    <SelectItem value="caregiver">Child Caregiver</SelectItem>
                    <SelectItem value="family-member">Family Member</SelectItem>
                    <SelectItem value="friend">Friend</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.relationship && (
              <p className="text-sm text-red-600 mt-1">
                {errors.relationship.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              {...register("phone")}
              placeholder="(555) 123-4567"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="email@example.com"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              {...register("address")}
              placeholder="Street address, city, state, zip"
              rows={2}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Additional notes about this person"
              rows={2}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" onClick={handleCancel} variant="ghost" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editing ? "Update Adult" : "Add Adult"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
