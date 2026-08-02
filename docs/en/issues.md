# 🗂️ Issue Backlog — TalentMatch Frontend

> Companion to [`bugs.md`](./bugs.md). Issues here are grouped **by screen**, with a data-architecture plan, identified bugs, and a QA test checklist (including Figma alignment).
>
> 🇪🇸 Versión en español: [`../es/issues.md`](../es/issues.md)
>
> **Premise:** the backend is finished and correct. Everything below is frontend work.
>
> **Last verified against the code: 2026-08-01.**

## What changed from earlier versions

The previous backlogs (`issues/P0.md`–`P3.md`, organized by EPICs) were **replaced on 2026-07-13** by per-screen QA plans — `P0.md`–`P3.md` no longer exist in this repository (if you see a link to them in an older document, it's broken: use the tables below instead). The original P0–P3 sprint is already closed; the current focus is a Figma-alignment review (margins, responsiveness, test checklists) screen by screen.

## Per-screen QA plans

Each file documents: data architecture/flow, identified bugs (kebab-menu overflow, blank username, `PAUSED` status handling, touch accessibility, margin inconsistencies), and a full test checklist.

| File                                                     | Screen                        | Route(s)                                                  |
| ----------------------------------------------------------- | -------------------------------- | -------------------------------------------------------------- |
| [`issues/dashboard.md`](./issues/dashboard.md)             | Dashboard                       | `/dashboard`                                                    |
| [`issues/admin-panel.md`](./issues/admin-panel.md)         | Admin Panel                     | `/admin`                                                        |
| [`issues/position-history.md`](./issues/position-history.md) | Position History              | `/position-history`                                             |
| [`issues/vacancy-history.md`](./issues/vacancy-history.md) | Vacancy History                | `/vacancy-history`                                              |
| [`issues/department-history.md`](./issues/department-history.md) | Department History      | `/department-history`                                           |
| [`issues/candidates-history.md`](./issues/candidates-history.md) | Candidates History      | `/candidates-history`                                           |
| [`issues/evaluations-history.md`](./issues/evaluations-history.md) | Evaluations            | `/evaluations-history`                                          |

## Screens without a dedicated QA plan yet

These screens don't have their own per-screen QA file. Their known code bugs are in [`bugs.md`](./bugs.md):

| Screen                        | Route(s)                                            | See in `bugs.md`               |
| -------------------------------- | -------------------------------------------------------- | ----------------------------------- |
| Login                          | `/login`                                                 | —                                    |
| New/Edit Vacancy               | `/vacancy`, `/vacancy/edit/:id`                           | §1.1 (ignored `onReset`)             |
| Upload CV                      | `/uploadcv`                                              | —                                    |
| CV History (legacy)            | `/cv-history`                                            | §2.2 (duplicated screen)             |
| Results (legacy)               | `/resultados`, `/resultados/:id`                          | §1.2, §2.1                           |
| Advanced Results               | `/advanced-results/:id`                                   | §1.3 (statuses not persisted)        |
| Create Position                | `/position`                                              | —                                    |
| Create Department              | `/department`                                            | —                                    |

## Cross-cutting code bugs

Bugs that aren't specific to one screen's margins/responsiveness, but are logic issues (ignored props, parsing, dead code, configuration), live in [`bugs.md`](./bugs.md) — they aren't duplicated here. They include: the ignored `onReset` prop in `VacancySuccess`, the parsing bug in `CandidateMatchRow` (legacy screen), the duplicated screens (`Resultados`/`AdvancedResults`, `CVHistory`/`CandidatesHistory`), orphaned components, and the missing fallback/`.env.example` for `VITE_API_URL`.

## Current state

**Every screen is connected to the real API** (see `front-documentation.md §8`). The remaining work is of two kinds:

1. **Figma-alignment QA** (margins, typography, responsiveness) — covered by the 7 per-screen plans above.
2. **Minor bug and technical-debt cleanup** — covered by `bugs.md`.

Neither blocks normal use of the application.
