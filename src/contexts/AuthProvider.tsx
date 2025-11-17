import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { authService, type ApiUser, type AuthUser } from '../services/authService';
import { websocketService } from '../services/websocketService';
import { apiRequest } from '../lib/queryClient';

interface AuthContextValue {
  user: AuthUser | null;
  profile: ApiUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  createProfile: (data: Partial<ApiUser>) => Promise<ApiUser>;
  updateProfile: (data: Partial<ApiUser>) => Promise<ApiUser>;
  deleteProfile: () => Promise<void>;
  refreshProfile: () => Promise<ApiUser | null>;
  completeOnboarding: () => Promise<AuthUser>;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  logout: async () => {},
  createProfile: async () => null as any,
  updateProfile: async () => null as any,
  deleteProfile: async () => {},
  refreshProfile: async () => null,
  completeOnboarding: async () => null as any,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    Promise.all([authService.getCurrentUser(), authService.getProfile()])
      .then(([u, p]) => {
        setUser(u);
        setProfile(p);

        if (u && !u.onboarding_completed && window.location.pathname !== '/onboarding') {
          setLocation('/onboarding');
          return;
        }

        if (u) {
          // Connect WebSocket for real-time notifications
          websocketService.connect(u.id);
          
          // Check for stored redirect URL after successful login
          const storedRedirect = sessionStorage.getItem('auth_redirect');
          if (storedRedirect) {
            sessionStorage.removeItem('auth_redirect');
            window.location.href = storedRedirect;
          }
        }
      })
      .finally(() => setLoading(false));
  }, [setLocation]);

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setProfile(null);
    websocketService.disconnect();
  };

  const createProfile = async (data: Partial<ApiUser>) => {
    const newProfile = (await apiRequest('POST', '/api/profile', data)) as ApiUser;
    setProfile(newProfile);
    return newProfile;
  };

  const updateProfile = async (data: Partial<ApiUser>) => {
    const updated = (await apiRequest('PUT', '/api/profile/me', data)) as ApiUser;
    setProfile(updated);
    return updated;
  };

  const completeOnboarding = async () => {
    const updated = (await apiRequest(
      'POST',
      '/api/users/onboarding-complete'
    )) as AuthUser;
    let nextUser: AuthUser | null = null;

    setUser((current) => {
      const auth_status = updated?.auth_status ?? current?.auth_status ?? 'authenticated';
      const google_auth_access =
        updated?.google_auth_access ?? current?.google_auth_access ?? false;
      const google_auth_refresh =
        updated?.google_auth_refresh ?? current?.google_auth_refresh ?? false;

      if (current) {
        nextUser = {
          ...current,
          ...updated,
          auth_status,
          google_auth_access,
          google_auth_refresh,
        };
      } else {
        nextUser = {
          ...updated,
          auth_status,
          google_auth_access,
          google_auth_refresh,
        } as AuthUser;
      }

      return nextUser;
    });

    return nextUser as AuthUser;
  };

  const deleteProfile = async () => {
    await apiRequest('DELETE', '/api/profile/me');
    setProfile(null);
  };

  const refreshProfile = async () => {
    const refreshed = (await apiRequest('GET', '/api/profile/me')) as ApiUser | null;
    setProfile(refreshed);
    return refreshed;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        logout,
        createProfile,
        updateProfile,
        deleteProfile,
        refreshProfile,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
