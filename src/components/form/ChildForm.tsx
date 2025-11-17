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

export const childSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().optional(),
  birthday: z.string().min(1, "Birthday is required"),
  custody_percentage: z.number().min(0).max(100).optional(),
  custody_arrangement: z.string().optional(),
  custody_schedule: z.string().optional(),
  school: z.string().optional(),
  grade: z.string().optional(),
  allergies: z.string().optional(),
  medications: z.string().optional(),
  emergency_contact: z.string().optional(),
  emergency_phone: z.string().optional(),
  notes: z.string().optional(),
  color: z.string().optional(),
});

export type ChildFormData = z.infer<typeof childSchema>;

interface ChildFormProps {
  form: UseFormReturn<ChildFormData>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ChildFormData) => void;
  onCancel: () => void;
  editing?: boolean;
  isSubmitting?: boolean;
}

export default function ChildForm({
  form,
  isOpen,
  onOpenChange,
  onSubmit,
  onCancel,
  editing,
  isSubmitting,
}: ChildFormProps) {
  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
  } = form;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h:[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit Child Information" : "Add Child Information"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="childFirstName">First Name *</Label>
              <Input id="childFirstName" {...register("first_name")} placeholder="Child's first name" />
              {errors.first_name && (
                <p className="text-sm text-red-600 mt-1">{errors.first_name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="childLastName">Last Name</Label>
              <Input id="childLastName" {...register("last_name")} placeholder="Child's last name" />
            </div>

            <div>
              <Label htmlFor="childBirthday">Birthday *</Label>
              <Input id="childBirthday" type="date" {...register("birthday")} />
              {errors.birthday && (
                <p className="text-sm text-red-600 mt-1">{errors.birthday.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="custody_percentage">Custody Percentage</Label>
              <Input
                id="custody_percentage"
                type="number"
                min="0"
                max="100"
                {...register("custody_percentage", { valueAsNumber: true })}
                placeholder="50"
              />
            </div>

            <div>
              <Label htmlFor="custody_arrangement">Custody Arrangement</Label>
              <Controller
                control={control}
                name="custody_arrangement"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select arrangement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="joint">Joint Custody</SelectItem>
                      <SelectItem value="primary">Primary Custody</SelectItem>
                      <SelectItem value="weekend">Weekend Custody</SelectItem>
                      <SelectItem value="alternate">Alternating Custody</SelectItem>
                      <SelectItem value="shared">Shared Custody</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <Label htmlFor="school">School Name</Label>
              <Input id="school" {...register("school")} placeholder="Child's school" />
            </div>

            <div>
              <Label htmlFor="grade">Grade</Label>
              <Input id="grade" {...register("grade")} placeholder="Current grade" />
            </div>

            <div>
              <Label htmlFor="color">Color</Label>
              <Input id="color" type="color" {...register("color")} />
            </div>

            <div>
              <Label htmlFor="emergency_contact">Emergency Contact</Label>
              <Input
                id="emergency_contact"
                {...register("emergency_contact")}
                placeholder="Emergency contact name"
              />
            </div>

            <div>
              <Label htmlFor="emergency_phone">Emergency Phone</Label>
              <Input
                id="emergency_phone"
                {...register("emergency_phone")}
                placeholder="Emergency contact phone"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="custody_schedule">Custody Schedule</Label>
            <Textarea
              id="custody_schedule"
              {...register("custody_schedule")}
              placeholder="Describe the custody schedule (e.g., Every other weekend, Wednesday evenings...)"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="allergies">Allergies</Label>
            <Textarea id="allergies" {...register("allergies")} placeholder="List any allergies" rows={2} />
          </div>

          <div>
            <Label htmlFor="medications">Medications</Label>
            <Textarea id="medications" {...register("medications")} placeholder="List any medications" rows={2} />
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Any additional information about the child"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" onClick={onCancel} variant="ghost">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="rounded-full">
              {isSubmitting ? "Saving..." : editing ? "Update Child" : "Add Child"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
