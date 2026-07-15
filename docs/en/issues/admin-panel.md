# Issue Plan — Admin Panel (`src/pages/AdminPanel.tsx`)

## Screen overview

The Admin Panel manages system users: paginated listing, creating new users, changing roles, and deleting accounts. It's only visible to users with `role === "ADMIN"` (the sidebar hides access for non-admin roles). The page is composed of independent modules: `StatsModule`, `UserTableModule`, `CreateUserModule`, `RoleUpdateModule`, `UserDeleteModule`.

---

## Data architecture

| Element | Source |
|---|---|
| Paginated user list | `adminService.getUsers(page, 10)` → `{ users[], meta }` |
| Authenticated user (for the header) | `useAuth()` → `user.username` |
| General stats | `StatsModule` (has its own internal fetch) |
| Create user | `CreateUserModule` → `onCreated` callback re-fetches |
| Role change | `RoleUpdateModule` → `onSaved` callback re-fetches |
| Deletion | `UserDeleteModule` → `onDeleted` callback re-fetches |

**State flow:**
1. A `useEffect` calls `fetchUsers(page)` on mount and on every page change.
2. `fetchUsers` is memoized with `useCallback` for dependency stability.
3. Every child module that mutates data calls its callback (`onCreated`, `onSaved`, `onDeleted`) → triggers `refetch()`, which refreshes the current page.
4. Pagination is handled in `UserTableModule` via `onPageChange(setPage)`.

---

## Identified issues

### Critical bug — Blank username

**Symptom:** The line `Sesión: <strong>{displayName}</strong>` shows the `—` placeholder or renders blank.

**Likely cause:** The `User` interface in `src/types/api.types.ts` defines `username: string` (line 13), but the decoded JWT token that `AuthContext` stores in `localStorage` under the `tm_user` key may carry the field under a different name (e.g. `name`, `email`, or a sub-claim). If the login response doesn't include `username`, `user?.username` returns `undefined` and the `??` operator coerces it to `'—'`.

**Steps to investigate:**
1. Log in and open DevTools → Application → localStorage → inspect the `tm_user` object.
2. Check whether the `username` field exists in the payload, or whether the backend uses a different field name.
3. If the field has a different name (e.g. `name`), update the `User` interface in `api.types.ts` and/or the `displayName` logic in `AdminPanel.tsx`.

**Note:** This same field can affect the avatar initial in `Sidebar.tsx` (`user?.username || "Acme Corp"`).

### UI — Margin review

1. **Panel header:** `flex items-center gap-3` with a `Shield` icon inside a `w-9 h-9 rounded-xl bg-[#EFF6FF]` container. Verify vertical alignment against the text to the right.
2. **Spacing between modules:** `space-y-6` between all modules. Confirm whether Figma calls for a more pronounced visual separator between sections, or whether `space-y-6` is enough.
3. **"admin" badge:** `text-[10px] px-2.5 py-1` with a `Shield` icon at `size={9}`. Verify it reads clearly at every viewport.

### StatsModule

- Note from CLAUDE.md: it currently runs on a **simulated timer** and isn't wired to a real user API. Verify whether it already has its own endpoint or is still simulated.
- If still simulated, document it as technical debt in the tests.

### Responsive design

- `max-w-4xl mx-auto` → below 768px, modules stack vertically.
- `UserTableModule`: the user table may need horizontal scroll on mobile.
- `RoleUpdateModule` and `UserDeleteModule`: verify the user selectors don't get cut off on narrow screens.

---

## Tests to perform

### Username bug

- [ ] **Reproduce the bug:** Log in as an admin user → navigate to `/admin` → check whether `displayName` shows the correct name or `—`.
- [ ] **Inspect localStorage:** Confirm the structure of the `tm_user` object and which fields the backend actually returns.
- [ ] **Verify the sidebar:** The avatar initial in Sidebar also uses `user?.username` — the fix must be applied consistently in both places.

### User loading and pagination

- [ ] On load, the spinner should show while `isLoading === true`.
- [ ] If `getUsers()` errors, the red banner "No se pudo cargar la lista de usuarios." should appear.
- [ ] With data: the `UserTableModule` table shows the paginated list (10 per page).
- [ ] Pagination works: advance from page 1 → 2 → back to 1 and verify the re-fetch.
- [ ] The total page count (`meta.totalPages`) matches the real number of users.

### Create user

- [ ] Fill out the `CreateUserModule` form with valid data → the user appears in the table after the re-fetch.
- [ ] Try creating a user with a duplicate email → the backend error should surface.
- [ ] Empty required fields → the form isn't submitted.

### Role change

- [ ] Select a user in `RoleUpdateModule` and switch from USER → ADMIN → save → the role updates in `UserTableModule`.
- [ ] You cannot change the role of your own currently-authenticated admin account (verify whether this restriction exists).

### Delete user

- [ ] Select a user in `UserDeleteModule` → confirm deletion → the user disappears from the table.
- [ ] Try deleting the currently authenticated user → should be blocked or show a warning.

### StatsModule

- [ ] Verify whether it shows real or simulated (timer-based) data.
- [ ] If simulated, document it as pending API connection.

### Responsive

- [ ] **Mobile (375px):** All modules stack, the table has horizontal scroll if needed.
- [ ] **Tablet (768px):** Verify the role/delete selectors don't overflow.
- [ ] **Desktop (1280px):** Layout with a centered `max-w-4xl`, no excessive empty space.

### Access security

- [ ] Navigate to `/admin` with a `role === "USER"` account → should redirect or show access denied (verify whether `ProtectedRoute` handles this or only the sidebar hides the link).
