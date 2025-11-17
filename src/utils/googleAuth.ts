// Utility for handling Google OAuth flow and retrieving an id_token

let googleScriptPromise: Promise<void> | null = null;

function loadGoogleScript(): Promise<void> {
  if (googleScriptPromise) return googleScriptPromise;
  googleScriptPromise = new Promise((resolve, reject) => {
    if (document.getElementById('google-oauth')) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.id = 'google-oauth';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google OAuth script'));
    document.head.appendChild(script);
  });
  return googleScriptPromise;
}

export async function getGoogleIdToken(): Promise<string | null> {
  await loadGoogleScript();

  return new Promise((resolve, reject) => {
    const google = (window as any).google;
    if (!google?.accounts?.id) {
      reject(new Error('Google API unavailable'));
      return;
    }

    google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: (resp: any) => {
        if (resp?.credential) {
          resolve(resp.credential);
        } else {
          // No credential means the user dismissed or blocked the prompt
          resolve(null);
        }
      },
      ux_mode: 'popup',
      use_fedcm_for_prompt: true,
    });

    google.accounts.id.prompt((notification: any) => {
      if (
        notification.isNotDisplayed() ||
        notification.isSkippedMoment() ||
        notification.isDismissedMoment()
      ) {
        resolve(null);
      }
    });
  });
}
