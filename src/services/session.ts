import { SessionUser } from "../types/auth.types";

export const USER_STORAGE_KEY = "tm_user";
export const TOKEN_STORAGE_KEY = "token";

/** Drops both session keys. Always remove them together — see `readStoredSession`. */
export const clearStoredSession = (): void => {
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem(TOKEN_STORAGE_KEY);
};

/**
 * Reads the persisted session, or null.
 *
 * A `tm_user` without its `token` is not a session: ProtectedRoute would admit
 * the user while every request 401s, stranding them in an app that looks signed
 * in. Same for a corrupted `tm_user` — an unguarded JSON.parse here would throw
 * during the AuthProvider's first render and blank the whole app. Either way we
 * clear both keys and treat it as signed out.
 */
export const readStoredSession = (): SessionUser | null => {
  const rawUser = localStorage.getItem(USER_STORAGE_KEY);
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);

  if (!rawUser || !token) {
    clearStoredSession();
    return null;
  }

  try {
    const parsed = JSON.parse(rawUser) as Partial<SessionUser> | null;

    if (!parsed?.email || !parsed?.username) return invalidate();
    if (parsed.role !== "ADMIN" && parsed.role !== "USER") return invalidate();

    return { email: parsed.email, role: parsed.role, username: parsed.username };
  } catch {
    return invalidate();
  }
};

const invalidate = (): null => {
  clearStoredSession();
  return null;
};

export const storeSession = (user: SessionUser, token: string): void => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

export const getStoredToken = (): string | null =>
  localStorage.getItem(TOKEN_STORAGE_KEY);
