import {addDays, format, startOfWeek} from "date-fns";
import SimpleBar from "simplebar-react";
import {Fragment, useContext, useEffect, useState} from "react";
import CurrentTimeIndicator from "@/components/calendar/CurrentTimeIndicator.tsx";
import type {CalendarEvent} from "@/utils/schema/schedule.ts";
import {ScheduleContext} from "@/contexts/ScheduleProvider.tsx";

function getWeekDays(date: Date) {
  const start = startOfWeek(date, { weekStartsOn: 0 });
  return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
}

// helpers to map times to 30-min slots
function slotIndex(date: Date) {
  return date.getHours() * 2 + (date.getMinutes() >= 30 ? 1 : 0);
}
function slotSpan(start: Date, end: Date) {
  return Math.max(1, slotIndex(end) - slotIndex(start));
}

function WeekView({
                     days,
                     events,
                     onSelectSlot,
                     onEditEvent,
                     isCurrentWeek
                 }: {
    days: Date[];
    events: CalendarEvent[];
    onSelectSlot?: (date: Date) => void;
    onEditEvent?: (event: CalendarEvent) => void;
    isCurrentWeek: boolean;
}) {
    const SLOT_HEIGHT = 24;
    const totalHeight = 48 * SLOT_HEIGHT; 
    const [currentTime, setCurrentTime] = useState(new Date());

    // build 48 half-hour slots
    const slots = Array.from({length: 48}).map((_, idx) => ({
        hour: Math.floor(idx / 2),
        minute: idx % 2 === 0 ? 0 : 30,
    }));


    // bucket events *only* by their start slot, with span
    type EventWithSpan = { ev: CalendarEvent; start: number; span: number };
    const eventsByDay: Record<string, EventWithSpan[]> = {};
    for (const ev of events) {
        if (!ev.start_time || !ev.end_time) continue;
        const start = new Date(ev.start_time);
        const end = new Date(ev.end_time);
        const dayKey = start.toISOString().slice(0, 10);
        const startIdx = slotIndex(start);
        const spanCount = slotSpan(start, end);

        if (!eventsByDay[dayKey]) eventsByDay[dayKey] = [];
        eventsByDay[dayKey].push({ev, start: startIdx, span: spanCount});
    }


    // helper function to lighten a color
    const lightenColor = (hex: any, amount = 0.4) => {
        // remove # if present
        hex = hex.replace('#', '');
        // convert to RGB
        const num = parseInt(hex, 16);
        const r = (num >> 16) & 255;
        const g = (num >> 8) & 255;
        const b = num & 255;
        // mix with white (255, 255, 255) based on amount
        const newR = Math.round(r + (255 - r) * amount);
        const newG = Math.round(g + (255 - g) * amount);
        const newB = Math.round(b + (255 - b) * amount);
        // convert back to hex
        return `#${((1 << 24) + (newR << 16) + (newG << 8) + newB).toString(16).slice(1)}`;
    };

    // helper function to darken a color
    const darkenColor = (hex: any, amount = 0.4) => {
        // remove # if present
        hex = hex.replace('#', '');
        // convert to RGB
        const num = parseInt(hex, 16);
        const r = (num >> 16) & 255;
        const g = (num >> 8) & 255;
        const b = num & 255;
        // reduce each channel by the amount to darken
        const newR = Math.round(r * (1 - amount));
        const newG = Math.round(g * (1 - amount));
        const newB = Math.round(b * (1 - amount));
        // convert back to hex
        return `#${((1 << 24) + (newR << 16) + (newG << 8) + newB).toString(16).slice(1)}`;
    };

    // for current time indicator
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000); // update every minute
        return () => clearInterval(timer);
    }, []);

return (
    <div className="w-full min-w-full flex-shrink-0 flex flex-col min-h-0 h-full">
      {/* header (non-scrolling) */}
      <div className="grid grid-cols-[56px_repeat(7,1fr)] bg-white border-b border-border shrink-0">
        <div />
        {days.map(d => (
          <div key={d.toISOString()} className="flex flex-col py-2 text-center text-gray-600 text-sm font-medium">
            <div className="hidden md:block">{format(d, "EEE d")}</div>
            <div className="md:hidden">
              <div className="text-xs">{format(d, "EEEEE")}</div>
              <div>{format(d, "d")}</div>
            </div>
          </div>
        ))}
      </div>

      {/* SCROLL REGION */}
      <SimpleBar className="flex-1 min-h-0">
        {/* IMPORTANT: relative wrapper so overlay positions against the scrolled content */}
        <div className="relative" style={{ height: totalHeight }}>
          {/* 1) static timeline grid */}
          <div className="grid grid-cols-[56px_repeat(7,1fr)] divide-y divide-border">
            {slots.map(({ hour, minute }, idx) => (
              <Fragment key={idx}>
                <div
                  className="border-r border-border px-2 text-right text-xs text-gray-500"
                  style={{ height: SLOT_HEIGHT }}
                >
                  {minute === 0 ? format(new Date(0, 0, 0, hour), "ha") : ""}
                </div>
                {days.map(day => (
                  <div
                    key={`${day.toISOString().slice(0, 10)}-${idx}`}
                    style={{ height: SLOT_HEIGHT }}
                    onClick={() =>
                      onSelectSlot?.(
                        new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, minute)
                      )
                    }
                    className="border-r px-1 cursor-pointer"
                  />
                ))}
              </Fragment>
            ))}
          </div>

          {/* 2) events overlay aligned to the grid above */}
          <div
            className="pointer-events-none absolute inset-0 grid grid-cols-[56px_repeat(7,1fr)]"
            style={{ gridTemplateRows: `repeat(48, ${SLOT_HEIGHT}px)` }}
          >
            {days.map((day, colIdx) => {
              const dayKey = day.toISOString().slice(0, 10);
              return (eventsByDay[dayKey] || []).map(({ ev, start, span }) => (
                <div
                  key={ev.id}
                  onClick={e => {
                    e.stopPropagation();
                    onEditEvent?.(ev);
                  }}
                  className="relative rounded hover:brightness-105 pointer-events-auto overflow-hidden min-w-0"
                  style={{
                    gridColumnStart: colIdx + 2,              // +1 for time column, +1 because CSS grid is 1-based
                    gridRowStart: start + 1,                  // 1-based row index
                    gridRowEnd: `span ${span}`,
                    backgroundColor: lightenColor(ev.color, 0.8),
                    color: ev.color ? darkenColor(ev.color) : undefined,
                    maxHeight: `${span * SLOT_HEIGHT}px`,
                  }}
                >
                  <div className="flex gap-2 font-sans min-w-0 h-full">
                    <div className="w-1 absolute left-0 h-full flex-shrink-0" style={{ backgroundColor: ev.color }} />
                    <div className="px-2.5 py-1 min-w-0 flex-1 flex flex-col justify-start overflow-hidden">
                      <div className="font-medium break-words overflow-hidden">{ev.title}</div>
                      <div className="font-normal text-xs break-words overflow-hidden flex-shrink-0" style={{ color: darkenColor(ev.color) }}>
                        {format(new Date(ev.start_time), "p").replace(/:00\s/, " ")} – {format(new Date(ev.end_time), "p").replace(/:00\s/, " ")}
                      </div>
                    </div>
                  </div>
                </div>
              ));
            })}

            <CurrentTimeIndicator
              currentTime={currentTime}
              SLOT_HEIGHT={SLOT_HEIGHT}
              isCurrent={isCurrentWeek}
            />
          </div>
        </div>
      </SimpleBar>
    </div>
  );
}

export default WeekView;