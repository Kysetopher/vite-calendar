import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User } from "lucide-react";

export const profileSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  birthday: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  relationship_history: z.string().optional(),
  communication_goals: z.string().optional(),
  communication_style: z.string().optional(),
  main_concerns: z.string().optional(),
  co_parenting_priorities: z.string().optional(),
  biggest_challenges: z.string().optional(),
  successful_strategies: z.string().optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  form: UseFormReturn<ProfileFormData>;
  onSubmit: (data: ProfileFormData) => void;
  isSubmitting?: boolean;
}

export default function ProfileForm({
  form,
  onSubmit,
  isSubmitting,
}: ProfileFormProps) {
  return (
    <Card className="shadow">
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="w-5 h-5 mr-2" />
          Profile Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name</Label>
              <Input id="first_name" {...form.register("first_name")} placeholder="Enter your first name" />
            </div>
            <div>
              <Label htmlFor="last_name">Last Name</Label>
              <Input id="last_name" {...form.register("last_name")} placeholder="Enter your last name" />
            </div>
            <div>
              <Label htmlFor="birthday">Birthday</Label>
              <Input id="birthday" type="date" {...form.register("birthday")} />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" {...form.register("phone")} placeholder="Enter your phone number" />
            </div>
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" {...form.register("address")} placeholder="Enter your address" rows={3} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...form.register("email")} placeholder="Enter your email" />
          </div>
          <Button type="submit" disabled={isSubmitting} className="rounded-full">
            {isSubmitting ? "Updating..." : "Update Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
