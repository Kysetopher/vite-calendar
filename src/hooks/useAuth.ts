// src/hooks/useAuth.ts
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthProvider';

export function useAuth() {
  const {
    user,
    profile,
    loading,
    logout,
    createProfile,
    updateProfile,
    deleteProfile,
    refreshProfile,
    completeOnboarding,
  } = useContext(AuthContext);
  return {
    user,
    profile,
    isLoading: loading,
    isAuthenticated: user?.auth_status === 'authenticated',
    logout,
    createProfile,
    updateProfile,
    deleteProfile,
    refreshProfile,
    completeOnboarding,
  };
}
