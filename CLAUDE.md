# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Working rules (read first — non-negotiable)

- **Always ask for permission/validation before doing anything.** Do not edit files, run mutating commands, commit, push, install packages, or otherwise change the project without first explaining what you intend to do and getting explicit confirmation from the user. When in doubt, ask. Read-only inspection to answer a question is fine; any action that changes state requires prior approval.
- **Never read `.env` files** (`.env`, `.env.*`, or any environment/secret file). Do not open, `cat`, `grep`, print, or otherwise access their contents. If you need to know which variables exist, ask the user or infer from how `import.meta.env.*` is used in the code — do not read the file.

## Project

TalentMatch AI frontend: a recruitment dashboard SPA for uploading CVs, managing vacancies/positions/departments, viewing AI-scored candidate rankings, and administering users. UI copy and most code comments are in Spanish; identifiers mix Spanish and English.

> Note: `README.md` describes an _aspirational_ stack (React 18, BEM CSS, Axios, Redux, Zod) that does **not** match the code. Trust this file and the source, not the README. The real stack is React 19, Tailwind v4, a hand-rolled `fetch` client, and React Context.

## Commands

```bash
npm run dev      # Vite dev server
npm run build    # Production build (fails on type errors, see below)
npm run lint     # ESLint
npm run preview  # Serve the built dist/
```

There is **no test runner** configured — no Jest/Vitest, no test files. "Run the tests" does not apply here; verify changes via `npm run build` (type check) and manual QA in the dev server.

## Type checking

`vite-plugin-checker` runs `tsc` in-process, so **type errors fail both `dev` and `build`** — there is no separate typecheck script. ESLint enforces `@typescript-eslint/no-explicit-any` as an **error**; avoid `any`. (Some older service files still use `any` internally for defensive response parsing — match the stricter, typed style in new code.)

## Architecture

- **Stack:** React 19 + Vite 5 + TypeScript + Tailwind CSS **v4** (via the `@tailwindcss/vite` plugin, configured in CSS). The root `tailwind.config.js` is a legacy v3-style stub and is effectively unused. `react-router-dom` v7 handles routing.
- **Routing (`src/App.tsx`):** `/` redirects to `/login`; `/login` is the only public route. Everything else renders inside **`ProtectedRoute`** (Sidebar + `SessionTimeoutGuard` + `<Outlet />`).
  - **Route protection is active:** `ProtectedRoute` shows a "Verificando sesión…" loader while `loading`, and redirects to `/login` when there is no `user`. Unknown paths fall through to `/dashboard` (which then bounces to login if unauthenticated). Pages behind `ProtectedRoute` can assume a `user` exists.
  - Detail/edit screens reuse a page component across routes via URL params (e.g. `/vacancy` and `/vacancy/edit/:id` → `Vacancy`; `/resultados/:id`, `/advanced-results/:id`, `/evaluations-history/:id`).
- **Admin panel (`src/pages/AdminPanel.tsx`, `src/components/admin/`):** user administration UI composed of `StatsModule`, `UserTableModule`, `RoleUpdateModule`, `UserDeleteModule`. Users have a `role: 'admin' | 'user'` (`src/types/admin.types.ts`). Note this screen currently runs on a simulated loading timer and is not yet wired to a dedicated users API.
- **API layer (`src/services/api/`):** `apiClient.ts` is a thin `fetch` wrapper — it prefixes `VITE_API_URL`, injects `Authorization: Bearer <token>` from `localStorage`, and **unwraps the response `.data` field** when present (returning the whole body otherwise). It treats the backend envelope `{ success, data, error/message }` as the contract and throws `Error` on `!ok`, `success:false`, or HTTP 401. Each domain has its own `*.api.ts` exporting a service object (e.g. `authService.login`, `departmentsApi`, `vacanciesApi`); add new endpoints as methods on these services, not by calling `fetch` directly.
  - Services often do **defensive normalization** on top of `apiClient`: flexibly unwrapping nested shapes (`res.response.data` / `res.data` / raw array), mapping Mongo `_id` → `id`, and translating field names between UI and backend (e.g. departments send/receive `title` but the UI uses `name`). Follow this pattern when a backend shape doesn't match the UI model.
- **Auth (`src/components/context/AuthContext.tsx`):** `AuthProvider` wraps the app. It persists `tm_user` (user object) and `token` separately in `localStorage`; `login(email, token)` derives `username` from the email local-part. Consume via the `useAuth()` hook. (The stored `UserData` does not yet carry a role — the admin UI models roles separately.)
- **Session timeout (`src/components/ui/SessionTimeoutGuard.jsx`):** Global inactivity watchdog mounted in the layout — warns at 9 min, auto-logs-out at 10 min of no `mousemove/keydown/click/scroll`, syncing `lastActivity` across tabs via `localStorage`.
- **Types (`src/types/`):** Per-domain `*.types.ts` files hold the TypeScript contracts for API payloads. Keep API response shapes here.

## Conventions

- **Ongoing JS→TS migration:** the codebase is a mix of `.jsx`/`.tsx` and `.js`/`.ts` (steadily trending toward TS). Write **new** components and modules in TypeScript (`.tsx`/`.ts`) with explicit interfaces; port a file to TS when you make substantial changes to it.
- **Folders:** `pages/` (route-level screens), `components/` (grouped into `admin/`, `cards/`, `modals/`, `ui/`, `Sections/`, `context/`), `layouts/` (Sidebar, Footer), `services/api/`, `types/`, `assets/icons/` (SVGs re-exported through `assets/icons/index.ts`).
- **Styling:** Tailwind utility classes inline in JSX (note existing arbitrary values like `bg-[#F0F0F5]`). There is no BEM/CSS-module system despite what the README claims.
- **Icons:** `lucide-react` and `react-icons` for inline icons, plus local SVGs in `assets/icons/`.

## Environment

The app reads `VITE_API_URL` (with a `http://localhost:5000/api` fallback in `apiClient.ts`) and demo credential vars via `import.meta.env`. Do **not** read the `.env` file to inspect these (see Working rules). `vercel.json` rewrites all non-`/api` paths to `index.html` for SPA routing on Vercel.

## Git & Commit Formatting

**Strict Commit Format (Conventional Commits):** Whenever I explicitly instruct you to generate a commit message or commit a specific set of changes, you MUST strictly adhere to the Conventional Commits specification.

- **Format:** `<type>(<scope>): <subject>`
- **Types allowed:** `feat`, `fix`, `refactor`, `test`, `docs`, `chore`.
- **Examples:** `feat(admin): implement JWT test helper utility`, `fix(db): resolve foreign key constraint in test teardown`, `refactor(auth): migrate token validation to strict TypeScript`.
- When generating the commit message, briefly ensure the subject line accurately reflects the actual architectural or code changes we just discussed.
