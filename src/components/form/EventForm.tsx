import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Baby, Users, RefreshCw } from "lucide-react";
import type { ScheduleEvent } from "@/utils/schema/schedule";
import { toLocalDatetimeString } from "@/utils/dateUtils";

export const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  location: z.string().optional(),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  event_type: z.enum(["pickup", "dropoff", "activity", "appointment", "other"]),
  shared_with: z.string().optional(),
  is_recurring: z.boolean().default(false),
  recurrence_pattern: z.string().optional(),
  recurrence_interval: z.number().min(1).default(1),
  recurrence_end: z.string().optional(),
  participants: z.array(z.string()).default([]),
  children_involved: z.array(z.string()).default([]),
});

export type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
  event?: ScheduleEvent | null;
  onSubmit: (data: EventFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  initialStartTime?: string;
  initialEndTime?: string;
}

export default function EventForm({
  event,
  onSubmit,
  onCancel,
  isSubmitting,
  initialStartTime,
  initialEndTime,
}: EventFormProps) {

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      start_time: "",
      end_time: "",
      event_type: "other",
      shared_with: "",
      is_recurring: false,
      recurrence_pattern: "",
      recurrence_interval: 1,
      recurrence_end: "",
      participants: [],
      children_involved: [],
    },
  });

  useEffect(() => {
    if (event) {
      const startDate = new Date(event.start_time);
      const endDate = new Date(event.end_time);
      form.reset({
        title: event.title,
        description: event.description || "",
        location: event.location || "",
        start_time: toLocalDatetimeString(startDate),
        end_time: toLocalDatetimeString(endDate),
        event_type: event.event_type as any,
        shared_with: event.shared_with || "",
        is_recurring: event.is_recurring || false,
        recurrence_pattern: event.recurrence_pattern || "",
        recurrence_interval: event.recurrence_interval || 1,
        recurrence_end: event.recurrence_end
          ? toLocalDatetimeString(new Date(event.recurrence_end))
          : "",
        participants: Array.isArray(event.participants) ? event.participants : [],
        children_involved: Array.isArray(event.children_involved)
          ? event.children_involved
          : [],
      });
    } else {
      form.reset();
      if (initialStartTime) {
        form.setValue("start_time", initialStartTime);
      }
      if (initialEndTime) {
        form.setValue("end_time", initialEndTime);
      }
    }
  }, [event, initialStartTime, initialEndTime]);

  const handleStartChange = (value: string) => {
    form.setValue("start_time", value, { shouldValidate: true });
    const end = form.getValues("end_time");
    const startDate = new Date(value);
    if (!end) {
      const newEnd = new Date(startDate.getTime() + 30 * 60 * 1000);
      form.setValue("end_time", toLocalDatetimeString(newEnd));
      return;
    }
    const endDate = new Date(end);
    if (endDate.getTime() < startDate.getTime()) {
      const newEnd = new Date(startDate.getTime() + 30 * 60 * 1000);
      form.setValue("end_time", toLocalDatetimeString(newEnd));
    }
  };

  const handleEndChange = (value: string) => {
    form.setValue("end_time", value, { shouldValidate: true });
    const start = form.getValues("start_time");
    const endDate = new Date(value);
    if (!start) {
      const newStart = new Date(endDate.getTime() - 30 * 60 * 1000);
      form.setValue("start_time", toLocalDatetimeString(newStart));
      return;
    }
    const startDate = new Date(start);
    if (endDate.getTime() < startDate.getTime()) {
      const newStart = new Date(endDate.getTime() - 30 * 60 * 1000);
      form.setValue("start_time", toLocalDatetimeString(newStart));
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Event Title</FormLabel>
            <FormControl>
              <Input placeholder="Enter event title" {...field} />
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
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea placeholder="Add any additional details..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Location</FormLabel>
            <FormControl>
              <Input placeholder="Enter event location (optional)" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="start_time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Time</FormLabel>
              <FormControl>
                <Input
                  type="datetime-local"
                  value={field.value}
                  onChange={(e) => handleStartChange(e.target.value)}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="end_time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Time</FormLabel>
              <FormControl>
                <Input
                  type="datetime-local"
                  value={field.value}
                  onChange={(e) => handleEndChange(e.target.value)}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="event_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Event Type</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="pickup">Pickup</SelectItem>
                <SelectItem value="dropoff">Drop-off</SelectItem>
                <SelectItem value="activity">Activity</SelectItem>
                <SelectItem value="appointment">Appointment</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

    

      

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            form.reset();
            onCancel();
          }}
        >
          Cancel
        </Button>
        <Button type="submit" className="bg-[#275559] hover:bg-[#275559]/90" disabled={isSubmitting}>
          {isSubmitting ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
          {event ? "Update Event" : "Create Event"}
        </Button>
      </div>
    </form>
  );
}
