// components/PendingTasks.tsx
import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import InviteCoParentForm from "@/components/form/InviteCoParentForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  Circle,
  ChevronDown,
  ChevronUp,
  Calendar,
  FileText,
  MessageSquare,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { websocketService } from "@/services/websocketService";

interface Task {
  id: string;
  title: string;
  label: string;
  dueDate: string;
  completed: boolean;
  action: string;
  actionLink: string;
  type?: "task" | "invitation";
  inviterEmail?: string;
  inviteToken?: string;
  status?: string;
}

export default function PendingTasks() {
  const response = {
    tasks: [
      {
        id: "connect",
        title: "Connect with your co-parent",
        label: "urgent",
        dueDate: "N/A",
        completed: false,
        action: "Invite",
        actionLink: "/invite-coparent",
      },
      {
        id: "1",
        title: "Update custody schedule for holidays",
        label: "urgent",
        dueDate: "Dec 15",
        completed: false,
        action: "Schedule",
        actionLink: "/schedule",
      },
      {
        id: "2",
        title: "Share school report card with co-parent",
        label: "normal",
        dueDate: "Today",
        completed: false,
        action: "Documents",
        actionLink: "/documents",
      },
      {
        id: "3",
        title: "Confirm pickup time for weekend",
        label: "reminder",
        dueDate: "Tomorrow",
        completed: false,
        action: "Message",
        actionLink: "/messages",
      },
      {
        id: "4",
        title: "Update emergency contact information",
        label: "normal",
        dueDate: "",
        completed: false,
        action: "Profile",
        actionLink: "/profile",
      },
      {
        id: "5",
        title: "Plan summer vacation schedule",
        label: "normal",
        dueDate: "Next week",
        completed: false,
        action: "Schedule",
        actionLink: "/schedule",
      },
    ],
  };

  const [showAll, setShowAll] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [syncTimer, setSyncTimer] = useState<NodeJS.Timeout | null>(null);
  const modifiedTasksRef = useRef<Record<string, Task>>({});
  const [isCooldown, setIsCooldown] = useState(false);
  const [hiddenTaskIds, setHiddenTaskIds] = useState<string[]>(() => {
    const stored = localStorage.getItem("hiddenPendingTasks");
    return stored ? JSON.parse(stored) : [];
  });
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: coParents } = useQuery({
    queryKey: ["/api/coparent/relationships"],
    retry: false,
  });

  // Pending invitations (received)
  const {
    data: invitations,
    refetch: refetchInvitations,
  } = useQuery({
    queryKey: ["/api/invitations/received"],
    retry: false,
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: true,
  });

  // Websocket: keep invitations live
  useEffect(() => {
    const handleWebSocketMessage = (message: any) => {
      if (message.type === "new_invitation") {
        refetchInvitations();
        toast({
          title: "New invitation received!",
          description: `${message.inviter_email} invited you to co-parent`,
        });
      }
    };

    websocketService.addMessageListener(handleWebSocketMessage);
    return () => {
      websocketService.removeMessageListener(handleWebSocketMessage);
    };
  }, [refetchInvitations, toast]);

  const hasCoParentConnection = coParents && Array.isArray(coParents) && coParents.length > 0;

  // Build tasks list with dynamic items & invitations
  useEffect(() => {
    let allTasks = [...response.tasks];

    // Update connect task if already connected
    if (hasCoParentConnection) {
      allTasks = allTasks.map((task) => {
        if (task.id === "connect") {
          const connectionCount = coParents?.length || 0;
          return {
            ...task,
            title:
              connectionCount === 1
                ? "Add another co-parent (optional)"
                : `Connected with ${connectionCount} co-parents`,
            label: "normal",
            action: "Add More",
            completed: false,
          };
        }
        return task;
      });
    }

    // Add pending invitations as tasks
    if (invitations && Array.isArray(invitations)) {
      invitations.forEach((invitation: any) => {
        if (invitation.status === "pending") {
          allTasks.unshift({
            id: `invite-${invitation.id}`,
            title: `${
              invitation.inviter_email ||
              invitation.inviter?.first_name ||
              invitation.inviter?.email ||
              "Someone"
            } invited you to co-parent`,
            label: "urgent",
            dueDate: "Action needed",
            completed: false,
            action: "Accept",
            actionLink: `/invite/${invitation.invite_token}`,
            type: "invitation",
            inviterEmail: invitation.inviter_email,
            inviteToken: invitation.invite_token,
            status: invitation.status,
          });
        }
      });
    }

    const visibleTasks = allTasks.filter((task) => !hiddenTaskIds.includes(task.id));
    setTasks(visibleTasks);
  }, [invitations, hasCoParentConnection, hiddenTaskIds, coParents]);

  const completedTasks = tasks.filter((t) => t.completed);
  const pendingTasks = tasks.filter((t) => !t.completed);
  const allTasksSorted = [...completedTasks, ...pendingTasks];
  const tasksToShow = showAll ? allTasksSorted : allTasksSorted.slice(0, 3);
  const hasMoreTasks = allTasksSorted.length > 3;

  const getTaskLabelColor = (label: string) => {
    switch (label) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "normal":
        return "bg-[#275559] bg-opacity-10 text-[#275559]";
      case "reminder":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTaskIcon = (action?: string) => {
    switch (action) {
      case "Schedule":
        return <Calendar className="w-4 h-4" />;
      case "Documents":
        return <FileText className="w-4 h-4" />;
      case "Message":
        return <MessageSquare className="w-4 h-4" />;
      case "Invite":
      case "Add More":
        return <UserPlus className="w-4 h-4" />;
      default:
        return <Circle className="w-4 h-4" />;
    }
  };

  const toggleTaskCompletion = (taskId: string) => {
    if (isCooldown) return;

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );

    const changedTask = tasks.find((t) => t.id === taskId);
    if (changedTask) {
      const updated = { ...changedTask, completed: !changedTask.completed };
      modifiedTasksRef.current[taskId] = updated;
    }

    setIsCooldown(true);
    setTimeout(() => setIsCooldown(false), 500);

    if (syncTimer) clearTimeout(syncTimer);
    setSyncTimer(setTimeout(syncToServer, 10000));
  };

  const syncToServer = () => {
    const updates = Object.values(modifiedTasksRef)[0];
    modifiedTasksRef.current = {};
    // TODO: send `updates` to your API
  };

  const hideTask = (taskId: string) => {
    const newHiddenIds = [...hiddenTaskIds, taskId];
    setHiddenTaskIds(newHiddenIds);
    localStorage.setItem("hiddenPendingTasks", JSON.stringify(newHiddenIds));
  };

  // Accept invitation
  const acceptInvitationMutation = useMutation({
    mutationFn: async (token: string) => {
      return await apiRequest("POST", `/api/invitations/accept/${token}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invitations/received"] });
      queryClient.invalidateQueries({ queryKey: ["/api/invitations/accepted/received"] });
      queryClient.invalidateQueries({ queryKey: ["/api/invitations/accepted/sent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/coparent/relationships"] });
      toast({
        title: "Invitation accepted!",
        description: "You are now connected as co-parents.",
      });
    },
    onError: (error: any, token: string) => {
      const statusCode = error?.response?.status;
      const errorMessage = error?.response?.data?.detail || "Failed to accept invitation";

      if (errorMessage.includes("Multiple rows")) {
        toast({
          title: "Database Error",
          description:
            "There's an issue with this invitation. Please contact support or ask for a new invitation.",
          variant: "destructive",
        });
      } else if (errorMessage.includes("already connected") || statusCode === 400) {
        queryClient.invalidateQueries({ queryKey: ["/api/invitations/received"] });
        queryClient.invalidateQueries({ queryKey: ["/api/invitations/accepted/received"] });
        queryClient.invalidateQueries({ queryKey: ["/api/invitations/accepted/sent"] });
        queryClient.invalidateQueries({ queryKey: ["/api/coparent/relationships"] });
        refetchInvitations();
        toast({
          title: "Already Connected",
          description: "You are already connected with this co-parent.",
        });
      } else if (statusCode === 404 || errorMessage.includes("not found")) {
        queryClient.invalidateQueries({ queryKey: ["/api/invitations/received"] });
        refetchInvitations();
        toast({
          title: "Invitation No Longer Available",
          description: "This invitation has already been processed.",
        });
      } else {
        toast({
          title: "Failed to accept invitation",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
  });

  // Decline invitation
  const declineInvitationMutation = useMutation({
    mutationFn: async (token: string) => {
      return await apiRequest("POST", `/api/invitations/decline/${token}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invitations/received"] });
      toast({
        title: "Invitation declined",
        description: "The invitation has been declined.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to decline invitation",
        description: "An error occurred while declining the invitation.",
        variant: "destructive",
      });
    },
  });

  return (
    <Card className="shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-serif font-semibold text-gray-900">
            Pending Tasks
          </CardTitle>
          <Badge variant="outline" className="text-[#275559] border-[#275559]">
            {pendingTasks.length} pending
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {pendingTasks.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">All caught up!</p>
            <p className="text-sm text-gray-400">No pending tasks at the moment.</p>
          </div>
        ) : (
          <div className="space-y-3 select-none">
            {tasksToShow.map((task) => (
              <div
                key={task.id}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  task.completed
                    ? "bg-green-50 border border-green-200"
                    : task.type === "invitation"
                    ? "bg-blue-50 border border-blue-200 hover:bg-blue-100"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => {
                  if (!isCooldown && task.type !== "invitation") toggleTaskCompletion(task.id);
                }}
              >
                {task.completed ? (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 hover:cursor-pointer" />
                ) : task.type === "invitation" ? (
                  <Users className="w-5 h-5 text-blue-500 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400 flex-shrink-0 hover:cursor-pointer" />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <p
                      className={`text-sm font-medium truncate ${
                        task.completed ? "text-green-800 line-through" : "text-gray-900"
                      }`}
                    >
                      {task.title}
                    </p>
                    <Badge className={`text-xs ${getTaskLabelColor(task.label)}`}>
                      {task.label}
                    </Badge>
                  </div>
                  {task.dueDate && <p className="text-xs text-gray-500">Due: {task.dueDate}</p>}
                </div>

                <div className="flex items-center gap-2">
                  {task.action && task.actionLink && (
                    task.id === "connect" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[#275559] border-[#275559] hover:bg-[#275559] hover:text-white transition-colors flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsInviteDialogOpen(true);
                        }}
                      >
                        {getTaskIcon(task.action)}
                        <span className="ml-1 hidden sm:inline">{task.action}</span>
                      </Button>
                    ) : task.type === "invitation" ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-600 hover:bg-green-600 hover:text-white transition-colors flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (task.inviteToken) {
                              acceptInvitationMutation.mutate(task.inviteToken);
                            }
                          }}
                          disabled={acceptInvitationMutation.isPending}
                        >
                          {acceptInvitationMutation.isPending ? "..." : "Accept"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white transition-colors flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (task.inviteToken) {
                              declineInvitationMutation.mutate(task.inviteToken);
                            }
                          }}
                          disabled={declineInvitationMutation.isPending}
                        >
                          {declineInvitationMutation.isPending ? "..." : "Decline"}
                        </Button>
                      </>
                    ) : (
                      <Link href={task.actionLink}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-[#275559] border-[#275559] hover:bg-[#275559] hover:text-white transition-colors flex-shrink-0"
                        >
                          {getTaskIcon(task.action)}
                          <span className="ml-1 hidden sm:inline">{task.action}</span>
                        </Button>
                      </Link>
                    )
                  )}

                  {(task.id === "connect" || task.type === "invitation") && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        hideTask(task.id);
                      }}
                      className="text-gray-400 hover:text-gray-600 p-1 h-auto"
                      title="Hide this task"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {hasMoreTasks && (
              <div className="pt-3">
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
                      Show {pendingTasks.length - 3} More Tasks
                    </>
                  )}
                </Button>
              </div>
            )}

            {hiddenTaskIds.length > 0 && (
              <div className="pt-3 mt-3 border-top">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setHiddenTaskIds([]);
                    localStorage.removeItem("hiddenPendingTasks");
                  }}
                  className="text-gray-500 hover:text-gray-700 text-xs"
                >
                  Restore hidden tasks ({hiddenTaskIds.length})
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Invite Co-Parent Dialog (reusing the shared form with your styling) */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Invite Your Co-Parent</DialogTitle>
            <DialogDescription>
              Send an invitation to your co-parent to join LiaiZen and start coordinating together.
            </DialogDescription>
          </DialogHeader>

          <InviteCoParentForm
            compact
            onSuccess={() => {
              setIsInviteDialogOpen(false);
              // optional extra nudge; form already invalidates /sent and /received
              queryClient.invalidateQueries({ queryKey: ["/api/invitations/received"] });
              queryClient.invalidateQueries({ queryKey: ["/api/invitations/sent"] });
              // If you want a hard fetch *right now*:
              // refetchInvitations();
            }}
            onForceRefreshInvites={() => {
              // lets the form ask the page for an immediate refresh on specific errors
              refetchInvitations();
            }}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
