# 🗂️ Issue Backlog by Flow — TalentMatch Frontend

> Companion to [`bugs.md`](./bugs.md). Here bugs are **grouped by flow** following [`api-documentation.md`](./api-documentation.md) and ordered from **most to least important**.
>
> 🇪🇸 Versión en español: [`../es/issues.md`](../es/issues.md)
>
> **Premise:** the backend is finished and correct. Everything below is frontend work.
>
> **Last verified against the code: 2026-07-09.**

## Priority legend

| Level  | Meaning                                                                                                    |
| ------ | ---------------------------------------------------------------------------------------------------------- |
| **P0** | Invisible bugs (the UI promises data the API doesn't return) and previous-sprint validation. Do first.     |
| **P2** | Polished screens, consistent pagination, orphan endpoints and housekeeping. Nothing blocking.              |

The previous backlogs (P0–P4 covering EPICs 1–11) were replaced on 2026-07-09 after closing the P0/P1/P2/P3 sprint and running a full review of the app. History is still available in `git log` — this index only reflects the work that's actually **pending today**.

## Detailed documents per priority

| File                             | Priority                       | EPICs                                                                       | Status     |
| -------------------------------- | ------------------------------ | --------------------------------------------------------------------------- | ---------- |
| [`issues/P0.md`](./issues/P0.md) | **P0** — blockers              | 12 (data the UI promises but the API doesn't return), 13 (sprint validation) | ⏳ Pending |
| [`issues/P2.md`](./issues/P2.md) | **P2** — polish and housekeeping | 14 (UI robustness), 15 (responsive), 16 (pagination), 17 (orphan endpoints), 18 (housekeeping) | ⏳ Pending |

## Current state

**Previous sprint (commits `80263da`…`f6feba2`, 2026-07-08 → 2026-07-09):** closed at code level but **not verified in the browser** (see P0 13.1). The main flows are connected: dashboard on `/dashboard`, admin panel on `/admin/*`, vacancy/position CRUD, match results, role-based auth.

**Current focus:** the invisible bugs surfaced by the review — `CandidateDetailsModal` with 6 bars at zero, `HistoryTable` with a dead CV link, and the misleading copy on the "Hire" button. None of them break compile or build, but they erode trust in what the UI shows the user.

## Priority summary

| EPIC | Flow                                       | Priority | Status     | Blocked on                    |
| ---- | ------------------------------------------ | -------- | ---------- | ----------------------------- |
| 12   | Data the UI promises but the API doesn't   | **P0**   | ⏳ Pending | Backend contract (12.1)       |
| 13   | Previous sprint validation                  | **P0**   | ⏳ Pending | Dev server + live backend     |
| 14   | UI robustness (labels, fallbacks)          | **P2**   | ⏳ Pending | —                             |
| 15   | Dashboard responsive                       | **P2**   | ⏳ Pending | —                             |
| 16   | Consistent pagination                      | **P2**   | ⏳ Pending | —                             |
| 17   | Orphan endpoints (register, candidates/:id) | **P2**   | ⏳ Pending | Product decision              |
| 18   | Pre-existing debt + housekeeping           | **P2**   | ⏳ Pending | —                             |
