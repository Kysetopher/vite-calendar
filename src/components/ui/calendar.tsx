import * as React from "react";
import {ChevronLeft, ChevronRight, Undo2} from "lucide-react";
import { DayPicker } from "react-day-picker";
import {
    startOfWeek,
    endOfWeek,
    isWithinInterval,
    isSameDay,
    startOfDay,
    endOfDay,
    startOfMonth,
    endOfMonth, format,
} from "date-fns";
import { cn } from "@/lib/utils";
import {Button, buttonVariants} from "@/components/ui/button";
import {useCallback, useState} from "react";

function Calendar({
                      className,
                      classNames,
                      showOutsideDays = true,
                      view,
                      selected,
                      ...props
                  }: CalendarProps) {
    const [month, setMonth] = useState<Date | undefined>(props.month || new Date());

    // custom Caption
    const CustomCaption = useCallback(({ displayMonth }: any) => {
        const goToPreviousMonth = () => {
            const newMonth = new Date(displayMonth);
            newMonth.setMonth(newMonth.getMonth() - 1);
            setMonth(newMonth);
            if (props.onMonthChange) {
                props.onMonthChange(newMonth);
            }
        };
        const goToNextMonth = () => {
            const newMonth = new Date(displayMonth);
            newMonth.setMonth(newMonth.getMonth() + 1);
            setMonth(newMonth);
            if (props.onMonthChange) {
                props.onMonthChange(newMonth);
            }
        };
        const handleTodayClick = () => {
            const today = new Date();
            setMonth(today);
            if (props.onMonthChange) {
                props.onMonthChange(today);
            }
        };
        // check if current month is displayed
        const today = new Date();
        const isCurrentMonth =
            displayMonth.getMonth() === today.getMonth() &&
            displayMonth.getFullYear() === today.getFullYear();
        return (
            <div className="flex justify-between items-center px-2 pt-4">
                {/* Month heading */}
                <h2 className="text-sm font-medium font-sans">
                    {format(displayMonth, "MMMM yyyy")}
                </h2>

                {/* Navigation buttons */}
                <div className="flex items-center space-x-1">
                    <button
                        onClick={handleTodayClick}
                        className={cn(
                            buttonVariants({variant: "ghost"}),
                            `h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 ${isCurrentMonth ? "hidden" : ""}`
                        )}
                        type="button"
                        aria-label="Go to today"
                    >
                        <Undo2 className='w-4 h-4'/>
                    </button>
                    <button
                        onClick={goToPreviousMonth}
                        className={cn(
                            buttonVariants({variant: "outline"}),
                            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                        )}
                        type="button"
                        aria-label="Go to previous month"
                    >
                        <ChevronLeft className="h-4 w-4"/>
                    </button>
                    <button
                        onClick={goToNextMonth}
                        className={cn(
                            buttonVariants({variant: "outline"}),
                            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                        )}
                        type="button"
                        aria-label="Go to next month"
                    >
                        <ChevronRight className="h-4 w-4"/>
                    </button>
                </div>
            </div>
        );
    }, [month, props.onMonthChange]);

    const getSelectedPeriod = () => {
        if (!selected) return undefined;

        const start = startOfDay(selected);
        const end = endOfDay(selected);

        if (view === 'week') {
            return {
                from: startOfWeek(start),
                to: endOfWeek(end),
            };
        }
        if (view === 'month') {
            return {
                from: startOfMonth(start),
                to: endOfMonth(end),
            };
        }
        // For 'day' view or default, the period is just the selected day.
        return {
            from: start,
            to: end,
        };
    };

    const selectedPeriod = getSelectedPeriod();

    const modifiers = {
        ...props.modifiers,
        selectedPeriod: (day: Date) =>
            selectedPeriod
                ? isWithinInterval(day, { start: selectedPeriod.from, end: selectedPeriod.to })
                : false,
        selectedPeriodStart: (day: Date) =>
            selectedPeriod ? isSameDay(day, selectedPeriod.from) : false,
        selectedPeriodEnd: (day: Date) =>
            selectedPeriod ? isSameDay(day, selectedPeriod.to) : false,
    };

    const modifiersClassNames = {
        ...props.modifiersClassNames,
        selectedPeriod: view !== 'month' ? "selected-period" : "",
        selectedPeriodStart: 'selected-period-start',
        selectedPeriodEnd: 'selected-period-end',
    };

    return (
        <div>
            <DayPicker
                showOutsideDays={showOutsideDays}
                month={month}
                onMonthChange={setMonth}
                className={cn("w-full", className)}
                classNames={{
                    months: cn(
                        "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full",
                        classNames?.months
                    ),
                    month: cn("space-y-4 w-full", classNames?.month),
                    caption: "flex justify-center pt-1 relative items-center",
                    caption_label: "text-sm font-medium",
                    nav: "space-x-1 flex items-center",
                    nav_button: cn(
                        buttonVariants({variant: "outline"}),
                        "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                    ),
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: cn("w-full border-collapse space-y-1", classNames?.table),
                    head_row: "flex",
                    head_cell:
                        "text-muted-foreground rounded-md w-full font-normal text-[0.8rem]",
                    row: "flex w-full mt-2",
                    cell: "h-9 w-full text-center text-sm p-0 relative first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                    day: cn(
                        buttonVariants({variant: "ghost"}),
                        "h-full w-full p-0 font-normal"
                    ),
                    day_range_end: "day-range-end",
                    day_selected:
                        "bg-accent text-accent-foreground",
                    day_today: "!bg-primary !text-primary-foreground",
                    day_outside: "text-muted-foreground opacity-50",
                    day_disabled: "text-muted-foreground opacity-50",
                    day_range_middle:
                        "aria-selected:bg-accent aria-selected:text-accent-foreground",
                    day_hidden: "invisible",
                    ...classNames,
                }}
                modifiers={modifiers}
                modifiersClassNames={modifiersClassNames}
                components={{
                    Caption: CustomCaption,
                }}
                {...props}
                selected={selected}
            />
        </div>
);
}

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  view?: string;
  selected?: Date;
};
Calendar.displayName = "Calendar";

export { Calendar };