import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import ChatSidebar from "@/components/chat/ChatSidebar";
import CollapsibleSidebarLayout from "@/components/layout/CollapsibleSidebarLayout";

import { Users } from "lucide-react";
// import { setupMobileKeyboardHandling, addKeyboardStyles } from "@/utils/mobileKeyboard";
import { cn } from "@/lib/utils";
import Loading from "@/components/Loading.tsx";
import { useMessageThread } from "@/hooks/useMessageThread";
import SimpleBar from "simplebar-react";
import type SimpleBarCore from "simplebar-core";


export default function Messages() {
  const { profile, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [selectedCoParent, setSelectedCoParent] = useState<number | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const messageScrollRef = useRef<SimpleBarCore | null>(null);

  const {
    messages,
    isConnected,
    handleSendMessage,
    sendMessagePending,
    isThreadLoading,
    moderationStatus,
    moderationFeedbackInput,
    setModerationStatus,
    setModerationFeedbackInput,
  } = useMessageThread(selectedCoParent);

  useEffect(() => {
    const scrollEl = messageScrollRef.current?.getScrollElement();
    scrollEl?.scrollTo({ top: scrollEl.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // // Mobile keyboard handling setup
  // useEffect(() => {
  //   addKeyboardStyles();
  //   const cleanup = setupMobileKeyboardHandling();
  //   return cleanup;
  // }, []);

  // Get co-parent relationships
  const { data: rawCoParents = [], isLoading: coParentsLoading } = useQuery({
    queryKey: ["/api/coparent/relationships"],
    enabled: isAuthenticated,
    retry: false,
  });

  const coParents = Array.isArray(rawCoParents) ? rawCoParents.reduce((unique: any[], coParent: any) => {
    const otherUserId = coParent.coparent_id;
    
    if (!otherUserId) {
      return unique; // Skip if no valid co-parent user
    }
    
    const alreadyExists = unique.some((existing: any) => {
      return existing.coparent_id === otherUserId;
    });
    
    if (!alreadyExists) {
      unique.push(coParent);
    }
    return unique;
  }, []) : [];

  // Set first co-parent as selected by default and handle deletions
  useEffect(() => {
    if (coParents && coParents.length > 0) {
      // Check if selected co-parent still exists
      if (selectedCoParent && !coParents.some(cp => cp.coparent_id === selectedCoParent)) {
        // Selected co-parent was removed, clear selection
        setSelectedCoParent(null);
        queryClient.invalidateQueries({ queryKey: ['/api/messages/thread'] });
      } else if (!selectedCoParent) {
        // No selection, pick first co-parent
        const firstCoParent = coParents[0];
        const coParentUserId = firstCoParent.coparent_id;
        if (coParentUserId) {
          setSelectedCoParent(coParentUserId);
        }
      }
    } else if (coParents.length === 0 && selectedCoParent) {
      // No co-parents exist, clear everything
      setSelectedCoParent(null);
      queryClient.invalidateQueries({ queryKey: ['/api/messages/thread'] });
    }
  }, [coParents, selectedCoParent, queryClient]);

  if (isLoading || !isAuthenticated) {
    return <Loading message="Retrieving your messages" />;
  }

return (
  <Layout>
    <CollapsibleSidebarLayout
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          sidebar={
            <ChatSidebar
              coParents={coParents}
              selectedCoParent={selectedCoParent}
              onSelect={setSelectedCoParent}
              loading={coParentsLoading}
            />
          }
        >
      {/* page root: fill parent and allow children to shrink */}
      <div className="lg:p-6 flex flex-col h-full min-h-0 overflow-hidden">
        {/* card: fill available height */}
        <Card className="rounded-none lg:rounded-xl shadow flex flex-col h-full min-h-0">
          <CardHeader className="border-b px-6 py-4 shrink-0">
            <CardTitle className="flex items-center space-x-3">
              {selectedCoParent && coParents ? (
                <>
                  <Avatar className="w-10 h-10 font-sans">
                    <AvatarImage src={coParents.find((cp: any) => cp.coparent_id === selectedCoParent)?.profile_image_url} />
                    <AvatarFallback>
                      {coParents.find((cp: any) => cp.coparent_id === selectedCoParent)?.coparent_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 font-sans">
                    <h3 className="text-lg font-semibold font-sans">
                      {coParents.find((cp: any) => cp.coparent_id === selectedCoParent)?.coparent_name}
                    </h3>
                    <p className="text-sm text-gray-500">Co-parent</p>
                  </div>
                  <div className="flex items-center space-x-2">

                  
                   </div>
                </>
              ) : (
                <div className="text-center w-full">
                  <p className="text-gray-500">Select a conversation</p>
                </div>
              )}
            </CardTitle>
          </CardHeader>

          {/* content column: header (above) + scroll area + input (below) */}
          <CardContent className="flex-1 min-h-0 p-0 flex flex-col">
            {selectedCoParent && profile?.id ? (
              <>
                {/* SCROLL REGION */}

                {isThreadLoading ? (
                       <div className="flex flex-1 min-h-0 items-center justify-center">
                        <div className="h-screen grid place-content-center text-center">
                          <div className="w-8 h-8 border-2 border-[#275559] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                          <p className="text-gray-500">Loading conversation...</p>
                        </div>
                      </div>
                ) : messages.length === 0 ? (
                   <div className="flex flex-1 min-h-0 items-center justify-center">
                       <div className="h-screen grid place-content-center text-center">
                        <div className="text-6xl mb-4">💬</div>
                        <h3 className="text-lg font-medium mb-2">No messages yet</h3>
                        <p className="text-sm">Start a conversation with your co-parent</p>
                      </div>
                    </div>
                ) : (

                  <SimpleBar ref={messageScrollRef} className="flex-1 min-h-0">
                  {/* remove h-screen; let SimpleBar control height */}
                  <div className="flex flex-col min-h-0 justify-end px-6 py-4">

                      <MessageList
                        messages={messages}
                        coParentName={coParents?.find((cp: any) => cp.coparent_id === selectedCoParent)?.coparent_name}
                        coParentAvatar={coParents?.find((cp: any) => cp.coparent_id === selectedCoParent)?.profile_image_url}
                      />

                  </div>
                </SimpleBar>
                )}
                {/* INPUT: fixed-height footer inside the card */}
                <div className="shrink-0 rounded-b-md">
                    <MessageInput
                      onSendMessage={handleSendMessage}
                      disabled={sendMessagePending || !isConnected}
                      placeholder={isConnected ? "Type your message..." : "Connecting..."}
                      moderationStatus={moderationStatus}
                      moderationFeedback={moderationFeedbackInput}
                      onClearFeedback={() => {
                        setModerationStatus(null);
                        setModerationFeedbackInput(undefined);
                      }}
                      scrollAreaRef={messageScrollRef}
                    />
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center flex-1">
                <div className="text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </CollapsibleSidebarLayout>
  </Layout>
);

}
