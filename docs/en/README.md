# Documentation Index — TalentMatch AI Frontend

> 🇪🇸 Versión en español: [`../es/README.md`](../es/README.md) · ⬆️ Language picker: [`../README.md`](../README.md)

This folder holds every document describing the TalentMatch AI **frontend**: what it is, how it's built, what's broken, and what to do next. Each document has a mirror in `docs/es/`.

**Last full verification against the source code: 2026-07-09.**

---

## Where to start

| If you want to…                                | Read                                                 |
| ---------------------------------------------- | ---------------------------------------------------- |
| Understand the project from zero               | [`front-documentation.md`](./front-documentation.md) |
| Call the backend                               | [`api-documentation.md`](./api-documentation.md)     |
| Know what's broken right now                   | [`bugs.md`](./bugs.md)                               |
| Pick up the next task                          | [`issues.md`](./issues.md) → `issues/P0–P3.md`       |
| Find out what changed recently and why         | [`last-changes.md`](./last-changes.md)               |

---

## The documents

### 📘 [`front-documentation.md`](./front-documentation.md)

**The main reference.** Describes the frontend's *actual* state, verified against the source: real technology stack, folder layout, routing and route guards, the hand-rolled `fetch` client and how it unwraps the backend envelope, authentication and the session watchdog, the API service layer, the type model, and a page-by-page inventory of which screens are genuinely connected to the API and which still run on mock data.

Start here. It also lists the technical debt and the conventions new code must follow.

### 🔌 [`api-documentation.md`](./api-documentation.md)

**The backend contract**, endpoint by endpoint: authentication, multi-tenant isolation, request/response shapes, enums, validation rules, and the `sendResponseOr404` double-envelope quirk.

> ⚠️ This describes the *backend*. The source of truth lives in the `talentmatch-backend` repository — this is a working copy for the frontend team and can drift.

### 🐞 [`bugs.md`](./bugs.md)

**The bug inventory**, swept over every route in `src/App.tsx`. Grouped into critical functional bugs, unconnected (mock) screens, UI/UX/responsive problems, and code-quality items. Includes an appendix of already-resolved bugs so they don't get reopened, and a section on **what the tooling does not catch** (a green build does not mean a correct UI).

The premise throughout: the backend is finished and correct, so everything here is frontend work.

### 🗂️ [`issues.md`](./issues.md)

**The prioritized backlog index.** The same problems as `bugs.md`, but grouped by *flow* (data layer, routing, positions, vacancies, uploads, results, dashboard, admin, auth, polish) and ordered P0 → P3. Each EPIC links to its detailed write-up:

| File                             | Priority                   | Contents                                             | Status                       |
| -------------------------------- | -------------------------- | ---------------------------------------------------- | ---------------------------- |
| [`issues/P0.md`](./issues/P0.md) | **P0** — blockers          | EPIC 1 (data layer), 2 (routing), 3 (create position) | ✅ Closed (historical record) |
| [`issues/P1.md`](./issues/P1.md) | **P1** — broken flows      | EPIC 4 (vacancies), 5 (CV upload), 6 (results)        | 🔨 In progress               |
| [`issues/P2.md`](./issues/P2.md) | **P2** — secondary screens | EPIC 7 (dashboard), 8 (admin), 9 (auth/role)          | 🔨 In progress               |
| [`issues/P3.md`](./issues/P3.md) | **P3** — polish            | EPIC 10 (UI/UX and code quality)                      | ⏳ Pending                   |

Each detailed file gives exact files, line numbers, code snippets, and acceptance criteria.

### 📋 [`last-changes.md`](./last-changes.md)

**The engineering log**, newest first. Explains not just *what* changed but *why* — the API alignment audit, the envelope-unwrapping cleanup, the P0 fixes, and the most recent session (build unblocked, docs restructured).

---

## Current state at a glance

- ✅ **Working end to end:** Login, Departments (create + CRUD history), Create Position, Positions/Vacancies/CVs histories.
- 🟡 **Connected, pending work:** New/Edit Vacancy, Upload CV, Results.
- 🔴 **No real API:** Dashboard, Advanced Results, Candidates History, Evaluations, Admin Panel.

⚠️ **The trap to know about:** `src/services/api/admin.api.ts` exists and the Admin Panel *looks* connected — but the service is a simulation (`MOCK_USERS` + `setTimeout`) that never calls `apiClient`. See [`bugs.md §1.1`](./bugs.md) and [`issues/P2.md §8.1`](./issues/P2.md).

---

## Conventions

- These documents describe **the code as it is**, not as it should be. When they disagree with the source, **the source wins** — fix the document.
- Every change that touches routing, the service layer, types, or auth should update `front-documentation.md` and, when relevant, `bugs.md` / `issues.md`.
- Keep both languages in sync: edit `docs/en/` and `docs/es/` in the same commit.
- Working rules for contributors (and for Claude Code) live in [`../../CLAUDE.md`](../../CLAUDE.md) at the repo root.
