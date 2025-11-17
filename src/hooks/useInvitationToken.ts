import { useEffect, useState } from 'react';

export const useInvitationToken = () => {
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  
  useEffect(() => {
    // Check URL params first
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('invite');
    
    if (urlToken) {
      setInviteToken(urlToken);
      sessionStorage.setItem('pendingInvite', urlToken);
    } else {
      // Check session storage as fallback
      const storedToken = sessionStorage.getItem('pendingInvite');
      if (storedToken) {
        setInviteToken(storedToken);
      }
    }
  }, []);
  
  const clearInviteToken = () => {
    sessionStorage.removeItem('pendingInvite');
    setInviteToken(null);
  };
  
  return { inviteToken, clearInviteToken };
};