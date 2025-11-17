import { useContext } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {Ellipsis, Eye, EyeClosed, EyeOff, PanelLeftDashed, Plus, Search, Settings} from "lucide-react";
import { ScheduleContext } from '@/contexts/ScheduleProvider';
import {ChangeEvent, useState} from "react";

import { cn } from "@/lib/utils";

interface CalendarSidebarProps {
    onAddEvent: () => void;
    className?: string;
    view: string;
}

export default function CalendarSidebar({onAddEvent, className, view}: CalendarSidebarProps) {
    const {
        googleCalendars,
        visibleCalendarIds,
        setVisibleCalendarIds,
        visibleChildIds,
        setVisibleChildIds,
        currentDate,
        setCurrentDate,
    } = useContext(ScheduleContext);
    const [sideBarVisible, setSideBarVisible] = useState(true);
    const [toggleAllCalendarTabs, setToggleAllCalendarTabs] = useState(true);
    const [isAddEventOpen, setIsAddEventOpen] = useState(false);

  const calendars = [
    ...googleCalendars,
    { id: "liaizen-shared", name: "Shared Calendar", backgroundColor: "#3B82F6" },
  ];

    const checkAll = () => {
        setVisibleCalendarIds(calendars.map((c) => c.id));
    };

    const uncheckAll = () => {
        setVisibleCalendarIds([]);
        setVisibleChildIds([]);
    };

    const handleCalendarToggle = (id: string, checked: boolean) => {
        setVisibleCalendarIds((prev) =>
            checked ? [...prev, id] : prev.filter((cid) => cid !== id)
        );
    };

    const handleChildToggle = (id: string, checked: boolean) => {
        setVisibleChildIds((prev) =>
            checked ? [...prev, id] : prev.filter((cid) => cid !== id)
        );
    };

    const allItems = [
        ...calendars.map((c) => ({
            id: c.id,
            name: c.name,
            type: "calendar" as const,
            color: c.backgroundColor,
        })),
      
    ];

    return (
        <div className='h-full w-full'>
            {!isAddEventOpen ? (
                <div className={cn("flex flex-col justify-between space-y-4 h-full flex-shrink-0", className)}>
                    <div className=''>
                        <Calendar
                            mode="single"
                            selected={currentDate}
                            onSelect={(d) => d && setCurrentDate(d)}
                            view={view}
                        />
                        <div className="space-y-2">
                            <div className="flex justify-between mt-4">
                                <label>All Calendars</label>
                                {toggleAllCalendarTabs ? (
                                    <button
                                        className='flex gap-2 items-center text-neutral-400 hover:text-neutral-700'
                                        onClick={() => {
                                            uncheckAll();
                                            setToggleAllCalendarTabs(false);
                                        }}
                                    >
                                        <div className='text-sm'>Hide All</div>
                                        <Eye className='w-4 h-4'/>
                                    </button>
                                ) : (
                                    <button
                                        className='flex gap-2 items-center text-neutral-400 hover:text-neutral-700'
                                        onClick={() => {
                                            checkAll();
                                            setToggleAllCalendarTabs(true);
                                        }}
                                    >
                                        <div className='text-sm'>Show All</div>
                                        <EyeOff className='w-4 h-4'/>
                                    </button>
                                )}
                            </div>

                            {allItems.map((item) => {
                                const isChecked =
                                    item.type === "calendar"
                                        ? visibleCalendarIds.includes(item.id)
                                        : visibleChildIds.includes(item.id);

                                const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
                                    item.type === "calendar"
                                        ? handleCalendarToggle(item.id, e.target.checked)
                                        : handleChildToggle(item.id, e.target.checked);

                                return (
                                    <div
                                        key={item.type + item.id}
                                        className="group flex items-center space-x-2 text-sm justify-between hover:bg-neutral-200/50 rounded-sm px-2 my-1 cursor-pointer"
                                    >
                                        <div className='flex items-center gap-1'>
                                            <div
                                                className={`h-2 w-2 rounded-full mr-2 ${item.id === "liaizen-shared" ? "bg-blue-500" : ""}`}
                                                style={
                                                    item.id !== "liaizen-shared"
                                                        ? {backgroundColor: item.color}
                                                        : undefined
                                                }
                                            />
                                            <span
                                                className={`${isChecked ? '' : 'text-neutral-400'}`}>{item.name}</span>
                                        </div>
                                        {isChecked ? (
                                            <div className='hidden text-neutral-400 gap-2 group-hover:flex'>
                                                <button className='hover:text-neutral-700'>
                                                    <Ellipsis className='w-4 h-4'/>
                                                </button>
                                                <button
                                                    className='hover:text-neutral-700'
                                                    onClick={() => {
                                                        const syntheticEvent = {
                                                            target: {checked: !isChecked}
                                                        } as ChangeEvent<HTMLInputElement>;
                                                        onChange(syntheticEvent);
                                                    }}
                                                >
                                                    <Eye className='w-4 h-4'/>
                                                </button>
                                            </div>
                                        ) : (
                                            <div className='hidden text-neutral-400 gap-2 group-hover:flex'>
                                                <button className='hover:text-neutral-700'>
                                                    <Ellipsis className='w-4 h-4'/>
                                                </button>
                                                <button className='hover:text-neutral-700'>
                                                    <EyeClosed
                                                        className='w-4 h-4'
                                                        onClick={() => {
                                                            const syntheticEvent = {
                                                                target: {checked: !isChecked}
                                                            } as ChangeEvent<HTMLInputElement>;
                                                            onChange(syntheticEvent);
                                                        }}
                                                    />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className='pb-4'>
                        <Button
                            className="w-full bg-[#275559] hover:bg-[#275559]/90 text-white flex items-center"
                            onClick={() => {
                                // setIsAddEventOpen(true);
                                onAddEvent();
                            }}
                        >
                            <Plus className="w-4 h-4 mr-2"/>
                            Add Event
                        </Button>
                    </div>
                </div>
                ) : (
                <div className='flex flex-col justify-between h-full w-full'>
                    <div>
                        <div>Create New Event</div>
                        <div>
                            <span>Title</span>
                            <input
                                type="text"
                                placeholder="Enter event title"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4" />
                        </div>
                        <div>
                            <span>Description</span>
                            <input
                                type="text"
                                placeholder="Add any additional details"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4" />
                        </div>
                        <div>
                            <span>Location</span>
                            <input
                                type="text"
                                placeholder="Add any additional details"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4" />
                        </div>
                        <div>
                            <div>
                                <span>From</span>
                                <input type="datetime-local"
                                       className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                       name="end_time" value="2025-08-13T01:00" />
                            </div>
                            <div>
                                <span>To</span>
                                <input type="datetime-local"
                                       className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                       name="end_time" value="2025-08-13T01:00" />
                            </div>
                        </div>
                        <div>
                            <span>Event Type</span>
                            <button
                                className="font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none hover:bg-accent flex h-10 text-muted-foreground w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                type="button"><span className="text-muted-foreground capitalize">other</span></button>
                        </div>
                        <div>Children Involved</div>
                        <div>Parents Involved</div>
                    </div>
                    <div className='flex flex-col pb-4 gap-2'>
                        <Button
                            className="w-full bg-gray-300 hover:bg-gray-400 text-muted-foreground flex items-center"
                            onClick={() => {
                                setIsAddEventOpen(false);
                            }}
                        >
                            <Plus className="w-4 h-4 mr-2"/>
                            Cancel
                        </Button>
                        <Button
                            className="w-full bg-[#275559] hover:bg-[#275559]/90 text-white flex items-center"
                            onClick={() => {
                                setIsAddEventOpen(true);
                            }}
                        >
                            Create Event
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
