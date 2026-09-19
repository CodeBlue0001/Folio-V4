// ─── Admin Authentication & Session Management ─────────────────────────────

const ADMIN_TOKEN_KEY = (import.meta as any).env?.VITE_ADMIN_TOKEN_KEY || 'folio_admin_auth_token';
const ADMIN_SESSION_EXPIRES = (import.meta as any).env?.VITE_ADMIN_SESSION_EXPIRES || 'folio_admin_auth_expires';

/**
 * Retrieve admin password from Vite environment variables with sanitization
 */
const getEnvPassword = (): string => {
  const env = (import.meta as any).env || {};
  const raw = env.VITE_ADMIN_PASSWORD || env.DEFAULT_FALLBACK_PASSWORD || env.ADMIN_PASSWORD || 'DS2026';
  return raw ? String(raw).trim().replace(/^['"]|['";\s]+$/g, '') : '';
};

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
 * with client-side fallback using configured env password.
 */
export const adminLogin = async (password: string): Promise<{ success: boolean; error?: string }> => {
  const cleanPassword = password ? password.trim() : '';
  if (!cleanPassword) {
    return { success: false, error: 'Password is required' };
  }

  // 1. Try Backend Verification
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: cleanPassword }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.token) {
        saveAdminSession(data.token);
        return { success: true };
      }
    }
  } catch {
    // Backend offline or running purely as static bundle
  }

  // 2. Client-side fallback check (configured via VITE_ADMIN_PASSWORD / env)
  const envPass = getEnvPassword();
  if (envPass && cleanPassword === envPass) {
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
