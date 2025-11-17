// src/contexts/RelationshipProvider.tsx
import React, { createContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import type { Child, Adult } from '@/utils/schema/relationship';

interface RelationshipContextValue {
  childData: Child[];
  adultData: Adult[];
  isLoading: boolean;
  refetchChildren: () => Promise<any>;
  refetchAdults: () => Promise<any>;
}

export const RelationshipContext = createContext<RelationshipContextValue>({
  childData: [],
  adultData: [],
  isLoading: true,
  refetchChildren: async () => {},
  refetchAdults: async () => {},
});

export function RelationshipProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  const {
    data: childrenData = [],
    isLoading: childrenLoading,
    refetch: refetchChildren,
  } = useQuery<Child[]>({
    queryKey: ['/api/children'],
    enabled: isAuthenticated,
    queryFn: async () =>
      (await apiRequest('GET', '/api/children')) as Child[],
  });

  const {
    data: adultsData = [],
    isLoading: adultsLoading,
    refetch: refetchAdults,
  } = useQuery<Adult[]>({
    queryKey: ['/api/adults'],
    enabled: isAuthenticated,
    queryFn: async () =>
      (await apiRequest('GET', '/api/adults')) as Adult[],
  });

  return (
    <RelationshipContext.Provider
      value={{
        childData: childrenData,
        adultData: adultsData,
        isLoading: childrenLoading || adultsLoading,
        refetchChildren,
        refetchAdults,
      }}
    >
      {children}
    </RelationshipContext.Provider>
  );
}
