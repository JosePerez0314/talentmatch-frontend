# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

TalentMatch AI frontend: a recruitment dashboard SPA for uploading CVs, managing vacancies/positions/departments, and viewing AI-scored candidate rankings. UI copy and most code comments are in Spanish; identifiers mix Spanish and English.

> Note: `README.md` describes an *aspirational* stack (React 18, BEM CSS, Axios, Redux, Zod) that does **not** match the code. Trust this file and the source, not the README. The real stack is React 19, Tailwind v4, a hand-rolled `fetch` client, and React Context.

## Commands

```bash
npm run dev      # Vite dev server
npm run build    # Production build (fails on type errors, see below)
npm run lint     # ESLint
npm run preview  # Serve the built dist/
```

There is **no test runner** configured — no Jest/Vitest, no test files. "Run the tests" does not apply here; verify changes via `npm run build` (type check) and manual QA in the dev server.

## Type checking

`vite-plugin-checker` runs `tsc` in-process, so **type errors fail both `dev` and `build`** — there is no separate typecheck script. ESLint enforces `@typescript-eslint/no-explicit-any` as an **error**; never introduce `any`.

## Architecture

- **Stack:** React 19 + Vite 5 + TypeScript + Tailwind CSS **v4** (via the `@tailwindcss/vite` plugin, configured in CSS). The root `tailwind.config.js` is a legacy v3-style stub and is effectively unused. `react-router-dom` v7 handles routing.
- **Routing (`src/App.tsx`):** All app routes render inside `LayoutWrapper` (Sidebar + `SessionTimeoutGuard` + `<Outlet />`). `/login` is standalone; unknown paths redirect to `/dashboard`.
  - **Route protection is intentionally disabled** — `LayoutWrapper` was stripped of its auth/loading guards so every route is publicly reachable regardless of login state (see the Spanish comments there). Do not assume a logged-in `user` exists inside a page. If you add real auth gating, that's the place.
- **API layer (`src/services/api/`):** `apiClient.ts` is a thin `fetch` wrapper — it prefixes `VITE_API_URL`, injects `Authorization: Bearer <token>` from `localStorage`, and **unwraps the response `.data` field** when present (returning the whole body otherwise). It treats the backend envelope `{ success, data, error/message }` as the contract and throws `Error` on `!ok`, `success:false`, or HTTP 401. Each domain has its own `*.api.ts` exporting a service object (e.g. `authService.login`); add new endpoints as methods on these services, not by calling `fetch` directly.
- **Auth (`src/components/context/AuthContext.tsx`):** `AuthProvider` wraps the app. It persists `tm_user` (user object) and `token` separately in `localStorage`; `login(email, token)` derives `username` from the email local-part. Consume via the `useAuth()` hook.
- **Session timeout (`src/components/ui/SessionTimeoutGuard.jsx`):** Global inactivity watchdog mounted in the layout — warns at 9 min, auto-logs-out at 10 min of no `mousemove/keydown/click/scroll`, syncing `lastActivity` across tabs via `localStorage`.
- **Types (`src/types/`):** Per-domain `*.types.ts` files hold the TypeScript contracts for API payloads. Keep API response shapes here.

## Conventions

- **Ongoing JS→TS migration:** the codebase is a mix of `.jsx`/`.tsx` and `.js`/`.ts`. Write **new** components and modules in TypeScript (`.tsx`/`.ts`) with explicit interfaces; port a file to TS when you make substantial changes to it.
- **Folders:** `pages/` (route-level screens), `components/` (grouped into `cards/`, `modals/`, `ui/`, `Sections/`, `context/`), `layouts/` (Sidebar, Footer), `services/api/`, `types/`, `assets/icons/` (SVGs re-exported through `assets/icons/index.ts`).
- **Styling:** Tailwind utility classes inline in JSX (note existing arbitrary values like `bg-[#F0F0F5]`). There is no BEM/CSS-module system despite what the README claims.

## Environment

`.env` provides `VITE_API_URL` (defaults to `http://localhost:5000/api` in `apiClient.ts` if unset) plus `VITE_TEST_USER` / `VITE_TEST_PASS` demo credentials. `vercel.json` rewrites all non-`/api` paths to `index.html` for SPA routing on Vercel.
