# 🐞 Bug Inventory — TalentMatch Frontend

> **Premise:** the backend is finished and correct. Therefore **every item in this document is the frontend's responsibility**.
>
> 🇪🇸 Versión en español: [`../es/bugs.md`](../es/bugs.md)
>
> **Last verified: 2026-07-14.**
>
> ⚠️ **Scope note:** everything listed here is **minor**. None of these bugs prevent normal use of the app — every screen loads, every core flow (create/edit/delete departments, positions, vacancies; upload CVs; view matching results; administer users) works end-to-end against the real API. What follows is dead code, a couple of UI bugs confined to legacy screens, and naming inconsistencies — cleanup work, not product blockers.

## Connection state by route

| Route                       | State          | Note                                                                       |
| ----------------------------- | ---------------- | ------------------------------------------------------------------------------ |
| `/login`                   | ✅ Connected   | Demo shortcut (`admin` → `admin@admin.ai`)                                     |
| `/dashboard`               | ✅ Connected   | Real `dashboardService.getSummary()`, no more `MOCK_DATA`                     |
| `/position`                | ✅ Connected   | 4-step wizard, manual or AI                                                    |
| `/uploadcv`                | ✅ Connected   |                                                                                |
| `/cv-history`              | ⚠️ Connected, orphaned | Parallel screen to `/candidates-history`, not linked from the sidebar     |
| `/position-history`        | ✅ Connected   |                                                                                |
| `/vacancy` (+ `/edit/:id`) | ⚠️ Connected   | Success screen ignores the `onReset` callback                                 |
| `/vacancy-history`         | ✅ Connected   |                                                                                |
| `/department`              | ✅ Connected   |                                                                                |
| `/department-history`      | ✅ Connected   |                                                                                |
| `/resultados/:id`          | ⚠️ Connected, legacy | Not linked from anywhere in the UI; parsing bug in `CandidateMatchRow`     |
| `/candidates-history`      | ✅ Connected   | Groups candidates by vacancy                                                   |
| `/evaluations-history`     | ✅ Connected   | The route's `:id` param is never used                                          |
| `/advanced-results/:id`    | ✅ Connected   | The current results screen                                                     |
| `/admin`                   | ✅ Connected   | Real `adminService`; role gate active in both Sidebar and `AdminRoute`         |

---

## 1. Confirmed code bugs

### 1.1 — `VacancySuccess.tsx` ignores the `onReset` prop

- **File:** `src/components/Sections/VacancySuccess.tsx`
- **Detail:** the component declares it receives `{ vacancyCode, onReset }`, but the actual destructuring only takes `({ vacancyCode })` — `onReset` is never used. `Vacancy.tsx` does pass a real `onReset` (to reset the edit-mode form and navigate). Since `VacancySuccess`'s own buttons (a hardcoded `navigate(...)`) cover the visible navigation, the bug goes unnoticed during normal use — but any additional logic that depended on `onReset` firing (e.g., clearing parent state) never runs.
- **Fix:** destructure and call `onReset` from the relevant button, or drop the prop from the signature if it's no longer needed.

### 1.2 — `CandidateMatchRow.tsx` doesn't parse `normalizedCandidate` (legacy screen)

- **File:** `src/components/cards/CandidateMatchRow.tsx` (used only by `src/pages/Resultados.tsx`)
- **Detail:** `api.types.ts` documents `MatchResult.normalizedCandidate` as a **serialized JSON string** that must be parsed (`CandidateDetailsModal.tsx` does this correctly via `parseNormalized`, wrapped in try/catch). `CandidateMatchRow.tsx` instead widens the type locally (`ResultData`) to treat it as if it were already an object, reading `resultData.normalizedCandidate?.technicalSkills` directly. If the backend always returns a string, this is `undefined`, and the candidate row on `Resultados.tsx` **renders zero skills**.
- **Scope:** only affects `/resultados/:id`, the legacy screen not linked from the sidebar (see §2). `AdvancedResults.tsx`, the current results screen, does not have this problem.
- **Fix:** parse `normalizedCandidate` with `JSON.parse()` the same way `CandidateDetailsModal.tsx` does, or retire the legacy screen (see §2.1).

### 1.3 — Invented candidate statuses in the UI, never persisted

- **Files:** `src/pages/AdvancedResults.tsx`, `src/pages/EvaluationsHistory.tsx`
- **Detail:** the backend's real enum is `CandidateStatus = "DISPONIBLE" | "CONTRATADO"` (`api.types.ts`). Both screens, however, offer a status `<select>` with extra values (`"CONTACTADO"`/`"NO_CONTRATADO"` in one, Spanish-cased variants in the other) backed **only by a local component-state `Map`** (`candidateStatuses`) — there is no endpoint that accepts these values. The change is visible in the UI but is lost on page reload.
- **Note:** this is a pending product decision, not a crash. `candidates.api.ts` explicitly documents (an inline comment) that updating an individual candidate's status is not implemented; the only real "hire" persistence is `Resultados.tsx`, which closes the whole vacancy via `vacanciesApi.updateStatus(id, "CLOSED")`.
- **Fix:** decide whether these statuses should persist (would require a new backend endpoint) or whether the control should be removed and the UI made clear that it's a local/temporary annotation only.

---

## 2. Duplicated / partially orphaned screens

### 2.1 — `Resultados.tsx` vs. `AdvancedResults.tsx`

- **Files:** `src/pages/Resultados.tsx` (routes `/resultados`, `/resultados/:id`) and `src/pages/AdvancedResults.tsx` (route `/advanced-results/:id`)
- **Detail:** both show matching results for a vacancy, but with different layouts. `AdvancedResults` is the screen linked from `VacancyHistory` and `CandidatesHistory`, and the one that received the recent redesign and fixes (separate sections, recalculate guard, `PAUSED` handling). `Resultados` is still alive in the router but **isn't linked from any button/link in the app** — only reachable by typing the URL directly. It also has the bug in §1.2 and uses a cosmetic (non-real) `ProcessingModal` progress animation.
- **Fix:** decide whether to retire `Resultados.tsx` from the router (which would also make the bug in §1.2 moot) or consolidate it with `AdvancedResults`.

### 2.2 — `CVHistory.jsx` vs. `CandidatesHistory.tsx`

- **Files:** `src/pages/CVHistory.jsx` (route `/cv-history`, uses `candidateService.getAll()` → flat `GET /candidates`) and `src/pages/CandidatesHistory.tsx` (route `/candidates-history`, uses `vacanciesApi.getAll()`, grouping candidates by vacancy)
- **Detail:** two "candidate history" screens with different data sources. The Sidebar only links `/candidates-history`; `/cv-history` doesn't appear in any menu and is only reachable via a direct URL. `HistoryTable.jsx` (used only by `CVHistory.jsx`) reads multiple alternate field names for the CV URL, a sign that it was written against an older API shape than what's documented today.
- **Fix:** same as §2.1 — decide whether to retire `/cv-history` from the router or consolidate.

---

## 3. Dead code and stale comments

### 3.1 — Orphaned components

- `src/components/DemoCredential.jsx` — not imported anywhere; `Login.tsx` doesn't use it.
- `src/components/ui/EmptyVacancyState.tsx` — not imported anywhere.
- `src/utils/dashboardConfig.js` — not imported anywhere; `Dashboard.tsx` builds its metrics inline from `dashboard.api.ts`.

### 3.2 — Sidebar's vestigial `isDynamic` mechanism

- **File:** `src/layouts/Sidebar.tsx`
- **Detail:** the `MenuItem` type has an `isDynamic` field and there's logic to suffix the route with `lastVacancyId` from `localStorage`, but **no** `MenuItem` in `MENU_GROUPS` currently sets `isDynamic: true` — it's a dead branch. `VacancyHistory.tsx` still writes `localStorage.setItem("lastVacancyId", id)` to feed a mechanism nothing visible consumes anymore.
- **Fix:** clean up the `isDynamic` field and the `lastVacancyId` write if there's truly no consumer left, or document why it's being kept.

### 3.3 — Stale comments

- `src/types/dashboard.types.ts` (line ~32): the comment says "UI types (mock data + cards)" — but these types are now populated with real data from `dashboard.api.ts` since `Dashboard.tsx` got wired up. The comment is stale.
- `src/main.tsx`: has a `@ts-ignore` with a comment ("Temporary while `App` is migrated to `.tsx`"), but `App.tsx` **is already** `.tsx` — the comment (and possibly the `@ts-ignore`) no longer apply.

### 3.4 — Cosmetic details

- `src/App.tsx` imports `VacancyHistory` under the name `VacacyHistory` (typo preserved) — no functional impact, only readability.
- `src/src/vite-env.d.ts` — a nested `src/src/` folder exists containing a single one-line file (`/// <reference types="vite/client" />`). It should live at `src/vite-env.d.ts`, not `src/src/`.
- `src/layouts/Sidebar.tsx`: `handleLogout` calls `logout()` (which already does a full navigation to `/login`) and additionally calls `navigate("/login")` — redundant double navigation, harmless.

---

## 4. Configuration and environment

### 4.1 — `apiClient.ts` has no fallback for `VITE_API_URL`

- **File:** `src/services/api/apiClient.ts:3`
- **Detail:** `const BASE_URL: string = import.meta.env.VITE_API_URL;` still has no fallback. If the variable is undefined, the first request literally uses the URL `"undefined/users/login"`.
- **Aggravating factor:** no `.env.example` is committed to the repo, despite `.gitignore` carving out an explicit exception for it (`!.env.example`). A fresh clone has no template indicating which variables to set.
- **Fix:** an explicit fallback or an early, clear failure at startup; commit a `.env.example` with `VITE_API_URL` (no real values).

### 4.2 — Dead environment variables

- The local `.env` defines `VITE_TEST_USER`/`VITE_TEST_PASS`, but **no file in `src/` reads them**. Only `VITE_API_URL` is used in code.

---

## 5. Minor UI / UX

### 5.1 — `UserTableModule`'s search only filters the current page

- **File:** `src/components/admin/UserTableModule.tsx`
- **Detail:** the search box filters over `users`, which is already the current page (10 rows) returned by `adminService.getUsers(page, limit)`. An admin searching for a user who isn't on the visible page won't find them, even if they exist in the system.
- **Fix:** decide whether search should be server-side (a new parameter on `GET /admin/users`) or documented in the UI itself as "search within this page only".

### 5.2 — Two icon libraries coexisting

- `lucide-react` is used pervasively; `react-icons` only appears in `DeleteDepartmentModal.tsx`, `EvaluationCard.tsx`, and the orphaned `EmptyVacancyState.tsx`. Not a bug, but consistency debt — there's no functional reason to keep two icon libraries.

### 5.3 — `/evaluations-history/:id` with an unused param

- **File:** `src/App.tsx` (route), `src/pages/EvaluationsHistory.tsx`
- **Detail:** the route declares `:id`, but `EvaluationsHistory.tsx` never calls `useParams()` — the screen is a self-contained state machine that starts in vacancy-selection mode regardless of the URL. The `:id` variant is effectively unreachable in any useful way.
- **Fix:** drop the `:id` route variant if there's no plan to use it, or implement pre-selecting the corresponding vacancy.

---

## 6. What tooling does **not** catch

- **Tailwind classes aren't validated.** A typo in a class (`className="rounded-[24px]"` vs. `"roundTomaed-[24px]"`) is equally valid to `tsc` and ESLint — they're just strings. Only caught by looking at the app in the browser.
- **Stray text in JSX either.** An `<h1>Título</h1>, cr` compiles fine and renders `, cr` on screen.
- **A green `npm run build` doesn't mean the UI is correct.** Both cases above happened in `LoginForm.tsx` in an earlier session (2026-07-09) and neither `tsc` nor ESLint caught them.

---

## Executive summary

| Category                                   | Count |
| --------------------------------------------- | ------- |
| Confirmed code bugs                          | 3     |
| Duplicated / partially orphaned screens      | 2     |
| Dead code / stale comments                   | 6     |
| Configuration and environment                | 2     |
| Minor UI / UX                                | 3     |

**None of these items is blocking.** Suggested priority if time is invested in cleanup: 1) decide the fate of the duplicated screens (§2) — this also resolves the bug in §1.2 if `Resultados.tsx` is retired; 2) fix the ignored `onReset` prop (§1.1); 3) harden `VITE_API_URL` and commit a `.env.example` (§4.1); 4) dead-code cleanup (§3) and minor details (§5).

---

## Appendix — Already-resolved bugs

Kept for traceability. **Do not reopen without verifying against the code.**

| Bug                                                              | Resolved in  | Note                                                                       |
| -------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------ |
| `adminService` was a fake (`MOCK_USERS` + `setTimeout`)              | 2026-07-13/14 | Rewritten on top of `apiClient` against `/admin/*`, with a new `createUser`   |
| Dashboard was 100% mock (`MOCK_DATA`)                                | 2026-07-13/14 | Wired to `dashboardService.getSummary()`                                      |
| Sidebar showed "Admin Panel" to every role                          | 2026-07-13/14 | Now gated on `user?.role === "ADMIN"`                                         |
| `AdminRoute` dumped the `user` object to the console                | ≤ 2026-07-13  | No `console.log` in the current file                                          |
| Role-casing mismatch (`admin/user` UI vs. `ADMIN/USER` API)         | ≤ 2026-07-13  | Unified to uppercase across the whole frontend                                |
| A `401` didn't log the user out                                     | ≤ 2026-07-13  | `apiClient` calls `endExpiredSession()` except on public endpoints            |
| `apiClient` attached a token to public auth endpoints               | 2026-07-13    | `isPublicEndpoint` skips attaching `Authorization` on login/register          |
| No `PAUSED` status handling on vacancy results                      | 2026-07-13    | `AdvancedResults.tsx` handles the badge and recalculate guard for `PAUSED`     |
| Dead dependencies in `package.json` (`express`, `cors`, `dotenv`)   | ≤ 2026-07-13  | Not present in the current `package.json`                                     |
| `Vacancy.tsx` navigated to the nonexistent route `/history`         | 2026-07-08    | Now `/vacancy-history`                                                        |
| Empty department dropdown in "New Position"                        | 2026-07-08    | Uses `departmentsApi.getAll()` with `Department[]` types                      |
| Invalid `FILLED` vacancy status                                     | 2026-07-08    | `CLOSED` is sent instead                                                      |
| `LoginForm.tsx` had corrupted text (`roundTomaed-[24px]`, `, cr`)   | 2026-07-09    | Neither `tsc` nor ESLint caught it — see §6                                    |
