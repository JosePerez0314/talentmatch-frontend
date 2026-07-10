/**
 * Lets the demo admin log in by typing just "admin" instead of the full
 * demo email (see `DemoCredential.jsx`: admin@admin.ai / Admin123).
 *
 * Applied only at submit time (see Login.tsx), never on keystroke — resolving
 * on every change would rewrite the input under the user's cursor the moment
 * they finish typing "admin". This keeps `LoginCredentials` and `apiClient`
 * untouched: the shortcut is expanded before the request leaves the form.
 */

const ADMIN_SHORTCUT = "admin";
const ADMIN_EMAIL = "admin@admin.ai";

export const isAdminShortcut = (rawEmail: string): boolean =>
  rawEmail.trim().toLowerCase() === ADMIN_SHORTCUT;

export const resolveLoginEmail = (rawEmail: string): string =>
  isAdminShortcut(rawEmail) ? ADMIN_EMAIL : rawEmail;
