import React from 'react';
import { format } from "date-fns";

interface CurrentTimeIndicatorProps {
    isCurrent?: boolean
    currentTime: Date;
    SLOT_HEIGHT?: number; // Height of each time slot in pixels, default is 24px
}

function CurrentTimeIndicator({ currentTime, SLOT_HEIGHT = 24, isCurrent }: CurrentTimeIndicatorProps) {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const slotIdx = hours * 2 + (minutes >= 30 ? 1 : 0);
    const minutesIntoSlot = minutes % 30;
    const pixelOffset = (minutesIntoSlot / 30) * SLOT_HEIGHT;
    const topPosition = slotIdx * SLOT_HEIGHT + pixelOffset;

    if (isCurrent === true) {
        return (
            <div
                className="absolute left-0 right-0 z-20 pointer-events-none"
                style={{top: `${topPosition}px`}}
            >
                {/* the red line */}
                <div className="relative">
                    <div className="absolute left-14 right-0 h-0.5 bg-red-500"/>

                    {/* the red dot on the left */}
                    {/*<div className="absolute left-14 -translate-x-1/2 -top-1 w-2 h-2 bg-red-500 rounded-full">*/}
                    {/*    <div className="absolute inset-0 bg-red-500 rounded-full animate-ping"/>*/}
                    {/*</div>*/}

                    {/* current time label */}
                    <div className="absolute w-14 text-center left-0 -top-2 text-xs bg-red-500 text-white px-1 rounded font-semibold">
                        {format(currentTime, "h:mm a")}
                    </div>
                </div>
            </div>
        );
    } else {
        return (
            <div
                className="absolute left-0 right-0 z-20 pointer-events-none"
                style={{top: `${topPosition}px`}}
            >
                {/* current time label */}
                <div className="absolute w-14 text-center left-0 -top-2 text-xs bg-neutral-100 shadow-sm border border-border text-red-500 px-1 rounded font-semibold">
                    {format(currentTime, "h:mm a")}
                </div>
            </div>
        )
    }
}

export default CurrentTimeIndicator;