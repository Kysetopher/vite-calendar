import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useContext,
} from "react";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import { addMonths, startOfMonth } from "date-fns";
import { ScheduleContext } from '@/contexts/ScheduleProvider';
import { getTextColor } from "@/utils/color";
import { Card } from "@/components/ui/card";
import type { CalendarEvent } from "@/utils/schema/schedule";


interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
}

interface CalendarGrid {
  days: CalendarDay[];
  rows: number;
}

// Dynamic grid helper with last-week drop logic
function getCalendarGrid(date?: Date): CalendarGrid {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return { days: [], rows: 0 };
  }
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startingDay = firstDay.getDay();

  // Calculate needed cells to fill complete weeks
  const totalCells = Math.ceil((startingDay + daysInMonth) / 7) * 7;
  const prevMonthLast = new Date(year, month, 0).getDate();

  const days: CalendarDay[] = [];
  // Leading days from previous month
  for (let i = startingDay - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, prevMonthLast - i),
      isCurrentMonth: false,
    });
  }
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ date: new Date(year, month, i), isCurrentMonth: true });
  }
  // Trailing days from next month
  const trailing = totalCells - days.length;
  for (let i = 1; i <= trailing; i++) {
    days.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false,
    });
  }

  let rows = totalCells / 7;
  // Drop last week unless last day of month is Saturday (weekday 6)
  const lastDayWeekday = new Date(year, month, daysInMonth).getDay();
  if (lastDayWeekday !== 6) {
    days.splice(-7);
    rows -= 1;
  }

  return { days, rows };
}

interface MonthlyCalendarProps {
  onSelectSlot?: (date: Date) => void;
  onEditEvent?: (event: CalendarEvent) => void;
}

export default function MonthlyCalendar({
  onSelectSlot,
  onEditEvent,
}: MonthlyCalendarProps) {
  const { filteredEvents: events, currentDate, setCurrentDate } = useContext(ScheduleContext);

  const simpleBarRef = useRef<SimpleBar | null>(null);
  const monthRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const resetScrollRef = useRef(false);
  const lastReportedRef = useRef<string>();
  const fromScrollRef = useRef(false);

  const [months, setMonths] = useState<Date[]>(() => {
    const curr = startOfMonth(currentDate);
    return [addMonths(curr, -1), curr, addMonths(curr, 1)];
  });

  // Bucket events by date string
  const eventsByDate: Record<string, CalendarEvent[]> = {};
  for (const ev of events) {
    const d = new Date(ev.start_time);
    if (!isNaN(d.getTime())) {
      const key = d.toISOString().split("T")[0];
      (eventsByDate[key] ||= []).push(ev);
    }
  }

  // Determine visible month when scrolling
  const updateVisibleMonth = useCallback(() => {
    const scrollEl = simpleBarRef.current?.getScrollElement();
    if (!scrollEl) return;
    const center = scrollEl.scrollTop + scrollEl.clientHeight / 2;
    for (const m of months) {
      const key = m.toISOString();
      const el = monthRefs.current.get(key);
      if (!el) continue;
      if (el.offsetTop <= center && el.offsetTop + el.offsetHeight >= center) {
        if (lastReportedRef.current !== key) {
          lastReportedRef.current = key;
          fromScrollRef.current = true;
          setCurrentDate(m);
        }
        break;
      }
    }
  }, [months, setCurrentDate]);

  // Infinite loading + visible month update
  const handleScroll = useCallback(() => {
    const scrollEl = simpleBarRef.current?.getScrollElement();
    if (!scrollEl) return;
    const firstEl = monthRefs.current.get(months[0].toISOString());
    const lastEl = monthRefs.current.get(
      months[months.length - 1].toISOString()
    );
    const topThreshold = firstEl?.offsetHeight ?? 0;
    const bottomThreshold = lastEl?.offsetHeight ?? 0;
    if (scrollEl.scrollTop < topThreshold) {
      const newMonth = addMonths(months[0], -1);
      setMonths((prev) => [newMonth, ...prev]);
      requestAnimationFrame(() => {
        const el = monthRefs.current.get(newMonth.toISOString());
        if (el) scrollEl.scrollTop += el.offsetHeight;
      });
    } else if (
      scrollEl.scrollTop + scrollEl.clientHeight >
      scrollEl.scrollHeight - bottomThreshold
    ) {
      const newMonth = addMonths(months[months.length - 1], 1);
      setMonths((prev) => [...prev, newMonth]);
    }
    updateVisibleMonth();
  }, [months, updateVisibleMonth]);

  // Reset months when currentDate changes externally
  useEffect(() => {
    const curr = startOfMonth(currentDate);
    setMonths([addMonths(curr, -1), curr, addMonths(curr, 1)]);
    if (fromScrollRef.current) {
      fromScrollRef.current = false;
    } else {
      resetScrollRef.current = true;
    }
  }, [currentDate]);

  // Snap scroll position when we programmatically reset
  useLayoutEffect(() => {
    if (!resetScrollRef.current) return;
    resetScrollRef.current = false;
    const scrollEl = simpleBarRef.current?.getScrollElement();
    if (!scrollEl) return;
    const firstEl = monthRefs.current.get(months[0].toISOString());
    if (firstEl) scrollEl.scrollTop = firstEl.offsetHeight;
  }, [months]);

  // Attach scroll listener
  useEffect(() => {
    const scrollEl = simpleBarRef.current?.getScrollElement();
    if (!scrollEl) return;
    scrollEl.addEventListener("scroll", handleScroll);
    return () => scrollEl.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

  return (
    <Card className="rounded-none lg:rounded-xl h-full min-h-0 overflow-hidden flex flex-col">
      {/* Weekday header */}
      <div className="p-2 bg-white border-b border-border rounded-none shrink-0 lg:rounded-t-md">
        <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-600">
          {weekdays.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
      </div>

       <SimpleBar
      ref={simpleBarRef}
      className="flex-1 min-h-0"
    >
        <div>
          {months.map((month) => {
            const { days, rows } = getCalendarGrid(month);
            if (rows === 0) return null;
            return (
              <div
                key={month.toISOString()}
                ref={(el) =>
                  el && monthRefs.current.set(month.toISOString(), el)
                }
              >
                <div
                  className="grid grid-cols-7 gap-px bg-gray-200 text-sm"
                  style={{
                    gridTemplateRows: `repeat(${rows}, minmax(0,1fr))`,
                  }}
                >
                  {days.map((day, idx) => {
                    const dateObj = day.date;
                    const dayNumber = dateObj.getDate();
                    const daysInMonthCount = new Date(
                      dateObj.getFullYear(),
                      dateObj.getMonth() + 1,
                      0
                    ).getDate();
                    const isFirstOfMonth = dayNumber === 1;
                    const isLastOfMonth = dayNumber === daysInMonthCount;
                    const monthAbbr = dateObj.toLocaleString('default', { month: 'short' });
                    const dateKey = dateObj.toISOString().split("T")[0];
                    const dayKey = `${dateKey}-${idx}`;
                    const dayEvents = eventsByDate[dateKey] || [];

                    // only highlight days in the current active month:
                    const activeYear = currentDate.getFullYear();
                    const activeMonth = currentDate.getMonth();
                    const isActiveMonth =
                      dateObj.getFullYear() === activeYear &&
                      dateObj.getMonth() === activeMonth;

                    return (
                      <div
                        key={dayKey}
                        onClick={() => onSelectSlot?.(dateObj)}
                        className={
                          "flex flex-col py-2 px-0.5 md:px-1 h-32 overflow-hidden cursor-pointer " +
                          (isActiveMonth
                            ? "bg-white"
                            : "bg-gray-50 text-gray-400")
                        }
                      >
                        <div className="text-right text-xs">
                          {isFirstOfMonth || isLastOfMonth ? (
                            <>
                               <span className="ml-1">{monthAbbr}</span> <span>{dayNumber}</span>
                            </>
                          ) : (
                            dayNumber
                          )}
                        </div>
                        <div className="flex flex-col gap-1 mt-1 overflow-y-auto font-sans font-medium">
                          {dayEvents.slice(0, 3).map((ev) => (
                            <div
                              key={ev.id}
                              className={`rounded text-xs truncate hover:brightness-105 cursor-pointer ${
                                !ev.color
                                  ? "bg-gray-200 text-gray-800"
                                  : ""
                              }`}
                              style={
                                ev.color
                                  ? {
                                      backgroundColor: lightenColor(ev.color, 0.8),
                                      color: darkenColor(ev.color),
                                    }
                                  : undefined
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditEvent?.(ev);
                              }}
                            >
                              <div className='flex w-full gap-2 items-center'>
                                <div
                                    className='absolute bg-black w-1 h-4 rounded-l'
                                    style={{backgroundColor: ev.color}}
                                ></div>
                                <div className='px-2 md:truncate'>{ev.title}</div>
                              </div>
                            </div>
                          ))}
                          {dayEvents.length > 3 && (
                            <div className="text-xs text-gray-500">
                              +{dayEvents.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </SimpleBar>
    </Card>
  );
}
