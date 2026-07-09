# 🐞 Bug Inventory — TalentMatch Frontend

> **Premise:** the backend is finished and correct. Therefore **every item in this document is the frontend's responsibility** (the frontend consumes/maps a working backend incorrectly, or simply isn't connected to it).
>
> 🇪🇸 Versión en español: [`../es/bugs.md`](../es/bugs.md)
>
> Sweep performed over **all routes** defined in `src/App.tsx`. **Last verified: 2026-07-09.**

## Connection status per route

| Route                      | Status         | Note                                                   |
| -------------------------- | -------------- | ------------------------------------------------------ |
| `/login`                   | ✅ Connected   | OK                                                     |
| `/dashboard`               | ❌ 100% mock   | `MOCK_DATA` + not responsive + cards don't navigate    |
| `/position`                | ✅ Connected   | OK                                                     |
| `/uploadcv`                | 🟡 Connected   | Per-file detail missing                                |
| `/cv-history`              | ✅ Connected   | OK                                                     |
| `/position-history`        | ✅ Connected   | OK                                                     |
| `/vacancy` (+ `/edit/:id`) | 🟡 Connected   | Success screen shows a fixed "Vac-009" code            |
| `/vacancy-history`         | ✅ Connected   | OK                                                     |
| `/department`              | ✅ Connected   | OK                                                     |
| `/department-history`      | ✅ Connected   | OK                                                     |
| `/resultados/:id`          | 🟡 Connected   | Candidate status doesn't persist                       |
| `/candidates-history`      | ❌ 100% mock   | Actions = `alert()`                                    |
| `/evaluations-history`     | ❌ 100% mock   | "Calcular" button does nothing                         |
| `/advanced-results/:id`    | ❌ 100% mock   | All buttons inert                                      |
| `/admin`                   | ❌ 100% mock   | Role gate is active, but the service is a simulation   |

---

## 1. Critical functional bugs

### 1.1 — `admin.api.ts` pretends to be connected

- **File:** `src/services/api/admin.api.ts` + `src/components/admin/*`
- **Detail:** `adminService` **does not import `apiClient`**. It defines a `MOCK_USERS` array and returns promises resolved with `setTimeout`. All four admin modules (`StatsModule`, `UserTableModule`, `RoleUpdateModule`, `UserDeleteModule`) consume it with `useEffect`, spinners, and reactive search boxes — so **the screen looks functional**: it lists users, "changes" roles, and "deletes". Nothing is persisted. `updateRole`/`deleteUser` resolve `{ success: true }` and `console.log`.
- **Aggravating factor:** `getStats` is typed `Promise<any>`, violating `@typescript-eslint/no-explicit-any` (configured as an _error_).
- **Fix:** rewrite it on top of `apiClient` against `GET /admin/stats`, `GET /admin/users`, `PUT /admin/users/:id/role`, `DELETE /admin/users/:id`. See `issues/P2.md §8.1`.

### 1.2 — `AdminRoute` dumps the `user` object to the console

- **File:** `src/components/routes/AdminRoute.tsx:8-9`
- **Detail:** two debug `console.log` calls print the full user and its role on **every render**. They ship in the production bundle.
- **Fix:** remove them.

### 1.3 — Vacancy success screen shows a fixed code

- **File:** `src/components/Sections/VacancySuccess.jsx:7` + `src/pages/Vacancy.tsx`
- **Detail:** `VacancySuccess` defaults to `vacancyCode = "Vac-009"`, and `Vacancy.tsx` renders it **without passing** `vacancyCode`. It always shows "Vac-009" regardless of the vacancy created.
- **Fix:** pass the real code/ID of the vacancy returned by `POST /vacancies`.

### 1.4 — Sidebar: "Administration" visible to everyone, misplaced, wrong icon

- **File:** `src/layouts/Sidebar.tsx:55-60`
- **Detail:** it sits in the last group ("CONFIGURACIÓN") and uses `Icons.sidebar.dashboard` (the same icon as Dashboard). It is also **not filtered by role**: a normal user sees the link, clicks it, and `AdminRoute` bounces them to `/dashboard`. Secure, but broken UX.
- **Fix:** move the item to the first group, give it its own icon (e.g. `Shield`), and render it only when `user.role === "admin"`.

### 1.5 — `apiClient` crashes if `VITE_API_URL` is missing

- **File:** `src/services/api/apiClient.ts:1`
- **Detail:** `const BASE_URL: string = import.meta.env.VITE_API_URL;` — **no fallback**. If the variable is undefined, `BASE_URL.endsWith("/")` throws `TypeError: Cannot read properties of undefined`. The `string` annotation is a lie: at runtime it can be `undefined`.
- **Fix:** an explicit fallback, or fail fast at startup with a clear message.

### 1.6 — A `401` does not end the session

- **File:** `src/services/api/apiClient.ts:78-84`
- **Detail:** on a `401` it throws `ApiError("Sesión expirada o no autorizada.")`, but **never calls `logout()`** or redirects. With an expired token, every screen renders its own error and the user is stuck in an app that still looks authenticated.
- **Fix:** centralize `401` handling (clear `localStorage` + redirect to `/login`).

### 1.7 — Role casing misaligned between frontend and backend

- **Files:** `src/components/context/AuthContext.tsx:5`, `src/types/admin.types.ts:17`, `src/types/api.types.ts:4`
- **Detail:** the backend emits `ADMIN`/`USER`; `UserData.role` and `AdminUser.role` type them as `'admin' | 'user'`, while `api.types.ts` exposes `UserRole = 'ADMIN' | 'USER'`. It works today thanks to two defensive patches: `normalizeRole()` in `Login.tsx` and `.toLowerCase()` in `AdminRoute`. Any new code that compares the role without normalizing will fail silently.
- **Fix:** unify on the backend enum and map to a display label in the UI.

---

## 2. Unconnected screens (100% mock)

### 2.1 — Dashboard

- **File:** `src/pages/Dashboard.tsx:9-28`
- **Detail:** all data comes from `MOCK_DATA`. It never calls `dashboardService.getSummary()` (which exists and is typed against the real backend shape). Metrics, chart, and vacancy statuses are fictional.

### 2.2 — Advanced Results

- **File:** `src/pages/AdvancedResults.tsx:21-25, 125`
- **Detail:** uses `MOCK_RESULTS`, `useParams` is unused, and the "Compartir", "Recalcular MatchScore", and "Ver perfil" buttons do nothing. Title/department/code are hardcoded.

### 2.3 — Candidates History

- **File:** `src/pages/CandidatesHistory.tsx:5-22`
- **Detail:** `MOCK_VACANCIES`. Every action is an `alert()`. It never uses `candidateService`.

### 2.4 — Evaluations

- **File:** `src/pages/EvaluationsHistory.tsx:16-53` + `src/components/EvaluationCard.tsx:63`
- **Detail:** `MOCK_EVALUATIONS`. The "Calcular" button has **no `onClick`**. The `/evaluations-history/:id` route receives `:id` but never uses it. `vacanciesApi.evaluateCandidates()` exists, is typed, and **nobody calls it**.
- **Extra:** the file **redeclares** the `EvaluationVacancy` interface locally instead of importing it from `src/types/evaluations.types.ts`, which already defines it identically.

### 2.5 — Admin Panel

- **File:** `src/pages/AdminPanel.tsx:11-15` + `src/services/api/admin.api.ts`
- **Detail:** a simulated `setTimeout(750)` loader in the page, **on top of** the fake service's own `setTimeout`s (see §1.1). The header prints `admin` as hardcoded text instead of reading `user.username`/`user.role`.

---

## 3. UI / UX / Responsive

### 3.1 — Dashboard doesn't adapt to small screens

- **File:** `src/pages/Dashboard.tsx:49, 79`
- **Detail:** fixed padding and rigid `min-h-[350px] xl:min-h-[450px]` inside a `<main>` with `overflow-y-auto`. On short viewports the content overflows and forces scrolling.
- **Fix:** flexible heights / `aspect-ratio`, revisit breakpoints.

### 3.2 — Dashboard metric cards don't navigate

- **File:** `src/components/cards/MetricCard.tsx` + `src/pages/Dashboard.tsx:63-72`
- **Detail:** each `MetricCard` draws a "→" arrow suggesting navigation, but the component **accepts neither `onClick` nor `to`**. No shortcut works.
- **Fix:** add the destination prop and wire each card to its history screen.

### 3.3 — Inconsistent candidate statuses across screens

- **Files:** `src/components/ui/StatusDropdown.jsx:9` vs `src/pages/AdvancedResults.tsx:8, 92`
- **Detail:** results use `"No contratado" | "Contratado" | "Contactar"`, while `AdvancedResults` uses `"No Contratado" | "Contactado" | "Contratado"`. They differ in wording ("Contactar" vs "Contactado") and casing. Neither matches the real enum `DISPONIBLE | CONTRATADO`.
- **Fix:** unify into a single set derived from the backend enum.

### 3.4 — Show/hide password icon is inverted

- **File:** `src/components/ui/LoginForm.tsx:60-66`
- **Detail:** when the password is visible it shows `Eye` (open) and when hidden it shows `EyeOff`; the usual convention is the opposite.
- **Fix:** swap the icons.

### 3.5 — Candidate status doesn't persist

- **Files:** `src/pages/Resultados.jsx` + `src/components/ui/StatusDropdown.jsx`
- **Detail:** changing the status only updates local UI (and, when "Contratado", the **vacancy** status via `PATCH /vacancies/:id/status` → `CLOSED`). There is no endpoint to persist per-candidate status: candidates are read-only in the API.
- **Fix:** design decision — remove the control or make it obvious it doesn't save. See `issues/P1.md §6.3`.

---

## 4. Code quality / minor

- **4.1 — Debug `console.log`:** `AdminRoute.tsx:8-9` (critical, see §1.2), `admin.api.ts:32,41,50`, `RoleUpdateModule.tsx:41`, `AdvancedResults.tsx:136`, `Resultados.jsx:51`, `CreateDepartment.tsx:35`.
- **4.2 — `alert()` as a placeholder:** `CandidatesHistory.tsx` (invented actions), and as error reporting in `Resultados.jsx`, `VacancyHistory.tsx`, `DepartmentHistory.tsx`, `PositionHistory.tsx`.
- **4.3 — Dead dependencies:** `package.json` declares `express`, `cors`, and `dotenv` — none are used in a 100% client-side frontend. Same for `react-router` alongside `react-router-dom`.
- **4.4 — `DemoCredential.jsx` is orphaned:** never imported anywhere, and its credentials are hardcoded as literal text rather than read from `import.meta.env`.
- **4.5 — `dashboard.types.ts` holds two models:** the real backend shape (`DashboardSummary`) and the mock's UI shape (`DashboardStats`) coexist. Connecting will require an adapter, or dropping one of them.
- **4.6 — `EvaluationsHistory.tsx` redeclares a type:** it defines `EvaluationVacancy` locally instead of importing it from `src/types/evaluations.types.ts`.

---

## 5. What the tooling does **not** catch

Worth keeping in mind when reviewing changes:

- **Tailwind classes are not validated.** `className="rounded-[24px]"` and `className="roundTomaed-[24px]"` are equally valid to `tsc` and to ESLint — they're just strings. A class typo only shows up by opening the app.
- **Stray JSX text isn't caught either.** `<h1>Title</h1>, cr` compiles fine and renders `, cr` on screen.
- Both happened in `LoginForm.tsx` (fixed on 2026-07-09). **A green `npm run build` does not mean the UI is correct.**

---

## Executive summary

| Category                    | Count |
| --------------------------- | ----- |
| Critical functional bugs    | 7     |
| Unconnected screens (mock)  | 5     |
| UI / UX / Responsive        | 5     |
| Quality / minor             | 6     |

**Suggested priority:** 1) genuinely connect `adminService` and remove the `user` console dump (§1.1, §1.2), 2) harden `apiClient` (§1.5, §1.6), 3) connect the mock screens (§2), 4) responsive and consistency (§3), 5) cleanup (§4).

---

## Appendix — Already-resolved bugs

Kept for traceability. **Do not reopen without checking against the code.**

| Bug                                                              | Resolved   | Note                                                       |
| ---------------------------------------------------------------- | ---------- | ---------------------------------------------------------- |
| `Vacancy.tsx` navigated to the non-existent `/history` route      | 2026-07-08 | Now `/vacancy-history`                                      |
| Empty departments dropdown in "Nueva Posición"                    | 2026-07-08 | Uses `departmentsApi.getAll()` typed as `Department[]`      |
| AI autocomplete broken (field `file`)                             | 2026-07-08 | The `FormData` now sends the `pdf` field                    |
| Invalid vacancy status `FILLED`                                   | 2026-07-08 | `Resultados.jsx` sends `CLOSED`                             |
| Fragile results unwrapping (`response.status`)                    | 2026-07-08 | `getResults` returns `MatchResult[]` directly               |
| `uploads.api.ts` posted to `/uploads` (nonexistent)               | 2026-07-08 | File deleted; `UploadCV` uses `vacanciesApi.uploadCVs`      |
| `Position.tsx` used `useState<any[]>`                             | 2026-07-08 | Typed as `Department[]`                                     |
| Dead `serverData` error branch in `CreateDepartment.tsx`          | 2026-07-08 | Uses `err instanceof ApiError`                              |
| `/admin` route had no role gate                                   | 2026-07-09 | `AdminRoute` guards it                                      |
| `AuthContext` didn't store the role                               | 2026-07-09 | `UserData.role` exists (but see §1.7)                       |
| `App.tsx` read `loading` from a context that never exposed it     | 2026-07-09 | Broke `dev` and `build`; branch removed                     |
| `Login.tsx` read `data.data?.token` (nonexistent field)           | 2026-07-09 | Broke `dev` and `build`; simplified to `data.token`         |
| Dead JSX block after `export default Login;`                      | 2026-07-09 | Removed                                                     |
| `LoginForm.tsx` had corrupted text (`roundTomaed-[24px]`, `, cr`) | 2026-07-09 | Caught by neither `tsc` nor ESLint — see §5                 |
