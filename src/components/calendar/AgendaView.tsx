import { useState, useContext } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Clock, ChevronDown, ChevronUp } from "lucide-react";
import { ScheduleContext } from '@/contexts/ScheduleProvider';
import { getTextColor } from "@/utils/color";


function formatEventDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const eventDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffInDays = Math.floor((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  let dayLabel = "";
  if (diffInDays === 0) dayLabel = "Today";
  else if (diffInDays === 1) dayLabel = "Tomorrow";
  else if (diffInDays < 7) dayLabel = format(date, "EEEE");
  else dayLabel = format(date, "MMM d");

  const time = format(date, "p");

  return { day: date.getDate().toString(), dayLabel, time, isToday: diffInDays === 0 };
}

export default function AgendaView( ) {
  const { filteredEvents: events, currentDate } = useContext(ScheduleContext);
  const [showAll, setShowAll] = useState(false);

  const upcomingEvents = events
    .filter((e) => new Date(e.start_time) >= new Date(currentDate))
    .sort(
      (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );

  const eventsToShow = showAll ? upcomingEvents : upcomingEvents.slice(0, 5);
  const hasMore = upcomingEvents.length > 5;

  return (
    <div className="space-y-4">
      {eventsToShow.map((event) => {
        const eventDate = formatEventDate(event.start_time);
        return (
          <div
            key={event.id}
            className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
              eventDate.isToday
                ? "bg-[#275559] bg-opacity-5 border border-[#275559] border-opacity-20"
                : "hover:bg-gray-50 border border-transparent"
            }`}
            style={{ borderLeft: `4px solid ${event.color || '#e5e7eb'}` }}
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                eventDate.isToday ? "bg-[#275559] text-white" : "bg-gray-300 text-gray-600"
              }`}
            >
              <span className="font-semibold text-sm">{eventDate.day}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {event.title}
                </p>
                <Badge
                  className="text-xs"
                  style={{
                    backgroundColor: event.color || '#e5e7eb',
                    color: getTextColor(event.color),
                  }}
                >
                  {event.event_type}
                </Badge>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>
                  {eventDate.dayLabel}, {eventDate.time}
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {hasMore && (
        <div>
          <button
            className="text-sm text-[#275559] hover:underline flex items-center"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" /> Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" /> Show {upcomingEvents.length - 5} More
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
