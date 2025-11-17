import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { authService } from '@/services/authService';
import { Loader2 } from 'lucide-react';

function MagicLinkVerify() {
    const [, setLocation] = useLocation();
    const [error, setError] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(true);

    useEffect(() => {
        const verifyMagicLink = async () => {
            try {
                // Get token and invite from URL params
                const urlParams = new URLSearchParams(window.location.search);
                const token = urlParams.get('token');
                const inviteToken = urlParams.get('invite');

                if (!token) {
                    setError('Invalid magic link');
                    setIsVerifying(false);
                    return;
                }

                // Instead of fetching, navigate directly to the backend endpoint
                // This ensures cookies are properly set by the browser
                const backendUrl = import.meta.env.VITE_API_BASE_URL || 'https://chat.liaizen.com';
                let verifyUrl = `${backendUrl}/api/auth/magic-link/verify?token=${token}`;
                if (inviteToken) {
                    verifyUrl += `&invite_token=${inviteToken}`;
                }
                
                // Navigate directly to backend - it will verify and redirect back with cookies set
                window.location.href = verifyUrl;
            } catch (err) {
                console.error('Magic link verification failed:', err);
                setError(err instanceof Error ? err.message : 'Invalid or expired magic link');
                setIsVerifying(false);
                
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    const urlParams = new URLSearchParams(window.location.search);
                    const inviteToken = urlParams.get('invite');
                    if (inviteToken) {
                        setLocation(`/login?invite=${inviteToken}`);
                    } else {
                        setLocation('/login');
                    }
                }, 3000);
            }
        };

        verifyMagicLink();
    }, [setLocation]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        {isVerifying ? 'Verifying Your Magic Link' : 'Verification Failed'}
                    </h1>
                    
                    {isVerifying ? (
                        <>
                            <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600 mb-4" />
                            <p className="text-gray-600">
                                Please wait while we sign you in...
                            </p>
                        </>
                    ) : error ? (
                        <>
                            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl mb-4">
                                {error}
                            </div>
                            <p className="text-gray-600">
                                Redirecting to login page...
                            </p>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

export default MagicLinkVerify;