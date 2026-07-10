import { UserRole } from "./api.types";

// ---------------------------------------------------------------------------
// Wire shapes — what POST /users/login actually sends and receives.
// ---------------------------------------------------------------------------

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  username: string;
}

/**
 * The user object exactly as the API returns it. Two traps live here:
 * `role` arrives uppercased (`ADMIN` / `USER`), and there is no `username`.
 */
export interface AuthUser {
  id: string | number;
  email: string;
  role: UserRole;
}

/** Body of POST /users/login once apiClient has unwrapped the envelope. */
export interface LoginResponse {
  token: string;
  user: AuthUser;
}

// ---------------------------------------------------------------------------
// Session shapes — what the UI stores and reads. Deliberately not the wire shape.
// ---------------------------------------------------------------------------

/** Role as the UI stores it. Matches the backend enum verbatim — no casing translation. */
export type SessionRole = UserRole;

/**
 * What we persist under `tm_user`. `username` is derived from the email
 * local-part — the API never sends one — and is what the Sidebar displays.
 */
export interface SessionUser {
  email: string;
  role: SessionRole;
  username: string;
}

/** Arguments accepted by `login()`. An object, so `token` and `role` can't be swapped. */
export interface LoginSession {
  email: string;
  token: string;
  role: SessionRole;
  username?: string;
}

export interface AuthContextValue {
  user: SessionUser | null;
  login: (session: LoginSession) => void;
  logout: () => void;
}

// ---------------------------------------------------------------------------
// UI state
// ---------------------------------------------------------------------------

export type AuthUiState = "form" | "loading" | "error";
