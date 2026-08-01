# Backend Bug Report — TalentMatch API

Generated: 2026-08-01  
Source: session analysis + `docs/en/api-documentation.md` §9

---

## Critical (blocking functionality)

### BUG-001 · `DELETE /api/vacancies/:id` returns 400 — missing `parseInt`

**Symptom:** Every vacancy delete attempt fails with `400 "Invalid data sent to the database"`.  
**Root cause:** `req.params.id` is always a `string` in Express. If the controller passes it directly to Prisma without `parseInt`, Prisma throws `PrismaClientValidationError` (expected `Int`, got `String`), which the global error handler converts to 400.  
**Fix:**
```js
const id = parseInt(req.params.id, 10);
if (isNaN(id)) return res.status(400).json({ success: false, error: "Invalid id" });
await prisma.vacancy.delete({ where: { id } });
```
**Affects:** `VacancyHistory.tsx` — delete button always fails.

---

### BUG-002 · `PATCH /api/vacancies/:vacancyId/candidates/:candidateId/status` returns 404 for pre-2026-07-13 data

**Symptom:** Changing a candidate's status returns 404 and shows "Este candidato no tiene un registro activo para esta vacante."  
**Root cause:** `Application(candidateId, vacancyId)` rows were only introduced on 2026-07-13. Candidates uploaded and evaluated before that date have `MatchResult` rows but no `Application` row. The PATCH endpoint (added 2026-07-23) requires the `Application` row to exist.  
**Fix:** Backfill migration:
```sql
INSERT INTO applications (candidateId, vacancyId, status)
SELECT DISTINCT mr.candidateId, mr.vacancyId, 'PENDIENTE'
FROM match_results mr
WHERE NOT EXISTS (
  SELECT 1 FROM applications a
  WHERE a.candidateId = mr.candidateId AND a.vacancyId = mr.vacancyId
);
```
**Affects:** `AdvancedResults.tsx` and `Resultados.tsx` — status selector and hire button return 404 on old data.

---

## High (incorrect behavior, no crash)

### BUG-003 · `GET /api/vacancies` omits candidates linked only via `Application`

**Symptom:** A candidate reused across vacancies (via hash dedup) only appears in the `candidates` array of the vacancy where they were *originally* uploaded. For any other vacancy they were linked to via `Application`, they don't appear in `vacancy.candidates` — even though they are evaluable and appear in `GET /api/vacancies/:id/results`.  
**Root cause:** `GET /api/vacancies` queries `Candidate` by `Candidate.vacancyId` (the FK of the original upload), not by `Application.vacancyId`.  
**Fix:** Join through `Application` instead of `Candidate.vacancyId` when loading `vacancy.candidates`.  
**Tracked as follow-up from 2026-07-13 fix.**

---

### BUG-004 · Dashboard `vacancyStatusBreakdown` hardcodes non-existent status `"CONTACTING"`

**Symptom:** `GET /api/dashboard` → `vacancyStatusBreakdown` always has a `"CONTACTING"` entry with `count: 0, percentage: 0`. The `PAUSED` status is never represented in the breakdown even when vacancies exist in that state.  
**Root cause:** `dashboard.service.ts` hardcodes the baseline as `["ACTIVE", "CLOSED", "CONTACTING"]`. `VacancyStatus` in the Prisma schema is `ACTIVE | PAUSED | CLOSED` — `CONTACTING` does not exist.  
**Fix:** Change the hardcoded baseline to `["ACTIVE", "PAUSED", "CLOSED"]`.  
**Affects:** Any frontend widget that renders this breakdown (dashboard stats).

---

### BUG-005 · File type/size validation errors return 500 instead of 400

**Symptom:** Uploading an oversized or non-PDF file to `POST /api/positions/complete` or `POST /api/vacancies/:id/upload` returns a 500 instead of a 400.  
**Root cause:** `multerConfig` throws a generic `Error` with no `statusCode` assigned. The global handler catches it in the `500` branch instead of the `400` validation branch.  
**Fix:** Throw a typed error with `statusCode: 400` from `multerConfig`, or catch `MulterError` explicitly in the controller and return 400.

---

### BUG-006 · `DELETE /api/admin/users/:id` — non-existent user falls through to global 500 handler

**Symptom:** Deleting a user that doesn't exist (e.g., already deleted, stale UI) throws an unhandled Prisma error instead of returning a clean 404.  
**Root cause:** `prisma.user.delete` on a non-existent record throws `PrismaClientKnownRequestError P2025`, which is not explicitly caught in the admin controller — it falls through to the global handler.  
**Fix:** Catch `P2025` explicitly and return 404.

---

## Low (design / scalability)

### BUG-007 · No pagination enforcement on list endpoints — unbounded response size

**Symptom:** `GET /api/vacancies` returns all vacancies with their full `candidates` array (including `rawApiPayload`) in a single response. For users with many vacancies and candidates, this response grows unbounded.  
**Also affects:** `GET /api/positions`, `GET /api/departments`, `GET /api/candidates` (all unpaginated). The two paginated endpoints (`GET /api/vacancies/:id/results`, `GET /api/admin/users`) accept `limit` with no clamping — any value returns the full table.  
**Fix:** Add `skip`/`take` with a configurable max (e.g., 100) and enforce a cap on `limit` in paginated endpoints.

---

### BUG-008 · `sendResponseOr404` double-wraps success responses inconsistently

**Symptom:** Endpoints using this helper return `{ response: { success, data } }` instead of `{ success, data }`. The frontend apiClient works around this, but any new consumer hitting these endpoints directly will get an unexpected extra nesting level.  
**Affected endpoints:** `GET /positions`, `GET /positions/:id`, `GET /candidates`, `GET /candidates/:id`, `GET /departments/*`, `PUT /departments/:id`, `DELETE /departments/:id`, `GET /vacancies`, `PATCH /vacancies/:id/status`, `PUT /vacancies/:id`, `GET /dashboard`.  
**Fix:** Refactor `sendResponseOr404` to respond with `{ success, data }` directly (same shape as the rest of the API), or migrate callers off this helper.

---

## Fixed (for reference)

| ID | Issue | Fixed |
|----|-------|-------|
| — | `success: "false"` (string) in `sendResponseOr404` 404 case | 2026-07-07 |
| — | Demo trial middleware dead code (`demoTrialMiddleware.js`) | 2026-07-04 |
| — | `Candidate.hash` globally unique → cross-tenant CV leak + cross-vacancy reuse broken | 2026-07-13 |
| — | `GET /vacancies` missing `position: { id, role }` in nested vacancy data | 2026-07-13 |
| — | `POST /evaluations` sourcing candidates from `Candidate.vacancyId` instead of `Application` | 2026-07-13 |
