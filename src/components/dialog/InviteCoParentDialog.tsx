// components/dialog/InviteCoParentDialog.tsx
import InviteCoParentForm from "@/components/form/InviteCoParentForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

interface InviteCoParentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function InviteCoParentDialog({ open, onOpenChange }: InviteCoParentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-[#275559] hover:bg-[#275559]/90 text-white">
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Co-Parent
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Invite Your Co-Parent</DialogTitle>
        </DialogHeader>

        <InviteCoParentForm
          compact
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
