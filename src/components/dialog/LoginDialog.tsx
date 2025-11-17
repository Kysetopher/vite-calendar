import LoginForm from "@/components/form/LoginForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  return (
    <Dialog modal={false} open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <LoginForm />
      </DialogContent>
    </Dialog>
  );
}

