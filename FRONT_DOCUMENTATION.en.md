# FRONT_DOCUMENTATION.en.md — TalentMatch AI (Frontend)

> English version of the frontend documentation. Documents the **actual current state** of the frontend: structure, components, data layer, flows, and their degree of integration with the backend.
>
> Spanish version: [`FRONT_DOCUMENTATION.md`](./FRONT_DOCUMENTATION.md).
>
> Related documents: [`CLAUDE.md`](./CLAUDE.md) (working rules) · [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md) (backend contract) · [`BUGS.md`](./BUGS.md) (bug inventory) · [`ISSUES.md`](./ISSUES.md) + [`issues/P0.md`](./issues/P0.md)–[`issues/P3.md`](./issues/P3.md) (prioritized backlog).
>
> ⚠️ The `README.md` describes an **aspirational** stack (React 18, BEM, Axios, Redux, Zod) that does **not** match the code. This document reflects the real code.

---

## 1. Product summary

Recruitment dashboard SPA to:

- Upload CVs (PDF) and evaluate them with AI against vacancies.
- Manage **Departments → Positions → Vacancies → Candidates**.
- View matching rankings (MatchScore) per vacancy.
- Administer users (admin panel).

UI copy and most comments are in **Spanish**; identifiers mix Spanish and English.

---

## 2. Real technology stack

| Area | Technology |
|---|---|
| Framework | **React 19** (`react` / `react-dom` ^19.2) |
| Bundler / dev | **Vite 5** |
| Language | **TypeScript** (`.jsx`→`.tsx` migration in progress) |
| Styling | **Tailwind CSS v4** via `@tailwindcss/vite` (configured in `src/index.css` with `@import "tailwindcss"`). The root `tailwind.config.js` is a legacy v3 stub and is **unused**. |
| Routing | **react-router-dom v7** |
| Global state | **React Context** (`AuthContext`) — no Redux |
| HTTP | **Hand-rolled** `fetch` client (`apiClient.ts`) — no Axios |
| Icons | `lucide-react`, `react-icons`, and local SVGs in `assets/icons/` |
| Type-check | `vite-plugin-checker` runs `tsc` in-process → **type errors fail both `dev` and `build`** |
| Lint | ESLint 9 with `@typescript-eslint/no-explicit-any` as an **error** |

> Note: `package.json` includes `express`, `cors`, and `dotenv` as dependencies. **They are not used in the frontend** (leftovers); the frontend is 100% client-side.

### Commands

```bash
npm run dev      # Vite dev server
npm run build    # Production build (fails on type errors)
npm run lint     # ESLint
npm run preview  # Serve the built dist/
```

**There is no test runner** (no Jest, no Vitest, no test files). Verification = `npm run build` (types) + manual QA in `npm run dev`.

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
│   ├── Sections/           # ActionDropdown, PositionHistoryTable, PositionSuccess, UploadCVSuccess, VacancySuccess
│   ├── ui/                 # AuthInput, LoginForm, PillInput, ProcessingModal, SessionTimeoutGuard, StatusDropdown, EmptyVacancyState
│   ├── DemoCredential.jsx, EmptyState.jsx, EvaluationCard.tsx, HistoryTable.jsx
├── layouts/                # Sidebar.tsx, Footer.jsx
├── pages/                  # Route-level screens (see §8)
├── services/api/           # apiClient + one *.api.ts per domain (see §6)
├── types/                  # Per-domain TypeScript contracts (see §7)
└── utils/                  # dashboardConfig.js
```

**TS migration status:** ~51 `.ts/.tsx` files vs ~16 `.js/.jsx`. The remaining `.jsx` files are mostly flow screens (`Resultados`, `UploadCV`, `CVHistory`) and legacy UI components. Rule: **new components in TypeScript**; port a file to TS when making substantial changes to it.

---

## 4. Core architecture

### 4.1 Routing (`src/App.tsx`)

- `/` → redirects to `/login`.
- `/login` is the **only public route**.
- Everything else lives inside **`ProtectedRoute`** (a `<Route element={<ProtectedRoute/>}>` with `<Outlet/>`).
- Wildcard `*` → redirects to `/dashboard` (which in turn bounces to login if there is no session).

**`ProtectedRoute`** (`App.tsx:29`): shows a "Verificando sesión…" loader while `loading`; if there is no `user`, `<Navigate to="/login">`. The protected layout mounts **`SessionTimeoutGuard` + `Sidebar` + `<main><Outlet/></main>`**. Protected pages can assume `user` exists.

**Page reuse across routes** (same screen, different URL with params):

| Component | Routes |
|---|---|
| `Vacancy` | `/vacancy`, `/vacancy/edit/:id` |
| `Resultados` | `/resultados`, `/resultados/:id` |
| `EvaluationsHistory` | `/evaluations-history`, `/evaluations-history/:id` |
| `AdvancedResults` | `/advanced-results/:id` |

#### Full route table

| Route | Page | Protected |
|---|---|---|
| `/login` | `Login` | ❌ public |
| `/dashboard` | `Dashboard` | ✅ |
| `/position` | `Position` | ✅ |
| `/uploadcv` | `UploadCV` | ✅ |
| `/cv-history` | `CVHistory` | ✅ |
| `/position-history` | `PositionHistory` | ✅ |
| `/vacancy`, `/vacancy/edit/:id` | `Vacancy` | ✅ |
| `/vacancy-history` | `VacancyHistory` | ✅ |
| `/department` | `CreateDepartment` | ✅ |
| `/department-history` | `DepartmentHistory` | ✅ |
| `/resultados`, `/resultados/:id` | `Resultados` | ✅ |
| `/candidates-history` | `CandidatesHistory` | ✅ |
| `/evaluations-history`, `/evaluations-history/:id` | `EvaluationsHistory` | ✅ |
| `/advanced-results/:id` | `AdvancedResults` | ✅ |
| `/admin` | `AdminPanel` | ✅ (no role gate — see §10) |

> ⚠️ **Non-existent route `/history`:** `Vacancy.tsx` navigates twice to `/history`, which **does not exist** in the router → it falls into `*` and bounces to `/dashboard`. It should be `/vacancy-history` (issue **EPIC 2 / P0**).

### 4.2 HTTP client (`src/services/api/apiClient.ts`)

Thin wrapper over `fetch`. Responsibilities:

1. Prefixes `VITE_API_URL` (strips a trailing `/`).
2. Injects `Authorization: Bearer <token>` from `localStorage`.
3. **Unwraps the backend envelope.** The contract is `{ success, data, error/message }`.
4. Throws `ApiError` (a subclass of `Error` with `status` and `data`) on `!response.ok`, `success:false`/`"false"`, or HTTP `401`.

**Current normalization (already implemented):**

- If the body has a `response` key (double-wrapping from the backend's `sendResponseOr404` helper, `{ response: { success, data } }`), it operates on `body.response`.
- `success` is evaluated against `false` (bool) **and** `"false"` (string, the backend's 404 case). It also includes a check for the backend's `succes` typo.
- Returns `castedBody.data` if present; otherwise the normalized object.

> ✅ This means **EPIC 1.1 (envelope normalization) is already applied** in `apiClient`. What **remains** of EPIC 1 is the cleanup (1.2): removing the ad-hoc `res.response.data` extractors that still live in `departments.api.ts` and several pages, to avoid double-unwrapping / dead code.
>
> **Login case:** `POST /users/login` responds `{ success, token, user }` (no `data`). The logic returns the full object → `Login.tsx` still reads `data.token`/`data.user`. ✅

### 4.3 Authentication (`src/components/context/AuthContext.tsx`)

- `AuthProvider` wraps the whole app.
- Persists **separately** in `localStorage`: `tm_user` (user object) and `token`.
- `login(email, token)` derives `username` from the email local-part and stores `{ username, email, loginDate }`.
- Consumed via the **`useAuth()`** hook.

```ts
interface UserData { username: string; email: string; loginDate: string; }
```

> ⚠️ **`UserData` does NOT store `role`.** The backend does return `user.role` on login and the token includes `{ userId, role }`, but the frontend discards it. Consequence: the admin UI cannot be gated by role (issue **EPIC 9 / P2**). The admin user type is modeled separately in `admin.types.ts`.

### 4.4 Session guard (`src/components/ui/SessionTimeoutGuard.jsx`)

Global inactivity watchdog, mounted in the protected layout:

- Listens to `mousemove/keydown/click/scroll` → updates `lastActivity` in `localStorage`.
- **Warns at 9 min** (modal `TimeoutWarningModal`), **logs out at 10 min**.
- Syncs `lastActivity` **across tabs** via the `storage` event.
- On expiry: `logout()` + `navigate("/login", { state: { sessionExpired: true } })` (login shows the notice).

---

## 5. Styling and assets

- **Tailwind v4 inline** in the JSX. **Hardcoded arbitrary values** abound (`bg-[#F0F0F5]`, `text-[#447ECA]`, CSS color filters on SVGs). There are no centralized theme tokens (technical debt documented in the `Login.tsx` code itself).
- De facto brand color: **`#447ECA`** (blue). App background: `#F0F0F5`.
- `index.css`: imports Tailwind and defines a custom "enterprise" scrollbar (thin, appears on hover).
- **Icons:** local SVGs in `assets/icons/` re-exported as an `Icons` object from `assets/icons/index.ts` (`Icons.sidebar.*`, `Icons.auth.*`, `Icons.logos.*`, …). Combined with `lucide-react` icons.
- No BEM/CSS-modules system (despite what the README claims).

---

## 6. API service layer (`src/services/api/`)

One service object per domain. **`fetch` is never called directly** (exception: `Position.tsx` still imports raw `apiClient` for departments — should be migrated to `departmentsApi.getAll()`).

| Service | File | Methods | Status |
|---|---|---|---|
| `authService` | `auth.api.ts` | `login`, `register` | ✅ login used; register has no UI |
| `departmentsApi` | `departments.api.ts` | `getAll`, `getById`, `create`, `update`, `delete` | ✅ **reference flow, 100% functional** |
| `positionService` | `positions.api.ts` | `getAll`, `getById`, `create`, `update`, `delete`, `completeWithAI`, `duplicate` | ⚠️ payload bugs (below) |
| `vacanciesApi` | `vacancies.api.ts` | `getAll`, `getById`, `create`, `update`, `updateStatus`, `delete`, `getResults`, `uploadCVs`, `evaluateCandidates` | ⚠️ partial |
| `candidateService` | `candidates.api.ts` | `getAll` | ✅ read-only |
| `dashboardService` | `dashboard.api.ts` | `getSummary` | ⚠️ defined but **not consumed** (Dashboard uses mock) |
| `uploadService` | `uploads.api.ts` | `uploadCVs` | ❌ **points to `/uploads`, an endpoint that does NOT exist** |

### 6.1 Department normalization (reference pattern)

`departmentsApi` does backend↔UI business mapping:

- Mongo `_id` → `id`
- The backend uses `title`; the UI uses `name` (translated both ways).
- Derives `positionsCount`.
- Keeps a flexible extractor (`res.response.data` / `res.data` / raw array) that is **already redundant** after the `apiClient` normalization (cleanup candidate — issue **1.2**).

### 6.2 Known service bugs (cross-checked against `API_DOCUMENTATION.md`)

| Service | Bug | Should be | Issue |
|---|---|---|---|
| `positions.api.ts` `completeWithAI` | sends `file` field in the `FormData` | field **`pdf`** | 3.2 / P0 |
| `positions.api.ts` `CreatePositionInput` | uses `education` | **`educationArea`** | 3.4 / P0 |
| `uploads.api.ts` | `POST /uploads` (nonexistent) | use `vacanciesApi.uploadCVs(vacancyId, files)` → `POST /vacancies/:id/upload` (field `pdfs`) | 5.1 / P1 |

> **Backend rule for creating candidates:** they are only created via `POST /vacancies/:id/upload` (field `pdfs`, max 100 files, 5 MB each, PDF only). There is SHA-256 hash deduplication; a failed file does not block the others. `vacanciesApi.uploadCVs` **already** uses the correct `pdfs` field.

---

## 7. Type model (`src/types/`)

Per-domain TS contracts. Key enums (in `api.types.ts`):

```ts
type UserRole        = 'ADMIN' | 'USER';
type EducationLevel  = 'NONE' | 'HIGH_SCHOOL' | 'BACHELOR' | 'TECHNICAL' | 'UNIVERSITY' | 'MASTER' | 'DOCTORATE';
type VacancyStatus   = 'ACTIVE' | 'PAUSED' | 'CLOSED';
type CandidateStatus = 'DISPONIBLE' | 'CONTRATADO';
```

Entities: `User`, `Position`, `Vacancy`, `Candidate`, `MatchResult`, `ApiResponse<T>`.

**Type inconsistencies to watch:**

- `admin.types.ts` types `AdminUser.role` as `'admin' | 'user'` (lowercase), while the backend/`api.types.ts` use `'ADMIN' | 'USER'`. Unify to the backend enum and map to a visible label (issue **8.3**).
- `dashboard.types.ts` (`DashboardStats` with `metrics`/`vacancyStatuses`/`monthlyData`) does **not** match the real backend shape (`total`/`vacancyStatusBreakdown`/`monthlyActivity`). Requires an adapter when connecting (issue **7.1**).
- `position.types.ts` (`PositionData`) uses `education`; the real model is `educationArea` + `educationLevel`.
- There are **duplicate** `Vacancy`/`VacancyStatus` definitions in `api.types.ts` and `vacancy.types.ts`.

---

## 8. Page inventory and connection status

**Legend:** ✅ Connected to real API · 🟡 Connected with bugs/pending · 🔴 Mock (fake data) · ⚪ Static/UI.

| Page | File | Status | Service | Notes |
|---|---|---|---|---|
| Login | `Login.tsx` | ✅ | `authService.login` | Works. **Dead code** after `export default` (commented JSX block, issue 10.3). Does not store `role`. |
| Dashboard | `Dashboard.tsx` | 🔴 | *(none)* | 100% `MOCK_DATA`. `dashboardService.getSummary()` exists but is not called. `MetricCard` cards draw "→" but **do not navigate**. Fixed padding/`min-h` → responsive issues. (EPIC 7) |
| Create Department | `CreateDepartment.tsx` | ✅ | `departmentsApi.create` | Works. Has a dead error branch (`serverData`) + `console.log` (issues 10.3/10.5). |
| Departments History | `DepartmentHistory.tsx` | ✅ | `departmentsApi.getAll/update/delete` | **Complete reference flow** (list/edit/delete with modals). Uses `alert()` for errors. |
| Create Position | `Position.tsx` | 🟡 | `positionService.create/completeWithAI` + raw `apiClient` | Loads departments with **raw** `apiClient('/departments')` (should use `departmentsApi.getAll()`). `useState<any[]>` (breaks `no-explicit-any`). Sends `educationLevel` as a Spanish label instead of the enum, and `education` instead of `educationArea` → **400**. AI uses the `file` field. (EPIC 3) |
| Positions History | `PositionHistory.tsx` | ✅ | `positionService.getAll/delete/duplicate` | Works after envelope normalization. Still has a redundant manual `data?.data` extractor. `alert()` on errors. |
| New/Edit Vacancy | `Vacancy.tsx` | 🟡 | `vacanciesApi`, `positionService`, `departmentsApi` | Loads departments+positions in parallel and edits via `getById`. **Navigates to non-existent `/history`** (EPIC 2). The success screen does not receive the created vacancy's real code. Position filter by `departmentId` (verify string/number types). |
| Vacancies History | `VacancyHistory.tsx` | ✅ | `vacanciesApi.getAll/updateStatus/delete` | Works. Redundant manual extractor. `alert()` on errors. |
| Upload CV | `UploadCV.jsx` | 🔴 | `uploadService.uploadCVs` | **Broken:** the service points to nonexistent `/uploads`. Should require a target vacancy and use `vacanciesApi.uploadCVs`. Does not handle per-file response (created/duplicate/failed). (EPIC 5) |
| CVs History | `CVHistory.jsx` | ✅ | `candidateService.getAll` | Lists candidates (read-only). Validate after normalization. |
| Results (matching) | `Resultados.jsx` | 🟡 | `vacanciesApi.getResults/updateStatus` | The `response.status === "success"` check is wrong after normalization. Uses invalid status **`"FILLED"`** (should be `CLOSED`). `console.log` + `alert()`. `StatusDropdown` implies persisting candidate status that **has no endpoint**. (EPIC 6) |
| Advanced Results | `AdvancedResults.tsx` | 🔴 | *(none)* | 100% `MOCK_RESULTS`. Unused `useParams`. Uncabled buttons. `console.log`. (EPIC 6.4) |
| Candidates History | `CandidatesHistory.tsx` | 🔴 | *(none)* | 100% `MOCK_VACANCIES`. Actions are `alert()` placeholders. (EPIC 6.5) |
| Evaluations | `EvaluationsHistory.tsx` | 🔴 | *(none)* | 100% `MOCK_EVALUATIONS`. "Calcular" button has no `onClick`. Should load real vacancies and trigger `evaluateCandidates`. (EPIC 6.2) |
| Admin Panel | `AdminPanel.tsx` | 🔴 | *(none)* | Simulated loader with `setTimeout`. Modules use `mockUsers`. **No `admin.api.ts` exists.** Search box has no `onChange`. No role gate. (EPIC 8) |

### Connection summary

- **Working end-to-end:** Login, Departments (create + history CRUD), Positions History, Vacancies History, CVs History.
- **Connected but with blocking bugs:** Create Position, New/Edit Vacancy, Results, Upload CV.
- **100% mock (no API):** Dashboard, Advanced Results, Candidates History, Evaluations, Admin Panel.

---

## 9. Component inventory

### `layouts/`
- **`Sidebar.tsx`** — group-based navigation (`MENU_GROUPS`): Dashboard · Quick Actions · Records · Analysis · **Configuration (Administration)**. Collapsible, shows user and logout. ⚠️ "Administration" is in the **last** group, uses the dashboard icon, and is **shown to everyone** (it should be first, with its own icon and only for `ADMIN` — EPIC 9.2). Supports `isDynamic` to inject `lastVacancyId` (not actively used today).
- **`Footer.jsx`** — static footer.

### `components/context/`
- **`AuthContext.tsx`** — see §4.3.

### `components/ui/`
- **`LoginForm.tsx`** — login form. ⚠️ Show/hide password icon is **inverted** relative to convention (issue 10.2).
- **`AuthInput.tsx`** — styled auth input.
- **`PillInput.tsx`** — "pills"/tags input (skills, languages).
- **`StatusDropdown.jsx`** — candidate status dropdown. Vocabulary `["No contratado","Contratado","Contactar"]`, **misaligned** with `AdvancedResults` (issue 10.1) and with the real enum `DISPONIBLE|CONTRATADO`.
- **`ProcessingModal.jsx`** — "processing…" modal (AI/uploads).
- **`SessionTimeoutGuard.jsx`** — see §4.4.
- **`EmptyVacancyState.tsx`** — empty state for vacancies.

### `components/modals/`
- **`CandidateDetailsModal.jsx`** — candidate detail with per-skill progress bars; defensively parses skills/languages arrays and colors by score.
- **`EditDepartmentModal.tsx`** / **`DeleteDepartmentModal.tsx`** — department edit/delete (used by the reference flow).
- **`VacancyActionModal.tsx`** — vacancy actions.
- **`TimeoutWarningModal.jsx`** — inactivity warning (9 min).

### `components/cards/`
- **`CandidateMatchRow.jsx`** — candidate row in results (score styled by range, CV link, status dropdown).
- **`MetricCard.tsx`** — Dashboard metric card (draws "→" but **does not navigate** yet — EPIC 7.3).

### `components/Sections/`
- **`ActionDropdown.tsx`** — row action menu (edit/delete/duplicate).
- **`PositionHistoryTable.tsx`** — positions table.
- **`PositionSuccess.tsx`**, **`VacancySuccess.jsx`**, **`UploadCVSuccess.jsx`** — success screens for each creation flow. ⚠️ `VacancySuccess` uses a fixed code `"Vac-009"` because `Vacancy.tsx` does not pass the real code (EPIC 4.4).

### `components/admin/`
- **`StatsModule.tsx`** + **`StatCard.tsx`** — admin panel metrics grid (mock).
- **`UserTableModule.tsx`** — users table; **exports `mockUsers`** which the other modules import.
- **`RoleUpdateModule.tsx`** — role change (over `mockUsers`).
- **`UserDeleteModule.tsx`** — user delete (over `mockUsers`).

### Standalone
- **`EvaluationCard.tsx`** — vacancy card in Evaluations ("Calcular" button not wired).
- **`HistoryTable.jsx`** — generic history table.
- **`DemoCredential.jsx`** — shows demo credentials. ⚠️ The values `admin@admin.ai` / `Admin123` are **hardcoded as literal text**, not read from `import.meta.env`; the component is also **orphaned** (not imported/rendered anywhere).
- **`EmptyState.jsx`** — generic empty state.

---

## 10. Issue backlog (map to the `issues/` files)

The backlog is prioritized in [`ISSUES.md`](./ISSUES.md) and detailed in `issues/P0–P3.md`. **Mandatory order: P0 → P1 → P2 → P3.** EPIC 1 unblocks the rest.

### P0 — Core flow blockers ([`issues/P0.md`](./issues/P0.md))
- **EPIC 1 — Response envelope.** The normalization in `apiClient` (1.1) **is already implemented**. Pending: **1.2** remove redundant ad-hoc extractors (`departments.api.ts`, `PositionHistory`, `VacancyHistory`, `Vacancy`, `CVHistory`) and **1.3** verify regressions (login, `GET /vacancies/:id`, 201 creations).
- **EPIC 2 — Routing.** `Vacancy.tsx`: change `navigate("/history")` (×2) to `/vacancy-history`.
- **EPIC 3 — Create Position.** Load departments with `departmentsApi.getAll()`; AI field `file`→`pdf`; `educationLevel` as enum (not Spanish label); `education`→`educationArea` with the optionality rule (API §8.1); client-side validations (role ≥5, description ≥25, ≥1 technical skill and ≥1 soft skill).

### P1 — Broken functional flows ([`issues/P1.md`](./issues/P1.md))
- **EPIC 4 — Vacancies.** Clean up the listing extractor; positions dropdown by department; status `"FILLED"`→`"CLOSED"` in `Resultados.jsx`; success screen with the real code.
- **EPIC 5 — Upload CVs.** `UploadCV` must require a target vacancy and use `vacanciesApi.uploadCVs`; delete `uploads.api.ts`; report **per-file** result (created/duplicate/failed).
- **EPIC 6 — Results and Candidates.** Fix `getResults` parsing; connect Evaluations (`evaluateCandidates` → navigate to `/resultados/:id`); decide candidate status (no individual endpoint; only the vacancy persists status); connect Advanced Results and Candidates History (currently mock).

### P2 — Unconnected/degraded secondary screens ([`issues/P2.md`](./issues/P2.md))
- **EPIC 7 — Dashboard.** Connect `dashboardService.getSummary()`; adapt `DashboardStats` to the real shape (`total`/`vacancyStatusBreakdown`/`monthlyActivity`); responsive; cards → shortcuts to histories.
- **EPIC 8 — Admin.** Create `admin.api.ts` (`/admin/stats`, `/admin/users`, role, delete); connect the modules; role casing `ADMIN|USER`; separate global stats from the per-user dashboard.
- **EPIC 9 — Auth/role.** Store `role` in `AuthContext`/`localStorage`; Sidebar admin first, with its own icon and **only for `ADMIN`**; (opt.) protect the `/admin` route.

### P3 — Polish and quality ([`issues/P3.md`](./issues/P3.md))
- **EPIC 10.** Unify candidate status vocabulary; fix password icon; remove dead code (`CreateDepartment` `serverData` branch, block after `export default Login`); remove `any` (`Position.tsx`); clean up debug `console.log`/`alert()`. Goal: clean `npm run lint` and `npm run build`.

---

## 11. Conventions and technical debt

**Conventions to follow:**
- **New** components/modules in TypeScript with explicit interfaces.
- Endpoints **always** as methods of a `*.api.ts`; never raw `fetch`/`apiClient` from a page (exception to fix: `Position.tsx`).
- Defensive backend↔UI normalization in the service layer (the `departments.api.ts` pattern).
- Avoid `any` (ESLint flags it as an **error**). `error: any` in catches is tolerated; `any[]` in state is not.
- Commits in **Conventional Commits** (`<type>(<scope>): <subject>`; types: `feat/fix/refactor/test/docs/chore`).

**Notable technical debt:**
- Hardcoded colors throughout the JSX (no Tailwind theme tokens).
- Duplicated/misaligned types (`Vacancy`, roles, `DashboardStats`, `education`).
- Redundant envelope extractors after the `apiClient` normalization.
- Dead dependencies in `package.json` (`express`, `cors`, `dotenv`).
- `alert()`/`console.log` as UX placeholders.
- 5 screens still in mock mode.

---

## 12. Environment and deployment

- Variables via `import.meta.env`: **`VITE_API_URL`** (fallback `http://localhost:5000/api`) and demo credentials. Note: the only variable actually consumed in the code is `VITE_API_URL` (`apiClient.ts`); any `VITE_TEST_*` demo vars are **not read** by the code (`DemoCredential` hardcodes the values).
- ⚠️ **Never read the `.env` file** (`CLAUDE.md` rule). Infer variables from `import.meta.env.*` usages.
- **`vercel.json`** rewrites all non-`/api` paths to `index.html` (SPA routing on Vercel).

---

## 13. How to continue (quick guide)

1. **Run:** `npm install` → `npm run dev` → login.
2. **Before touching data:** the **Departments** flow is the working reference pattern; imitate it when connecting other domains.
3. **Prioritize P0** (routing + create position; the envelope is already normalized, only cleanup remains).
4. **Verify every change with `npm run build`** (no tests; type errors break the build).
5. When connecting a mock screen, **add loading/error/empty states** (almost none have them today).

---

*Document generated from source-code analysis and the `issues/P0–P3.md` backlog. If this document and the code disagree, the code wins: update this documentation.*
