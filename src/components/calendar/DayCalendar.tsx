import { useContext, useEffect, useState, useRef } from "react";
import { addDays, subDays } from "date-fns";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import { Card } from "@/components/ui/card";
import { ScheduleContext } from '@/contexts/ScheduleProvider';
import type { CalendarEvent } from "@/utils/schema/schedule";
import DayView from "@/components/calendar/DayView.tsx";
import { useSwipe } from "@/hooks/useSwipe.ts";

interface DayCalendarProps {
  onSelectSlot?: (date: Date) => void;
  onEditEvent?: (event: CalendarEvent) => void;
}

export default function DayCalendar({ onSelectSlot, onEditEvent }: DayCalendarProps) {
  const { filteredEvents: events, currentDate, setCurrentDate } = useContext(ScheduleContext);
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewDates, setViewDates] = useState({
    prev: subDays(currentDate, 1),
    current: currentDate,
    next: addDays(currentDate, 1)
  });
  const today = new Date();

  // swipe handlers
  const handleSwipeLeft = () => {
    setCurrentDate(viewDates.next);
  };
  const handleSwipeRight = () => {
    setCurrentDate(viewDates.prev);
  };
  const { touchHandlers, swipeStyle } = useSwipe(containerRef, handleSwipeLeft, handleSwipeRight);
  useEffect(() => {   // update view dates when currentDate changes (from external navigation)
    setViewDates({
      prev: subDays(currentDate, 1),
      current: currentDate,
      next: addDays(currentDate, 1)
    });
  }, [currentDate]);

  return (
      <Card className="min-h-0 h-full overflow-hidden  rounded-none lg:rounded-xl">
        <div
            ref={containerRef}
            className="relative min-h-0 h-full flex flex-col"
            style={{
  
              overflow: 'hidden',
              touchAction: 'pan-y pinch-zoom'
            }}
            {...touchHandlers}
        >
          <SimpleBar className="flex-1 min-h-0" >
            <div
                className="flex"
                style={swipeStyle}
            >
              {/* Previous Day */}
              <DayView
                  date={viewDates.prev}
                  events={events}
                  onSelectSlot={onSelectSlot}
                  onEditEvent={onEditEvent}
                  isToday={viewDates.prev.getDate() === today.getDate()}
              />

              {/* Current Day */}
              <DayView
                  date={viewDates.current}
                  events={events}
                  onSelectSlot={onSelectSlot}
                  onEditEvent={onEditEvent}
                  isToday={viewDates.current.getDate() === today.getDate()}
              />

              {/* Next Day */}
              <DayView
                  date={viewDates.next}
                  events={events}
                  onSelectSlot={onSelectSlot}
                  onEditEvent={onEditEvent}
                  isToday={viewDates.next.getDate() === today.getDate()}
              />
            </div>
          </SimpleBar>
        </div>
      </Card>
  );
}
