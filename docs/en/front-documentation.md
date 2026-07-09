# Frontend Documentation — TalentMatch AI

> Documents the **actual current state** of the frontend: structure, components, data layer, flows, and their degree of integration with the backend.
>
> 🇪🇸 Versión en español: [`../es/front-documentation.md`](../es/front-documentation.md)
>
> Related documents: [`../../CLAUDE.md`](../../CLAUDE.md) (working rules) · [`api-documentation.md`](./api-documentation.md) (backend contract) · [`bugs.md`](./bugs.md) (bug inventory) · [`issues.md`](./issues.md) + [`issues/P0.md`](./issues/P0.md)–[`issues/P3.md`](./issues/P3.md) (prioritized backlog) · [`last-changes.md`](./last-changes.md) (engineering log).
>
> **Last verified against the code:** 2026-07-09.

---

## 1. Product summary

Recruitment dashboard SPA to:

- Upload CVs (PDF) and evaluate them with AI against vacancies.
- Manage **Departments → Positions → Vacancies → Candidates**.
- View matching rankings (MatchScore) per vacancy.
- Administer users (admin panel).

UI copy and most comments are in **Spanish**; identifiers mix Spanish and English. **New** comments are written in English (see `CLAUDE.md`).

---

## 2. Real technology stack

| Area          | Technology                                                                                                                                                                            |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework     | **React 19** (`react` / `react-dom` ^19.2)                                                                                                                                            |
| Bundler / dev | **Vite 5**                                                                                                                                                                            |
| Language      | **TypeScript** (`.jsx`→`.tsx` migration in progress)                                                                                                                                  |
| Styling       | **Tailwind CSS v4** via `@tailwindcss/vite` (configured in `src/index.css` with `@import "tailwindcss"`). The root `tailwind.config.js` is a legacy v3 stub and is **unused**.         |
| Routing       | **react-router-dom v7**                                                                                                                                                               |
| Global state  | **React Context** (`AuthContext`) — no Redux                                                                                                                                          |
| HTTP          | **Hand-rolled** `fetch` client (`apiClient.ts`) — no Axios                                                                                                                            |
| Icons         | `lucide-react` (v1.x), `react-icons`, and local SVGs in `assets/icons/`                                                                                                               |
| Type-check    | `vite-plugin-checker` with `typescript: true` → **type errors fail both `dev` and `build`**                                                                                            |
| Lint          | ESLint 9 with `@typescript-eslint/no-explicit-any` as an **error**                                                                                                                     |

> **Dead dependencies:** `package.json` includes `express`, `cors`, and `dotenv`. **They are unused** — the frontend is 100% client-side. `react-router` is also listed alongside `react-router-dom` (the latter already pulls in the former).

### Commands

```bash
npm run dev      # Vite dev server
npm run build    # Production build (fails on type errors)
npm run lint     # ESLint
npm run preview  # Serve the built dist/
```

**There is no test runner** (no Jest, no Vitest, no test files). There is also no separate typecheck script: `vite-plugin-checker` runs `tsc` inside the Vite process. Verification = `npm run build` (types) + manual QA in `npm run dev`.

---

## 3. Folder structure

```
src/
├── App.tsx                 # Router + ProtectedRoute + layout
├── main.tsx                # React bootstrap (StrictMode)
├── index.css               # Tailwind v4 + custom scrollbar
├── App.css                 # (legacy)
├── assets/icons/           # SVGs + index.ts (re-exports as `Icons`)
├── components/
│   ├── admin/              # StatCard, StatsModule, UserTableModule, RoleUpdateModule, UserDeleteModule
│   ├── cards/              # CandidateMatchRow (.jsx), MetricCard (.tsx)
│   ├── context/            # AuthContext.tsx
│   ├── modals/             # CandidateDetailsModal, DeleteDepartmentModal, EditDepartmentModal, VacancyActionModal, TimeoutWarningModal
│   ├── routes/             # AdminRoute.tsx  ← role guard for /admin
│   ├── Sections/           # ActionDropdown, PositionHistoryTable, PositionSuccess, UploadCVSuccess, VacancySuccess
│   ├── ui/                 # AuthInput, LoginForm, PillInput, ProcessingModal, SessionTimeoutGuard, StatusDropdown, EmptyVacancyState
│   ├── DemoCredential.jsx, EmptyState.jsx, EvaluationCard.tsx, HistoryTable.jsx
├── layouts/                # Sidebar.tsx, Footer.jsx
├── pages/                  # Route-level screens (see §8)
├── services/api/           # apiClient + one *.api.ts per domain (see §6)
├── types/                  # Per-domain TypeScript contracts (see §7)
└── utils/                  # dashboardConfig.js
```

**TS migration status:** 50 `.ts/.tsx` files vs 16 `.js/.jsx`. The remaining `.jsx` files are flow screens (`Resultados`, `UploadCV`, `CVHistory`) and legacy UI components. Rule: **new components in TypeScript**; port a file to TS when making substantial changes to it.

---

## 4. Core architecture

### 4.1 Routing (`src/App.tsx`)

- `/` → redirects to `/login`.
- `/login` is the **only public route**.
- Everything else lives inside **`ProtectedRoute`** (a `<Route element={<ProtectedRoute/>}>` with `<Outlet/>`).
- `/admin` additionally sits inside **`AdminRoute`** (nested role guard).
- Wildcard `*` → redirects to `/dashboard` (which in turn bounces to login if there is no session).

**`ProtectedRoute`**: if there is no `user`, `<Navigate to="/login">`. The protected layout mounts **`SessionTimeoutGuard` + `Sidebar` + `<main><Outlet/></main>`**. Protected pages can assume `user` exists.

> `AuthProvider` hydrates `user` from `localStorage` **synchronously** (in the `useState` initializer), so there is no async session check and no `loading` state to wait on.

**Page reuse across routes** (same screen, different URL with params):

| Component            | Routes                                             |
| -------------------- | -------------------------------------------------- |
| `Vacancy`            | `/vacancy`, `/vacancy/edit/:id`                    |
| `Resultados`         | `/resultados`, `/resultados/:id`                   |
| `EvaluationsHistory` | `/evaluations-history`, `/evaluations-history/:id` |
| `AdvancedResults`    | `/advanced-results/:id`                            |

#### Full route table

| Route                                              | Page                 | Protection                  |
| -------------------------------------------------- | -------------------- | --------------------------- |
| `/login`                                           | `Login`              | ❌ public                   |
| `/dashboard`                                       | `Dashboard`          | ✅ session                  |
| `/position`                                        | `Position`           | ✅ session                  |
| `/uploadcv`                                        | `UploadCV`           | ✅ session                  |
| `/cv-history`                                      | `CVHistory`          | ✅ session                  |
| `/position-history`                                | `PositionHistory`    | ✅ session                  |
| `/vacancy`, `/vacancy/edit/:id`                    | `Vacancy`            | ✅ session                  |
| `/vacancy-history`                                 | `VacancyHistory`     | ✅ session                  |
| `/department`                                      | `CreateDepartment`   | ✅ session                  |
| `/department-history`                              | `DepartmentHistory`  | ✅ session                  |
| `/resultados`, `/resultados/:id`                   | `Resultados`         | ✅ session                  |
| `/candidates-history`                              | `CandidatesHistory`  | ✅ session                  |
| `/evaluations-history`, `/evaluations-history/:id` | `EvaluationsHistory` | ✅ session                  |
| `/advanced-results/:id`                            | `AdvancedResults`    | ✅ session                  |
| `/admin`                                           | `AdminPanel`         | ✅ session + **role `admin`** |

### 4.2 HTTP client (`src/services/api/apiClient.ts`)

Thin wrapper over `fetch`. Responsibilities:

1. Prefixes `VITE_API_URL` (strips a trailing `/`).
2. Injects `Authorization: Bearer <token>` from `localStorage`.
3. **Unwraps the backend envelope.** The contract is `{ success, data, error/message }`.
4. Throws `ApiError` (a subclass of `Error` with `status` and `data`) on `!response.ok` or `success: false`.

**Normalization:**

- If the body has a `response` key (double-wrapping from the backend's `sendResponseOr404` helper, `{ response: { success, data } }`), it operates on `body.response`.
- `success` is treated as a failure **only** when it is exactly `false`. An `undefined` counts as success (envelope-less responses).
- Returns `standardResponse.data` when defined; otherwise the whole normalized object.
- Option `raw: true` → returns the full envelope without unwrapping `.data`.

> **Login case:** `POST /users/login` responds `{ success, token, user }` (no `data`). The full object is returned → `Login.tsx` reads `data.token` / `data.user`.

> ⚠️ **`BASE_URL` has no fallback.** It is literally `import.meta.env.VITE_API_URL`. If the variable is undefined, `BASE_URL.endsWith("/")` throws on the first request. Defining `VITE_API_URL` is mandatory.

> ⚠️ A `401` throws `ApiError("Sesión expirada o no autorizada.")` but **does not trigger `logout()`** or redirect. Each caller decides what to do.

### 4.3 Authentication (`src/components/context/AuthContext.tsx`)

- `AuthProvider` wraps the whole app.
- Persists **separately** in `localStorage`: `tm_user` (user object) and `token`.
- `login(email, token, role, username?)` — if `username` is omitted, it derives one from the email local-part.
- `logout()` clears `localStorage` and does `window.location.href = "/login"` (full reload, not `navigate`).
- Consumed via the **`useAuth()`** hook.

```ts
export interface UserData {
  email: string;
  role: "admin" | "user";
  username?: string;
}
```

> ⚠️ **Role casing mismatch.** The backend emits `ADMIN` / `USER` (uppercase); `UserData.role` types them lowercase. `Login.tsx` normalizes via a `normalizeRole()` helper on save, and `AdminRoute` compares defensively with `.toLowerCase()`. That is a working patch, not a unification: `admin.types.ts` still types `'admin' | 'user'` while `api.types.ts` exposes `UserRole = 'ADMIN' | 'USER'` (issue **8.3**).

### 4.4 Role guard (`src/components/routes/AdminRoute.tsx`)

Wraps `/admin` inside `ProtectedRoute`:

- No `user` → `/login`.
- `user.role.toLowerCase() !== "admin"` → `/dashboard` (avoids the backend's raw `403`).

> ⚠️ It contains **two debug `console.log` calls** that dump the whole `user` object (role included) to the browser console on every render. They must be removed (issue **10.5**).

### 4.5 Session guard (`src/components/ui/SessionTimeoutGuard.jsx`)

Global inactivity watchdog, mounted in the protected layout:

- Listens to `mousemove/keydown/click/scroll` → updates `lastActivity` in `localStorage`.
- **Warns at 9 min** (modal `TimeoutWarningModal`), **logs out at 10 min**.
- Syncs `lastActivity` **across tabs** via the `storage` event.
- On expiry: `logout()` + `navigate("/login", { state: { sessionExpired: true } })` (login shows the notice).

---

## 5. Styling and assets

- **Tailwind v4 inline** in the JSX. **Hardcoded arbitrary values** abound (`bg-[#F0F0F5]`, `text-[#447ECA]`, CSS color filters on SVGs). There are no centralized theme tokens.
- De facto brand color: **`#447ECA`** (blue). App background: `#F0F0F5`.
- `index.css`: imports Tailwind and defines a custom "enterprise" scrollbar (thin, appears on hover).
- **Icons:** local SVGs in `assets/icons/` re-exported as an `Icons` object from `assets/icons/index.ts` (`Icons.sidebar.*`, `Icons.auth.*`, `Icons.logos.*`, …). Combined with `lucide-react` icons.
- No BEM/CSS-modules system.

> ⚠️ A misspelled Tailwind class **breaks neither the build nor the lint** — to the compiler it is just a string inside `className`. Class typos only surface by looking at the app in a browser.

---

## 6. API service layer (`src/services/api/`)

One service object per domain. **`fetch` is never called directly** from a page.

| Service            | File                 | Methods                                                                                                            | Status                                     |
| ------------------ | -------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `authService`      | `auth.api.ts`        | `login`, `register`                                                                                                | ✅ login used; `register` has no UI        |
| `departmentsApi`   | `departments.api.ts` | `getAll`, `getById`, `create`, `update`, `delete`                                                                  | ✅ **reference flow, 100% functional**     |
| `positionService`  | `positions.api.ts`   | `getAll`, `getById`, `create`, `update`, `delete`, `completeWithAI`, `duplicate`                                   | ✅ functional                              |
| `vacanciesApi`     | `vacancies.api.ts`   | `getAll`, `getById`, `create`, `update`, `updateStatus`, `delete`, `getResults`, `uploadCVs`, `evaluateCandidates` | ✅ functional (`evaluateCandidates` unused by the UI) |
| `candidateService` | `candidates.api.ts`  | `getAll`                                                                                                           | ✅ read-only                               |
| `dashboardService` | `dashboard.api.ts`   | `getSummary`                                                                                                       | ⚠️ defined but **not consumed**            |
| `adminService`     | `admin.api.ts`       | `getStats`, `getUsers`, `updateRole`, `deleteUser`                                                                 | ❌ **fake stub — never calls the API**     |

Every method already returns the unwrapped type (`Promise<Position[]>`, `Promise<Vacancy>`, `Promise<void>`…), not `Promise<ApiResponse<T>>`. `apiClient` handles the envelope, so callers **must not re-unwrap**.

### 6.1 `admin.api.ts` is a simulation (important trap)

`adminService` **does not import `apiClient`**. It returns invented data:

```ts
const MOCK_USERS: AdminUser[] = [ /* Ana Garcia, Carlos Perez, Beatriz Solis */ ];

export const adminService = {
  getStats: async (): Promise<any> =>
    new Promise((resolve) => setTimeout(() => resolve({ totalUsers: 145, /* … */ }), 800)),
  getUsers: async (page, limit): Promise<AdminUser[]> =>
    new Promise((resolve) => setTimeout(() => resolve(MOCK_USERS), 500)),
  // updateRole / deleteUser → resolve { success: true } without persisting anything
};
```

The four modules under `components/admin/` already consume it with `useEffect` and loading states, so **the panel looks connected and is not**. It also uses `Promise<any>`, violating `no-explicit-any`. Rewriting it on top of `apiClient` against `/admin/*` is issue **8.1**.

### 6.2 Department normalization (reference pattern)

`departmentsApi` does backend↔UI business mapping through a `RawDepartment` interface and a typed `normalizeRawDepartment` function (no `any`):

- `id: number` → `id: string`
- The backend uses `title`; the UI uses `name` (translated both ways).
- Flattens `_count.positions` → `positionsCount`.

This is the pattern to imitate when connecting other domains whose shape doesn't match the UI.

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
```

| File                          | Contents                                                                                                                                                                                                        |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `api.types.ts`                | Enums + `User`, `Position`, `Vacancy`, `Candidate`, `MatchResult`, `ApiResponse<T>`, `ApiErrorDetail`, `UploadResult`                                                                                            |
| `dashboard.types.ts`          | The real backend shape (`DashboardTotals`, `VacancyStatusBreakdownItem`, `MonthlyActivityItem`, `DashboardSummary`) **and** UI shapes (`DashboardMetric`, `DashboardVacancyStatusCard`, `MonthlyData`, `DashboardStats`) |
| `department.types.ts`         | `Department`, `CreateDepartmentInput`, `UpdateDepartmentInput`                                                                                                                                                   |
| `admin.types.ts`              | `AdminUser`, `StatItem`, `StatCardColorType`                                                                                                                                                                     |
| `evaluations.types.ts`        | `EvaluationVacancy` (UI shape)                                                                                                                                                                                   |
| `candidates-history.types.ts` | `HistoryCandidate`, `VacancyGroup` (UI shapes)                                                                                                                                                                   |

`position.types.ts` and `vacancy.types.ts` were **deleted** (they duplicated `api.types.ts` and carried the stale `education` field).

**Live inconsistencies:**

- `admin.types.ts` types `AdminUser.role` as `'admin' | 'user'`; the backend uses `'ADMIN' | 'USER'` (issue **8.3**).
- `dashboard.types.ts` keeps **two** parallel models: the real backend one and the one today's mock `Dashboard` consumes. Connecting them will need an adapter (issue **7.1**).
- `evaluations.types.ts` exists, but `EvaluationsHistory.tsx` **redeclares the same interface locally** instead of importing it.

---

## 8. Page inventory and connection status

**Legend:** ✅ Connected to the real API · 🟡 Connected with pending work · 🔴 Mock (fake data).

| Page                | File                     | Status | Service                                                          | Notes                                                                                                                                              |
| ------------------- | ------------------------ | ------ | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Login               | `Login.tsx`              | ✅     | `authService.login`                                              | Normalizes the role via `normalizeRole()` and redirects to `/admin` or `/dashboard`.                                                                |
| Dashboard           | `Dashboard.tsx`          | 🔴     | _(none)_                                                         | 100% `MOCK_DATA`. `dashboardService.getSummary()` exists but is never called. `MetricCard` draws "→" but **does not navigate**. Fixed `min-h` → responsive issues. |
| Create Department   | `CreateDepartment.tsx`   | ✅     | `departmentsApi.create`                                          | Works. Surfaces Zod `details` via `ApiError`. A debug `console.log` remains.                                                                        |
| Departments History | `DepartmentHistory.tsx`  | ✅     | `departmentsApi.getAll/update/delete`                            | **Complete reference flow** (list/edit/delete with modals). Uses `alert()` for errors.                                                              |
| Create Position     | `Position.tsx`           | ✅     | `positionService.create/completeWithAI`, `departmentsApi.getAll` | Departments typed as `Department[]`. Sends the `educationLevel` enum, omits `educationArea` when applicable, AI field `pdf`. Client-side validations. |
| Positions History   | `PositionHistory.tsx`    | ✅     | `positionService.getAll/delete/duplicate`                        | Works. `alert()` on errors.                                                                                                                        |
| New/Edit Vacancy    | `Vacancy.tsx`            | 🟡     | `vacanciesApi`, `positionService`, `departmentsApi`              | Loads departments+positions in parallel and edits via `getById`. The success screen **does not receive the vacancy's real code** (issue 4.4).       |
| Vacancies History   | `VacancyHistory.tsx`     | ✅     | `vacanciesApi.getAll/updateStatus/delete`                        | Works. `alert()` on errors.                                                                                                                        |
| Upload CV           | `UploadCV.jsx`           | 🟡     | `vacanciesApi.getAll/uploadCVs`                                  | Mandatory active-vacancy picker; uploads via `POST /vacancies/:id/upload`. Only counts failures; **per-file detail** is missing (issue 5.2).        |
| CVs History         | `CVHistory.jsx`          | ✅     | `candidateService.getAll`                                        | Lists candidates (read-only).                                                                                                                      |
| Results (matching)  | `Resultados.jsx`         | 🟡     | `vacanciesApi.getResults/updateStatus`                           | Correct parsing (`MatchResult[]`) and `CLOSED` status. The `StatusDropdown` **does not persist** candidate status (issue 6.3). `console.log`/`alert()`. |
| Advanced Results    | `AdvancedResults.tsx`    | 🔴     | _(none)_                                                         | 100% `MOCK_RESULTS`. Unused `useParams`. Unwired buttons. `console.log`.                                                                            |
| Candidates History  | `CandidatesHistory.tsx`  | 🔴     | _(none)_                                                         | 100% `MOCK_VACANCIES`. Actions are `alert()` placeholders.                                                                                          |
| Evaluations         | `EvaluationsHistory.tsx` | 🔴     | _(none)_                                                         | 100% `MOCK_EVALUATIONS`. The "Calcular" button has no `onClick`. `evaluateCandidates` exists but nobody calls it.                                   |
| Admin Panel         | `AdminPanel.tsx`         | 🔴     | `adminService` (**fake**)                                        | `setTimeout` loader in the page **and** in the service. Modules wired to invented data. The header shows a hardcoded "admin".                       |

### Connection summary

- **Working end-to-end:** Login, Departments (create + history CRUD), Create Position, Positions History, Vacancies History, CVs History.
- **Connected with pending work:** New/Edit Vacancy, Upload CV, Results.
- **No real API:** Dashboard, Advanced Results, Candidates History, Evaluations, Admin Panel.

---

## 9. Component inventory

### `layouts/`

- **`Sidebar.tsx`** — group-based navigation (`MENU_GROUPS`): Dashboard · Quick Actions · Records · Analysis · **Configuration (Administration)**. Collapsible, shows user and logout. ⚠️ "Administration" is still in the **last** group, uses `Icons.sidebar.dashboard` (the same icon as Dashboard), and is **shown to everyone** even though `AdminRoute` blocks access: a normal user sees the link and bounces to `/dashboard` on click (issue **9.2**).
- **`Footer.jsx`** — static footer.

### `components/routes/`

- **`AdminRoute.tsx`** — see §4.4.

### `components/context/`

- **`AuthContext.tsx`** — see §4.3.

### `components/ui/`

- **`LoginForm.tsx`** — login form. ⚠️ Show/hide password icon is **inverted** relative to convention (issue 10.2).
- **`AuthInput.tsx`** — styled auth input.
- **`PillInput.tsx`** — "pills"/tags input (skills, languages).
- **`StatusDropdown.jsx`** — candidate status dropdown. Vocabulary `["No contratado", "Contratado", "Contactar"]`, **misaligned** with `AdvancedResults` and with the real enum `DISPONIBLE|CONTRATADO` (issue 10.1).
- **`ProcessingModal.jsx`** — "processing…" modal (AI/uploads).
- **`SessionTimeoutGuard.jsx`** — see §4.5.
- **`EmptyVacancyState.tsx`** — empty state for vacancies.

### `components/modals/`

- **`CandidateDetailsModal.jsx`** — candidate detail with per-skill progress bars; defensively parses skills/languages arrays and colors by score.
- **`EditDepartmentModal.tsx`** / **`DeleteDepartmentModal.tsx`** — department edit/delete (reference flow).
- **`VacancyActionModal.tsx`** — vacancy actions.
- **`TimeoutWarningModal.jsx`** — inactivity warning (9 min).

### `components/cards/`

- **`CandidateMatchRow.jsx`** — candidate row in results (score styled by range, CV link, status dropdown).
- **`MetricCard.tsx`** — Dashboard metric card. Draws "→" but **accepts neither `onClick` nor `to`** (issue 7.3).

### `components/Sections/`

- **`ActionDropdown.tsx`** — row action menu (edit/delete/duplicate).
- **`PositionHistoryTable.tsx`** — positions table.
- **`PositionSuccess.tsx`**, **`VacancySuccess.jsx`**, **`UploadCVSuccess.jsx`** — success screens for each flow. ⚠️ `VacancySuccess` uses a fixed code `"Vac-009"` because `Vacancy.tsx` never passes the real one (issue 4.4).

### `components/admin/`

- **`StatsModule.tsx`** + **`StatCard.tsx`** — metrics grid (data from `adminService`, fake).
- **`UserTableModule.tsx`** — paginated users table, consumes `adminService.getUsers()`.
- **`RoleUpdateModule.tsx`** — role change with reactive search. Debug `console.log`.
- **`UserDeleteModule.tsx`** — user delete with reactive search.

> All four modules already have loading states and working filters. The only thing missing is for `adminService` to actually talk to the backend.

### Standalone

- **`EvaluationCard.tsx`** — vacancy card in Evaluations ("Calcular" button not wired).
- **`HistoryTable.jsx`** — generic history table.
- **`DemoCredential.jsx`** — shows demo credentials. ⚠️ The values are **hardcoded as literal text**, not read from `import.meta.env`; the component is also **orphaned** (never imported or rendered).
- **`EmptyState.jsx`** — generic empty state.

---

## 10. Issue backlog

The backlog is prioritized in [`issues.md`](./issues.md) and detailed in `issues/P0–P3.md`. **Mandatory order: P0 → P1 → P2 → P3.**

- **P0 — Blockers** ([`issues/P0.md`](./issues/P0.md)): ✅ **all resolved.** Kept as a historical record (EPIC 1 envelope, EPIC 2 routing, EPIC 3 create position).
- **P1 — Functional flows** ([`issues/P1.md`](./issues/P1.md)): pending 4.4 (real vacancy code), 5.2 (per-file upload detail), 6.2 (connect Evaluations), 6.3 (decide candidate status), 6.4 (Advanced Results), 6.5 (Candidates History).
- **P2 — Secondary screens** ([`issues/P2.md`](./issues/P2.md)): 7.x (Dashboard), 8.x (Admin — a real `adminService`), 9.2 (role-aware Sidebar). 9.1 and 9.3 ✅ resolved.
- **P3 — Polish** ([`issues/P3.md`](./issues/P3.md)): 10.1 (candidate status vocabulary), 10.2 (password icon), 10.5 (`console.log`/`alert()`).

---

## 11. Conventions and technical debt

**Conventions to follow:**

- **New** components/modules in TypeScript with explicit interfaces.
- Endpoints **always** as methods of a `*.api.ts`; never raw `fetch`/`apiClient` from a page.
- Services return the already-unwrapped type; **do not re-unwrap** in the caller.
- Defensive backend↔UI normalization in the service layer (the `departments.api.ts` pattern).
- Avoid `any` (ESLint flags it as an **error**).
- **New** code comments in English.
- Commits in **Conventional Commits** (`<type>(<scope>): <subject>`, in English).

**Notable technical debt:**

- `adminService` is a simulation that looks connected.
- Hardcoded colors throughout the JSX (no Tailwind theme tokens).
- Misaligned role casing (`admin|user` in the UI vs `ADMIN|USER` in the API), patched by normalizing in two places.
- `dashboard.types.ts` keeps two parallel models.
- Dead dependencies in `package.json` (`express`, `cors`, `dotenv`, `react-router`).
- `alert()`/`console.log` as UX placeholders (including a dump of the `user` object in `AdminRoute`).
- 5 screens still have no real API.
- `apiClient` has no `VITE_API_URL` fallback and no auto-logout on `401`.

---

## 12. Environment and deployment

- Required variable via `import.meta.env`: **`VITE_API_URL`**. **There is no default** — without it the app fails on the first request.
- ⚠️ **Never read the `.env` file** (`CLAUDE.md` rule). Infer the variables from `import.meta.env.*` usages.
- **`vercel.json`** rewrites all non-`/api` paths to `index.html` (SPA routing on Vercel).

---

## 13. How to continue (quick guide)

1. **Run:** `npm install` → set `VITE_API_URL` → `npm run dev` → login.
2. **Before touching data:** the **Departments** flow is the working reference pattern; imitate it when connecting other domains.
3. **Prioritize P1** (P0 is closed): real vacancy code, upload detail, connect Evaluations.
4. **Verify every change with `npm run build`** (no tests; type errors break the build).
5. Remember that **`npm run build` validates neither Tailwind classes nor strings**: check the UI in the browser.
6. When connecting a mock screen, **add loading/error/empty states**.

---

_Document generated from source-code analysis. If this document and the code disagree, the code wins: update this documentation._
