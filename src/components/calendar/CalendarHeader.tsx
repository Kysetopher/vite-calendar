import { format, startOfWeek, addDays } from "date-fns";
import {Calendar, ChevronDown, ChevronLeft, ChevronRight, Menu, Settings, Undo2} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {SelectValue, Select, SelectTrigger, SelectContent, SelectItem} from "@/components/ui/select.tsx";

interface CalendarHeaderProps {
  setCollapsed?: (value: boolean) => void;
  selectedDate: Date;
  view: string;
  onPrev: () => void;
  onNext: () => void;
  onSetView: (view: string) => void;
  onOpenSettings: () => void;
  onToday: () => void;
}

export default function CalendarHeader({ setCollapsed, selectedDate, view, onPrev, onNext, onSetView, onOpenSettings, onToday }: CalendarHeaderProps) {
  const currentDay = new Date().getDate();
  const currentYear = new Date().getFullYear();
  let label = format(selectedDate, "MMMM");
  if (selectedDate.getFullYear() !== currentYear) {
    label = format(selectedDate, "MMMM yyyy");
  }
  // check if current date is visible
  let isCurrentDateVisible = () => {
    if (view === "day") {
      return selectedDate.getDate() === currentDay;
    }
    if (view === "week") {
      const start = startOfWeek(selectedDate, { weekStartsOn: 0 });
      const end = addDays(start, 6);
      console.log(start.getDate(), currentDay, end.getDate());
      console.log(currentDay >= start.getDate() && currentDay <= end.getDate())
      return currentDay >= start.getDate() && currentDay <= end.getDate();
    }
    if (view === "month") {
      return selectedDate.getMonth() === new Date().getMonth() && selectedDate.getFullYear() === currentYear;
    }
    return false;
  };
  return (
    <div className="bg-white py-4 px-6 flex md:items-center justify-between border-b border-border">
      <div className="flex items-center space-x-2">
        <button className='lg:hidden' onClick={() => setCollapsed?.(false)}>
          <Menu className='w-4 h-4' />
        </button>
        <h2 className="text-2xl whitespace-nowrap font-semibold font-sans">{label}</h2>
      </div>
      <div className="flex items-center space-x-2">
        {/* Calendar Navigation Buttons */}
        <div className='hidden lg:flex'>
          <Button variant="ghost" size="icon" className="hover:bg-transparent" onClick={onPrev}>
            <ChevronLeft className="w-4 h-4"/>
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-transparent" onClick={onNext}>
            <ChevronRight className="w-4 h-4"/>
          </Button>
        </div>
        <Button variant="ghost" className="hidden lg:flex gap-2 bg-muted text-muted-foreground hover:bg-muted hover:text-black" onClick={onToday}>
            <div>Today</div>
            <Undo2 className="w-4 h-4"/>
        </Button>
        {/* View Selector - Mobile */}
        <div className='md:hidden w-28'>
          <Select value={view} onValueChange={onSetView}>
            <SelectTrigger>
              <SelectValue placeholder={view} />
              <ChevronDown className='ml-2 h-4 w-4 text-muted-foreground' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={"day"}>Day</SelectItem>
              <SelectItem value={"week"}>Week</SelectItem>
              <SelectItem value={"month"}>Month</SelectItem>
              <SelectItem value={"agenda"}>Agenda</SelectItem>
              <SelectItem value={"tasks"}>Tasks</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View Selector - Desktop */}
        <div className='hidden md:block'>
          <Tabs value={view} onValueChange={onSetView}>
            <TabsList className="grid grid-cols-5 w-full md:w-auto">
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="agenda">Agenda</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <button
            className={`relative inline-block hover:text-slate-600 lg:hidden active:scale-95 active:transition-transform ${isCurrentDateVisible() ? 'text-muted-foreground' : 'text-primary'}`}
            onClick={onToday}
        >
          <Calendar strokeWidth={1} className='h-10 w-10'/>
          <div className='font-semibold absolute inset-0 flex items-center justify-center pt-3'>{currentDay}</div>
        </button>
        {/*<Button variant="default" className="size-10 p-0 bg-primary lg:hidden gap-2 hover:bg-secondary hover:text-black" onClick={onToday}>*/}
        {/*    <div>{currentDay}</div>*/}
        {/*</Button>*/}
        <Button variant="ghost" size="icon" onClick={onOpenSettings} className='hidden lg:flex'>
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
