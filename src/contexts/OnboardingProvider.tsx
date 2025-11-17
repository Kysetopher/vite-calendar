import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import type { InvitationResponse } from '@/utils/schema/relationship';

export interface OnboardingContextValue {
  hasInvitation: boolean;
  inviterEmail: string | null;
  invitationToken: string | null;
  inviterFirstName: string | null;
  inviterLastName: string | null;
  inviteeFirstName: string | null;
  inviteeLastName: string | null;
}

export const OnboardingContext = createContext<OnboardingContextValue>({
  hasInvitation: false,
  inviterEmail: null,
  invitationToken: null,
  inviterFirstName: null,
  inviterLastName: null,
  inviteeFirstName: null,
  inviteeLastName: null,
});

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [hasInvitation, setHasInvitation] = useState(false);
  const [inviterEmail, setInviterEmail] = useState<string | null>(null);
  const [invitationToken, setInvitationToken] = useState<string | null>(null);
  const [inviterFirstName, setInviterFirstName] = useState<string | null>(null);
  const [inviterLastName, setInviterLastName] = useState<string | null>(null);
  const [inviteeFirstName, setInviteeFirstName] = useState<string | null>(null);
  const [inviteeLastName, setInviteeLastName] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const resetState = () => {
      if (!isMounted) return;
      setHasInvitation(false);
      setInviterEmail(null);
      setInvitationToken(null);
      setInviterFirstName(null);
      setInviterLastName(null);
      setInviteeFirstName(null);
      setInviteeLastName(null);
    };

    if (!isAuthenticated) {
      resetState();
      return;
    }

    (async () => {
      try {
        const receivedInvitations = (await apiRequest(
          'GET',
          '/api/invitations/received'
        )) as InvitationResponse[];

        const pendingReceived = Array.isArray(receivedInvitations)
          ? receivedInvitations.find((invitation) => invitation.status === 'pending')
          : null;

        if (pendingReceived) {
          if (!isMounted) return;

          setHasInvitation(true);
          setInviterEmail(pendingReceived.inviter_email ?? null);
          setInvitationToken(pendingReceived.invite_token || null);
          setInviterFirstName(pendingReceived.inviter_first_name ?? null);
          setInviterLastName(pendingReceived.inviter_last_name ?? null);
          setInviteeFirstName(pendingReceived.invitee_first_name ?? null);
          setInviteeLastName(pendingReceived.invitee_last_name ?? null);
          return;
        }

        const sentInvitations = (await apiRequest(
          'GET',
          '/api/invitations/sent'
        )) as InvitationResponse[];

        const pendingSent = Array.isArray(sentInvitations)
          ? sentInvitations.find((invitation) => invitation.status === 'pending')
          : null;

        if (pendingSent) {
          if (!isMounted) return;

          setHasInvitation(false);
          setInviterEmail(pendingSent.invitee_email ?? null);
          setInvitationToken(null);
          setInviterFirstName(pendingSent.inviter_first_name ?? null);
          setInviterLastName(pendingSent.inviter_last_name ?? null);
          setInviteeFirstName(pendingSent.invitee_first_name ?? null);
          setInviteeLastName(pendingSent.invitee_last_name ?? null);
          return;
        }

        resetState();
      } catch {
        resetState();
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  return (
    <OnboardingContext.Provider
      value={{
        hasInvitation,
        inviterEmail,
        invitationToken,
        inviterFirstName,
        inviterLastName,
        inviteeFirstName,
        inviteeLastName,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  return useContext(OnboardingContext);
}
