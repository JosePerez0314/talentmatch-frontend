# Frontend Documentation — TalentMatch AI

> Documentation of the **real current state** of the frontend: structure, components, data layer, flows, and how connected each screen is to the backend.
>
> 🇪🇸 Versión en español: [`../es/front-documentation.md`](../es/front-documentation.md)
>
> Related documents: [`../../CLAUDE.md`](../../CLAUDE.md) (working rules) · [`api-documentation.md`](./api-documentation.md) (backend contract) · [`bugs.md`](./bugs.md) (bug inventory) · [`issues.md`](./issues.md) + [`issues/`](./issues/) (per-screen QA plans) · [`last-changes.md`](./last-changes.md) (changelog).
>
> **Last verified against the code:** 2026-07-14.
>
> **State summary:** every screen is now wired to the real API — there is no longer any 100%-mock screen. The `MOCK_*`/`setTimeout` code that the previous version of this file documented (Dashboard, Admin Panel) has been replaced with real calls. What remains are **minor bugs** (dead code, one legacy screen with a parsing bug, an ignored prop, naming inconsistencies) — none of them block normal use of the app. Full detail in [`bugs.md`](./bugs.md).

---

## 1. Product overview

Recruitment SPA (dashboard) for:

- Uploading CVs (PDF) and scoring them with AI against vacancies.
- Managing **Departments → Positions → Vacancies → Candidates**.
- Viewing matching rankings (MatchScore) per vacancy.
- Administering users (admin panel), including user creation and role changes.

The UI and most comments are in **Spanish**; identifiers mix Spanish and English. **New** comments are written in English (see `CLAUDE.md`).

---

## 2. Real technology stack

| Area          | Technology                                                                                                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Framework     | **React 19** (`react` / `react-dom` ^19.2)                                                                                                                                          |
| Bundler / dev | **Vite 5**                                                                                                                                                                          |
| Language      | **TypeScript** (`.jsx`→`.tsx` migration nearly complete — 5 `.jsx` files remain, see §3)                                                                                            |
| Styling       | **Tailwind CSS v4** via `@tailwindcss/vite` (configured in `src/index.css` with `@import "tailwindcss"`). The root `tailwind.config.js` is a legacy v3-style stub and is **unused**. |
| Routing       | **react-router-dom v7**                                                                                                                                                             |
| Global state  | **React Context** (`AuthContext`) — no Redux                                                                                                                                        |
| HTTP          | Hand-rolled `fetch` wrapper (`apiClient.ts`) — no Axios                                                                                                                              |
| Icons         | `lucide-react` **and** `react-icons` coexist (see §5), plus local SVGs in `assets/icons/`                                                                                            |
| Screenshots   | `html-to-image` — used by `EvaluationsHistory` to copy results as an image to the clipboard                                                                                          |
| Type-check    | `vite-plugin-checker` with `typescript: true` → **type errors fail both `dev` and `build`**                                                                                          |
| Lint          | ESLint 9 with `@typescript-eslint/no-explicit-any` as an **error** — the current sweep confirms **zero** uses of `any` anywhere in `src/`                                            |

> **`package.json` is clean.** There are no dead dependencies (`express`, `cors`, `dotenv` — which earlier versions of this documentation mentioned — **do not exist** in the current `package.json`). There is also no stray `react-router` alongside `react-router-dom`.

> **`vite.config.ts`** pins `server.port: 5173` with `strictPort: true` — this prevents the dev server from silently starting on a different port if 5173 is taken, which would break the `Origin` the backend's CORS expects.

### Commands

```bash
npm run dev      # Vite dev server (fixed port 5173)
npm run build    # Production build (fails on type errors)
npm run lint     # ESLint
npm run preview  # Serve the built dist/
```

**There is no test runner** (no Jest/Vitest, no `*.test.*`/`*.spec.*` files). There is also no separate typecheck script: `vite-plugin-checker` runs `tsc` inside the Vite process. Verification = `npm run build` (types) + manual QA in `npm run dev`.

---

## 3. Folder structure

```
src/
├── App.tsx                 # Router + ProtectedRoute + AdminRoute + layout
├── main.tsx                # React bootstrap (StrictMode)
├── index.css                # Tailwind v4 + custom scrollbar
├── App.css                  # (legacy, 5 lines)
├── vite-env.d.ts             # Vite client types (relocated from orphan src/src/)
├── assets/icons/             # SVGs + index.ts (re-exports as `Icons`)
├── components/
│   ├── admin/                # StatCard, StatsModule, UserTableModule, CreateUserModule, RoleUpdateModule, UserDeleteModule
│   ├── cards/                 # CandidateMatchRow.tsx, MetricCard.tsx
│   ├── context/               # AuthContext.tsx
│   ├── modals/                 # CandidateDetailsModal, DeleteDepartmentModal, EditDepartmentModal, VacancyActionModal, TimeoutWarningModal
│   ├── routes/                  # AdminRoute.tsx  ← role guard for /admin
│   ├── Sections/                 # ActionDropdown, PositionHistoryTable, PositionSuccess, VacancySuccess, UploadCVSuccess
│   ├── ui/                        # AuthInput, LoginForm, PillInput, ProcessingModal, SessionTimeoutGuard
│   ├── EmptyState.jsx, EvaluationCard.tsx, HistoryTable.jsx
├── layouts/                  # Sidebar.tsx, Footer.jsx
├── pages/                    # Route-level screens (see §8)
├── services/api/             # apiClient + one *.api.ts per domain (see §6)
├── services/session.ts       # localStorage session persistence (see §4.3)
├── types/                    # Per-domain TypeScript contracts (see §7)
└── utils/                    # loginShortcuts.ts
```

**TS migration status:** only a few `.jsx`/`.js` files remain: `CVHistory.jsx`, `EmptyState.jsx`, `HistoryTable.jsx`, `TimeoutWarningModal.jsx`, `ProcessingModal.jsx`, `SessionTimeoutGuard.jsx`. Everything else — including every page except `CVHistory.jsx` — is already TypeScript. Rule: **new components in TypeScript**; port a file to TS when it receives substantial changes.

---

## 4. Core architecture

### 4.1 Routing (`src/App.tsx`, 87 lines)

- `/` → `<Navigate to="/login" replace />`.
- `/login` is the **only public route**.
- Everything else lives inside **`ProtectedRoute`** (a `<Route element={<ProtectedRoute/>}>` with `<Outlet/>`), which redirects to `/login` if `useAuth().user` is falsy.
- `/admin` additionally lives inside **`AdminRoute`**, nested inside `ProtectedRoute` (requires both a session **and** the `ADMIN` role).
- Catch-all `*` → `<Navigate to="/dashboard" replace />` (which itself bounces to login if there's no session).

**Page reuse across routes** (same screen, different URL with params):

| Component             | Routes                                                  |
| ----------------------- | ---------------------------------------------------------- |
| `Position`            | `/position`, `/position/edit/:id` (create/edit mode via `Boolean(useParams().id)`) |
| `Vacancy`             | `/vacancy`, `/vacancy/edit/:id` (create/edit mode via `Boolean(useParams().id)`) |
| `Resultados`          | `/resultados`, `/resultados/:id`                              |
| `EvaluationsHistory`  | `/evaluations-history`, `/evaluations-history/:id`            |
| `AdvancedResults`     | `/advanced-results/:id`                                        |

#### Full route table

| Route                                               | Page                  | Protection                     | Note                                                                    |
| ------------------------------------------------------ | ----------------------- | ------------------------------- | ---------------------------------------------------------------------------- |
| `/login`                                           | `Login`                | ❌ public                      |                                                                                |
| `/dashboard`                                       | `Dashboard`            | ✅ session                     | Wired to `dashboardService.getSummary()`                                      |
| `/position`, `/position/edit/:id`                  | `Position`             | ✅ session                     | 4-step wizard, manual or AI-assisted; edit mode pre-fills the form via `useParams().id` |
| `/uploadcv`                                        | `UploadCV`             | ✅ session                     |                                                                                |
| `/cv-history`                                      | `CVHistory`            | ✅ session                     | ⚠️ parallel screen to `CandidatesHistory`, not linked from the sidebar — see §10 |
| `/position-history`                                | `PositionHistory`      | ✅ session                     |                                                                                |
| `/vacancy`, `/vacancy/edit/:id`                    | `Vacancy` (`CreateVacancy`) | ✅ session                 |                                                                                |
| `/vacancy-history`                                 | `VacancyHistory`       | ✅ session                     | Imported in `App.tsx` under the name `VacacyHistory` (typo, see §10)         |
| `/department`                                      | `CreateDepartment`     | ✅ session                     |                                                                                |
| `/department-history`                              | `DepartmentHistory`    | ✅ session                     |                                                                                |
| `/resultados`, `/resultados/:id`                   | `Resultados`           | ✅ session                     | ⚠️ legacy screen, not linked from anywhere in the UI — see §10                |
| `/candidates-history`                              | `CandidatesHistory`    | ✅ session                     | Groups candidates by vacancy (uses `vacanciesApi.getAll()`)                    |
| `/evaluations-history`, `/evaluations-history/:id` | `EvaluationsHistory`   | ✅ session                     | The `:id` param is never read — the screen is its own self-driven state machine, see §10 |
| `/advanced-results/:id`                            | `AdvancedResults`      | ✅ session                     | The "current" results screen, linked from Vacancies/Candidates                |
| `/admin`                                           | `AdminPanel`           | ✅ session + **`ADMIN` role**  | The sidebar link is already role-filtered (see §4.4/§9)                       |

No lazy-loading/code-splitting: every page is statically imported.

### 4.2 HTTP client (`src/services/api/apiClient.ts`, 159 lines)

Thin wrapper over `fetch`. Responsibilities:

1. Prefixes `VITE_API_URL` (trims a trailing `/`).
2. Injects `Authorization: Bearer <token>` from `localStorage` — **except** on endpoints marked `isPublicEndpoint: true`.
3. **Unwraps the backend envelope.** Supports two shapes: `{ success, data, error/message, details }` (`ApiResponse<T>`) or the double-wrapped `{ response: { success, data } }` (`WrappedApiResponse<T>`, used by the backend's `sendResponseOr404` helper) — whichever is present.
4. Returns `.data` if defined, unless `raw: true` was requested (returns the full envelope).
5. Throws `ApiError` (with `message`, `status`, `data`) on `!response.ok` or `success: false`.

**`isPublicEndpoint` (a per-call option, currently used only by `authService.login` and `authService.register`):**

- Does not attach `Authorization` to the request (avoids sending a stale/invalid token to `POST /users/login` or `POST /users`).
- A `401` on a public endpoint does **not** trigger `endExpiredSession()` — it propagates as a normal `ApiError` so the login form can show "wrong credentials" instead of the app wiping session state and redirecting away from the very login form the user is filling out.

**401 on non-public endpoints:** calls `endExpiredSession()` (clears `localStorage` via `session.ts` and does `window.location.assign("/login")`, unless already on `/login`). This is a real behavior change vs. earlier versions of the frontend, where a 401 did not trigger logout.

> ⚠️ **`BASE_URL` still has no fallback.** `const BASE_URL: string = import.meta.env.VITE_API_URL;` — if the variable is undefined, the first request literally uses the URL `"undefined/users/login"`. No `.env.example` is committed to the repo despite `.gitignore` carving out an explicit exception for it (`!.env.example`) — a fresh clone has no template to guide it. See `bugs.md`.

### 4.3 Authentication (`src/components/context/AuthContext.tsx` + `src/services/session.ts`)

- `AuthProvider` wraps the whole app; hydrates state synchronously via `readStoredSession()` inside the `useState` initializer (there is no `loading` state to await).
- `readStoredSession()` (`session.ts`): if `tm_user` exists but there is no `token`, treats the session as invalid and clears both keys (avoids being "logged in" in appearance but without a real token). Validates that `role` is exactly `"ADMIN"` or `"USER"`; any other value invalidates the session.
- `login({email, token, role, username?})` — if `username` isn't passed, it's derived from the email's local part (`deriveUsername`).
- `logout()` clears `localStorage` (via `clearStoredSession`) and does `window.location.href = "/login"` (full reload, not `navigate`).
- Consumed via the **`useAuth()`** hook (throws if used outside the provider).

```ts
// src/types/auth.types.ts
export type SessionRole = UserRole; // 'ADMIN' | 'USER' — same enum as the backend, no casing translation
export interface SessionUser {
  email: string;
  role: SessionRole;
  username: string;
}
```

> ✅ **The role-casing mismatch that earlier versions of this document documented no longer exists.** The backend emits `ADMIN`/`USER` and **the entire frontend** (`AuthContext`, `session.ts`, `AdminRoute`, `types/api.types.ts`, `types/auth.types.ts`) uses that same uppercase enum — there is no lowercase `'admin' | 'user'` anywhere in the current code. The only remaining normalization is defensive and lives in `Login.tsx`: `asRole(role) = role === "ADMIN" ? "ADMIN" : "USER"`, for the edge case where the backend returns something unexpected.
- After a successful login, `Login.tsx` navigates explicitly: `navigate(role === "ADMIN" ? "/admin" : "/dashboard")` — an admin doesn't pass through `/dashboard` first.
- `Login.tsx` also resolves demo shortcuts via `resolveLoginEmail()` (`utils/loginShortcuts.ts`): typing just `"admin"` in the email field expands it to `admin@admin.ai` on submit. The email `<input>` toggles `type="text"`/`type="email"` (`LoginForm.tsx`) so the browser's native validation doesn't block that shortcut before it gets expanded.

### 4.4 Role guard (`src/components/routes/AdminRoute.tsx`, 13 lines)

```ts
export const AdminRoute: React.FC = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};
```

Direct comparison against `'ADMIN'` (no `.toLowerCase()` needed anymore). **No `console.log`** — the debug dump that earlier versions of this document documented has been removed.

### 4.5 Session guard (`src/components/ui/SessionTimeoutGuard.jsx`)

Global inactivity watchdog, mounted in the protected layout:

- Listens to activity events → updates `lastActivity` in `localStorage` (throttled to at most 1 write/second).
- **Warns at 9 min** (`TimeoutWarningModal`), **logs out at 10 min**.
- Syncs `lastActivity` **across tabs** via the `storage` event.
- On expiry: `logout()` + `navigate("/login", { state: { sessionExpired: true } })`.

---

## 5. Styling and assets

- **Inline Tailwind v4** in JSX. **Hardcoded arbitrary values** are common (`bg-[#F0F0F5]`, `text-[#447ECA]`). There are no centralized theme tokens.
- De facto brand color: **`#447ECA`** (blue). App background: `#F0F0F5`.
- `index.css` (25 lines): imports Tailwind and defines a custom "enterprise" scrollbar (thin, appears on hover). `App.css` is 5 lines with no relevant content.
- **Two icon libraries coexist:** `lucide-react` (used pervasively) and `react-icons` (used only in `DeleteDepartmentModal.tsx` and `EvaluationCard.tsx`). Not a bug, but consistency debt — see `bugs.md`.
- **Local icons:** SVGs in `assets/icons/` re-exported as an `Icons` object from `assets/icons/index.ts` (`Icons.sidebar.*`, `Icons.auth.*`, `Icons.logos.*`, …).
- No BEM/CSS-modules system.

> ⚠️ A misspelled Tailwind class **doesn't break the build or lint** — to the compiler it's just a string inside `className`. Class typos are only caught by looking at the app in the browser.

---

## 6. API services layer (`src/services/api/`)

One service object per domain. **A page never calls `fetch` directly.** **All eight files are real — no service remains mocked.**

| Service             | File                  | Methods                                                                                                              | State                                          |
| --------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `authService`      | `auth.api.ts`        | `login`, `register`                                                                                                  | ✅ both `isPublicEndpoint: true`                 |
| `departmentsApi`   | `departments.api.ts` | `getAll`, `getById`, `create`, `update`, `delete`                                                                     | ✅ **reference flow, 100% functional**            |
| `positionService`  | `positions.api.ts`   | `getAll`, `getById`, `create`, `update`, `delete`, `completeWithAI`, `duplicate`                                      | ✅ functional                                       |
| `vacanciesApi`     | `vacancies.api.ts`   | `getAll`, `getById`, `create`, `update`, `updateStatus`, `delete`, `getResults`, `uploadCVs`, `evaluateCandidates`, `updateCandidateStatus`   | ✅ functional — `updateCandidateStatus(vacancyId, candidateId, status)` calls `PATCH /vacancies/:vacancyId/candidates/:candidateId/status` |
| `candidateService` | `candidates.api.ts`  | `getAll`                                                                                                             | ✅ read-only |
| `dashboardService` | `dashboard.api.ts`   | `getSummary`                                                                                                         | ✅ **wired** — consumed by `Dashboard.tsx`         |
| `adminService`     | `admin.api.ts`       | `getStats`, `getUsers`, `updateRole`, `deleteUser`, `createUser`                                                     | ✅ **rewritten on top of `apiClient` — no longer a mock** |

Every method already returns the unwrapped type (`Promise<Position[]>`, `Promise<Vacancy>`, `Promise<void>`…), not `Promise<ApiResponse<T>>`. `apiClient` handles the envelope, so callers **must not re-unwrap**.

### 6.1 `admin.api.ts` is no longer a fake

Earlier documentation warned that `adminService` returned invented data via `MOCK_USERS` + `setTimeout`. **This is no longer the case**: all five methods call `apiClient` against real endpoints —

```ts
getStats()                     // GET  /admin/stats
getUsers(page = 1, limit = 50) // GET  /admin/users?page&limit → { users, meta }
updateRole(userId, newRole)    // PUT  /admin/users/:id/role
deleteUser(userId)             // DELETE /admin/users/:id
createUser(email, password)    // POST /users (public endpoint; created as USER, and if the
                                // admin picked ADMIN in the form, CreateUserModule makes a
                                // second call to updateRole)
```

There is no remaining `console.log`, `setTimeout`, or `any` in this file.

### 6.2 Department normalization (reference pattern)

`departmentsApi` does backend↔UI business mapping via a `RawDepartment` interface and a typed `normalizeRawDepartment` function (no `any`):

- `id: number` → `id: string`.
- The backend uses `title`; the UI uses `name` (translated both ways, on read and on write).
- Flattens `_count.positions` → `positionsCount`.

This is the pattern to imitate when wiring up other domains whose shape doesn't match the UI.

---

## 7. Type model (`src/types/`)

Per-domain TS contracts. Key enums (in `api.types.ts`):

```ts
type UserRole = "ADMIN" | "USER";
type EducationLevel =
  | "NONE" | "HIGH_SCHOOL" | "BACHELOR" | "TECHNICAL"
  | "UNIVERSITY" | "MASTER" | "DOCTORATE";
type VacancyStatus = "ACTIVE" | "PAUSED" | "CLOSED";
type CandidateStatus = "DISPONIBLE" | "CONTRATADO";
type ApplicationStatus = "PENDIENTE" | "EN_PROCESO" | "SELECCIONADO" | "RECHAZADO";
```

| File                           | Contents                                                                                                                                                                                                                |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `api.types.ts`                | Enums + `User`, `Position`, `Vacancy` (includes `_count.candidates` and `candidates?: Candidate[]`, only present on the list endpoint), `Candidate` (has current `fileUrl` and legacy `resumeUrl`), `NormalizedCandidate`, `MatchResult` (documents `normalizedCandidate?: string` as **serialized JSON** that must be parsed), `ApiResponse<T>`, `ApiErrorDetail`, `UploadResult`, `ApplicationStatus` (`PENDIENTE \| EN_PROCESO \| SELECCIONADO \| RECHAZADO`), `Application` (pairs `candidateId`, `vacancyId`, `status: ApplicationStatus`) |
| `auth.types.ts`                | `AuthUser`, `LoginResponse`, `SessionRole`, `SessionUser`, `LoginSession`, `AuthContextValue`, `AuthUiState` — with explicit inline comments about the backend user object's two "traps" (uppercased role, no `username`) |
| `dashboard.types.ts`          | Wire types (`DashboardTotals`, `VacancyStatusBreakdownItem`, `MonthlyActivityItem`, `DashboardSummary`) **and** UI types (`DashboardMetric`, `DashboardVacancyStatusCard`, `MonthlyData`) — ⚠️ the inline comment says "mock data" but these types are now populated with real data (see `bugs.md`) |
| `department.types.ts`         | `Department`, `CreateDepartmentInput`, `UpdateDepartmentInput`                                                                                                                                                            |
| `admin.types.ts`              | `StatItem`, `StatCardColorType` — no longer defines its own role type; transitively reuses `UserRole`                                                                                                                    |
| `evaluations.types.ts`        | `EvaluationVacancy` (UI shape; its `status: "Activa" | "Cerrada"` field is almost always `"Activa"` in practice because the source list is already filtered to `ACTIVE`)                                                    |

**Live inconsistency:**

- The real candidate enum is `CandidateStatus = "DISPONIBLE" | "CONTRATADO"`, but several screens (`AdvancedResults.tsx`, `EvaluationsHistory.tsx`) locally handle extra statuses like `"CONTACTADO"`/`"NO_CONTRATADO"` that **don't exist on the backend** — they're purely cosmetic, reset on page reload, and are never sent to the API. See `bugs.md`.

---

## 8. Page inventory and connection state

**Legend:** ✅ Connected to the real API · ⚠️ Connected, with a caveat worth knowing.

| Page                     | File                      | State  | Service                                                              | Notes                                                                                                                                                    |
| -------------------------- | --------------------------- | -------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Login                   | `Login.tsx`              | ✅     | `authService.login`                                                  | Demo shortcut (`admin` → `admin@admin.ai`), navigates straight to `/admin` if the role is `ADMIN`.                                                        |
| Dashboard               | `Dashboard.tsx`          | ✅     | `dashboardService.getSummary`                                        | Metrics, monthly-activity SVG chart, and status breakdown — all from the real backend. Full loading/error/empty states.                                   |
| Create Department       | `CreateDepartment.tsx`   | ✅     | `departmentsApi.create`                                              | Surfaces Zod `details` via `ApiError`. Has a `console.debug` (not `console.log`) for validation detail.                                                    |
| Department History      | `DepartmentHistory.tsx`  | ✅     | `departmentsApi.getAll/update/delete`                                 | **Full reference flow.** Deletion requires typing the exact department name into the modal.                                                               |
| Create Position         | `Position.tsx`           | ✅     | `positionService.create/completeWithAI`, `departmentsApi.getAll`    | 4-step wizard, manual or AI-autofilled from a PDF.                                                                                                          |
| Position History        | `PositionHistory.tsx`    | ✅     | `positionService.getAll/delete/duplicate`                             | Department tabs computed client-side.                                                                                                                       |
| New/Edit Vacancy        | `Vacancy.tsx`            | ⚠️     | `vacanciesApi`, `positionService`, `departmentsApi`                  | Functional end-to-end, but the success screen ignores the `onReset` it's passed (see §10 / `bugs.md`).                                                     |
| Vacancy History         | `VacancyHistory.tsx`     | ✅     | `vacanciesApi.getAll/updateStatus/delete`                             | Kebab menu with status transitions (Active/Paused/Closed) via `VacancyActionModal`.                                                                         |
| Upload CV               | `UploadCV.tsx`           | ✅     | `vacanciesApi.getAll/uploadCVs`                                      | Requires selecting an active vacancy first; window-level drag-and-drop plus a file picker. Validates `application/pdf`.                                    |
| CV History              | `CVHistory.jsx`          | ⚠️     | `candidateService.getAll`                                            | Parallel screen to `CandidatesHistory` with a different data source (flat `/candidates`) — not linked from the sidebar. See §10.                           |
| Results (legacy)        | `Resultados.tsx`         | ✅     | `vacanciesApi.getResults/updateStatus/updateCandidateStatus`          | Older results screen, not linked from anywhere in the UI. Has a parsing bug in `CandidateMatchRow` (see §10 / `bugs.md`). `handleHire` now calls `updateCandidateStatus(..., "SELECCIONADO")` instead of closing the whole vacancy. |
| Advanced Results        | `AdvancedResults.tsx`    | ✅     | `vacanciesApi.getResults/getById/getAll/uploadCVs/evaluateCandidates/updateCandidateStatus` | The **current** results screen: two sections (uploaded/evaluated candidates), a recalculate guard, `PAUSED` status handling. Status selector uses real `ApplicationStatus` values via `PATCH` API with optimistic update + rollback. Status seeded from `candidate.applications[0].status`. 404/409 error messages surfaced. |
| Candidates History      | `CandidatesHistory.tsx`  | ✅     | `vacanciesApi.getAll`                                                 | Groups candidates by vacancy (uses `GET /vacancies` with nested `candidates[]`, not `GET /candidates`).                                                     |
| Evaluations             | `EvaluationsHistory.tsx` | ✅     | `vacanciesApi.evaluateCandidates/getResults`, `departmentsApi.getAll`  | State machine (idle/calculating/done/empty). Includes "Share" (screenshot via `html-to-image`).                                                             |
| Admin Panel             | `AdminPanel.tsx`         | ✅     | `adminService` (real)                                                 | Includes `CreateUserModule` (new). Real pagination from `GET /admin/users`.                                                                                  |

### Connection summary

- **Every screen calls the real API.** No screen remains mocked.
- **With minor caveats to resolve (non-blocking):** New/Edit Vacancy (ignored `onReset` prop), CV History and legacy Results (overlapping, partially unlinked screens, one with a parsing bug). Full detail in [`bugs.md`](./bugs.md).

---

## 9. Component inventory

### `layouts/`

- **`Sidebar.tsx`** (236 lines) — grouped navigation (`MENU_GROUPS`): Dashboard (+ conditional Admin Panel) · Quick Actions · Records · Analysis. ✅ **The "Admin Panel" link is now role-filtered** (`user?.role === "ADMIN"`) — the bug earlier versions of this document documented (visible to everyone) is resolved. ⚠️ Still carries a vestigial `isDynamic`/`lastVacancyId` mechanism: no current `MenuItem` triggers it, but `VacancyHistory.tsx` still writes `lastVacancyId` to `localStorage` for it (dead code, see `bugs.md`). Logout calls `logout()` (which already navigates) and additionally does its own `navigate("/login")` — redundant double navigation, harmless.
- **`Footer.jsx`** — static footer, only rendered on `Login.tsx`.

### `components/routes/`

- **`AdminRoute.tsx`** — see §4.4. No longer has `console.log`.

### `components/context/`

- **`AuthContext.tsx`** — see §4.3.

### `components/ui/`

- **`LoginForm.tsx`** — login form. The email field toggles `type="text"`/`"email"` to allow the demo shortcut.
- **`AuthInput.tsx`** — styled auth input.
- **`PillInput.tsx`** — tag/pill input (skills, languages). Supports Enter and blur to add; deduplication is the caller's job (`Position.tsx` uses a `Set`).
- **`ProcessingModal.jsx`** — "processing…" modal used **only** by `Resultados.tsx` (legacy); a cosmetic progress animation (a 3-step fixed `setInterval`), not tied to real progress.
- **`SessionTimeoutGuard.jsx`** — see §4.5.
### `components/modals/`

- **`CandidateDetailsModal.tsx`** (442 lines) — the canonical candidate-detail view; correctly parses `normalizedCandidate` as JSON (`parseNormalized`, wrapped in try/catch). Used by `Resultados`, `AdvancedResults`, and `EvaluationsHistory`.
- **`EditDepartmentModal.tsx`** / **`DeleteDepartmentModal.tsx`** — department edit/delete (reference flow); deletion requires typing the exact name.
- **`VacancyActionModal.tsx`** — status-change confirmation with per-status copy/colors (ACTIVE/PAUSED/CLOSED).
- **`TimeoutWarningModal.jsx`** — inactivity warning (9 min), purely presentational.

### `components/cards/`

- **`CandidateMatchRow.tsx`** — used only by `Resultados.tsx` (legacy). ⚠️ Treats `normalizedCandidate` as if it were already an object instead of parsing the JSON string documented in `api.types.ts` — see `bugs.md`.
- **`MetricCard.tsx`** — Dashboard metric card; renders a `<Link>` if given `to`, or a plain `<div>` otherwise.

### `components/Sections/`

- **`ActionDropdown.tsx`** — generic row action menu (edit/delete/duplicate), used by `PositionHistoryTable`.
- **`PositionHistoryTable.tsx`** — position table with a department badge.
- **`PositionSuccess.tsx`**, **`UploadCVSuccess.tsx`** — success screens; `UploadCVSuccess` lists the per-file result from `UploadResult[]`.
- **`VacancySuccess.tsx`** — ⚠️ declares it receives `{vacancyCode, onReset}` but only destructures `vacancyCode` — `onReset` is silently ignored even though `Vacancy.tsx` does pass a real one. Its own buttons navigate with a hardcoded `navigate(...)`, so the visible behavior mostly still "works" by coincidence, not because the callback fires. See `bugs.md`.

### `components/admin/`

All five modules consume the real `adminService`, each with its own loading/error states.

- **`StatsModule.tsx`** + **`StatCard.tsx`** — a 6-metric grid from `GET /admin/stats`. `StatCard` resolves a `lucide-react` icon dynamically by string name (with a `@ts-ignore` since `lucide-react`'s namespace isn't typed for arbitrary indexing), falling back to `HelpCircle`.
- **`UserTableModule.tsx`** — paginated table. ⚠️ The search box only filters the **current page** of users (10 rows), not the whole system — a minor UX limitation, not a data bug. Displays `email.split('@')[0]` as the username (the API never returns a `username` field).
- **`CreateUserModule.tsx`** — new module. Validates the password policy client-side (10-100 chars, upper/lower/digit) mirroring the documented backend policy. If `ADMIN` was chosen as the role, makes a second call to `updateRole` after creating the user.
- **`RoleUpdateModule.tsx`** — role change with deferred per-user edits (`pendingRoles`) before saving. User display uses `email.split('@')[0]`.
- **`UserDeleteModule.tsx`** — two-step in-place confirmation ("Delete" → "Confirm?"), no modal or `window.confirm`. User display uses `email.split('@')[0]`.

### Loose files

- **`EvaluationCard.tsx`** — active-vacancy card in Evaluations, with a "Calculate" button.
- **`HistoryTable.jsx`** — generic table used only by `CVHistory.jsx`; reads several alternate field names for the CV URL (`cv.fileUrl || cv.cvUrl || cv.rawApiPayload?.cvUrl`), suggesting it was written against an older/looser API shape than what `candidates.api.ts` documents today.
- **`EmptyState.jsx`** — generic empty state, used by `CVHistory.jsx`.

---

## 10. Known bugs and technical debt

Full inventory, with severity and files, in [`bugs.md`](./bugs.md). Summary — **all minor; none prevent normal use of the app:**

- `VacancySuccess.tsx` ignores the `onReset` callback passed by `Vacancy.tsx`.
- `CandidateMatchRow.tsx` (legacy `Resultados.tsx` screen) treats `normalizedCandidate` as an object instead of parsing the JSON — likely renders skills as zero on that screen.
- Two overlapping, partially-unlinked screen pairs: `Resultados` vs. `AdvancedResults`, and `CVHistory` vs. `CandidatesHistory`.
- `/evaluations-history/:id` declares a route param that's never read.
- `Sidebar`'s `isDynamic`/`lastVacancyId` mechanism, vestigial.
- Stale comments: `dashboard.types.ts` says "mock data" (it's no longer mock); `main.tsx` has a `@ts-ignore` with a comment about migrating `App` to `.tsx` (already migrated).
- `apiClient.ts` still has no fallback for `VITE_API_URL`; no `.env.example` is committed.
- Cosmetic detail: `VacacyHistory` typo in `App.tsx`'s import.

---

## 11. Conventions and technical debt

**Conventions to follow:**

- **New** components/modules in TypeScript with explicit interfaces.
- Endpoints **always** as methods of a `*.api.ts`; never raw `fetch`/`apiClient` from a page.
- Services return the already-unwrapped type; **do not re-unwrap** at the call site.
- Defensive backend↔UI normalization in the services layer (the `departments.api.ts` pattern).
- Avoid `any` (ESLint flags it as an **error**) — the current sweep confirms zero uses.
- **New** code comments in English.
- Commits in **Conventional Commits** (`<type>(<scope>): <subject>`, in English).

**Notable technical debt (see `bugs.md` for full detail):**

- Duplicated/parallel screens not yet consolidated (`Resultados`/`AdvancedResults`, `CVHistory`/`CandidatesHistory`).
- Two icon libraries (`lucide-react` + `react-icons`) coexisting.
- `apiClient` with no `VITE_API_URL` fallback and no committed `.env.example`.
- Remaining dead code (the sidebar `isDynamic` mechanism, stale comments).

---

## 12. Environment and deployment

- Required variable via `import.meta.env`: **`VITE_API_URL`**. **No default value** — without it the app fails on the first request.
- The local (untracked) `.env` also defines `VITE_TEST_USER`/`VITE_TEST_PASS`, but **no file in `src/` reads them** — they're dead variables today.
- ⚠️ **Never read the `.env` file** (a `CLAUDE.md` rule). Infer variables from `import.meta.env.*` usages instead.
- **`vercel.json`** rewrites every non-`/api` path to `index.html` (SPA routing on Vercel).

---

## 13. How to continue (quick guide)

1. **Boot it up:** `npm install` → set `VITE_API_URL` → `npm run dev` (fixed port 5173) → log in.
2. **Before touching data:** the **Departments** flow is still the working reference pattern; imitate it when wiring up new domains.
3. **Prioritize the debt in `bugs.md`** — everything is minor, but the ignored `onReset` prop and the `CandidateMatchRow` parsing bug are the most concrete to fix.
4. **Decide what to do with the duplicated screens** (`Resultados` vs. `AdvancedResults`, `CVHistory` vs. `CandidatesHistory`): consolidate into one, or retire the legacy route from the router?
5. **Verify every change with `npm run build`** (there are no tests; type errors fail the build).
6. Remember that **`npm run build` doesn't validate Tailwind classes or stray strings**: check the UI in the browser.
7. For detailed per-screen QA (margins, responsive behavior, test checklists), see [`issues/`](./issues/) — covers Dashboard, Admin Panel, Position/Vacancy/Department/Candidates History, and Evaluations.

---

_Document generated from an analysis of the source code. Where this document and the code disagree, the code wins: update this documentation._
