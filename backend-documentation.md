# Backend Documentation — TalentMatch AI

> A complete technical reference for the TalentMatch AI backend. It is written so that an engineer with **no prior exposure to the project** can read it top to bottom and understand what the system does, how it is structured, how a request flows through it, how data is modeled, and how to run, test and deploy it.

**Audience:** backend engineers, new joiners, integrators, and reviewers.
**Companion documents:** [`api-documentation.md`](./api-documentation.md) (endpoint-by-endpoint contract), [`readme.md`](./readme.md) (quick start), [`changelog-frontend.md`](./changelog-frontend.md) (contract changes for the frontend team), [`last-changes.md`](./last-changes.md) (recent engineering log).

---

## Table of contents

1. [What the system does](#1-what-the-system-does)
2. [Technology stack](#2-technology-stack)
3. [High-level architecture](#3-high-level-architecture)
4. [Request lifecycle](#4-request-lifecycle)
5. [Project structure](#5-project-structure)
6. [Domain model & database schema](#6-domain-model--database-schema)
7. [Multi-tenancy & data isolation](#7-multi-tenancy--data-isolation)
8. [Authentication & authorization (RBAC)](#8-authentication--authorization-rbac)
9. [Validation layer (Zod)](#9-validation-layer-zod)
10. [Error handling & response envelopes](#10-error-handling--response-envelopes)
11. [The CV processing pipeline](#11-the-cv-processing-pipeline)
12. [AI integration (OpenAI)](#12-ai-integration-openai)
13. [The scoring / matching engine](#13-the-scoring--matching-engine)
14. [Dashboard & admin analytics](#14-dashboard--admin-analytics)
15. [Security layer](#15-security-layer)
16. [Configuration & environment variables](#16-configuration--environment-variables)
17. [Running locally](#17-running-locally)
18. [Testing](#18-testing)
19. [CI/CD & deployment](#19-cicd--deployment)
20. [Known issues & conventions](#20-known-issues--conventions)

---

## 1. What the system does

TalentMatch AI is a **B2B SaaS platform that automates candidate screening for HR teams**. Each customer (a company or recruiter) operates an isolated workspace organized as a hierarchy:

```
User (tenant / recruiter)
 └── Department        e.g. "Engineering"
      └── Position     the job requirements baseline (skills, experience, education…)
           └── Vacancy an active opening tied to a Position
                └── Candidate  a CV parsed from a PDF, plus its AI evaluation
```

The core value proposition: instead of a recruiter reading dozens of unqualified CVs, they upload the PDFs to a vacancy and receive an **ordered, explainable ranking** of the best-fitting candidates.

The backend is the "brain": it ingests CVs, uses an LLM to turn unstructured resume text into a structured profile, and then computes a **deterministic 0–100 match score** against the vacancy's Position — the AI never assigns the score itself.

## 2. Technology stack

| Layer | Technology |
| --- | --- |
| Runtime | Node.js `20.20.1` (see `engines` in `package.json`) |
| Web framework | Express 5 |
| Language | TypeScript (strict, no `any`) — migrated from a hybrid JS/TS codebase |
| Database | MySQL 8 |
| ORM | Prisma 6 |
| Validation | Zod 4 |
| Auth | JSON Web Tokens (`jsonwebtoken`) + `bcrypt` password hashing |
| AI / NLP | OpenAI API (Responses API, server-stored prompts) |
| File storage | Cloudinary |
| PDF parsing | `pdf-parse` (wrapped with a bounded retry) |
| File uploads | Multer (in-memory storage) |
| HTTP security | Helmet, `express-rate-limit`, CORS whitelist |
| Bounded concurrency | `p-limit` |
| Testing | Jest + Supertest (via `babel-jest`) |
| Dev runner | `tsx` (hot reload, script execution) |

**Infrastructure model — important distinction:**

- **Local development:** Docker runs **MySQL only**. The Node.js backend runs **natively** (`npm run dev`).
- **VPS (production):** 100% containerized — both the backend and MySQL run in Docker via `docker-compose.yml`.

## 3. High-level architecture

The backend is a single Express application exposing a JSON REST API under `/api`. It follows a **strict layered architecture** and every request passes through the layers in order — no layer is ever skipped:

```
Route  →  Security middleware  →  Auth middleware  →  Zod validation  →  Controller  →  Service  →  Prisma  →  MySQL
```

- **Routes** (`src/routes/`) declare the endpoints and wire the middleware chain.
- **Validation middleware** (`src/middlewares/validation/`) runs the Zod schema for `body`/`params`/`query` before any controller code executes.
- **Controllers** (`src/controllers/`) orchestrate the request: they own request/response shaping and tenant scoping.
- **Services** (`src/services/`) hold reusable business logic (CV dedup, Cloudinary uploads, candidate validation, dashboard aggregation).
- **Prisma** (`src/lib/prisma.ts`) is the single database client.

**`app.ts` vs `index.ts` — a deliberate split:**

- `src/app.ts` builds the Express app (middlewares + routes) and **exports it without calling `listen`**.
- `src/index.ts` is the **only** file that calls `app.listen`.

This split exists so that Supertest can `import app` directly in tests without opening a real network port. **Do not merge them back together.**

## 4. Request lifecycle

Using `app.ts` as the source of truth, every incoming request is processed in this exact order:

1. **CORS** (`corsMiddleware`) — rejects origins not in the `ALLOWED_ORIGINS` whitelist.
2. **Helmet** (`helmetMiddleware`) — sets secure HTTP response headers.
3. **Rate limit** (`rateLimitMiddleware`) — 100 requests / 15 minutes per IP.
4. **Body parsing** — `express.json()`.
5. **Public routes** — `POST /api/users` (register) and `POST /api/users/login` are mounted **before** the auth gate, so they need no token.
6. **Auth gate** (`authMiddleware`) — from this point on, every route requires a valid JWT. It decodes the token and attaches `req.user = { id, role }`.
7. **Feature routes** — `/api/admin`, `/api/departments`, `/api/positions`, `/api/vacancies`, `/api/candidates`, `/api/dashboard`.
8. **404 handler** (`notFoundMiddleware`) — for unmatched routes.
9. **Global error handler** (`errorHandler`) — the single place that turns thrown errors into HTTP responses (see [§10](#10-error-handling--response-envelopes)).

Controllers are wrapped so that thrown/rejected errors propagate to the global handler instead of crashing the process. The helper `catchAsync` (`src/lib/catchAsync.ts`) wraps an async handler and forwards any rejection to `next()`:

```ts
export const catchAsync = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
```

## 5. Project structure

```
src/
├── app.ts               # Builds the Express app (no listen) — imported by tests
├── index.ts             # The only entrypoint that calls app.listen
├── routes/              # Endpoint definitions + middleware wiring (per resource)
├── controllers/         # Request/response orchestration + tenant scoping
├── services/            # Reusable business logic (CV dedup, Cloudinary, dashboard…)
├── prompts/             # OpenAI call wrappers (extractCv, matchEngine, autoComplete)
├── validations/         # Zod schemas for body/params/query (per resource)
├── middlewares/
│   ├── auth/            # JWT auth + RBAC role guard
│   ├── error/           # Global error handler + 404 handler
│   ├── security/        # CORS, Helmet, rate limiting
│   ├── upload/          # Multer (in-memory PDF uploads)
│   └── validation/      # Generic Zod-applying middleware
├── utils/               # Deterministic scoring engine, CV hashing, default departments
├── lib/                 # Prisma client, catchAsync, response helper, pdf wrapper, Cloudinary config
├── types/               # Shared TypeScript types & ambient declarations
└── tests/               # Jest/Supertest suites + helpers (mirrors the source tree)

prisma/
├── schema.prisma        # Data model (MySQL)
├── migrations/          # Migration history (11 migrations)
└── seed.ts              # Seeds admin@admin.ai / Admin123 + default departments

scripts/
└── test.ts              # Custom test runner (target guard, name shortcut, external prompt)
```

## 6. Domain model & database schema

The schema lives in `prisma/schema.prisma` (MySQL). Six models and five enums.

### Enums

| Enum | Values |
| --- | --- |
| `UserRole` | `ADMIN`, `USER` |
| `EducationLevel` | `NONE`, `HIGH_SCHOOL`, `BACHELOR`, `TECHNICAL`, `UNIVERSITY`, `MASTER`, `DOCTORATE` |
| `VacancyStatus` | `ACTIVE`, `PAUSED`, `CLOSED` |
| `CandidateStatus` | `DISPONIBLE`, `CONTRATADO` |
| `ApplicationStatus` | `PENDIENTE`, `EN_PROCESO`, `SELECCIONADO`, `RECHAZADO` |

### Models

- **`User`** — the tenant (HR admin / recruiter). Owns departments, positions, vacancies and candidates. `email` is unique; `password` is a bcrypt hash; `role` defaults to `USER`.
- **`Department`** — groups positions under a business unit. `@@unique([title, userId])` (a title is unique per tenant), indexed by `userId`.
- **`Position`** — the job-requirements baseline the AI evaluates candidates against: `role`, `yearsOfExperience` (Int, `≥ 0`), `description` (Text), skill arrays stored as **JSON** (`technicalSkills`, `optionalTechnicalSkills`, `softSkills`, `languages`), `educationLevel` (enum), `educationArea`, and an optional `positionPdfUrl` (Cloudinary). **`department` relation is `onDelete: Cascade`** — deleting a Department cascades to its Positions (see [§20](#20-known-issues--conventions)).
- **`Vacancy`** — an active opening tied to a Position: `title`, `availableSlots`, `startDate`/`endDate`, `status` (default `ACTIVE`). Cascades on Position delete and User delete.
- **`Candidate`** — a CV parsed from a PDF: identity + the same structured skill/experience/education fields as a Position, plus `fileUrl` (Cloudinary), a **unique `hash`** (SHA-256 of the CV, for dedup), and `rawApiPayload` (the raw AI JSON, kept for auditing). `status` defaults to `DISPONIBLE`.
- **`MatchResult`** — the deterministic evaluation joining a Candidate to a Vacancy. Stores the total `matchScore` plus a per-criterion breakdown (`hardSkillsScore`, `experienceScore`, `roleScore`, `languagesScore`, `educationScore`, `softSkillsScore`), a `normalizedCandidate` JSON snapshot (frozen at evaluation time for auditability), a `summary`, and optional `redFlags`. **`@@unique([candidateId, vacancyId])`** — a candidate has at most one evaluation per vacancy.
- **`Application`** — defined in the schema (with `ApplicationStatus`) but **has no active routes or controller**. Do not assume an `/api/applications` endpoint exists.

### Indexing strategy

The schema uses composite indexes tuned for the common query paths, e.g. `Vacancy @@index([userId, status])` for dashboards, `Position @@index([userId, createdAt])`, `Candidate @@index([userId, createdAt])`. New queries should be written to use these indexes rather than trigger full table scans. Skill arrays are stored as JSON blobs — the deterministic scoring engine reads them in the application layer rather than filtering inside JSON in SQL.

## 7. Multi-tenancy & data isolation

Every resource **except** `/api/admin/*` is scoped by the authenticated user. `Department`, `Position`, `Vacancy` and `Candidate` all carry a `userId` column, and controllers **filter and write by `req.user!.id`** on every operation.

Consequences:

- A user can never read or modify another user's data. A cross-tenant `:id` returns **`404`, not `403`** — the API does not reveal whether the resource exists for another tenant.
- Cross-entity relationships are validated against the tenant before writing. Example: creating a Vacancy checks that the `departmentId` belongs to the caller, that the department has at least one Position, and that the `positionId` belongs to that department — otherwise it rejects with `404`/`400`.

## 8. Authentication & authorization (RBAC)

**Authentication** — JWT bearer tokens.

- A token is issued at `POST /api/users/login` and contains `{ userId, role }`.
- `authMiddleware` (`src/middlewares/auth/auth.middleware.ts`) requires an `Authorization: Bearer <token>` header, verifies it with `JWT_SECRET`, checks the payload has both `userId` and `role`, and attaches `req.user = { id, role }`.
- Failure modes all return `401` with a specific message: missing/`Bearer`-less header → `Unauthorized`; malformed token → `Malformed Token`; expired → `Session expired`; otherwise → `Invalid or expired token`.

**Authorization (RBAC)** — two roles, `USER` and `ADMIN`.

- The role guard (`src/middlewares/auth/roleMiddleware.ts`) protects `/api/admin/*`. A `USER` hitting an admin route gets `403`.
- Admin endpoints aggregate across **all** tenants and never use `req.user.id` as a foreign key — they are the one exception to tenant scoping.

## 9. Validation layer (Zod)

Every external input (`req.body`, `req.params`, `req.query`) is validated **before** it reaches a controller. The generic middleware (`src/middlewares/validation/validate.middleware.ts`) parses a single object `{ body, params, query }` against a Zod schema and, on success, **replaces `req.body/params/query` with the parsed (coerced & sanitized) values**:

```ts
const parsed = schema.parse({ body: req.body, params: req.params, query: req.query });
req.body = parsed.body; // coerced values flow downstream
```

On failure it forwards the `ZodError` to the global handler, which returns a structured `400` (see [§10](#10-error-handling--response-envelopes)). Schemas live in `src/validations/` per resource. Notable rules:

- **Password:** 10–100 chars, at least one uppercase, one lowercase, one digit.
- **Email:** normalized to lowercase + trimmed.
- **`Position.yearsOfExperience`:** integer `≥ 0` (accepts `0` for entry-level roles; coerced from string).
- **`Position.educationArea` conditional rule:** required unless `educationLevel` is `NONE`/`HIGH_SCHOOL` — see [§20](#20-known-issues--conventions).

## 10. Error handling & response envelopes

### Global error handler

`src/middlewares/error/errorHandler.middleware.ts` is the **single** place that maps thrown errors to HTTP responses:

| Thrown error | HTTP status | Body `error` |
| --- | --- | --- |
| `ZodError` | `400` | `"Validation error"` + `details[]` (field/message) |
| Prisma `P2002` (unique constraint) | `409` | `"A record with this data already exists"` |
| Prisma `P2025` (record not found) | `404` | `"Record not found"` |
| Other `PrismaClientValidationError` / known request error | `400` | `"Invalid data sent to the database"` |
| Any error carrying a `statusCode` | that code | the message (or generic in prod) |
| Anything else | `500` | `"Internal server error"` |

**Log severity matches real severity:** anything resolving to `5xx` (and the `headersSent` edge case) is logged via `console.error`; expected `4xx` client errors are logged via `console.warn`. In production (`NODE_ENV=production`) a `5xx` never leaks the internal message — it always returns `"Internal server error"`. In development the real message is returned to aid debugging.

### Success response shapes (and a known inconsistency)

Most controllers respond directly:

```json
{ "success": true, "data": { ... } }
```

But endpoints that use the helper `sendResponseOr404` (`src/lib/responseHandler.ts`) **double-wrap** the success case:

```json
{ "response": { "success": true, "data": { ... } } }
```

and its 404 case returns `{ "success": false, "error": "<Entity> not found" }`. This inconsistency is intentional-for-now and documented; consumers should check the exact shape per endpoint in [`api-documentation.md`](./api-documentation.md). Validation errors always add a `details` array:

```json
{ "success": false, "error": "Validation error", "details": [{ "field": "…", "message": "…" }] }
```

## 11. The CV processing pipeline

Triggered by `POST /api/vacancies/:id/upload` (`multipart/form-data`, field `pdfs`, up to 100 files, max 5MB each, `application/pdf` only). Each file is processed **independently with a concurrency cap of 5** (`p-limit(5)`) — one failing file never blocks the batch. For each PDF:

1. **Dedup first (SHA-256).** `findExistingCandidateByCv` hashes the raw PDF buffer and looks up an existing `Candidate` by `hash`. If found, the pipeline **short-circuits** and returns the existing candidate — no text extraction, no OpenAI call, no Cloudinary upload.
2. **Text extraction.** `extract()` (from `src/lib/pdfWrapper.ts`) runs `pdf-parse`. The wrapper adds a **bounded retry (up to 6 attempts, 50ms apart)** because `pdf-parse` is non-deterministic in tight in-process bursts (intermittent "bad XRef entry" on valid PDFs); a genuinely corrupt PDF still fails every attempt and rethrows unchanged.
3. **Quality gate.** If the extracted text is `< 500` characters (scanned/corrupt/illegible), the file is rejected with an error entry — without blocking the rest of the batch.
4. **AI extraction.** The text is sent to OpenAI, which returns a structured candidate profile.
5. **Non-CV rejection.** `assertCandidateIsCv` (`candidateValidation.service.ts`) rejects the file if the AI returned an **all-blank profile** (empty text fields, `educationLevel NONE`, no skills, `yearsOfExperience 0`) — i.e. the PDF was not a resume — **before** spending a Cloudinary upload. A real CV missing a single field is never rejected (all meaningful fields must be blank).
6. **Cloudinary upload.** The original PDF is stored; the URL is saved on the candidate.
7. **Persistence.** A `Candidate` row is created with the structured profile, the `hash`, the Cloudinary URL and the raw AI JSON (`rawApiPayload`). A race that inserts a duplicate hash is caught (`P2002`) and resolves to the existing candidate.

**Evaluation is a separate, explicit step** (`POST /api/vacancies/:id/evaluations`): it runs the matching engine over the vacancy's candidates that don't yet have a `MatchResult`, again with `p-limit(5)`.

## 12. AI integration (OpenAI)

The OpenAI client is a thin singleton (`src/services/openai.service.ts`) built from `OPENAI_API_KEY`. Two call sites, both using the **Responses API with server-stored prompt IDs** and the model `gpt-5.4-nano`, and both forcing JSON output via a `system` message ("Return only valid JSON"):

- **`extractCandidateData`** (`src/prompts/extractCv.prompt.ts`) — turns raw CV text into a structured `CandidateExtracted` profile.
- **`matchEngine`** (`src/prompts/matchEngine.prompt.ts`) — given the Position and the extracted candidate, returns a `NormalizedCandidate` (which also carries an `aiAnalysis` block with `projectHighlights`, `redFlags`, and a `rawTextSummary`).
- **`autoCompletePosition`** (`src/prompts/`) — backs `POST /api/positions/complete`, which extracts Position fields from a job-description PDF (no DB write).

**Key principle:** the AI only **structures and normalizes** data. It never assigns the match score. Any OpenAI failure is wrapped as `"Failed to process resume with AI"` and, in the upload pipeline, is contained to the single file.

## 13. The scoring / matching engine

`src/utils/scoringEngine.ts` — `calculateMatchScore(position, normalizedCandidate)` — is a **pure, deterministic function** returning a `totalScore` (0–100, rounded) plus a per-criterion `breakdown`. It reads only the JSON produced by the AI extraction phase, so the ranking is math-based, not hallucinated.

**Weights (sum to 100%):**

| Criterion | Weight | How it's computed |
| --- | --- | --- |
| Technical (hard) skills | 30% | Linear ratio `matched / required × 30`. If the Position lists no required skills, full marks. Matching is case-insensitive. |
| Experience | 20% | Full 20 if candidate years ≥ required. Otherwise the **"lifesaver"**: if the AI flagged `projectHighlights`, award half (10) instead of a proportional cut; else proportional ratio (0 if the requirement is `0`). |
| Role | 15% | Binary: exact (case-insensitive) role-string match → 15, else 0. |
| Languages | 15% | Linear ratio `matched / required × 15` (full marks if none required). |
| Education | 10% | Levels ranked `NONE(0) … DOCTORATE(6)`. Full 10 if the Position requires `NONE` or the candidate's level ≥ the required level; otherwise proportional. |
| Soft skills | 10% | Linear ratio `matched / required × 10` (full marks if none required). |

**Special rules called out in the code:**

- **"Lifesaver":** a candidate short on formal years but with strong personal projects gets partial experience credit instead of an automatic reject.
- **"Guillotine":** a missing mandatory hard skill drags the hard-skills contribution down proportionally (it is the largest weight), pushing the candidate down the ranking.

In the evaluation controller, each criterion's rounded score plus the total is persisted to a `MatchResult`, together with the frozen `normalizedCandidate` snapshot, the AI `summary`, and any `redFlags`.

## 14. Dashboard & admin analytics

Two distinct analytics surfaces — **do not confuse them**:

- **`GET /api/dashboard`** — **per-tenant** metrics for the authenticated user: totals (positions, departments, candidates, open vacancies), a vacancy-status breakdown with percentages, and monthly activity. The monthly activity is computed with a single raw SQL query (`prisma.$queryRaw`) that `UNION ALL`s Position/Candidate/Vacancy creation events and groups them by `YYYY-MM` — one round trip instead of three (`src/services/dashboard.service.ts`).
- **`GET /api/admin/stats`** — **platform-wide** totals across every tenant (users, candidates, positions, vacancies, active/closed vacancies). Admin-only.

## 15. Security layer

- **Passwords** — hashed with `bcrypt` before persistence; login never reveals which field was wrong (generic `401`).
- **JWT** — signed with `JWT_SECRET`; payload validated on every request.
- **CORS** — explicit origin whitelist from `ALLOWED_ORIGINS` (comma-separated). Requests with no `Origin` (e.g. same-origin/server-to-server) are allowed; unknown origins are rejected. `credentials: true`; methods limited to `GET/POST/PUT/DELETE/PATCH/OPTIONS`.
- **Helmet** — secure HTTP headers on every response.
- **Rate limiting** — 100 requests / 15 min per IP (`express-rate-limit`), standard headers on.
- **Upload hardening** — Multer uses in-memory storage, a 5MB per-file limit, and a `application/pdf`-only file filter.
- **Production error masking** — `5xx` responses never expose internal messages in production.

## 16. Configuration & environment variables

There is currently **no committed `.env.example`**. Create a `.env` in the project root:

```env
# MySQL init (used by docker-compose for the local DB container)
MYSQL_ROOT_PASSWORD=
MYSQL_DATABASE=
MYSQL_USER=
MYSQL_PASSWORD=

# Prisma connection (points at the Dockerized MySQL; host port 3307 → container 3306)
DATABASE_URL=

# Node / Express core
NODE_ENV=development
PORT=3000
JWT_SECRET=

# External integrations
OPENAI_API_KEY=
CLOUDINARY_URL=
ALLOWED_ORIGINS=http://localhost:5173
```

Additional env files: `.env.production` (VPS) and `.env.test` (test DB + placeholder external keys — see [§18](#18-testing)).

## 17. Running locally

Follow the project's infrastructure split — **Docker runs MySQL only**, the backend runs natively.

```bash
npm install                                       # install dependencies

docker compose -f docker-compose.local.yml up -d  # start MySQL only

# configure your .env (see §16)

npx prisma generate                               # generate the Prisma client
npx prisma migrate dev                            # apply the schema to your local DB
npx prisma db seed                                # (optional) admin@admin.ai / Admin123 + default departments

npm run dev                                        # start the dev server (hot reload, tsx watch)
```

The server listens on `http://localhost:<PORT>` (default `3000`).

**Scripts (`package.json`):**

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server with hot reload (`tsx watch`) |
| `npm run build` | Compile TypeScript to `dist/` (`tsconfig.build.json`, tests excluded) |
| `npm start` | Run the compiled build (`node dist/index.js`) — production |
| `npm run type-check` | `tsc --noEmit` — **the CI gate**; a type error stops the deploy pipeline |
| `npm run check-js` | Type-check the remaining legacy `.js` files |
| `npm test <target>` | Custom runner — requires an explicit target (see [§18](#18-testing)) |

## 18. Testing

- **Stack:** Jest + Supertest, transpiled by `babel-jest` (not `ts-jest`), so tests behave identically via `npm test`, CI, or an editor's single-test runner. Config in `jest.config.js`.
- **Serial execution (`maxWorkers: 1`):** all suites share one physical `talentmatch_test` database and truncate it between tests (global `beforeAll`/`afterEach`/`afterAll` in `jest.setup.afterEnv.ts`). Parallel runs would let one suite's cleanup wipe another's fixtures.
- **Safety guard:** `jest.setup.ts` loads `.env.test` and **hard-fails if `DATABASE_URL` doesn't contain `talentmatch_test`**, so a misconfigured environment can never truncate dev/prod data. The test DB/user is created manually per machine (not part of repo automation).
- **JWT test helper:** `src/tests/utils/jwt.util.ts` mints real JWTs (`authHeaderFor({ userId, role })`) signed with the test secret — no login round trip. It also exposes `expiredTestToken` and `tokenWithWrongSecret`.
- **Test tree:** suites live under `src/tests/` mirroring the source (`src/routes/admin.ts` → `src/tests/routes/admin.test.ts`), matched by `src/**/*.test.ts` — kept out of the production build.
- **Custom runner (`scripts/test.ts`, via `tsx`):** `npm test` **requires an explicit target** (the shared DB is not meant for casual full-suite runs). A **bare name is a shortcut** anchored to the file name (`npm test positions` → `positions.test.ts`) — anchoring matters on Windows, where the absolute path starts with `C:\Users\...`. Full paths and Jest flags (`-t "…"`) pass through untouched.
- **Opt-in external-service tests:** happy paths that call OpenAI/Cloudinary (`positions.test.ts`, `vacancies.test.ts`) are `describe.skip`-gated. The runner prompts in an interactive shell and always skips them non-interactively (CI); `--external`/`--no-external` bypass the prompt. Real keys are overlaid at runtime from `.env` for only `OPENAI_API_KEY`/`CLOUDINARY_URL` — `DATABASE_URL`/`JWT_SECRET` are never overridden.
- **`npm test upload`** is a throughput benchmark (not a unit test): it forces real credentials + `KEEP_TEST_DATA=true`, generates 100 unique CV PDFs, uploads them in one request, and logs ms-per-CV. It also proves the 100-file-per-request cap (`upload.array("pdfs", 100)` rejects the 101st before the controller runs).

## 19. CI/CD & deployment

`.github/workflows/deploy.yml` runs on `main`:

1. **Validation gate:** `npm ci` + `npm run type-check`. If the project doesn't compile, the pipeline stops here — **type-check is the deploy gate** (there is no test gate yet).
2. **Deploy (only if the gate passes):** SSH into the VPS, `git reset --hard origin/main`, rebuild the image with `docker compose`, run `npx prisma migrate deploy` inside the running container, and prune old images.

On the VPS **everything runs containerized** (backend + MySQL via `docker-compose.yml`), unlike local where only the DB is Dockerized.

## 20. Known issues & conventions

- **`educationArea` "NONE" rule:** on `POST /api/positions`, if `educationLevel` is `NONE`/`HIGH_SCHOOL` and `educationArea` is omitted, the backend auto-assigns `"N/A"` (never `null`/`""`). For the levels that require an area (`BACHELOR`…`DOCTORATE`), omitting it returns `400 "Education area is required for this education level"`. On `PUT` (partial update) an omitted `educationArea` is left untouched — the `"N/A"` sentinel is not re-applied. Frontends should render `"N/A"` as "Not applicable".
- **`PUT` is a real partial patch:** on `PUT /api/positions/:id` and `PUT /api/vacancies/:id`, only fields present in the body are updated; omitted fields keep their stored value. To clear an optional array you must send it explicitly.
- **`Department` delete cascades:** `Position.department` is `onDelete: Cascade`, so deleting a Department deletes its Positions instead of being blocked. Making deletion blocking would require an `onDelete: Restrict` schema change + a new migration.
- **Response-shape inconsistency:** `sendResponseOr404` double-wraps success as `{ response: { success, data } }`; the rest return `{ success, data }`. Tracked, not yet unified.
- **Multer errors surface as `500`:** a file-type/size/count violation throws a generic `Error`/`MulterError` with no `statusCode`, so the global handler falls through to `500` rather than a clean `4xx`. The limit *is* enforced; only the status code is imperfect.
- **`Application` model is dormant:** present in the schema, no routes/controller.
- **English-only code comments:** all inline/block/JSDoc comments must be in English, regardless of the working language (project convention).
- **No `any` in TypeScript:** strict typing is enforced; the codebase is mid-migration from JS to TS.

---

_This document reflects the state of the `main` branch at the time of writing. When the backend or the database schema changes, update this document (and its Spanish counterpart `../es/backend-documentation.md`) alongside the code._
