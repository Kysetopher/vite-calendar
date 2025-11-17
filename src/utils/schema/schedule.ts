export interface Schedule {
  id: string;
  title: string;
  start: Date;
  end: Date;
  recurring?: boolean;
  description?: string;
  type?: 'pickup' | 'dropoff' | 'event' | 'reminder';
}

export interface ScheduleEvent {
  id: number;
  title: string;
  description?: string;
  location?: string;
  start_time: string;
  end_time: string;
  event_type: string;
  shared_with?: string;
  is_recurring?: boolean;
  recurrence_pattern?: string;
  recurrence_interval?: number;
  recurrence_end?: string;
  participants?: string[];
  children_involved?: string[];
  is_confirmed?: boolean;
  color?: string;
}

export interface CalendarSyncSetting {
  sync_enabled: boolean;
  google_calendar_id?: string;
}

export interface CalendarEvent {
  id: number | string;
  title: string;
  start_time: string;
  end_time: string;
  event_type?: string;
  color?: string;
}