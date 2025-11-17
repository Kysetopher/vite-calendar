import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

export const commentSchema = z.object({
  content: z.string().min(1, "Comment is required"),
  section: z.string().optional(),
});

export type CommentFormData = z.infer<typeof commentSchema>;

interface CommentFormProps {
  form: UseFormReturn<CommentFormData>;
  onSubmit: (data: CommentFormData) => void;
  isSubmitting?: boolean;
}

export default function CommentForm({ form, onSubmit, isSubmitting }: CommentFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex space-x-2">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input placeholder="Add a comment..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </Form>
  );
}
