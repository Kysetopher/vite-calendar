export function normalizeScheduleEvent(event: any): any {
  return event;
}

export function normalizeScheduleEvents(events: any[]): any[] {
  return Array.isArray(events) ? events : (events as any);
}

interface GoogleCalendar {
  id: string;
  backgroundColor?: string;
}

export function filterEvents(
  events: any[],
  calendarIds: string[],
  childIds: string[],
  childData: any[] = [],
  googleCalendars: GoogleCalendar[] = [],
): any[] {
  if (calendarIds.length === 0 && childIds.length === 0) return [];

  // Normalize to strings once
  const visibleCalendarIds = new Set(calendarIds.map(String));
  const visibleChildIds = new Set(childIds.map(String));

  // Child lookup
  const childMap = new Map<string, any>(
    Array.isArray(childData)
      ? childData.map((c: any) => [String(c.id), c])
      : Object.entries(childData as Record<string, any>),
  );

  // Calendar color lookup
  const calendarColorMap = new Map<string, string>(
    googleCalendars
      .filter((c) => c.backgroundColor)
      .map((c) => [c.id, c.backgroundColor!]),
  );

  const result: any[] = [];

  for (const evt of events) {
    if (evt?.origin === "google") {
      if (visibleCalendarIds.has(evt.google_calendar_id)) {
        const color = calendarColorMap.get(evt.google_calendar_id);
        // return a NEW object, don't mutate input
        result.push(color ? { ...evt, color } : evt);
      }
      continue;
    }

    if (evt?.origin === "liaizen") {
      const kids = Array.isArray(evt.children_involved) ? evt.children_involved : [];
      if (kids.length === 0) {
        if (visibleCalendarIds.has("liaizen-shared")) {
          result.push({ ...evt, color: "#3b82f6" }); // blue for shared
        }
        continue;
      }

      // any child matches?
      const matchId = kids.find((id: string | number) => visibleChildIds.has(String(id)));
      if (matchId != null) {
        const child = childMap.get(String(matchId));
        const color = child?.color as string | undefined;
        result.push(color ? { ...evt, color } : evt);
      }
      continue;
    }

    // Unknown origin: pass through unchanged
    result.push(evt);
  }

  return result;
}
