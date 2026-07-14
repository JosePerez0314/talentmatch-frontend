# Documentation Index — TalentMatch AI Frontend

> 🇪🇸 Versión en español: [`../es/README.md`](../es/README.md) · ⬆️ Language picker: [`../README.md`](../README.md)

This folder holds every document describing the TalentMatch AI **frontend**: what it is, how it's built, what's broken, and what to do next. Each document has a mirror in `docs/es/`.

**Last full verification against the source code: 2026-07-14.**

---

## Where to start

| If you want to…                                | Read                                                 |
| ---------------------------------------------- | ---------------------------------------------------- |
| Understand the project from zero               | [`front-documentation.md`](./front-documentation.md) |
| Call the backend                               | [`api-documentation.md`](./api-documentation.md)     |
| Know what's broken right now                   | [`bugs.md`](./bugs.md)                               |
| Pick up the next task                          | [`issues.md`](./issues.md) → [`issues/`](./issues/)  |
| Find out what changed recently and why         | [`last-changes.md`](./last-changes.md)               |

---

## The documents

### 📘 [`front-documentation.md`](./front-documentation.md)

**The main reference.** Describes the frontend's *actual* state, verified against the source: real technology stack, folder layout, routing and route guards, the hand-rolled `fetch` client and how it unwraps the backend envelope, authentication and the session watchdog, the API service layer, the type model, and a page-by-page inventory of which screens are connected to the API and any caveats worth knowing.

Start here. It also lists the technical debt and the conventions new code must follow.

### 🔌 [`api-documentation.md`](./api-documentation.md)

**The backend contract**, endpoint by endpoint: authentication, multi-tenant isolation, request/response shapes, enums, validation rules, and the `sendResponseOr404` double-envelope quirk.

> ⚠️ This describes the *backend*. The source of truth lives in the `talentmatch-backend` repository — this is a working copy for the frontend team and can drift.

### 🐞 [`bugs.md`](./bugs.md)

**The bug inventory**, swept over every route in `src/App.tsx`. Every screen is now wired to the real API — what remains is a short list of **minor, non-blocking** items: confirmed code bugs, a couple of duplicated/partially-orphaned screens, dead code, stale comments, and environment/config gaps. Includes an appendix of already-resolved bugs so they don't get reopened, and a section on **what the tooling does not catch** (a green build does not mean a correct UI).

The premise throughout: the backend is finished and correct, so everything here is frontend work.

### 🗂️ [`issues.md`](./issues.md)

**The backlog index.** Points to per-screen QA plans in [`issues/`](./issues/) — each one documents that screen's data flow, identified bugs, and a full test checklist (including Figma-alignment review: margins, typography, responsive behavior). Screens without a dedicated plan yet are cross-referenced to the relevant section of `bugs.md`.

| File                                                          | Screen                  |
| ---------------------------------------------------------------- | -------------------------- |
| [`issues/dashboard.md`](./issues/dashboard.md)                  | Dashboard                 |
| [`issues/admin-panel.md`](./issues/admin-panel.md)              | Admin Panel               |
| [`issues/position-history.md`](./issues/position-history.md)   | Position History          |
| [`issues/vacancy-history.md`](./issues/vacancy-history.md)     | Vacancy History           |
| [`issues/department-history.md`](./issues/department-history.md) | Department History      |
| [`issues/candidates-history.md`](./issues/candidates-history.md) | Candidates History      |
| [`issues/evaluations-history.md`](./issues/evaluations-history.md) | Evaluations            |

> The earlier `issues/P0.md`–`P3.md` EPIC-based backlog was replaced by these per-screen plans on 2026-07-13 — those files no longer exist in this repo.

### 📋 [`last-changes.md`](./last-changes.md)

**The engineering log**, newest first. Explains not just *what* changed but *why* — the API alignment audit, the envelope-unwrapping cleanup, the earlier P0 fixes, the admin/dashboard real-API rewiring, and the most recent documentation refresh.

---

## Current state at a glance

- ✅ **Every screen calls the real API.** No screen remains mocked (previously: Dashboard and the Admin Panel ran on fake data — both are now wired to `dashboardService`/`adminService`).
- ⚠️ **Minor caveats, not blockers:** New/Edit Vacancy ignores a reset callback on its success screen; two pairs of overlapping/partially-unlinked legacy screens (`Resultados` vs. `AdvancedResults`, `CVHistory` vs. `CandidatesHistory`); a handful of dead code and stale comments. Full detail in [`bugs.md`](./bugs.md).

---

## Conventions

- These documents describe **the code as it is**, not as it should be. When they disagree with the source, **the source wins** — fix the document.
- Every change that touches routing, the service layer, types, or auth should update `front-documentation.md` and, when relevant, `bugs.md` / `issues.md`.
- Keep both languages in sync: edit `docs/en/` and `docs/es/` in the same commit.
- Working rules for contributors (and for Claude Code) live in [`../../CLAUDE.md`](../../CLAUDE.md) at the repo root.
