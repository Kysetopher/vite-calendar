import {useState, useContext, useEffect} from "react";
import {addDays, addMonths, startOfMonth, startOfToday, startOfWeek} from "date-fns";
import { useMutation } from "@tanstack/react-query";
import Layout from "@/components/layout/AppLayout";
import Loading from "@/components/Loading";
import MonthlyCalendar from "@/components/calendar/MonthlyCalendar";
import DayCalendar from "@/components/calendar/DayCalendar";
import WeekCalendar from "@/components/calendar/WeekCalendar";
import AgendaView from "@/components/calendar/AgendaView";
import CalendarHeader from "@/components/calendar/CalendarHeader";
import CalendarSidebar from "@/components/calendar/CalendarSidebar";
import CollapsibleSidebarLayout from "@/components/layout/CollapsibleSidebarLayout";
import CalendarSettingsDialog from "@/components/dialog/CalendarSettingsDialog";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { type EventFormData } from "@/components/form/EventForm";
import EventDialog from "@/components/dialog/EventDialog";
import type { ScheduleEvent } from "@/utils/schema/schedule";
import { toLocalDatetimeString } from "@/utils/dateUtils";
import { ScheduleContext } from '@/contexts/ScheduleProvider';

export default function SchedulePage() {
  const { toast } = useToast();
  const {
    isLoading,
    saveEvent,
    currentDate,
    setCurrentDate,
  } = useContext(ScheduleContext);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const [initialStartTime, setInitialStartTime] = useState<string | undefined>();
  const [initialEndTime, setInitialEndTime] = useState<string | undefined>();
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [view, setView] = useState("month");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const handlePrev = () => {
    setCurrentDate((d) => {
      if (view === "day") return addDays(d, -1);
      if (view === "week") return addDays(d, -7);
      return addMonths(d, -1);
    });
  };
  const handleNext = () => {
    setCurrentDate((d) => {
      if (view === "day") return addDays(d, 1);
      if (view === "week") return addDays(d, 7);
      return addMonths(d, 1);
    });
  };
  const handleToday = () => {
    const today = startOfToday();
    switch (view) {
      case "day":
      case "agenda":
        setCurrentDate(today);
        break;
      case "week":
        setCurrentDate(startOfWeek(today, { weekStartsOn: 0 }));
        break;
      case "month":
      case "tasks":
      default:
        setCurrentDate(startOfMonth(today));
        break;
    }
  }


  const createEventMutation = useMutation({
    mutationFn: async (eventData: EventFormData) => {
      await saveEvent(eventData, editingEvent?.id);
    },
    onSuccess: () => {
      setIsDialogOpen(false);
      setEditingEvent(null);
      toast({
        title: editingEvent ? "Event updated" : "Event created",
        description: `Your event has been ${editingEvent ? "updated" : "created"} successfully.`,
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: `Failed to ${editingEvent ? "update" : "create"} event. Please try again.`,
        variant: "destructive",
      });
    },
  });



  const onSubmit = (data: EventFormData) => {
    createEventMutation.mutate(data);
  };

  const handleAddEvent = () => {
    setEditingEvent(null);
    setInitialStartTime(undefined);
    setInitialEndTime(undefined);
    setIsDialogOpen(true);
  };

  const handleEditEvent = (event: any) => {
    setEditingEvent(event);
    setInitialStartTime(undefined);
    setInitialEndTime(undefined);
    setIsDialogOpen(true);
  };

  const handleSelectSlot = (date: Date) => {
    const startISO = toLocalDatetimeString(date);
    const endISO = toLocalDatetimeString(new Date(date.getTime() + 60 * 60 * 1000));
    setInitialStartTime(startISO);
    setInitialEndTime(endISO);
    setEditingEvent(null);
    setIsDialogOpen(true);
  };

  // if (!isAuthenticated || isLoading) {
  //   return <Loading message="Loading calendar..." />;
  // }

  return (
    <Layout>
      <EventDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingEvent(null);
          }
        }}
        event={editingEvent}
        initialStartTime={initialStartTime}
        initialEndTime={initialEndTime}
        onSubmit={onSubmit}
        isSubmitting={createEventMutation.isPending}
      />
      <CalendarSettingsDialog
        open={showSettingsDialog}
        onOpenChange={setShowSettingsDialog}
        onConnect={(provider) => {
          setConnectProviders([provider]);
          setShowConnectDialog(true);
        }}
      />
      <CollapsibleSidebarLayout
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        sidebar={
          <CalendarSidebar
              onAddEvent={handleAddEvent}
              view={view}
          />
        }
      >
          <div className="flex flex-col h-full min-h-0">
          <CalendarHeader

            setCollapsed={setSidebarCollapsed}
            selectedDate={currentDate}
            view={view}
            onPrev={handlePrev}
            onNext={handleNext}
            onSetView={setView}
            onOpenSettings={() => setShowSettingsDialog(true)}
            onToday={handleToday}
          />
          <div className="flex-1 min-h-0 lg:p-6">
          {view === "month" && (
            <MonthlyCalendar
              onSelectSlot={handleSelectSlot}
              onEditEvent={handleEditEvent}
            />
          )}
          {view === "week" && (
            <WeekCalendar
              onSelectSlot={handleSelectSlot}
              onEditEvent={handleEditEvent}
            />
          )}
          {view === "day" && (
            <DayCalendar
              onSelectSlot={handleSelectSlot}
              onEditEvent={handleEditEvent}
            />
          )}
          {view === "agenda" && <AgendaView />}
          </div>
        </div>
      </CollapsibleSidebarLayout>
    </Layout>
  );
}
