# 🗂️ Issue Backlog by Flow — TalentMatch Frontend

> Companion to [`bugs.md`](./bugs.md). Here bugs are **grouped by flow** following [`api-documentation.md`](./api-documentation.md) and ordered from **most to least important**.
>
> 🇪🇸 Versión en español: [`../es/issues.md`](../es/issues.md)
>
> **Premise:** the backend is finished and correct. Everything below is frontend work.
>
> **Last verified against the code: 2026-07-09.**

## Priority legend

| Level  | Meaning                                                             |
| ------ | ------------------------------------------------------------------- |
| **P0** | Blocks the core flow or breaks several screens at once. Do first.   |
| **P1** | Breaks one concrete functional flow (create/list/upload).           |
| **P2** | Secondary screen unconnected or degraded.                          |
| **P3** | UI/UX polish and code quality.                                     |
| **P4** | Sprint close-out and housekeeping (nothing blocking).              |

## Detailed documents per priority

This file is the **general index**. The detailed write-up of each issue (exact steps, files, snippets, acceptance criteria) lives in the [`issues/`](./issues/) folder:

| File                             | Priority                   | EPICs                                                       | Status                       |
| -------------------------------- | -------------------------- | ----------------------------------------------------------- | ---------------------------- |
| [`issues/P0.md`](./issues/P0.md) | **P0** — blockers          | 1 (data layer), 2 (routing), 3 (create position)             | ✅ **Closed**                |
| [`issues/P1.md`](./issues/P1.md) | **P1** — broken flows      | 4 (vacancies), 5 (CV upload), 6 (results/candidates)         | 🔨 In progress               |
| [`issues/P2.md`](./issues/P2.md) | **P2** — secondary screens | 7 (dashboard), 8 (admin), 9 (auth/role)                      | 🔨 In progress (9.1, 9.3 ✅) |
| [`issues/P3.md`](./issues/P3.md) | **P3** — polish            | 10 (UI/UX and quality)                                       | ⏳ Pending                   |
| [`issues/P4.md`](./issues/P4.md) | **P4** — close-out         | 11 (sprint close-out)                                        | ⏳ Pending                   |

## Current state

**P0 is fully resolved.** The envelope is normalized in `apiClient`, the broken routing is fixed, and the position-creation flow works end to end. `issues/P0.md` is kept as a historical record.

The next focus is **P1**, but one **P2** item is in practice more urgent: **`admin.api.ts` is a simulation** (`MOCK_USERS` + `setTimeout`, never calls `apiClient`) and all four admin modules already consume it, so the panel **appears connected**. See `bugs.md §1.1` and `issues/P2.md §8.1`.

---

## EPIC 1 — [P0] ✅ Data layer: normalize the response envelope

**Resolved.** `apiClient` unwraps the double-wrapped `{ response: { success, data } }` and then `.data`. The ad-hoc extractors were removed from `PositionHistory`, `VacancyHistory`, `Vacancy`, `Position`, and `departmentsApi`. All services return the unwrapped type.

Details in [`issues/P0.md`](./issues/P0.md).

---

## EPIC 2 — [P0] ✅ Broken navigation

**Resolved.** Both `navigate("/history")` calls in `Vacancy.tsx` now point to `/vacancy-history`.

---

## EPIC 3 — [P0] ✅ Position creation flow

**Resolved.** `Position.tsx` uses `departmentsApi.getAll()`, sends the `educationLevel` enum, renamed `education`→`educationArea` (omitting it when the level is `NONE`/`HIGH_SCHOOL`), the AI PDF field is `pdf`, and client-side validations prevent the 400s.

---

## EPIC 4 — [P1] Vacancies flow

**Flow:** Position → New/Edit Vacancy → list → change status.
**Endpoints:** `GET /vacancies`, `POST /vacancies`, `PUT /vacancies/:id`, `PATCH /vacancies/:id/status`. Ref: §4.

- [x] **4.1** Vacancy list (`VacancyHistory.tsx`) — validated after EPIC 1.
- [x] **4.2** Positions dropdown in create-vacancy — works after EPIC 1.
- [x] **4.3** Invalid status `FILLED` → `CLOSED` in `Resultados.jsx`.
- [ ] **4.4** `VacancySuccess` shows the fixed code "Vac-009"; `Vacancy.tsx` never passes one. Pass the real `id`/code returned by `POST /vacancies`.

**Acceptance criteria:** create, edit, list a vacancy and change its status work end to end, showing the real code.

---

## EPIC 5 — [P1] CV upload flow

**Flow:** Vacancy → upload CVs → create candidates.
**Endpoints:** `POST /vacancies/:id/upload` (field `pdfs`, max 100, 5 MB each). Ref: §4, §5.

- [x] **5.1** `uploads.api.ts` (which posted to the nonexistent `/uploads`) was deleted. `UploadCV` requires a target vacancy and uses `vacanciesApi.uploadCVs`.
- [ ] **5.2** Handle the **per-file** response: the 201 returns an array with `{ success, data }` or `{ success:false, message }` per CV, including hash duplicates. Today only failures are counted.

**Acceptance criteria:** uploading CVs to a vacancy creates/associates candidates and reports duplicates/failures per file.

---

## EPIC 6 — [P1] Matching results and Candidates

**Flow:** Vacancy → AI evaluation → ranking → candidate detail.
**Endpoints:** `POST /vacancies/:id/evaluations`, `GET /vacancies/:id/results`, `GET /candidates`. Ref: §4, §5.

- [x] **6.1** Results parsing aligned: `getResults` returns `MatchResult[]` directly.
- [ ] **6.2** `EvaluationsHistory` is 100% mock and the "Calcular" button has no `onClick`. Connect the list to `GET /vacancies` and the button to `POST /vacancies/:id/evaluations`, then navigate to results. `vacanciesApi.evaluateCandidates()` already exists and is typed.
- [ ] **6.3** Candidate status has no backend: there is no candidate update endpoint. The `StatusDropdown` doesn't persist. Decide: (a) remove the control, or (b) map "Contratado" only to closing the vacancy.
- [ ] **6.4** `AdvancedResults` (`/advanced-results/:id`) is 100% mock. Connect to `GET /vacancies/:id/results` (reuse `useParams`) and wire the buttons.
- [ ] **6.5** `CandidatesHistory` is 100% mock with `alert()` actions. Connect against `GET /candidates`.

**Acceptance criteria:** evaluating a vacancy produces a real ranking; candidate detail uses backend data; no controls that fake persistence.

---

## EPIC 7 — [P2] Dashboard

**Flow:** per-user summary view.
**Endpoints:** `GET /dashboard` (user-scoped, ≠ `/admin/stats`). Ref: §7.

- [ ] **7.1** Dashboard uses `MOCK_DATA`. Connect it to `dashboardService.getSummary()` and map the real response (`total`, `vacancyStatusBreakdown[]`, `monthlyActivity[]`). The types already exist in `dashboard.types.ts`.
- [ ] **7.2** Responsive: fixed `min-h` overflows on small screens.
- [ ] **7.3** Shortcuts: `MetricCard`s draw an arrow but the component accepts no destination. Each card should navigate to its history screen.

**Acceptance criteria:** real per-user metrics, no undue scrolling, working shortcuts.

---

## EPIC 8 — [P2] Admin Panel

**Flow:** an admin manages platform-wide users.
**Endpoints:** `GET /admin/stats`, `GET /admin/users` (paginated), `PUT /admin/users/:id/role`, `DELETE /admin/users/:id`. `role: ADMIN` only (403 otherwise). Ref: §6.

- [ ] **8.1** ⚠️ **Top priority.** `src/services/api/admin.api.ts` exists but is a **simulation**: `MOCK_USERS` + `setTimeout`, `Promise<any>`, never imports `apiClient`. Rewrite it for real.
- [ ] **8.2** The modules (`StatsModule`, `UserTableModule`, `RoleUpdateModule`, `UserDeleteModule`) **already have** `useEffect`, loading states, and reactive search. All that's left is removing the `setTimeout(750)` from `AdminPanel.tsx` and letting the data come from the backend. The header shows a hardcoded "admin": read it from `useAuth()`.
- [ ] **8.3** Role casing: the API uses `ADMIN`/`USER`; the frontend types `admin`/`user` (`admin.types.ts`, `AuthContext`). Unify and map to a display label.
- [ ] **8.4** `GET /admin/stats` is **global** — don't confuse it with the per-user `/dashboard` (§9.4).

**Acceptance criteria:** the panel lists real users, changes roles, and deletes; global stats are correct.

---

## EPIC 9 — [P2] Auth / role-based access

**Flow:** login → token with `{ userId, role }` → gating admin routes.
**Endpoints:** `POST /users/login` (returns `user.role`). Ref: §0, §1.

- [x] **9.1** `AuthContext` stores the `role` (`UserData.role`); `Login.tsx` normalizes it with `normalizeRole()` and redirects based on it.
- [ ] **9.2** Sidebar: move "Administración" to the **first** group, with its **own icon** (e.g. `Shield`), and show it **only to admins**. Today it uses the Dashboard icon, sits last, and is **shown to everyone** (even though `AdminRoute` blocks access).
- [x] **9.3** The `/admin` route is guarded by `AdminRoute`, which redirects to `/dashboard` when the role isn't admin.

**Acceptance criteria:** the Administration entry appears first, with its own icon, and only for admins.

---

## EPIC 10 — [P3] UI/UX and code quality

- [ ] **10.1** Inconsistent candidate statuses: `StatusDropdown.jsx` ("Contactar", "No contratado") vs `AdvancedResults.tsx` ("Contactado", "No Contratado"). Neither matches `DISPONIBLE | CONTRATADO`.
- [ ] **10.2** Show/hide password icon inverted (`LoginForm.tsx`).
- [x] **10.3** Dead code: JSX block after `export default Login;` — removed (2026-07-09).
- [x] **10.4** `useState<any[]>` in `Position.tsx` → typed `Department[]`. (A `Promise<any>` remains in `admin.api.ts`, covered by 8.1.)
- [ ] **10.5** Remove debug `console.log`/`alert`. **Most urgent:** `AdminRoute.tsx:8-9` dumps the `user` object to the console on every render.

**Acceptance criteria:** consistent UI, no dead code, clean `npm run lint`.

---

## Priority summary

| EPIC | Flow                     | Priority | Status              | Depends on |
| ---- | ------------------------ | -------- | ------------------- | ---------- |
| 1    | Data layer (envelope)    | **P0**   | ✅ Resolved         | —          |
| 2    | Navigation (`/history`)  | **P0**   | ✅ Resolved         | —          |
| 3    | Create Position          | **P0**   | ✅ Resolved         | —          |
| 4    | Vacancies                | **P1**   | 🔨 4.4 pending      | —          |
| 5    | CV upload                | **P1**   | 🔨 5.2 pending      | —          |
| 6    | Results / Candidates     | **P1**   | 🔨 6.2–6.5 pending  | —          |
| 7    | Dashboard                | **P2**   | ⏳ Pending          | —          |
| 8    | Administration           | **P2**   | ⚠️ Critical (8.1)   | —          |
| 9    | Auth / role              | **P2**   | 🔨 9.2 pending      | —          |
| 10   | UI/UX and quality        | **P3**   | ⏳ Pending          | —          |
