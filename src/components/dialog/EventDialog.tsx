import EventForm, { type EventFormData } from "@/components/dialog/EventForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ScheduleEvent } from "@/utils/schema/schedule";

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: ScheduleEvent | null;
  initialStartTime?: string;
  initialEndTime?: string;
  onSubmit: (data: EventFormData) => void;
  isSubmitting?: boolean;
}

export default function EventDialog({
  open,
  onOpenChange,
  event,
  initialStartTime,
  initialEndTime,
  onSubmit,
  isSubmitting,
}: EventDialogProps) {

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event ? "Edit Event" : "Create New Event"}</DialogTitle>
        </DialogHeader>
        <EventForm
          event={event}
          initialStartTime={initialStartTime}
          initialEndTime={initialEndTime}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}

