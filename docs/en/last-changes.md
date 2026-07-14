# Last Changes

> 🇪🇸 Versión en español: [`../es/last-changes.md`](../es/last-changes.md)

---

## Full documentation refresh against current code

**Branch:** `main`
**Date:** 2026-07-14

### Context

`front-documentation.md`, `bugs.md`, and `issues.md` were last verified on 2026-07-09, but the code moved on significantly afterward (commits `bea453c`…`f670013`, 2026-07-08 → 2026-07-13): the Dashboard and Admin Panel went from 100%-mock to real API calls, `admin.api.ts` was rewritten on top of `apiClient`, a new `CreateUserModule` was added, the vacancy-results screen was redesigned (`AdvancedResults.tsx`) with `PAUSED`-status handling and a recalculate guard, the Sidebar's admin link became role-filtered, and `apiClient` stopped attaching a stored token to public auth endpoints. None of this had been reflected in the docs.

Separately, the `docs(issues): replace P0/P2 with per-screen issue plans in Spanish` commit (`f670013`) deleted `issues/P0.md` and `issues/P2.md` (as well as the already-gone `P1.md`/`P3.md`) and replaced them with 7 new per-screen QA plans — but only wrote content in `docs/es/issues/`; the English counterparts in `docs/en/issues/` were left as empty (0-byte) files, and `issues.md` in both languages still linked to the deleted `P0.md`–`P3.md`.

### What changed

- **`front-documentation.md` (en+es):** rewritten end to end against a fresh source audit. Every page now shows as connected to the real API (no more mock screens); documents the `isPublicEndpoint` mechanism in `apiClient.ts`, the now-unified uppercase role casing (the earlier `admin/user` vs. `ADMIN/USER` mismatch no longer exists), the new `session.ts` module, and the current file inventory (including newly-found dead code: `DemoCredential.jsx`, `EmptyVacancyState.tsx`, `utils/dashboardConfig.js`, the vestigial `isDynamic` Sidebar mechanism, and a nested `src/src/vite-env.d.ts`).
- **`bugs.md` (en+es):** rewritten as a much shorter, explicitly **minor/non-blocking** bug list, since every screen now works end to end. New findings: `VacancySuccess.tsx` silently ignores its `onReset` prop; `CandidateMatchRow.tsx` (used only by the legacy `Resultados.tsx` screen) reads `normalizedCandidate` as an object instead of parsing the documented JSON string; two screen pairs are duplicated and partially unlinked from the UI (`Resultados` vs. `AdvancedResults`, `CVHistory` vs. `CandidatesHistory`); candidate statuses like `"CONTACTADO"`/`"NO_CONTRATADO"` exist only in local component state and are never persisted; `apiClient` still has no `VITE_API_URL` fallback and no `.env.example` is committed.
- **`issues.md` (en+es):** rewritten to drop every reference to the deleted `P0.md`–`P3.md` and instead index the 7 per-screen QA plans, plus a table cross-referencing screens that don't have a dedicated plan yet to the relevant `bugs.md` section.
- **`issues/*.md` (en):** all 7 files were empty; translated in full from their Spanish counterparts (`dashboard.md`, `admin-panel.md`, `position-history.md`, `vacancy-history.md`, `department-history.md`, `candidates-history.md`, `evaluations-history.md`).
- **`README.md` (root, en, es):** updated the folder-structure diagrams and document descriptions to reflect the per-screen `issues/` layout instead of the old `P0–P3` EPIC structure, and refreshed the "current state at a glance" summary.

### Verification approach

A full source read was done for every file under `src/` (pages, components, services, types, layouts) plus targeted greps for `console.log`, `alert(`, `MOCK_`, `TODO`/`FIXME`, `any`, and `@ts-ignore` — confirming zero mocks, zero `console.log`, zero `any`, and only two `@ts-ignore` occurrences remain anywhere in the codebase.

---

## Vacancy results UI redesign + auto-evaluation bug fix

**Branch:** `fix/vacancy-results-ui` (not yet merged into `features`)
**Date:** 2026-07-12

### Context

`src/pages/AdvancedResults.tsx` was rebuilt from a three-column card grid into a two-section row layout, and a real bug was fixed along the way: uploading a CV used to trigger an automatic AI evaluation, with no way to add candidates to a vacancy without also scoring them.

### Section 1 vs. Section 2 split

- **Section 1 — "Candidatos de esta Vacante":** every candidate uploaded for the vacancy, no match score. Includes a search box (filters by `fullName`/`niche`), a collapsible drag-and-drop dropzone, and a hidden `<input type="file" multiple accept=".pdf">` wired through `fileInputRef`.
- **Section 2 — "Evaluaciones":** only candidates that have gone through AI scoring (`MatchResult[]`), sorted by `matchScore` descending, filtered by the same search query.

`allCandidates` (Section 1) now comes from `localCandidates` state, not from `evaluatedCandidates` — the two lists are independent and can be out of sync (e.g. 10 uploaded, 3 evaluated).

### Auto-evaluation bug fix

Previously, uploading CVs implicitly called `vacanciesApi.evaluateCandidates()` right after `uploadCVs()`, forcing a scoring pass on every upload. `handleFilesUpload` now only calls `vacanciesApi.uploadCVs(id, files)` and reads candidates directly out of the response:

```typescript
const results: UploadResult[] = await vacanciesApi.uploadCVs(id, Array.from(files));
const uploaded: Candidate[] = results.flatMap(r => r.success && r.data ? [r.data] : []);
setLocalCandidates(prev => {
    const existingIds = new Set(prev.map(c => c.id));
    return [...prev, ...uploaded.filter(c => !existingIds.has(c.id))];
});
```

Candidates appear in Section 1 immediately, deduplicated by `id`. Evaluation is now only triggered explicitly via the "Recalcular MatchScore (IA)" button (`handleRecalculate` → `vacanciesApi.evaluateCandidates(id)` → reload).

Per-file upload failures are surfaced from the `UploadResult[]` response (`r.message ?? r.error`) instead of being silently dropped.

### Hire flow removed, replaced by a local status dropdown

`handleHire` (which called `vacanciesApi.updateStatus(id, "CLOSED")` behind a `window.confirm`, closing the vacancy) was deleted along with the `hiring` state and the "Contratar" button. In its place, each evaluated candidate row now has a `<select>` (No Contratado / Contactar / Contratado) backed by **local component state only** (`candidateStatuses: Map<number, string>`, via `handleUpdateStatus`) — it is not persisted to the backend. There is no longer a UI path on this page that closes the vacancy or calls `updateStatus`.

### Score display

The full SVG `CircularProgress` component (radius/stroke/circumference math, animated `strokeDashoffset`) was removed. Match score is now a small colored badge (`w-12 h-12` circle with a border), computed by `getScoreColor`:

- `>= 80` → `#00FA15` (green)
- `>= 50` → `#F8C807` (yellow)
- `< 50` → `#EF5050` (red)

Same thresholds as before, just a different visual treatment.

### Navigation fixes

- The back button changed from `navigate(-1)` to `navigate("/vacancy-history")` (explicit target instead of relying on browser history).
- `src/pages/VacancyHistory.tsx` `handleViewResults` changed `navigate(`/resultados/${id}`)` → `navigate(`/advanced-results/${id}`)` — `/resultados/:id` is not a route in `App.tsx`; candidates clicking "Ver resultados" from the vacancy history list were hitting the catch-all redirect to `/dashboard` instead of the results page.

### Type addition

`src/types/api.types.ts` — `Vacancy` gained an optional `candidates?: Candidate[]` field:

```typescript
// GET /vacancies includes _count.candidates and the full candidates array (see api-documentation.md §4)
_count?: { candidates: number };
candidates?: Candidate[];
```

`loadData` now seeds `localCandidates` from `vac.candidates` when `getById` returns it, so Section 1 can populate from the backend directly and not only from upload responses. **This assumes the backend's `GET /vacancies/:id` response actually includes a `candidates` array — not yet confirmed against `api-documentation.md`.**

### New vacancy info row

A stats grid (`grid-cols-2 md:grid-cols-4`) was added between the header and Section 1, showing position role, department, `availableSlots`, and `startDate`/`endDate` (via a new `formatVacancyDate` helper, `DD/MM/YYYY`).

### Other

- New `getInitials`, `formatDate`, `formatVacancyDate`, `getStatusStyle` helpers.
- Each evaluated row now has a "Descargar CV" link when `candidate.resumeUrl` is present.
- The "Selecciona una vacante" empty state (shown when there is no `:id` route param) was removed.

---

## Build unblocked + documentation restructured into `docs/`

**Branch:** `features`
**Date:** 2026-07-09

### Context

A documentation audit turned up two things that had nothing to do with docs: the working tree contained corrupted source text, and `npm run build` / `npm run dev` were both failing.

### Broken build (6 type errors)

`vite-plugin-checker` runs with `typescript: true`, so type errors fail `dev` and `build` alike.

- **`src/App.tsx`** — `ProtectedRoute` destructured `loading` from `useAuth()`, but `AuthContextType` only exposes `user`, `login`, `logout`. `AuthProvider` hydrates `user` from `localStorage` synchronously in the `useState` initializer, so there was never anything async to wait on. The `loading` branch (and its "Verificando sesión…" screen) was removed rather than adding a permanently-`false` flag.
- **`src/pages/Login.tsx`** — `handleSubmit` read `data.data?.token` and `data.data?.user`, but `LoginResponseData` is `{ user, token }` with no `.data` (a leftover from when services were typed `Promise<ApiResponse<T>>`). It also declared `token`/`email` at the top and shadowed them inside an `if`, tripping `noUnusedLocals`.

### Corrupted source in `LoginForm.tsx`

Uncommitted edits had prompt fragments typed into the JSX:

```diff
-    <div className="w-full max-w-[420px] bg-white rounded-[24px] p-10 ...">
+    <div className="w-full max-w-[420px] bg-white roundTomaed-[24px] p-10 ...">

-        <h1 className="text-3xl font-bold">Inicia Sesión</h1>
+        <h1 className="text-3xl font-bold">Inicia Sesión</h1>, cr
```

`Toma` was spliced into `rounded-[24px]` (killing the login card's rounded corners) and `, cr` rendered as visible text under the title.

**Neither `tsc` nor ESLint catches this** — `roundTomaed-[24px]` is a valid string in `className`, and `, cr` is valid JSX text. It only shows up in the browser. Recorded in `bugs.md §5`.

### Role normalization in `Login.tsx`

Fixing the type error surfaced a real bug. The API returns `role` uppercased (`ADMIN`/`USER`), while `AuthContext.UserData.role` types it lowercase. The old code compared the raw value:

```ts
if (role === 'admin') navigate('/admin');   // never true for a real ADMIN
```

so an actual admin was redirected to `/dashboard`. `AdminRoute` meanwhile compares with `.toLowerCase()`, so `/admin` *was* reachable by URL — an inconsistency between two code paths. Now normalized once:

```ts
// The API returns the role uppercased (`ADMIN` / `USER`); AuthContext stores it lowercased.
const normalizeRole = (role: string | undefined): UserData["role"] =>
  role?.toLowerCase() === "admin" ? "admin" : "user";
```

The `catch (error: any)` was also narrowed to `error instanceof Error` (the `any` violated `no-explicit-any`). Unifying the casing end to end remains open as issue **8.3**.

Also removed: the dead JSX block after `export default Login;` (P3 §10.3, now closed).

### Documentation restructured

All documentation markdown moved into `docs/`, split by language, with `git mv` to preserve history:

| Before                       | After                                                  |
| ---------------------------- | ------------------------------------------------------ |
| `FRONT_DOCUMENTATION.md`     | `docs/es/front-documentation.md`                        |
| `FRONT_DOCUMENTATION.en.md`  | `docs/en/front-documentation.md`                        |
| `API_DOCUMENTATION.md`       | `docs/en/api-documentation.md` (+ `docs/es/` from HEAD) |
| `BUGS.md`                    | `docs/es/bugs.md` (+ new `docs/en/bugs.md`)             |
| `ISSUES.md`                  | `docs/es/issues.md` (+ new `docs/en/issues.md`)         |
| `issues/P0–P3.md`            | `docs/es/issues/` (+ new `docs/en/issues/`)             |
| `LAST_CHANGES.md`            | `docs/en/last-changes.md` (+ new `docs/es/`)            |

`API_DOCUMENTATION.md` had an uncommitted full ES→EN translation overwriting the Spanish version in place; the Spanish text was recovered from `git show HEAD:API_DOCUMENTATION.md` so both languages survive.

`README.md` and `CLAUDE.md` stay at the repo root. `docs/README.md` is a language picker; `docs/{en,es}/README.md` index and describe each document.

### Documentation corrected against the code

The docs had drifted far from the source. The largest corrections:

- **`admin.api.ts` exists but is a fake.** The docs said it didn't exist. It does — as `MOCK_USERS` + `setTimeout`, typed `Promise<any>`, never importing `apiClient`. All four admin modules consume it, so the panel *looks* connected. Promoted to the most urgent backlog item (`issues/P2.md §8.1`).
- **`apiClient` has no `VITE_API_URL` fallback.** The docs (and `CLAUDE.md`) claimed `http://localhost:5000/api`. It's a bare `import.meta.env.VITE_API_URL`, so a missing env var throws on the first request.
- **`apiClient` no longer tolerates `success: "false"`** (string) or the backend's `succes` typo — it only checks the boolean.
- **`AuthContext` does store `role`** (the docs said it didn't) — see the casing caveat above. `loginDate` is gone; `username` is now optional.
- **`AdminRoute.tsx` was undocumented**, including its two debug `console.log`s that dump `user` on every render.
- `uploads.api.ts`, `position.types.ts`, `vacancy.types.ts` were deleted; `evaluations.types.ts` and `candidates-history.types.ts` are new and were undocumented.
- `Resultados.jsx` already sends `CLOSED`, not `FILLED`; `bugs.md` still listed it as open.

### Verification

`npx tsc --noEmit` → 0 errors. `npm run build` → succeeds (1863 modules, 7.25s).

---

## API alignment audit + typing cleanup

**Branch:** `features`
**Date:** 2026-07-08 (session continued)

---

### Context

Full audit of `.tsx`/`.ts`/`.jsx` files against `API_DOCUMENTATION.md`. Found and fixed:

1. Service methods still typed as `Promise<ApiResponse<T>>` when `apiClient` unwraps `.data` → typing lies that forced callers to defensively re-unwrap.
2. `any` scattered across pages and services (violates `@typescript-eslint/no-explicit-any` error rule).
3. Runtime bugs from stale assumptions about the API shape (`Resultados.jsx` checking a `status` field that doesn't exist; `"FILLED"` sent as a vacancy status when the enum only allows `ACTIVE | PAUSED | CLOSED`).
4. `uploads.api.ts` calling `POST /uploads`, an endpoint that doesn't exist — CVs are documented as uploaded via `POST /vacancies/:id/upload`.
5. `Position.tsx` sending `educationArea: ""` when the backend expects the field omitted (per §8.1) — caused 400 on `NONE`/`HIGH_SCHOOL` levels.
6. `Position.tsx` using `||` fallback for `yearsOfExperience` — treated 0 as falsy and lost legitimate values after the backend was updated to accept `>= 0`.
7. Duplicate/stale type files (`position.types.ts`, `vacancy.types.ts`) with fields (`education`) that no longer exist in the backend contract.

---

### Phase A — Service return type corrections

`apiClient` unwraps `.data` from `{ success, data }` (and the double-wrapped `{ response: { success, data } }`). Return types now reflect that.

#### `src/services/api/positions.api.ts`

- `getById`, `create`, `update`, `duplicate` → `Promise<Position>` (was `Promise<ApiResponse<Position>>`).
- `completeWithAI` → `Promise<Partial<CreatePositionInput>>` (was `Promise<ApiResponse<...>>`).
- `delete` → `Promise<void>`.
- `CreatePositionInput.educationArea` → optional (`educationArea?: string`), so callers can send `undefined` and let `JSON.stringify` omit the field.

#### `src/services/api/vacancies.api.ts`

- `getById`, `create`, `update`, `updateStatus` → `Promise<Vacancy>`.
- `delete` → `Promise<void>`.
- `getResults` → `Promise<MatchResult[]>` (was `Promise<ApiResponse<any>>`).
- `uploadCVs` → `Promise<UploadResult[]>` (was `Promise<ApiResponse<any>>`).
- `evaluateCandidates` → `Promise<MatchResult[]>` (was `Promise<ApiResponse<any>>`).

#### `src/services/api/auth.api.ts`

- `login`, `register` → `Promise<LoginResponseData>` (was `Promise<ApiResponse<LoginResponseData>>`). Explains why `Login.tsx` was previously reading both `data.token` and `data.data?.token`.

#### `src/services/api/candidates.api.ts`

- `getAll` → `Promise<Candidate[]>` (was `Promise<ApiResponse<Candidate[]>>`).

#### `src/services/api/departments.api.ts`

- `RawDepartment` interface + `normalizeRawDepartment` function replace the ad-hoc `any`-heavy extractor. Field mapping matches Prisma output (`id: number`, `title`, `_count.positions`, `createdAt`).

#### `src/services/api/dashboard.api.ts`

- `getSummary` → `Promise<DashboardSummary>`.

---

### Phase A — Type additions & deletions

#### `src/types/api.types.ts`

Added `UploadResult` interface for per-file CV upload results (§4):

```typescript
export interface UploadResult {
    success: boolean;
    data?: Candidate;
    message?: string;
    error?: string;
}
```

#### `src/types/dashboard.types.ts`

Added interfaces matching the real `GET /dashboard` response (§7): `DashboardTotals`, `VacancyStatusBreakdownItem`, `MonthlyActivityItem`, `DashboardSummary`. Renamed the local UI-side `VacancyStatus` interface to `DashboardVacancyStatusCard` to avoid clashing with the `VacancyStatus` enum from `api.types.ts`.

#### Deleted

- `src/types/position.types.ts` — unused, contained stale `education` field name.
- `src/types/vacancy.types.ts` — unused duplicate of `Vacancy` in `api.types.ts`.
- `src/services/api/uploads.api.ts` — called non-existent `/uploads` endpoint.

---

### Phase A — `any` cleanup across pages

#### `src/pages/Login.tsx`

- Removed `const data: any = await authService.login(...)`. Now uses the typed `LoginResponseData`.
- Simplified token/email lookup — dead `data.data?.token` fallback removed (was a symptom of the wrong `ApiResponse<T>` typing).
- Replaced `catch (error: any)` with `catch (error) { const message = error instanceof Error ? error.message : String(error); }`.

#### `src/pages/PositionHistory.tsx`

- `useState<any[]>` → `useState<Position[]>` (imported from `api.types.ts`).
- Removed `as string[]` cast on department names (now inferred).
- `catch (err: any)` → `catch (err)`.

#### `src/pages/Position.tsx`

- Two `catch (error: any)` blocks (AI processing + submit) narrow via `formatApiError` (see Phase B).

#### `src/pages/Vacancy.tsx`

- `catch (error: any)` → `catch (error)` with `formatApiError` narrowing.
- Removed `const v = vacancyData?.data || vacancyData` defensive unwrap now that `vacanciesApi.getById` returns `Vacancy` directly.

#### `src/pages/CreateDepartment.tsx`

- Replaced ad-hoc `{ serverData: any }` type assertion with `err instanceof ApiError && err.data` — narrows via the `ApiError` class exported from `apiClient.ts`, which carries typed `data?: unknown` for server details.

#### `src/components/Sections/PositionHistoryTable.tsx`

- `PositionData.createdAt` now optional (`createdAt?: string`) and `formatDate` accepts `string | undefined` so `Position[]` is structurally assignable.

---

### Phase A — Error surfacing (Zod field-level details)

`Position.tsx` and `Vacancy.tsx` now include a `formatApiError` helper:

```typescript
const formatApiError = (error: unknown, fallback: string): string => {
  if (error instanceof ApiError) {
    if (Array.isArray(error.data)) {
      const details = (error.data as ApiErrorDetail[])
        .map(d => `${d.field}: ${d.message}`)
        .join("; ");
      if (details) return `${error.message} — ${details}`;
    }
    return error.message;
  }
  return error instanceof Error ? error.message || fallback : fallback;
};
```

When the backend returns a 400 with Zod `details`, the UI now shows `Validation error — body.role: mínimo 5 caracteres` instead of just `Validation error`.

---

### Phase A — Position create fixes

Two fixes in `Position.tsx handleSubmitFinal` and `processWithAI` resolve the 400s that were happening on the create flow.

**1. `educationArea: undefined` when empty**

Per §8.1, `educationArea` is optional when `educationLevel` is `NONE` or `HIGH_SCHOOL`; if omitted the backend assigns `"N/A"`. But the frontend was sending `educationArea: ""` (empty string, not omitted), which the Zod validator rejected. Fixed with:

```typescript
educationArea: formData.educationArea?.trim() || undefined,
```

`JSON.stringify` omits `undefined` values, so the field is truly absent from the payload.

**2. `??` coalescing for AI-extracted `yearsOfExperience`**

The AI mapping was `yearsOfExperience: aiData.yearsOfExperience || prev.yearsOfExperience`, which treated a legitimate `0` as falsy and fell back to the previous value. Backend now accepts `>= 0`, so `??` is needed:

```typescript
yearsOfExperience: aiData.yearsOfExperience ?? prev.yearsOfExperience,
```

---

### Phase B — `Resultados.jsx` bug fixes

#### Response parsing

Was checking `response.status === "success"` and reading `response.data.results` — neither exists in the API contract. After `apiClient` unwraps `.data`, the response is `MatchResult[]` directly. Simplified to:

```javascript
setCandidates(Array.isArray(response) ? response : []);
```

#### Invalid vacancy status

`await vacanciesApi.updateStatus(id, "FILLED")` — `"FILLED"` is not a valid `VacancyStatus`. Enum allows `ACTIVE | PAUSED | CLOSED` (§0). When a candidate is marked "Contratado" and the vacancy closes, we now send `"CLOSED"`.

---

### Phase C — `/uploadcv` routed through documented endpoint

`uploads.api.ts` was deleted (called non-existent `/uploads`). `UploadCV.jsx` now:

1. Loads vacancies on mount via `vacanciesApi.getAll()`, filtered to `status === "ACTIVE"`.
2. Renders a required `<select>` picker at the top of the form.
3. Disables the "Subir Archivos" button until a vacancy is selected.
4. Uploads via `vacanciesApi.uploadCVs(selectedVacancyId, files)` — the documented `POST /vacancies/:id/upload` (§4).
5. On response, counts per-file failures (`UploadResult[]`) and shows a warning if any file couldn't be processed. Full per-file detail (created/duplicate/failed) is still pending — see `issues/P1.md §5.2`.

---

### Issue tracking

`issues/P0.md`, `P1.md`, `P2.md`, `P3.md` restructured to reflect current state:

- **P0** — all EPICs (1, 2.1, 3.x) resolved. Doc kept as historical record.
- **P1** — remaining: 4.4, 5.2 (partial), 6.2, 6.3, 6.4, 6.5.
- **P2** — no items resolved, but groundwork for 7.1 (Dashboard) and 9.1 (auth role) is in place with the new types.
- **P3** — 10.3 (CreateDepartment `serverData`) and 10.4 (`any` cleanup) resolved. Remaining: 10.1, 10.2, 10.3 (Login trailing block), 10.5.

Resolved items were removed from the files so each P now contains only actionable pending work.

---

## Previous session — Envelope unwrapping cleanup

**Branch:** `features`
**Date:** 2026-07-08

### Context

`apiClient` already unwraps the backend response envelope (including the double-wrapped `{ response: { success, data } }` shape used by `sendResponseOr404` endpoints). Despite this, several service methods were incorrectly typed as returning `Promise<ApiResponse<T>>` when they actually return `T` directly. Consumers then had to defensively re-unwrap with patterns like:

```typescript
Array.isArray(data) ? data : (data as any)?.data || [];
```

These are now removed. See `API_DOCUMENTATION.md §9` for the `sendResponseOr404` double-envelope detail.

### Files changed

#### `src/services/api/positions.api.ts`

- `getAll`: return type corrected from `Promise<ApiResponse<Position[]>>` to `Promise<Position[]>`. Added explicit `<Position[]>` type parameter to the `apiClient` call so TypeScript infers the correct type at the call site.

#### `src/services/api/vacancies.api.ts`

- `getAll`: same correction — `Promise<ApiResponse<Vacancy[]>>` → `Promise<Vacancy[]>` with explicit `<Vacancy[]>` on `apiClient`.

#### `src/services/api/candidates.api.ts`

- `getAll`: same correction — `Promise<ApiResponse<Candidate[]>>` → `Promise<Candidate[]>` with explicit `<Candidate[]>` on `apiClient`.

#### `src/pages/PositionHistory.tsx` (line 28)

- Replaced `const positionsArray = Array.isArray(data) ? data : (data as any)?.data || []` with `const positionsArray = data ?? []`.
- Removed the now-redundant `(p: any)` annotation on the `.map()` call — TypeScript now infers `p: Position` from the typed array.

#### `src/pages/VacancyHistory.tsx` (line 35)

- Removed `rawData` intermediate variable and the defensive extraction chain.
- Simplified to `setVacancies([...data].reverse())` directly. The previous ternary guard (`rawData ? ... : []`) was always truthy and is gone.

#### `src/pages/Vacancy.tsx` (line 64)

- Replaced `const positions = Array.isArray(posRes) ? posRes : (posRes as any)?.data || []` with `const positions = posRes`. `positionService.getAll()` now declares `Position[]` as its return type, so no unwrapping is needed.

#### `src/pages/Position.tsx` (lines 9, 51–60)

- Replaced `import { apiClient }` with `import { departmentsApi }`.
- Replaced the manual `apiClient('/departments', { method: 'GET' })` fetch (which also contained a defensive extractor) with a single `departmentsApi.getAll()` call — consistent with how `Vacancy.tsx` loads departments.

#### `src/pages/CVHistory.jsx` (line 25)

- **No change.** `setCvs(data || [])` already works correctly: `candidateService.getAll()` returns the array directly and the `|| []` fallback is a harmless guard for unexpected null/undefined. Validated and left as-is.

### Also changed in this session (departments.api.ts)

The `RawDepartment` interface and `normalizeRawDepartment` function in `src/services/api/departments.api.ts` were corrected to match the actual Prisma/SQL backend shape (validated against `API_DOCUMENTATION.md`):

| Before                    | After                            | Reason                                                           |
| ------------------------- | -------------------------------- | ---------------------------------------------------------------- |
| `_id?: string`            | `id: number`                     | Backend is Prisma/SQL — field is `id`, not `_id`, and is numeric |
| `positionsCount?: number` | `_count?: { positions: number }` | Prisma returns the count nested under `_count`                   |
| `created_at?: string`     | _(removed)_                      | Prisma uses camelCase `createdAt` exclusively                    |
| `positions?: unknown[]`   | _(removed)_                      | Not returned by the API                                          |

The normalization now converts `id: number → string`, flattens `_count.positions → positionsCount`, and maps `title → name` — all in one typed, `any`-free function.

---

## P0 remaining issues — EPIC 2 & EPIC 3

**Date:** 2026-07-08

### EPIC 2.1 — `src/pages/Vacancy.tsx`

Two `navigate("/history")` calls pointed to a route that doesn't exist in `App.tsx` (falls through to `/dashboard`). Both corrected to `navigate("/vacancy-history")`:

- `onReset` callback inside `<VacancySuccess>` (edit mode branch)
- "Volver al historial" button `onClick`

### EPIC 3.2 — `src/services/api/positions.api.ts`

`POST /positions/complete` expects `multipart/form-data` with field `pdf` (§3). The frontend was sending `file`.

- `formData.append("file", pdfFile)` → `formData.append("pdf", pdfFile)`

### EPIC 3.3 — `src/pages/Position.tsx` (educationLevel select)

The `<select>` was using Spanish labels as `value` (`"Bachiller"`, `"Maestría"`…). The API validates against the `EducationLevel` enum (§0). All values updated to the enum and two missing levels added:

| Before (value) | After (value) | Label shown |
|---|---|---|
| `"Ninguno"` | `"NONE"` | Ninguno |
| `"Bachiller"` | `"HIGH_SCHOOL"` | Bachiller |
| _(missing)_ | `"TECHNICAL"` | Técnico |
| _(missing)_ | `"BACHELOR"` | Pregrado / Bachiller universitario |
| `"Grado Universitario"` | `"UNIVERSITY"` | Grado Universitario |
| `"Maestría"` | `"MASTER"` | Maestría |
| _(missing)_ | `"DOCTORATE"` | Doctorado |

### EPIC 3.4 — `education` → `educationArea` rename

The API uses `educationArea` (§3); the frontend was sending `education` → 400 on creation.

- `src/services/api/positions.api.ts` — `CreatePositionInput.education: string` → `educationArea: string`
- `src/pages/Position.tsx` — `INITIAL_STATE.education` → `educationArea`; input `value`/`onChange` updated; `validateStep(4)` updated with §8.1 rule: `educationArea` only required when `educationLevel` is not `NONE` or `HIGH_SCHOOL`. Asterisk on "Área de estudio" label is now conditional on the same rule.

### EPIC 3.5 — `src/pages/Position.tsx` (AI response mapping)

`processWithAI` was mapping `education: aiData.education` — field doesn't exist in the API response (§3 uses `educationArea`). Fixed to `educationArea: aiData.educationArea ?? prev.educationArea`.

### EPIC 3.6 — `src/pages/Position.tsx` (`validateStep` client guards)

Added minimum-length guards matching API validation rules (§3):

- Step 2: `role.trim().length >= 5` (was `!== ""`), `description.trim().length >= 25` (was `!== ""`)
- Step 4: `educationLevel !== ""` + conditional `educationArea` check (§8.1)

### EPIC 10.4 (from P3) — `src/pages/Position.tsx` (`any[]` → `Department[]`)

`useState<any[]>` for departments resolved as a side-effect of EPIC 3.1: the import for `Department` from `../types/department.types` was added and the state typed as `useState<Department[]>([])`.

---

## Issues files — corrections against API_DOCUMENTATION.md

### P1 §6.1 — parsing de resultados

The suggested parsing code used `response?.results` which does not exist in the API response. `GET /vacancies/:id/results` returns `{ success, data: MatchResult[], meta }` — `apiClient` unwraps `.data`, so `response` is already `MatchResult[]`. Corrected to:

```js
const candidatesData = Array.isArray(response) ? response : [];
```

### All other P0–P3 issues validated against API_DOCUMENTATION.md ✅

After cross-referencing every issue against the API doc:

- **P0:** All EPICs 1–3 match the documented endpoints, enums, and field names.
- **P1:** EPICs 4–6 match; only §6.1 had the `response?.results` error (corrected above).
- **P2:** EPICs 7–9 match; admin API shape in §8.1 aligns with documented `GET /admin/users` response (`{ users, meta }`).
- **P3:** EPIC 10 is code-quality only; no API accuracy issues.
