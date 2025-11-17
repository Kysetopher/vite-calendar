// Authentication service for LiaiZen dual authentication system
// All requests are routed through the single API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const PROFESSIONAL_FASTAPI_MODE = false; // Fallback to Express endpoints

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface AuthResponse {
  token_type: string;      
  expires_in: number;      
  user: ApiUser;
  invite_token?: string;  // Added for invitation preservation
}

export interface ApiUser {
  id: number;
  auth0_id: string;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  profile_image_url?: string;
  birthday?: Date;
  address?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
  calendar_linked?: boolean;
  onboarding_completed?: boolean;
  sub?: string;
}

export interface AuthUser extends ApiUser {
  auth_status: string;
  google_auth_access: boolean;
  google_auth_refresh: boolean;
}

class AuthService {
  /** ---------------------------
   * Invite token helpers (shared)
   * ----------------------------*/

  private INVITE_KEY = 'pendingInvite';

  getAuthStateFromInvite(): string {
    const invite = this.getActiveInviteToken();
    return invite ? encodeURIComponent(JSON.stringify({ invite })) : "";
  }

  oauthLogin(provider: "google" | "apple"): void {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const state = this.getAuthStateFromInvite();
    const url = `${API_BASE_URL}/api/auth/login/${provider}${state ? `?state=${state}` : ""}`;
    window.location.href = url;
  }
  /** Pulls ?invite= from URL and caches it in sessionStorage (idempotent). */
  storeInviteFromUrl(): string | undefined {
    try {
      const params = new URLSearchParams(window.location.search);
      const invite = params.get('invite') || undefined;
      if (invite) sessionStorage.setItem(this.INVITE_KEY, invite);
      return invite;
    } catch {
      return undefined;
    }
  }

  /** Read cached invite from sessionStorage (if present). */
  getInviteFromStorage(): string | undefined {
    try {
      const v = sessionStorage.getItem(this.INVITE_KEY);
      return v || undefined;
    } catch {
      return undefined;
    }
  }

  /** Best-effort: prefer URL, then storage. Also refresh storage from URL. */
  getActiveInviteToken(): string | undefined {
    const fromUrl = this.storeInviteFromUrl();
    if (fromUrl) return fromUrl;
    return this.getInviteFromStorage();
  }

  /** Optional: clear stored invite after you no longer need it. */
  clearInvite(): void {
    try {
      sessionStorage.removeItem(this.INVITE_KEY);
    } catch {}
  }

  async googleLogin()  {
      window.location.href = `${API_BASE_URL}/api/auth/login/google`;
  }

  async login(credentials: LoginRequest, inviteToken?: string): Promise<AuthResponse> {
    // Build URL with invite token if present
    const url = new URL(`${API_BASE_URL}/api/auth/login`);
    if (inviteToken) {
      url.searchParams.append('invite_token', inviteToken);
    }
    
    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',           // ← send/receive cookies
      body: JSON.stringify(credentials),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(err.detail || 'Invalid credentials');
    }

    // the cookies are already set by the server; JSON only has user + metadata
    return res.json();
  }

  async signup(userData: SignupRequest, inviteToken?: string): Promise<AuthResponse> {
    // Build URL with invite token if present
    const url = new URL(`${API_BASE_URL}/api/auth/register`);
    if (inviteToken) {
      url.searchParams.append('invite_token', inviteToken);
    }
    
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
        first_name: userData.first_name,
        last_name: userData.last_name,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Signup failed' }));
      throw new Error(error.detail || error.message || 'Signup failed');
    }

    const data = await response.json();
    
    return data;
  }

  private decodeJWT(token: string): any {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
      credentials: 'include',
    });
    if (res.status === 401) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        const retryRes = await fetch(`${API_BASE_URL}/api/auth/me`, {
          credentials: 'include',
        });
        if (retryRes.ok) return await retryRes.json();
        return null;
      }
      return null;
    }
    if (!res.ok) return null;
    const user: AuthUser = await res.json();
    return user;
  }

  async getProfile(): Promise<ApiUser | null> {
    const res = await fetch(`${API_BASE_URL}/api/profile/me`, {
      credentials: 'include',
    });
    if (res.status === 401) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        const retryRes = await fetch(`${API_BASE_URL}/api/profile/me`, {
          credentials: 'include',
        });
        if (retryRes.ok) return await retryRes.json();
        return null;
      }
      return null;
    }
    if (!res.ok) return null;
    const profile: ApiUser = await res.json();
    return profile;
  }

  async logout(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    if (res.status === 401) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        const retryRes = await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          credentials: 'include'
        });
        if (!retryRes.ok) {
          const err = await retryRes.json().catch(() => ({}));
          throw new Error(err.detail || err.message || 'Logout failed');
        }
        return retryRes.json();
      }
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || err.message || 'Logout failed');
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || err.message || 'Logout failed');
    }
    return res.json();
  }

  /**
   * Refresh the access token using the refresh token cookie.
   * Returns true if a new token was issued, false otherwise.
   */
  async refreshAccessToken(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!res.ok) return false;
      // response contains a new access token in JSON; cookies are rotated automatically
      await res.json().catch(() => ({}));
      return true;
    } catch {
      return false;
    }
  }

  async requestMagicLink(email: string, inviteToken?: string): Promise<any> {
    const url = new URL(`${API_BASE_URL}/api/auth/magic-link/request`);
    
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email,
        invite_token: inviteToken,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to send magic link' }));
      throw new Error(error.detail || error.message || 'Failed to send magic link');
    }
    
    return await response.json();
  }

  async verifyMagicLink(token: string, inviteToken?: string): Promise<AuthResponse> {
    const url = new URL(`${API_BASE_URL}/api/auth/magic-link/verify`);
    url.searchParams.append('token', token);
    if (inviteToken) {
      url.searchParams.append('invite_token', inviteToken);
    }
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Invalid or expired magic link' }));
      throw new Error(error.detail || error.message || 'Invalid or expired magic link');
    }

    return response.json();
  }
}

export const authService = new AuthService();
