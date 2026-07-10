# API Documentation — TalentMatch AI

> 🇪🇸 Versión en español: [`../es/api-documentation.md`](../es/api-documentation.md)
>
> ⚠️ This document describes the **backend contract**, not the frontend. The source of truth lives in the `talentmatch-backend` repository; this copy is a reference for the frontend team and may drift.

**Generated from:** the backend's `src/routes/`, `src/controllers/`, `src/validations/` and `prisma/schema.prisma`.
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

### `POST /api/positions`

Creates a position. Validates that `departmentId` exists and belongs to the user.

| Field (body) | Type | Required | Validation |
| ------------------------- | ------------------------- | ----------- | ----------------------------------------------------- |
| `role` | `string` | Yes | minimum 5 characters |
| `yearsOfExperience` | `number` | Yes | integer ≥ 0 — accepts `0` for entry-level roles (coerced from string) |
| `technicalSkills` | `string[]` | Yes | at least 1 element |
| `optionalTechnicalSkills` | `string[]` | No | — |
| `softSkills` | `string[]` | Yes | — |
| `languages` | `string[]` | No | — |
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

No parameters. Includes `_count.candidates` and the full `candidates`.

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

`404` if it doesn't exist/doesn't belong to the user.

### `GET /api/vacancies/:id/results`

Paginated matching (AI) results.

| Parameter | Type | Required | Default |
| --------------- | -------- | --------- | ------- |
| `id` (path) | `number` | Yes | — |
| `page` (query) | `number` | No | 1 |
| `limit` (query) | `number` | No | 20 |

**Response 200:** `{ success, data: MatchResult[], meta: { total, page, limit, totalPages } }`.

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
| Hash already exists (duplicate CV) | `{ success: true, data: <existing candidate> }` |
| Other processing/AI error | `{ success: false, message, error, stack }` |

**Global errors:** `400` if no file is sent · `404` vacancy doesn't exist/doesn't belong to the user (implicit via invalid `id`) · `500`.

### `POST /api/vacancies/:id/evaluations`

Runs the AI matching engine over all of the vacancy's candidates that don't yet have a `MatchResult`. No body.

**Errors:** `404` vacancy not found or no candidates pending evaluation (`400` if there are no candidates) · `500`.

### `PATCH /api/vacancies/:id/status`

| Field (body) | Type | Required |
| ------------ | ------------------------ | --------- |
| `status` | `VacancyStatus` (string) | Yes |

**Errors:** `400` invalid status/invalid id · `404` doesn't exist/doesn't belong to the user · `500`.

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

### `GET /api/admin/users`

Paginated list of all users in the system.

| Parameter (query) | Type | Required | Default |
| ----------------- | -------- | --------- | ------- |
| `page` | `number` | No | 1 |
| `limit` | `number` | No | 50 |

**Response 200:** `{ success, data: { users: User[], meta: { totalCount, currentPage, totalPages } } }`.

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

### 8.5 Schema entities without an exposed endpoint

`Application` is defined in `prisma/schema.prisma` (with `ApplicationStatus`) but **has no active routes or controller** in the current API — no `/api/applications` endpoint should be assumed.

---

## 9. Technical Notes / Known Inconsistencies

Documented so the frontend knows what to expect today, not an "ideal" behavior:

1. **Double wrapping in `sendResponseOr404`:** endpoints that use this helper for the success case return `{ "response": { "success": true, "data": ... } }` (one extra level compared to the `{ success, data }` pattern used by the other controllers). Affects: `GET /positions`, `GET /positions/:id`, `GET /candidates`, `GET /candidates/:id`, `GET /departments/*`, `PUT /departments/:id`, `DELETE /departments/:id`, `GET /vacancies`, `GET /vacancies/:id` (¹), `PATCH /vacancies/:id/status`, `PUT /vacancies/:id`, `GET /dashboard`.
   (¹) `GET /vacancies/:id` actually does not use the helper — it responds `{ success, data }` directly. Check case by case in this table.
2. ~~**`success: "false"` (string) in the 404 case of `sendResponseOr404`**, instead of `false` (boolean) as in the rest of the API.~~ **Fixed (2026-07-07):** `sendResponseOr404` now returns `success: false` as a boolean in the 404 case too, consistent with the rest of the API. A strict check (`response.success === false`) on the frontend now works correctly for this case.
3. **File type/size errors in Multer have no `statusCode` assigned** (`multerConfig` throws a generic `Error`), so today they fall into the global handler's `500` branch instead of `400`, in `POST /positions/complete` and `POST /vacancies/:id/upload`.
4. **`GET /api/admin/stats` is global** (all platform users), while `GET /api/dashboard` is per-user — do not confuse them as the same source of truth.
5. ~~A middleware `identifyUserDemo` (`demoTrialMiddleware.js`) exists to limit demo accounts to 5 days, but is not wired to any active route.~~ **Removed (2026-07-04, #138):** the demo-account-limit middleware (`demoTrialMiddleware.js`) was deleted from the repository along with `matchRepository.js` as dead code. There is no longer any reference to demo accounts in the backend (the `DEMO_USER` environment variable is also now unused).

---

_Document generated by analyzing `src/routes/`, `src/controllers/`, `src/validations/` and `prisma/schema.prisma` in their current state on the working branch. No code file was modified for this documentation._
