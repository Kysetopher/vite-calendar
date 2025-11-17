import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ChevronDown, ChevronUp, Calendar, FileText, MessageSquare, UserPlus, Users, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { websocketService } from "@/services/websocketService";

interface CompletedTask {
  id: string;
  title: string;
  label: string;
  completedDate?: string;
  type?: 'task' | 'invitation';
  acceptedDate?: string;
}

export default function CompletedTasks() {
  const [showAll, setShowAll] = useState(false);
  const [hiddenTaskIds, setHiddenTaskIds] = useState<string[]>(() => {
    const stored = localStorage.getItem('hiddenCompletedTasks');
    return stored ? JSON.parse(stored) : [];
  });
  const queryClient = useQueryClient();
  
  // Fetch accepted invitations (received)
  const { data: acceptedInvitations } = useQuery({
    queryKey: ["/api/invitations/accepted/received"],
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
  
  // Fetch accepted invitations (sent)
  const { data: sentAcceptedInvitations } = useQuery({
    queryKey: ["/api/invitations/accepted/sent"],
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
  
  // Fetch current co-parent relationships to verify connections
  const { data: coParentRelationships } = useQuery({
    queryKey: ["/api/coparent/relationships"],
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
  
  // Listen for invitation acceptance via WebSocket
  useEffect(() => {
    const handleWebSocketMessage = (message: any) => {
      if (message.type === 'invitation_accepted') {
        // Refetch co-parent relationships when an invitation is accepted
        queryClient.invalidateQueries({ queryKey: ["/api/coparent/relationships"] });
        queryClient.invalidateQueries({ queryKey: ["/api/invitations/accepted/sent"] });
        queryClient.invalidateQueries({ queryKey: ["/api/invitations/accepted/received"] });
      }
    };
    
    websocketService.addMessageListener(handleWebSocketMessage);
    
    return () => {
      websocketService.removeMessageListener(handleWebSocketMessage);
    };
  }, [queryClient]);
  
  // Combine completed tasks
  const completedTasks: CompletedTask[] = [];
  
  // Add connections from co-parent relationships
  if (coParentRelationships && Array.isArray(coParentRelationships)) {
    coParentRelationships.forEach((rel: any) => {
      // Add a completed task for each relationship
      completedTasks.push({
        id: `relationship-${rel.id}`,
        title: `Connected with ${rel.coparent_name || rel.coparent_email || 'co-parent'}`,
        label: 'completed',
        type: 'invitation',
        acceptedDate: rel.created_at,
      });
    });
  }
  
  // Sort by date (most recent first)
  completedTasks.sort((a, b) => {
    const dateA = new Date(a.acceptedDate || a.completedDate || '');
    const dateB = new Date(b.acceptedDate || b.completedDate || '');
    return dateB.getTime() - dateA.getTime();
  });
  
  // Filter out hidden tasks
  const visibleTasks = completedTasks.filter(task => !hiddenTaskIds.includes(task.id));
  
  const tasksToShow = showAll ? visibleTasks : visibleTasks.slice(0, 3);
  const hasMoreTasks = visibleTasks.length > 3;
  
  const hideTask = (taskId: string) => {
    const newHiddenIds = [...hiddenTaskIds, taskId];
    setHiddenTaskIds(newHiddenIds);
    localStorage.setItem('hiddenCompletedTasks', JSON.stringify(newHiddenIds));
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };
  
  const getTaskIcon = (type?: string) => {
    if (type === 'invitation') {
      return <Users className="w-4 h-4" />;
    }
    return <CheckCircle className="w-4 h-4" />;
  };
  
  if (visibleTasks.length === 0 && hiddenTaskIds.length === 0) {
    return null; // Don't show the card if there are no completed tasks
  }
  
  return (
    <Card className="shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-serif font-semibold text-gray-900">
            Completed Tasks
          </CardTitle>
          <Badge variant="outline" className="text-green-600 border-green-600">
            {visibleTasks.length} completed
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tasksToShow.map((task) => (
            <div
              key={task.id}
              className="flex items-center space-x-3 p-3 rounded-lg bg-green-50 border border-green-200"
            >
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <p className="text-sm font-medium text-green-800 line-through truncate">
                    {task.title}
                  </p>
                  {task.type === 'invitation' && (
                    <Badge className="text-xs bg-green-100 text-green-800">
                      connected
                    </Badge>
                  )}
                </div>
                {(task.acceptedDate || task.completedDate) && (
                  <p className="text-xs text-gray-500">
                    Completed: {formatDate(task.acceptedDate || task.completedDate)}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {getTaskIcon(task.type)}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => hideTask(task.id)}
                  className="text-gray-400 hover:text-gray-600 p-1 h-auto"
                  title="Hide this task"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {hasMoreTasks && (
            <div className="pt-3">
              <Button
                variant="outline"
                onClick={() => setShowAll(!showAll)}
                className="w-full text-green-600 border-green-600 hover:bg-green-600 hover:text-white transition-colors"
              >
                {showAll ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-2" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-2" />
                    Show {visibleTasks.length - 3} More Completed
                  </>
                )}
              </Button>
            </div>
          )}
          
          {/* Show hidden count and restore option */}
          {hiddenTaskIds.length > 0 && (
            <div className="pt-3 mt-3 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setHiddenTaskIds([]);
                  localStorage.removeItem('hiddenCompletedTasks');
                }}
                className="text-gray-500 hover:text-gray-700 text-xs"
              >
                Restore hidden tasks ({hiddenTaskIds.length})
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}