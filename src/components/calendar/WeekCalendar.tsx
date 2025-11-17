import { useEffect, useState, useContext, useRef} from "react";
import {addDays, startOfWeek, format, subDays} from "date-fns";

import "simplebar-react/dist/simplebar.min.css";
import { Card } from "@/components/ui/card";
import { ScheduleContext } from '@/contexts/ScheduleProvider';
import type { CalendarEvent } from "@/utils/schema/schedule";
import WeekView from "@/components/calendar/WeekView.tsx";
import {useSwipe} from "@/hooks/useSwipe.ts";

interface WeekCalendarProps {
  onSelectSlot?: (date: Date) => void;
  onEditEvent?: (event: CalendarEvent) => void;
}

function getWeekDays(date: Date) {
  const start = startOfWeek(date, { weekStartsOn: 0 });
  return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
}


export default function WeekCalendar({onSelectSlot, onEditEvent}: WeekCalendarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { filteredEvents: events, currentDate, setCurrentDate } = useContext(ScheduleContext);
  const [viewDates, setViewDates] = useState({
    prev: () => {
      const lastWeekDay = subDays(currentDate, 7);
      return getWeekDays(lastWeekDay);
    },
    current: () => { return getWeekDays(currentDate) },
    next: () => {
        const nextWeekDay = addDays(currentDate, 7);
        return getWeekDays(nextWeekDay);
    }
  });

  // check if today is in the current week view
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const days = getWeekDays(currentDate);
  const isCurrentWeek = days.some(day =>
    day.toISOString().slice(0, 10) === todayKey
  );

  // swipe handlers
  const handleSwipeLeft = () => {
    setCurrentDate(addDays(currentDate, 7));
  };
  const handleSwipeRight = () => {
    setCurrentDate(subDays(currentDate, 7));
  };
  const { touchHandlers, swipeStyle } = useSwipe(containerRef, handleSwipeLeft, handleSwipeRight);
  useEffect(() => {   // update view dates when currentDate changes (from external navigation)
    setViewDates({
    prev: () => {
      const lastWeekDay = subDays(currentDate, 7);
      return getWeekDays(lastWeekDay);
    },
    current: () => { return getWeekDays(currentDate) },
    next: () => {
        const nextWeekDay = addDays(currentDate, 7);
        return getWeekDays(nextWeekDay);
    }
  });
  }, [currentDate]);

  return (
      <Card className="overflow-hidden min-h-0 h-full text-sm rounded-none lg:rounded-xl flex flex-col">
        <div
            ref={containerRef}
            className="relative"
            style={{
              overflow: 'hidden',
              touchAction: 'pan-y pinch-zoom'
            }}
            {...touchHandlers}
        >
          <div
              className='flex  min-h-0 h-full flex'
              style={swipeStyle}
          >
            {/* Previous Week */}
            <WeekView
                days={viewDates.prev()}
                events={events}
                onSelectSlot={onSelectSlot}
                onEditEvent={onEditEvent}
                isCurrentWeek={isCurrentWeek}
            />

            {/* Current Week */}
            <WeekView
                days={viewDates.current()}
                events={events}
                onSelectSlot={onSelectSlot}
                onEditEvent={onEditEvent}
                isCurrentWeek={isCurrentWeek}
            />

            {/* Next Week */}
            <WeekView
                days={viewDates.next()}
                events={events}
                onSelectSlot={onSelectSlot}
                onEditEvent={onEditEvent}
                isCurrentWeek={isCurrentWeek}
            />
          </div>
        </div>
      </Card>
  );
}
