import React, { useContext } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { ScheduleContext } from '@/contexts/ScheduleProvider';
import { CalendarSyncSetting } from "@/utils/schema/schedule";

interface CalendarSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (provider: string) => void;
}


/* ───────── Child: one row per provider ───────── */
interface RowProps {
  provider: string;
  onConnect: (p: string) => void;
}
export function ProviderRow({ provider, onConnect }: RowProps) {
  const {
    syncSettings,
    
    googleCalendars,
    selectCalendar,
    refetchSyncSettings,
    refetchCalendars,
  } = useContext(ScheduleContext);



  // toggle sync on/off (sends correct schema field)
  const syncSettingsMutation = useMutation<void, Error, CalendarSyncSetting>({
    mutationFn: async ({ sync_enabled, google_calendar_id }) => {
      await apiRequest("PUT", "/api/calendar/sync-settings", {
        sync_enabled,
        google_calendar_id,
      });
    },
    onSuccess: async () => {
      await refetchSyncSettings();
      await refetchCalendars();
    },
  });

  const [isSelecting, setIsSelecting] = React.useState(false);
  const currentCalendarId = syncSettings.google_calendar_id;

  const handleSelect = async (id: string) => {
    if (!syncSettings) return;
    setIsSelecting(true);
    await selectCalendar(id);
    setIsSelecting(false);
  };

  return (
    <div className="border rounded-lg p-4 space-y-2">
      {/* header */}
      <div className="flex items-center justify-between">
        <span className="font-medium capitalize">{provider} Calendar</span>
        {syncSettings ? (
          <Switch
            checked={!!syncSettings.sync_enabled}
            onCheckedChange={(on) =>
              syncSettingsMutation.mutate({
                sync_enabled: on,
              })
            }
          />
        ) : (
          <Button
            onClick={() => onConnect(provider)}
            className="bg-[#275559] hover:bg-[#275559]/90"
          >
            Connect
          </Button>
        )}
      </div>

      {/* custom calendar picker */}
      {syncSettings && googleCalendars.length > 0 && (
        <div className="space-y-2">
          {googleCalendars.map((calendar) => {
            const isCurrentlySelected =
              currentCalendarId === calendar.id;
            return (
              <div
                key={calendar.id}
                className={`
                  flex items-center justify-between p-3 border rounded-lg cursor-pointer
                  hover:bg-gray-50 transition-colors
                  ${
                    isCurrentlySelected
                      ? "border-[#275559] bg-[#275559] bg-opacity-5"
                      : "border-gray-200"
                  }
                `}
                onClick={() => !isSelecting && handleSelect(calendar.id)}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full border-2"
                    style={{
                      backgroundColor:
                        calendar.backgroundColor ?? "#4285f4",
                    }}
                  />
                  <div>
                    <p className="font-medium text-gray-900">
                      {calendar.name}
                    </p>
                    {calendar.description && (
                      <p className="text-sm text-gray-500 truncate max-w-xs">
                        {calendar.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {isCurrentlySelected && (
                    <Badge className="bg-[#275559] text-white">
                      Current
                    </Badge>
                  )}
                  {isSelecting ? (
                    <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
                  ) : (
                    <Button variant="outline" size="sm">
                      Select
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ───────── Parent dialog ───────── */
export default function CalendarSettingsDialog({
  open,
  onOpenChange,
  onConnect,
}: CalendarSettingsDialogProps) {
  const { data: providersApi = [] } = useQuery<string[]>({
    queryKey: ["/api/calendar/providers"],
    enabled: open,
  });

  const { syncSettings }  = useContext(ScheduleContext);





  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Calendar Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
        <ProviderRow  provider={"google"} onConnect={onConnect} />
 

        </div>
      </DialogContent>
    </Dialog>
  );
}
