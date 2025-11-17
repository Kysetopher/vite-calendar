import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus } from "lucide-react";

export const createPlanSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  coParent: z.string().optional(),
});

export type CreatePlanFormData = z.infer<typeof createPlanSchema>;

interface CreatePlanFormProps {
  form: UseFormReturn<CreatePlanFormData>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreatePlanFormData) => void;
  isSubmitting?: boolean;
}

export default function CreatePlanForm({
  form,
  isOpen,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: CreatePlanFormProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create New Plan
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Parenting Plan</DialogTitle>
          <DialogDescription>
            Start building a comprehensive parenting plan with your co-parent
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Smith Family Parenting Plan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Brief description of the plan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="coParent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Co-Parent Email (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="coparent@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Plan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
