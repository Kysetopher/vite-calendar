import {  useEffect, useState, Fragment, } from "react";
import { format} from "date-fns";
import "simplebar-react/dist/simplebar.min.css";
import type { CalendarEvent } from "@/utils/schema/schedule";
import CurrentTimeIndicator from "@/components/calendar/CurrentTimeIndicator.tsx";

function DayView({
                     date,
                     events,
                     onSelectSlot,
                     onEditEvent,
                     isToday
                 }: {
    date: Date;
    events: CalendarEvent[];
    onSelectSlot?: (date: Date) => void;
    onEditEvent?: (event: CalendarEvent) => void;
    isToday: boolean;
}) {
    const dayKey = date.toISOString().split("T")[0];
    const [currentTime, setCurrentTime] = useState(new Date());
    // helpers to map times to 30-min slots
    const SLOT_HEIGHT = 24; // px; adjust to match cell height
    function slotIndex(date: Date) {
        return date.getHours() * 2 + (date.getMinutes() >= 30 ? 1 : 0);
    }

    function slotSpan(start: Date, end: Date) {
        return Math.max(1, slotIndex(end) - slotIndex(start));
    }

    // for current time indicator
    useEffect(() => {
        if (isToday) {
            const timer = setInterval(() => {
                setCurrentTime(new Date());
            }, 60000); // update every minute
            return () => clearInterval(timer);
        }
    }, [isToday]);

    // build 48 half-hour slots
    const slots = Array.from({length: 48}).map((_, idx) => ({
        hour: Math.floor(idx / 2),
        minute: idx % 2 === 0 ? 0 : 30,
    }));

    // compute events with start slot and span for the current day
    type EventWithSpan = { ev: CalendarEvent; start: number; span: number };
    const dayEvents: EventWithSpan[] = [];
    for (const ev of events) {
        if (!ev.start_time || !ev.end_time) continue;
        const start = new Date(ev.start_time);
        const end = new Date(ev.end_time);
        if (start.toISOString().slice(0, 10) !== dayKey) continue;
        dayEvents.push({ev, start: slotIndex(start), span: slotSpan(start, end)});
    }

    // helper function to lighten a color
    const lightenColor = (hex: any, amount = 0.4) => {
        hex = hex.replace('#', '');
        const num = parseInt(hex, 16);
        const r = (num >> 16) & 255;
        const g = (num >> 8) & 255;
        const b = num & 255;
        const newR = Math.round(r + (255 - r) * amount);
        const newG = Math.round(g + (255 - g) * amount);
        const newB = Math.round(b + (255 - b) * amount);
        return `#${((1 << 24) + (newR << 16) + (newG << 8) + newB).toString(16).slice(1)}`;
    };

    // helper function to darken a color
    const darkenColor = (hex: any, amount = 0.4) => {
        hex = hex.replace('#', '');
        const num = parseInt(hex, 16);
        const r = (num >> 16) & 255;
        const g = (num >> 8) & 255;
        const b = num & 255;
        const newR = Math.round(r * (1 - amount));
        const newG = Math.round(g * (1 - amount));
        const newB = Math.round(b * (1 - amount));
        return `#${((1 << 24) + (newR << 16) + (newG << 8) + newB).toString(16).slice(1)}`;
    };

    return (
        <div className="relative text-sm w-full flex-shrink-0">
            {/* header */}
            <div className='sticky top-0 z-30 grid grid-cols-[56px_repeat(1,1fr)] bg-white border-b border-border py-2 text-center text-gray-600 text-sm font-medium'>
                <div className='flex justify-end items-center text-xs'>{format(date, 'zzz')}</div>
                <div className='text-center'>{format(date, "EEE d")}</div>
            </div>
            {/* base grid with time labels and day column */}
            <div className="grid grid-cols-[3.5rem_1fr] divide-y divide-border">
                {slots.map(({hour, minute}, idx) => (
                    <Fragment key={idx}>
                        <div
                            className="border-r border-border px-2 text-right text-xs text-gray-500"
                            style={{height: SLOT_HEIGHT}}
                        >
                            {minute === 0 ? format(new Date(0, 0, 0, hour), "ha") : ""}
                        </div>
                        <div
                            className="border-r cursor-pointer"
                            style={{height: SLOT_HEIGHT}}
                            onClick={() =>
                                onSelectSlot?.(
                                    new Date(
                                        date.getFullYear(),
                                        date.getMonth(),
                                        date.getDate(),
                                        hour,
                                        minute
                                    )
                                )
                            }
                        />
                    </Fragment>
                ))}
            </div>

            {/* overlay grid for events */}
            <div
                className="absolute left-0 right-0 top-[37px] pointer-events-none grid grid-cols-[3.5rem_1fr]"
                style={{gridTemplateRows: `repeat(48, ${SLOT_HEIGHT}px)`}}
            >
                {dayEvents.map(({ev, start, span}) => (
                    <div
                        key={ev.id}
                        onClick={(e) => {
                            e.stopPropagation();
                            onEditEvent?.(ev);
                        }}
                        className="relative rounded hover:brightness-105 pointer-events-auto overflow-hidden min-w-0"
                        style={{
                            gridColumnStart: 2,
                            gridRowStart: start + 1,
                            gridRowEnd: `span ${span}`,
                            backgroundColor: lightenColor(ev.color, 0.8),
                            color: ev.color ? darkenColor(ev.color) : undefined,
                            maxHeight: `${span * SLOT_HEIGHT}px`,
                        }}
                    >
                        <div className='flex gap-2 font-sans min-w-0 h-full'>
                            <div
                                className='w-1 absolute left-0 h-full'
                                style={{backgroundColor: ev.color}}
                            ></div>
                            <div className='px-2.5 py-1 min-w-0 flex-1'>
                                <div className="font-medium break-words overflow-hidden">{ev.title}</div>
                                <div
                                    className="font-normal text-xs break-words overflow-hidden flex-shrink-0"
                                    style={{color: darkenColor(ev.color)}}
                                >
                                    {format(new Date(ev.start_time), "p").replace(/:00\s/, ' ')} - {format(new Date(ev.end_time), "p").replace(/:00\s/, ' ')}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <CurrentTimeIndicator currentTime={currentTime} SLOT_HEIGHT={24} isCurrent={isToday}/>
        </div>
    );
}

export default DayView;