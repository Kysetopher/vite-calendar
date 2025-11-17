import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CheckCircle } from "lucide-react";

export const agreementSchema = z.object({
  signature: z.string().min(1, "Digital signature is required"),
});

export type AgreementFormData = z.infer<typeof agreementSchema>;

interface AgreementFormProps {
  form: UseFormReturn<AgreementFormData>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AgreementFormData) => void;
  isSubmitting?: boolean;
}

export default function AgreementForm({
  form,
  isOpen,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: AgreementFormProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <CheckCircle className="w-4 h-4 mr-2" />
          Agree to Plan
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Digital Agreement</DialogTitle>
          <DialogDescription>
            By signing below, you agree to the terms outlined in this parenting plan
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="signature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Digital Signature</FormLabel>
                  <FormControl>
                    <Input placeholder="Type your full legal name" {...field} />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-gray-600">
                    By typing your name, you certify this as your digital signature
                  </p>
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Recording..." : "Sign Agreement"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
