// src/contexts/ScheduleProvider.tsx
import React, {
  createContext,
  ReactNode,
  useCallback,
  useState,
  useMemo,
  useEffect,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { normalizeScheduleEvents, filterEvents } from '../utils/eventUtils';
import type { ScheduleEvent, CalendarSyncSetting } from "@/utils/schema/schedule";
import type { EventFormData } from '../components/form/EventForm';


interface CalendarItem {
  id: string;
  name: string;
  backgroundColor?: string;
  description?: string;
}

interface ScheduleContextValue {
  events: ScheduleEvent[];
  syncSettings: CalendarSyncSetting;
  providers: string[];
  googleCalendars: CalendarItem[];
  visibleCalendarIds: string[];
  setVisibleCalendarIds: React.Dispatch<React.SetStateAction<string[]>>;
  visibleChildIds: string[];
  setVisibleChildIds: React.Dispatch<React.SetStateAction<string[]>>;
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
  filteredEvents: ScheduleEvent[];
  getCalendars: (provider: string) => CalendarItem[];
  isLoading: boolean;
  refetchEvents: () => Promise<any>;
  refetchCalendars: () => Promise<any>;
  refetchSyncSettings: () => Promise<any>;
  refetchProviders: () => Promise<any>;
  saveEvent: (data: EventFormData, id?: string | number) => Promise<void>;
  selectCalendar: (calendarId: string) => Promise<void>;
}

const defaultSyncSettings: CalendarSyncSetting = {
  sync_enabled: false,
  google_calendar_id: '',
};

export const ScheduleContext = createContext<ScheduleContextValue>({
  events: [],
  syncSettings: defaultSyncSettings,
  providers: [],
  googleCalendars: [],
  visibleCalendarIds: [],
  setVisibleCalendarIds: () => {},
  visibleChildIds: [],
  setVisibleChildIds: () => {},
  currentDate: new Date(),
  setCurrentDate: () => {},
  filteredEvents: [],
  getCalendars: () => [],
  isLoading: true,
  refetchEvents: async () => {},
  refetchCalendars: async () => {},
  refetchSyncSettings: async () => {},
  refetchProviders: async () => {},
  saveEvent: async () => {},
  selectCalendar: async () => {},
});

export function ScheduleProvider({ children }: { children: ReactNode }) {

  const [visibleCalendarIds, setVisibleCalendarIds] = useState<string[]>(['liaizen-shared']);
  const [visibleChildIds, setVisibleChildIds] = useState<string[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [calendarsInitialized, setCalendarsInitialized] = useState(false);

  const {
    data: events = [],
    isLoading: eventsLoading,
    refetch: refetchEvents,
  } = useQuery<ScheduleEvent[]>({
    queryKey: ['/api/schedule/events'],
    select: normalizeScheduleEvents,
  });

  const {
    data: syncSettings = defaultSyncSettings,
    isLoading: syncLoading,
    refetch: refetchSyncSettings,
  } = useQuery<CalendarSyncSetting>({
    queryKey: ['/api/calendar/sync-settings'],
  });

  const {
    data: providers = [],
    isLoading: providerLoading,
    refetch: refetchProviders,
  } = useQuery<string[]>({
    queryKey: ['/api/calendar/providers'],
  });
 
  const {
    data: googleCalendars = [],
    isLoading: calendarsLoading,
    refetch: refetchCalendars,
  } = useQuery<CalendarItem[]>({
    queryKey: ['/api/calendar/google-calendars'],

    queryFn: async () => {
      try {
        return (await apiRequest('GET', '/api/calendar/google-calendars')) as CalendarItem[];
      } catch (error: any) {
        // If user doesn't have Google Calendar linked, return empty array
        if (error?.status === 400 || error?.status === 401) {
          console.log('Google Calendar not linked for this user');
          return [];
        }
        throw error;
      }
    },
  });


  useEffect(() => {
    if (googleCalendars.length && !calendarsInitialized) {
      setVisibleCalendarIds([...googleCalendars.map((c) => c.id), 'liaizen-shared']);
      setCalendarsInitialized(true);
    }
  }, [googleCalendars, calendarsInitialized]);

  const filteredEvents = useMemo(
    () =>
      filterEvents(
        events as any[],
        visibleCalendarIds,
        visibleChildIds,
        googleCalendars,
      ),
    [
      events,
      visibleCalendarIds,
      visibleChildIds,
      googleCalendars,
    ],
  );

  const isLoading =
    eventsLoading ||
    syncLoading ||
    calendarsLoading ||
    providerLoading;

  const getCalendars = useCallback(
    (provider: string) => {
      if (provider === 'google') return googleCalendars;
      return [];
    },
    [googleCalendars],
  );

  const saveEvent = useCallback(
    async (data: EventFormData, id?: string | number) => {
      const start_time = new Date(data.start_time).toISOString();
      const end_time = new Date(data.end_time).toISOString();
      const payload = {
        title: data.title,
        description: data.description || undefined,
        location: data.location || undefined,
        start_time,
        end_time,
        event_type: data.event_type,
        is_recurring: data.is_recurring,
        recurrence_pattern: data.recurrence_pattern || undefined,
        recurrence_interval: data.recurrence_interval,
        recurrence_end: data.recurrence_end
          ? new Date(data.recurrence_end).toISOString()
          : undefined,
        participants: data.participants,
        children_involved: data.children_involved,
      };
      if (id) {
        await apiRequest('PUT', `/api/schedule/events/${id}`, payload);
      } else {
        await apiRequest('POST', '/api/schedule/events', payload);
      }
      await refetchEvents();
    },
    [refetchEvents],
  );



  const selectCalendar = useCallback(
    async (calendarId: string ) => {
      await apiRequest('PUT', '/api/calendar/sync-settings', {
        google_calendar_id: calendarId,
      });
    },
    [],
  );

  return (
    <ScheduleContext.Provider
      value={{
        events,
        syncSettings,
        providers,
        googleCalendars,
        visibleCalendarIds,
        setVisibleCalendarIds,
        visibleChildIds,
        setVisibleChildIds,
        currentDate,
        setCurrentDate,
        filteredEvents,
        getCalendars,
        isLoading,
        refetchEvents,
        refetchCalendars,
        refetchSyncSettings,
        refetchProviders,
        saveEvent,
        selectCalendar,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
}

