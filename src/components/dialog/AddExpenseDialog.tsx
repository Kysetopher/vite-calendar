import ExpenseForm, { type ExpenseFormData } from "@/components/form/ExpenseForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ExpenseFormData) => void;
  isSubmitting?: boolean;
}

export default function AddExpenseDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: AddExpenseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>Add Expense</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Expense</DialogTitle>
        </DialogHeader>
        <ExpenseForm
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
