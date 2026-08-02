# API Documentation — TalentMatch AI

**Generated from:** `src/routes/`, `src/controllers/`, `src/validations/` and `prisma/schema.prisma`.
**Base URL:** `/api`
**Format:** JSON (`Content-Type: application/json`), except the file-upload endpoints (`multipart/form-data`).

---

## 0. General conventions

### Authentication

Most endpoints require a JWT in the header:

```
Authorization: Bearer <token>
```

The token is obtained at `POST /api/users/login` and contains `{ userId, role }`. The auth middleware (`authMiddleware`) decodes it and exposes `req.user = { id, role }` to the controllers.

**Public routes (no token):** only `POST /api/users` and `POST /api/users/login`. Everything else requires a valid `Authorization: Bearer <token>`.

**Admin-only routes:** everything under `/api/admin/*` additionally requires `role: "ADMIN"` in the token — if the user is `"USER"`, it responds `403`.

**Multi-tenant isolation:** except for the `/api/admin` endpoints, every query is filtered by the token's `userId` — a user can never read/edit/delete another user's resources (returns `404`, not `403`, so as not to leak the resource's existence).

### Standard success response format

Most controllers respond:

```json
{ "success": true, "data": { ... } }
```

> **Technical note:** endpoints that use the `sendResponseOr404` helper (see section 9) wrap the response one extra level: `{ "response": { "success": true, "data": { ... } } }`. Check case by case in the tables below which shape applies to each endpoint.

### Standard error format

```json
{ "success": false, "error": "<message>" }
```

Validation errors (Zod, HTTP 400) additionally include:

```json
{
  "success": false,
  "error": "Validation error",
  "details": [{ "field": "field", "message": "..." }]
}
```

### Relevant enums (`prisma/schema.prisma`)

| Enum | Values |
| ------------------- | ----------------------------------------------------------------------------------- |
| `EducationLevel` | `NONE`, `HIGH_SCHOOL`, `BACHELOR`, `TECHNICAL`, `UNIVERSITY`, `MASTER`, `DOCTORATE` |
| `VacancyStatus` | `ACTIVE`, `PAUSED`, `CLOSED` |
| `CandidateStatus` | `DISPONIBLE`, `CONTRATADO` |
| `ApplicationStatus` | `PENDIENTE`, `EN_PROCESO`, `SELECCIONADO`, `RECHAZADO` |
| `UserRole` | `ADMIN`, `USER` |

---

## 1. Authentication and Users — `/api/users`

### `POST /api/users`

Registers a new user and automatically creates 10 default departments for the account.
**Auth:** not required.

| Field (body) | Type | Required | Validation |
| ------------ | -------- | --------- | -------------------------------------------------------------- |
| `email` | `string` | Yes | Valid email format (normalized to lowercase and trimmed) |
| `password` | `string` | Yes | 10–100 characters, at least 1 uppercase, 1 lowercase, 1 digit |

**Response 201:**

```json
{ "success": true, "message": "User created successfully", "userId": 1 }
```

**Errors:**
| Code | Cause |
|---|---|
| 400 | Invalid body (malformed email, password doesn't meet regex/length) |
| 409 | Email already registered (`Email alredy exists`) |
| 500 | Unhandled internal error |

---

### `POST /api/users/login`

**Auth:** not required.

| Field (body) | Type | Required | Validation |
| ------------ | -------- | --------- | -------------------- |
| `email` | `string` | Yes | Valid email format |
| `password` | `string` | Yes | Non-empty |

**Response 200:**

```json
{
  "success": true,
  "token": "<jwt>",
  "user": { "id": 1, "email": "...", "role": "USER" }
}
```

**Errors:**
| Code | Cause |
|---|---|
| 400 | Invalid body |
| 401 | Wrong email or password (generic message, does not reveal which field failed) |
| 500 | Unhandled internal error |

---

## 2. Departments — `/api/departments`

**Auth:** required (any role). All operations are scoped to `req.user.id`.

### `GET /api/departments`

No parameters. Returns all departments of the authenticated user, with `_count.positions`.

**Pagination:** none. `prisma.department.findMany` has no `skip`/`take` — every department the user owns comes back in one response, always. In practice this list is small and bounded (10 seeded on signup + whatever the user creates), so it hasn't needed pagination so far.

### `POST /api/departments`

| Field (body) | Type | Required | Validation |
| ------------ | -------- | --------- | ------------------- |
| `title` | `string` | Yes | minimum 3 characters |

Response 201 with the created department.

### `GET /api/departments/:id`

| Parameter | Type | Required |
| ----------- | ------------------- | --------- |
| `id` (path) | `number` (positive) | Yes |

### `PUT /api/departments/:id`

| Field (body) | Type | Required | Validation |
| ------------ | -------- | ------------ | ------------------------------- |
| `title` | `string` | No (partial) | minimum 3 characters if sent |

### `DELETE /api/departments/:id`

Only `id` in params.

**Common errors (the 4 endpoints with `:id`):**
| Code | Cause |
|---|---|
| 400 | `id` is not a positive integer, or invalid body |
| 404 | Department does not exist or does not belong to the user |
| 500 | Internal error |

> Note: `updateDepartment` does not use the "only update defined fields" technique because the model has a single field (`title`) that is already optional in the schema — there is no risk of accidental overwrite as in Positions/Vacancies.

---

## 3. Positions — `/api/positions`

**Auth:** required. All operations are scoped to `req.user.id`.

### `GET /api/positions`

No parameters. Lists the user's positions (selected fields: `id, userId, departmentId, role, yearsOfExperience, technicalSkills, optionalTechnicalSkills, softSkills, languages, description, educationLevel, educationArea, createdAt` — **does not include** `positionPdfUrl` or `updatedAt`).

**Pagination:** none. `prisma.position.findMany` has no `skip`/`take` — it returns **every** position the user has ever created, in one array, with no `limit`/`page` query params accepted. A user with hundreds of positions gets all of them back in a single response.

### `POST /api/positions`

Creates a position. Validates that `departmentId` exists and belongs to the user.

| Field (body) | Type | Required | Validation |
| ------------------------- | ------------------------- | ----------- | ----------------------------------------------------- |
| `role` | `string` | Yes | minimum 5 characters |
| `yearsOfExperience` | `number` | Yes | integer ≥ 0 — accepts `0` for entry-level roles (coerced from string) |
| `technicalSkills` | `string[]` | Yes | at least 1 element |
| `optionalTechnicalSkills` | `string[]` | No | — |
| `softSkills` | `string[]` | Yes | at least 1 element — `"At least one soft skill is required"` |
| `languages` | `string[]` | Yes | at least 1 element — `"At least one language is required"` |
| `description` | `string` | Yes | minimum 25 characters |
| `educationLevel` | `EducationLevel` (string) | Yes | must be one of the enum values |
| `educationArea` | `string` | Conditional | **see section 8 — the `NONE` rule** |
| `departmentId` | `number` | Yes | positive integer, must exist and belong to the user |

**Response 201:** the full created `Position` object (includes `userId`, `positionPdfUrl: null`, timestamps).

**Errors:**
| Code | Cause |
|---|---|
| 400 | Invalid body (Zod) — includes missing `educationArea` when the level requires it |
| 404 | `departmentId` does not exist or does not belong to the user |
| 500 | Internal error |

### `POST /api/positions/complete`

Extracts and autocompletes a position's data from a PDF, using AI. **Persists nothing to the database.**
**Content-Type:** `multipart/form-data`, file field: `pdf` (single file).

**Response 200:**

```json
{
  "success": true,
  "data": {
    /* PositionExtracted */
  },
  "cloudinaryPositionUrl": "https://...",
  "message": "..."
}
```

**Errors:**
| Code | Cause |
|---|---|
| 400 | No file uploaded, or the text extracted from the PDF is under 300 characters |
| 500 | Unhandled extraction/AI/Cloudinary error |

### `POST /api/positions/duplicate/:id`

Duplicates an existing position of the user (appends `" (Copy)"` to `role`). No body.

| Parameter | Type | Required |
| ----------- | ------------------- | --------- |
| `id` (path) | `number` (positive) | Yes |

**Errors:** `400` invalid id · `404` position doesn't exist/doesn't belong to the user · `500`.

### `GET /api/positions/:id`

Same field selection as the list. `404` if it doesn't exist/doesn't belong to the user.

### `PUT /api/positions/:id`

**Real partial update** — only the fields present in the body are modified; omitted ones keep their current value (see section 8).

| Field (body) | Type | Required |
| ----------------------------------------- | ---- | --------------------- |
| All fields of `POST /api/positions` | — | No (all optional) |

**Errors:** `400` invalid body/id · `404` doesn't exist/doesn't belong to the user · `500`.

### `DELETE /api/positions/:id`

Only `id`. `404` if it doesn't exist/doesn't belong to the user.

---

## 4. Vacancies — `/api/vacancies`

**Auth:** required. Scoped to `req.user.id`.

### `GET /api/vacancies`

No parameters. Includes `_count.candidates`, the full `candidates`, and `position: { id, role }` (**fixed 2026-07-13**: previously the response only carried the raw `positionId` FK, with no nested position data — the frontend had no way to display the position's role without a second request).

**Pagination:** none, on either axis. `prisma.vacancy.findMany` returns **all** of the user's vacancies with no `skip`/`take`, and for each vacancy it embeds the **complete** `candidates` array (every `Candidate` row linked to that vacancy — not just `_count`, the full records with `rawApiPayload` and all). This is the heaviest unpaginated response in the API: response size scales with vacancy count **times** candidates-per-vacancy. A vacancy with thousands of uploaded CVs makes this single response proportionally large — there is no `limit`/`page` query param to slice it.

### `POST /api/vacancies`

Validates that `departmentId` belongs to the user, that the department has at least one position, and that `positionId` belongs to that department.

| Field (body) | Type | Required | Validation |
| ---------------- | ------------------------ | --------- | -------------------------------------------------- |
| `title` | `string` | Yes | minimum 1 character |
| `availableSlots` | `number` | Yes | positive integer |
| `startDate` | `date` (ISO string) | Yes | must be before `endDate` |
| `endDate` | `date` (ISO string) | Yes | must be after `startDate` |
| `status` | `VacancyStatus` (string) | No | defaults to `ACTIVE` if omitted |
| `departmentId` | `number` | Yes | positive integer |
| `positionId` | `number` | Yes | positive integer, must belong to the `departmentId` |

**Errors:** `400` invalid body / department without positions / position doesn't belong to the department · `404` department doesn't exist or doesn't belong to the user · `500`.

### `GET /api/vacancies/:id`

`404` if it doesn't exist/doesn't belong to the user. Also includes `position: { id, role }` (**fixed 2026-07-13**, same fix as the list endpoint above — this single-record endpoint previously omitted `position` entirely, not even the FK-only shape).

### `GET /api/vacancies/:id/results`

Paginated matching (AI) results.

| Parameter | Type | Required | Default |
| --------------- | -------- | --------- | ------- |
| `id` (path) | `number` | Yes | — |
| `page` (query) | `number` | No | 1 |
| `limit` (query) | `number` | No | 20 |

**Response 200:** `{ success, data: MatchResult[], meta: { total, page, limit, totalPages } }`. Each `MatchResult` includes the full score breakdown (`hardSkillsScore`, `experienceScore`, `roleScore`, `languagesScore`, `educationScore`, `softSkillsScore`), the frozen `normalizedCandidate` snapshot, `summary`, `redFlags`, and a nested `candidate: { id, fullName, email, fileUrl, applications: [{ status }] }` — this is currently the only place `ApplicationStatus` is exposed to a client (read-only, no dedicated `/api/applications` endpoint — see §8.5).

> **No upper bound on `limit`:** the controller does `parseInt(req.query.limit) || 20` with no `Math.min`/clamp against a max page size. A client sending `?limit=100000` gets every `MatchResult` for that vacancy back in a single "page." Use `meta.total`/`meta.totalPages` to drive real pagination in the UI rather than assuming 20 is a hard cap.

### `POST /api/vacancies/:id/upload`

Uploads one or more CVs in PDF, processes them with AI (extraction + SHA-256 hash deduplication) and creates `Candidate` records linked to the vacancy.
**Content-Type:** `multipart/form-data`, field: `pdfs` (array, max. 100 files, max. 5MB each, `application/pdf` only).

**Response 201:**

```json
{ "success": true, "data": [ { "success": true, "data": { /* Candidate */ } } | { "success": false, "message": "...", "error": "...", "stack": "..." } ] }
```

Each file is processed independently (max concurrency 5) — a failing file does not block the others.

**Per-file errors (inside the array, they do not change the global HTTP status):**
| Cause | Result |
|---|---|
| Extracted text < 500 characters | `{ success: false, message: "..." }` |
| Hash already exists **for this user** (duplicate CV, possibly across vacancies) | `{ success: true, data: <existing candidate> }` |
| Other processing/AI error | `{ success: false, message, error, stack }` |

> **Cross-vacancy reuse (fixed 2026-07-13):** `Candidate.hash` dedup is scoped per user (`@@unique([userId, hash])`), not global. Uploading the same CV to a **different** vacancy of the same user reuses the existing `Candidate` row (no repeat OpenAI/Cloudinary call) and additionally creates/upserts an `Application(candidateId, vacancyId)` row linking it to the new vacancy — this is what makes the reused candidate show up as pending in `POST /:id/evaluations` for that vacancy too. Before this fix, the reused candidate stayed silently tied only to the vacancy of its *original* upload and could never be evaluated for any other vacancy (the request still returned `success: true`, with no visible error — see the "Known Inconsistencies" section for the incident this closes). Uploading the same CV under **two different users** no longer collides at all — each user gets their own independent `Candidate` row (hash dedup never crosses tenants).

**Global errors:** `400` if no file is sent · `404` vacancy doesn't exist/doesn't belong to the user (implicit via invalid `id`) · `500`.

### `POST /api/vacancies/:id/evaluations`

Runs the AI matching engine over every `Application` for this vacancy that doesn't yet have a `MatchResult` (**changed 2026-07-13**: previously sourced pending candidates from `Candidate.vacancyId` directly, which meant a candidate reused across vacancies via hash dedup was invisible to every vacancy except the one it was originally uploaded to). No body.

**Errors:** `404` vacancy not found or no candidates pending evaluation (`400` if there are no candidates) · `500`.

### `PATCH /api/vacancies/:id/status`

| Field (body) | Type | Required |
| ------------ | ------------------------ | --------- |
| `status` | `VacancyStatus` (string) | Yes |

**Errors:** `400` invalid status/invalid id · `404` doesn't exist/doesn't belong to the user · `500`.

### `PATCH /api/vacancies/:vacancyId/candidates/:candidateId/status`

**Added 2026-07-23.** Changes an `Application`'s status (i.e. a candidate's hiring status for this specific vacancy) and enforces `Vacancy.availableSlots` — see **§8.6** for the full business rule. This is the only write path for `ApplicationStatus` today; there is still no generic `/api/applications` CRUD (see §8.5).

| Parameter | Type | Required |
| ------------------- | ------------------------- | --------- |
| `vacancyId` (path) | `number` (positive) | Yes |
| `candidateId` (path) | `number` (positive) | Yes |
| `status` (body) | `ApplicationStatus` (string) | Yes |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "application": { /* updated Application row */ },
    "vacancy": { "id": 1, "availableSlots": 2, "status": "ACTIVE" }
  }
}
```

Note this endpoint does **not** use `sendResponseOr404` — the response is `{ success, data }` directly, not double-wrapped (contrast with `PATCH /:id/status` above).

**Errors:**
| Code | Cause |
|---|---|
| 400 | Invalid `status` value, or invalid `vacancyId`/`candidateId` |
| 404 | Vacancy doesn't exist/doesn't belong to the user, or the candidate has no `Application` for this vacancy |
| 409 | The vacancy is already `CLOSED`, or `status: "SELECCIONADO"` is sent but `availableSlots` is already full (see §8.6) |
| 500 | Unhandled internal error |

### `PUT /api/vacancies/:id`

**Real partial update** (same behavior as Positions — see section 8).

| Field (body) | Type | Required |
| ----------------------------------------- | ---- | --------------------- |
| All fields of `POST /api/vacancies` | — | No (all optional) |

### `DELETE /api/vacancies/:id`

Only `id`. `404` if it doesn't exist/doesn't belong to the user.

---

## 5. Candidates — `/api/candidates`

**Auth:** required. Read-only — there are no direct create/edit/delete endpoints (candidates are created only via `POST /api/vacancies/:id/upload`).

### `GET /api/candidates`

Lists the user's candidates (selected fields, includes `rawApiPayload`).

**Pagination:** none. `prisma.candidate.findMany` returns **every** candidate ever uploaded by the user, with no `skip`/`take` and no `page`/`limit` query params. Each row also includes `rawApiPayload` (the raw JSON the AI returned per CV), which is not a small field — a user with a large candidate history gets the full history back, payload included, in one response.

### `GET /api/candidates/:id`

| Parameter | Type | Required |
| ----------- | ------------------- | --------- |
| `id` (path) | `number` (positive) | Yes |

**Errors:** `400` invalid id · `404` doesn't exist/doesn't belong to the user.

---

## 6. Administration — `/api/admin`

**Auth:** required + `role: "ADMIN"` (`403` otherwise).

### `GET /api/admin/stats`

**Platform-wide metrics** (not filtered by user, unlike the section-7 dashboard): `usersCount, candidatesCount, positionsCount, vacanciesCount, activeVacancies, closedVacancies`.

Not a list — a single aggregated object (six `count()` queries run in parallel). No pagination applies; there's nothing to page through.

### `GET /api/admin/users`

Paginated list of all users in the system.

| Parameter (query) | Type | Required | Default |
| ----------------- | -------- | --------- | ------- |
| `page` | `number` | No | 1 |
| `limit` | `number` | No | 50 |

**Response 200:** `{ success, data: { users: User[], meta: { totalCount, currentPage, totalPages } } }`.

> **No upper bound on `limit`:** same pattern as vacancy results — `parseInt(req.query.limit, 10) || 50` with no clamp. `?limit=999999` returns every user in the system in one page. Sorted deterministically by `createdAt desc`, so pages don't shift between requests as long as no new user is created in between.

### `PUT /api/admin/users/:id/role`

| Parameter | Type | Required |
| ------------- | ------------------- | --------- |
| `id` (path) | `number` | Yes |
| `role` (body) | `"ADMIN" \| "USER"` | Yes |

**Errors:** `400` invalid role/invalid id · `403` if the requester is not ADMIN · `404` (Prisma throws if the user doesn't exist — today not explicitly caught, falls through to the global handler) · `500`.

### `DELETE /api/admin/users/:id`

Only `id`. Same error considerations as above.

---

## 7. Dashboard — `/api/dashboard`

**Auth:** required. Scoped to `req.user.id` (unlike `/api/admin/stats`, which is global).

### `GET /api/dashboard`

No parameters.

**Response 200:**

```json
{
  "total": {
    "positionsCount": 0,
    "departmentsCount": 0,
    "candidatesCount": 0,
    "openVacanciesCount": 0
  },
  "vacancyStatusBreakdown": [
    { "status": "ACTIVE", "count": 0, "percentage": 0 }
  ],
  "monthlyActivity": [
    {
      "month": "2026-01",
      "positionsCreated": 0,
      "cvUploads": 0,
      "vacanciesCreated": 0
    }
  ]
}
```

**Pagination and array sizes — no `page`/`limit` params exist on this endpoint at all:**

- `total`: not an array — four independent `count()`/aggregate queries, always exactly these 4 keys.
- `vacancyStatusBreakdown`: fixed-size array, always 3 entries (one per baseline status the service hardcodes), regardless of how many vacancies the user has. **Known mismatch:** the hardcoded baseline in `dashboard.service.ts` is `["ACTIVE", "CLOSED", "CONTACTING"]`, but `VacancyStatus` in `prisma/schema.prisma` is actually `ACTIVE | PAUSED | CLOSED` — there is no `CONTACTING` status anywhere in the schema, and `PAUSED` is missing from this breakdown entirely. In practice: the `"CONTACTING"` entry always reports `count: 0, percentage: 0` (it can never match a real row), and any vacancy actually in `PAUSED` is silently excluded from the breakdown (it's still counted in `total`, just invisible here). Don't rely on this array to reconcile against every vacancy's real status until this is fixed.
- `monthlyActivity`: **unbounded, no pagination** — one row per calendar month that has at least one event (position/CV/vacancy created) since the user's very first one, computed with a raw SQL `GROUP BY DATE_FORMAT(createdAt, '%Y-%m')`, ascending. For a multi-year-old account this array only grows; there is no `from`/`to` range filter and no cap on how many months are returned.

---

## 8. Integration Contracts (Business Rules)

### 8.1 Handling the `"NONE"` value in education (Positions)

`EducationLevel` includes `NONE` as a **legitimate** enum value — it is not an invalid placeholder, it represents "no formal education requirement" for the position.

- If `educationLevel` is `"NONE"` or `"HIGH_SCHOOL"`, **`educationArea` is optional**. If omitted, the backend automatically assigns `educationArea: "N/A"` before saving (it never stays `null`/`undefined`/`""` in the database).
- If `educationLevel` is `"BACHELOR"`, `"TECHNICAL"`, `"UNIVERSITY"`, `"MASTER"` or `"DOCTORATE"`, **`educationArea` is required** — if missing, the API responds `400` with `"Education area is required for this education level"`.
- **Recommended frontend consumption:** when displaying `educationArea` on read screens, treat the value `"N/A"` as "Not applicable" in the UI, don't show it raw.
- This rule applies only to `POST /api/positions` (creation). On `PUT /api/positions/:id` (partial update), if `educationArea` is not sent it is simply left untouched — the `"N/A"` sentinel is not re-applied on update.

### 8.2 Partial update (`PUT`) in Positions and Vacancies

The endpoints `PUT /api/positions/:id` and `PUT /api/vacancies/:id` are **real patches**: only the fields present in the body are modified in the database; any omitted field keeps its current value. To empty an optional array (e.g. `optionalTechnicalSkills`) or change a value, it must be sent explicitly in the body — omitting it never deletes it.

### 8.3 Ownership validation (multi-tenant)

All relationships between entities (`Position.departmentId`, `Vacancy.departmentId`/`positionId`) are validated against `req.user.id` before writing. A user cannot create a position in another user's department, nor a vacancy on a position that doesn't belong to them — the API responds `404`/`400` as appropriate, never allowing the cross operation.

### 8.4 Standardized error handling

- Payload validation errors (Zod) → always `400` with per-field `details`.
- Prisma errors not explicitly caught in the controller (`PrismaClientValidationError`, `PrismaClientKnownRequestError`) → `400` with the generic message `"Invalid data sent to the database"` (Prisma's internal detail is not exposed).
- Any other unhandled error → `500`. In production (`NODE_ENV=production`) the message is always `"Internal server error"`, with no internal detail; in development the real message is shown for debugging.
- The frontend **must not** parse the `error` text of a `500` to make business decisions — only for logging.

### 8.5 `Application` — no generic CRUD endpoint, but actively written/read since 2026-07-13

~~`Application` is defined in `prisma/schema.prisma` (with `ApplicationStatus`) but has no active routes or controller in the current API.~~ **Partially superseded (2026-07-13):** `Application(candidateId, vacancyId)` is now written to internally by `POST /api/vacancies/:id/upload` (linking a reused candidate to a new vacancy) and read by `POST /api/vacancies/:id/evaluations` (sourcing which candidates are pending for a vacancy) — see section 4. `GET /api/vacancies/:id/results` exposes `ApplicationStatus` read-only, nested as `candidate.applications[0].status` (see section 4).

**Updated 2026-07-23:** `PATCH /api/vacancies/:vacancyId/candidates/:candidateId/status` (section 4) now lets the frontend change a candidate's `ApplicationStatus` for a given vacancy directly — this is the write path referenced by §8.6. There is still **no generic `/api/applications` resource** (no list/create/delete of `Application` rows by their own id) — this endpoint is scoped to one candidate within one vacancy, not a full CRUD surface.

### 8.6 Vacancy slot enforcement & auto-close (added 2026-07-23)

This is a deliberately minimal, **not built for high-concurrency scale** rule, added to close the gap where a vacancy never closed on its own once all its `availableSlots` were filled:

- Only transitioning a candidate's `Application.status` **into** `"SELECCIONADO"` is checked against `Vacancy.availableSlots`. Any other transition (`PENDIENTE`/`EN_PROCESO`/`RECHAZADO`, or re-confirming a candidate already `SELECCIONADO`) never touches the slot count.
- The check counts existing `Application` rows with `status: "SELECCIONADO"` for that vacancy. If the count is already `>= availableSlots`, the request is rejected with `409` and **nothing is written** — the candidate's status stays whatever it was before the call.
- If accepting this candidate reaches `availableSlots`, the vacancy's `status` is set to `"CLOSED"` in the **same transaction** as the `Application` update (`prisma.$transaction`, with the `Vacancy` row locked via `SELECT ... FOR UPDATE` for the duration, so two near-simultaneous hire attempts on the same vacancy can't both squeeze past the slot check).
- **While a vacancy is `CLOSED`, this endpoint rejects *any* candidate status change with `409`** — not just new selections — until the vacancy is reactivated.
- **No automatic reopening, ever.** Moving a candidate out of `SELECCIONADO` (freeing a slot) does not reopen a `CLOSED` vacancy. Reopening is always the explicit, manual `PATCH /api/vacancies/:id/status` (`ACTIVE`) — this endpoint never writes `Vacancy.status` back to `ACTIVE`.
- **Raising `availableSlots` does not reopen a `CLOSED` vacancy either.** `PUT /api/vacancies/:id` can increase `availableSlots` (it's a real patch, §8.2), but if the vacancy is `CLOSED` that has to be paired with a manual `PATCH .../status` → `ACTIVE` to actually accept anyone into the new slots.

---

## 9. Technical Notes / Known Inconsistencies

Documented so the frontend knows what to expect today, not an "ideal" behavior:

1. **Double wrapping in `sendResponseOr404`:** endpoints that use this helper for the success case return `{ "response": { "success": true, "data": ... } }` (one extra level compared to the `{ success, data }` pattern used by the other controllers). Affects: `GET /positions`, `GET /positions/:id`, `GET /candidates`, `GET /candidates/:id`, `GET /departments/*`, `PUT /departments/:id`, `DELETE /departments/:id`, `GET /vacancies`, `GET /vacancies/:id` (¹), `PATCH /vacancies/:id/status`, `PUT /vacancies/:id`, `GET /dashboard`.
   (¹) `GET /vacancies/:id` actually does not use the helper — it responds `{ success, data }` directly. Check case by case in this table.
2. ~~**`success: "false"` (string) in the 404 case of `sendResponseOr404`**, instead of `false` (boolean) as in the rest of the API.~~ **Fixed (2026-07-07):** `sendResponseOr404` now returns `success: false` as a boolean in the 404 case too, consistent with the rest of the API. A strict check (`response.success === false`) on the frontend now works correctly for this case.
3. **File type/size errors in Multer have no `statusCode` assigned** (`multerConfig` throws a generic `Error`), so today they fall into the global handler's `500` branch instead of `400`, in `POST /positions/complete` and `POST /vacancies/:id/upload`.
4. **`GET /api/admin/stats` is global** (all platform users), while `GET /api/dashboard` is per-user — do not confuse them as the same source of truth.
5. ~~A middleware `identifyUserDemo` (`demoTrialMiddleware.js`) exists to limit demo accounts to 5 days, but is not wired to any active route.~~ **Removed (2026-07-04, #138):** the demo-account-limit middleware (`demoTrialMiddleware.js`) was deleted from the repository along with `matchRepository.js` as dead code. There is no longer any reference to demo accounts in the backend (the `DEMO_USER` environment variable is also now unused).
6. **`GET /api/dashboard`'s `vacancyStatusBreakdown` hardcodes a `"CONTACTING"` status that doesn't exist in `VacancyStatus`** (`ACTIVE | PAUSED | CLOSED`), and omits `PAUSED` entirely — see section 7 for the full detail. Do not treat this array as an exhaustive breakdown of every vacancy status today.
7. **No list endpoint in this API enforces a maximum page size.** The two paginated endpoints (`GET /api/vacancies/:id/results`, `GET /api/admin/users`) clamp nothing on `limit` — a large enough value returns the entire table in one response. The unpaginated list endpoints (`GET /api/departments`, `GET /api/positions`, `GET /api/vacancies`, `GET /api/candidates`) have no size limit at all by design. See section 10 for the full endpoint-by-endpoint breakdown.
8. ~~`Candidate.hash` was globally unique (`@unique`) instead of scoped per user, which caused two separate bugs: (a) uploading the same CV to a second vacancy of the same user silently reused the existing `Candidate` without ever linking it to the new vacancy — the upload reported `success: true` but the candidate could never be evaluated for that second vacancy, and (b) two different users uploading a byte-identical PDF would have the second user's request transparently return the first user's confidential `Candidate` data (cross-tenant leak).~~ **Fixed (2026-07-13):** `Candidate.hash` is now unique per `(userId, hash)`. Reused candidates are linked to additional vacancies via `Application` (see section 8.5), and different users can now each have their own independent `Candidate` row for the same underlying CV. `GET /api/vacancies` and `GET /api/vacancies/:id` still list `candidates` by `Candidate.vacancyId` only (the vacancy of the *original* upload) — a candidate linked to a second vacancy only via `Application` won't appear in that vacancy's `candidates` array yet, even though it's now evaluable there. Tracked as a follow-up, not yet fixed.

---

## 10. Pagination & List Sizes — Quick Reference

Consolidated answer to "how much does each `GET` actually return?" — see each endpoint's own section above for the full detail.

| Endpoint | Returns | Paginated? | Default page size | Enforced max |
| --- | --- | --- | --- | --- |
| `GET /api/departments` | ALL departments of the user | No | — | — |
| `GET /api/positions` | ALL positions of the user | No | — | — |
| `GET /api/positions/:id` | Single record | N/A | — | — |
| `GET /api/vacancies` | ALL vacancies of the user, each with its **full** `candidates` array and `position: { id, role }` embedded | No | — | — |
| `GET /api/vacancies/:id` | Single record | N/A | — | — |
| `GET /api/vacancies/:id/results` | `MatchResult[]` for one vacancy | Yes (`page`/`limit`) | `page=1`, `limit=20` | **None** — `limit` is not clamped |
| `GET /api/candidates` | ALL candidates of the user (incl. `rawApiPayload`) | No | — | — |
| `GET /api/candidates/:id` | Single record | N/A | — | — |
| `GET /api/admin/stats` | Single aggregated object, platform-wide | N/A (not a list) | — | — |
| `GET /api/admin/users` | `User[]`, platform-wide | Yes (`page`/`limit`) | `page=1`, `limit=50` | **None** — `limit` is not clamped |
| `GET /api/dashboard` | `total` (single object) + `vacancyStatusBreakdown` (fixed 3 rows) + `monthlyActivity` (1 row per active calendar month, grows with account age) | No | — | — |

**Practical takeaway for frontend consumers:** if a user account accumulates a large number of positions, vacancies, or candidates, the four "No" rows above will return the entire dataset in a single response with no way to request a slice — plan client-side rendering (virtualization, lazy sections) accordingly rather than assuming the backend will ever hand back a small page. For the two paginated endpoints, don't hardcode the default page size as a hard ceiling either, since a caller (or a future bug) can request an unbounded `limit`.

---

_Document generated by analyzing `src/routes/`, `src/controllers/`, `src/validations/` and `prisma/schema.prisma` in their current state on the working branch. No code file was modified for this documentation._
