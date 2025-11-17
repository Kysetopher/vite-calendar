import { useState, useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "wouter";
import type { ScheduleEvent } from "@/utils/schema/schedule";
import { ScheduleContext } from '@/contexts/ScheduleProvider';
import { getTextColor } from "@/utils/color";

export default function UpcomingSchedule() {
  const [showAll, setShowAll] = useState(false);
  const { filteredEvents: events, isLoading } = useContext(ScheduleContext);

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffInDays = Math.floor((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    let dayLabel = "";
    if (diffInDays === 0) dayLabel = "Today";
    else if (diffInDays === 1) dayLabel = "Tomorrow";
    else if (diffInDays < 7) dayLabel = date.toLocaleDateString('en-US', { weekday: 'long' });
    else dayLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    
    return {
      day: date.getDate().toString(),
      dayLabel,
      time,
      isToday: diffInDays === 0,
    };
  };

  // Filter and sort upcoming events
  const upcomingEvents = events
    ? (events as any)
        ?.filter((event: ScheduleEvent) => new Date(event.start_time) > new Date())
        .sort((a: ScheduleEvent, b: ScheduleEvent) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        )
    : [];

  // Determine how many events to show
  const eventsToShow = showAll ? upcomingEvents : upcomingEvents.slice(0, 3);
  const hasMoreEvents = upcomingEvents.length > 3;

  return (
    <Card className="shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-serif font-semibold text-gray-900">
            Upcoming Events
          </CardTitle>
          <Link href="/schedule">
            <span className="text-sm text-[#275559] hover:text-[#1e4448] font-medium transition-colors cursor-pointer">
              Full calendar
            </span>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No upcoming events</p>
            <p className="text-sm text-gray-400 mb-4">Schedule your first event</p>
            <Link href="/schedule">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {eventsToShow.map((event: ScheduleEvent) => {
              const eventDate = formatEventDate(event.start_time);
              return (
                <div
                  key={event.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    eventDate.isToday
                      ? 'bg-[#275559] bg-opacity-5 border border-[#275559] border-opacity-20'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                  style={{ borderLeft: `4px solid ${event.color || '#e5e7eb'}` }}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      eventDate.isToday ? 'bg-[#275559] text-white' : 'bg-gray-300 text-gray-600'
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
                  {!event.is_confirmed && (
                    <Button variant="outline" size="sm" className="text-xs">
                      Confirm
                    </Button>
                  )}
                </div>
              );
            })}
            
            {hasMoreEvents && (
              <div className="pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAll(!showAll)}
                  className="w-full text-[#275559] border-[#275559] hover:bg-[#275559] hover:text-white transition-colors"
                >
                  {showAll ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-2" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-2" />
                      Show {upcomingEvents.length - 3} More Events
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-200">
          <Link href="/schedule">
            <Button className="w-full transition-colors font-medium">
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
