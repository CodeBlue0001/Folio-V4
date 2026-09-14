// ─── Admin Authentication & Session Management ─────────────────────────────

const ADMIN_TOKEN_KEY = 'folio_admin_auth_token';
const ADMIN_SESSION_EXPIRES = 'folio_admin_auth_expires';
const DEFAULT_FALLBACK_PASSWORD = 'admin2026';

export interface AdminAuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: string | null;
}

/**
 * Check if the current user session is authenticated and not expired
 */
export const isUserAdminAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const token = sessionStorage.getItem(ADMIN_TOKEN_KEY);
    const expires = sessionStorage.getItem(ADMIN_SESSION_EXPIRES);
    if (!token || !expires) return false;

    // Check expiration (4 hours session)
    if (Date.now() > parseInt(expires, 10)) {
      adminLogout();
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

/**
 * Perform login against the backend /api/admin/login endpoint,
 * with client-side fallback for static deployments.
 */
export const adminLogin = async (password: string): Promise<{ success: boolean; error?: string }> => {
  if (!password || !password.trim()) {
    return { success: false, error: 'Password is required' };
  }

  // 1. Try Backend Verification
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.token) {
        saveAdminSession(data.token);
        return { success: true };
      }
    } else if (res.status === 401) {
      return { success: false, error: 'Invalid administrator credentials' };
    }
  } catch {
    // Backend offline or running purely as static bundle
  }

  // 2. Client-side fallback check (configured via VITE_ADMIN_PASSWORD)
  const envPass = (import.meta as any).env?.VITE_ADMIN_PASSWORD || DEFAULT_FALLBACK_PASSWORD;
  if (password === envPass) {
    const fallbackToken = `client_admin_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    saveAdminSession(fallbackToken);
    return { success: true };
  }

  return { success: false, error: 'Invalid password. Access denied.' };
};

/**
 * Save auth session to sessionStorage (valid for 4 hours)
 */
const saveAdminSession = (token: string) => {
  if (typeof window === 'undefined') return;
  const fourHoursMs = 4 * 60 * 60 * 1000;
  sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
  sessionStorage.setItem(ADMIN_SESSION_EXPIRES, (Date.now() + fourHoursMs).toString());
};

/**
 * Clear admin session
 */
export const adminLogout = () => {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  sessionStorage.removeItem(ADMIN_SESSION_EXPIRES);
};
