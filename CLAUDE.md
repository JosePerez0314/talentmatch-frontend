# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Working rules (read first — non-negotiable)

- **Always ask for permission/validation before doing anything.** Do not edit files, run mutating commands, commit, push, install packages, or otherwise change the project without first explaining what you intend to do and getting explicit confirmation from the user. When in doubt, ask.
- **Never read `.env` files** (`.env`, `.env.*`, or any environment/secret file). Do not open, `cat`, `grep`, print, or otherwise access their contents. If you need to know which variables exist, ask the user or infer from how `import.meta.env.*` is used in the code.
- **Architecture Review First:** Before writing or modifying a component to connect to data, outline a brief logical plan of the data flow. Outline which state variables you will use, `useEffect` hooks, and fetch calls. I am a backend engineer; I will review the data flow logically before you execute the code.

## Project

TalentMatch AI frontend: a recruitment dashboard SPA for uploading CVs, managing vacancies/positions/departments, viewing AI-scored candidate rankings, and administering users. UI copy and most code comments are in Spanish; identifiers mix Spanish and English.

> Note: `README.md` describes an _aspirational_ stack (React 18, BEM CSS, Axios, Redux, Zod) that does **not** match the code[cite: 4]. Trust this file and the source, not the README. The real stack is React 19, Tailwind v4, a hand-rolled `fetch` client, and React Context[cite: 4].

## Commands

```bash
npm run dev      # Vite dev server
npm run build    # Production build (fails on type errors)
npm run lint     # ESLint
npm run preview  # Serve the built dist/
```

````

There is **no test runner** configured — no Jest/Vitest, no test files. "Run the tests" does not apply here; verify changes via `npm run build` (type check) and manual QA in the dev server.

## Type checking

`vite-plugin-checker` runs `tsc` in-process, so **type errors fail both `dev` and `build**`— there is no separate typecheck script. ESLint enforces`@typescript-eslint/no-explicit-any`as an **error**; avoid`any`.

## Architecture & UI Reusability

- **Stack:** React 19 + Vite 5 + TypeScript + Tailwind CSS **v4** (via the `@tailwindcss/vite` plugin, configured in CSS). The root `tailwind.config.js` is a legacy v3-style stub and is effectively unused. `react-router-dom` v7 handles routing.

- **UI Components:** Do not generate raw HTML/Tailwind for standard elements if a component already exists. Always check `src/components/ui/` for existing inputs, buttons, and layouts. Check `src/components/modals/` before building inline dialogs.

- **Routing (`src/App.tsx`):** `/` redirects to `/login`; `/login` is the only public route. Everything else renders inside **`ProtectedRoute`** (Sidebar + `SessionTimeoutGuard` + `<Outlet />`).

- **Route protection behavior:** `ProtectedRoute` shows a "Verificando sesión…" loader while `loading`, and redirects to `/login` when there is no `user`. Unknown paths fall through to `/dashboard`.

- **Page Reuse:** Detail/edit screens reuse a page component across routes via URL params (e.g. `/vacancy` and `/vacancy/edit/:id` → `Vacancy`).

- **Admin panel (`src/pages/AdminPanel.tsx`, `src/components/admin/`):** user administration UI composed of `StatsModule`, `UserTableModule`, `RoleUpdateModule`, `UserDeleteModule`. Users have a `role: 'admin' | 'user'`. Note this screen currently runs on a simulated loading timer and is not yet wired to a dedicated users API.

- **Auth (`src/components/context/AuthContext.tsx`):** `AuthProvider` wraps the app. It persists `tm_user` (user object) and `token` separately in `localStorage`. Consume via the `useAuth()` hook.

- **Session timeout (`src/components/ui/SessionTimeoutGuard.jsx`):** Global inactivity watchdog mounted in the layout — warns at 9 min, auto-logs-out at 10 min of inactivity.

- **Types (`src/types/`):** Per-domain `*.types.ts` files hold the TypeScript contracts for API payloads. Keep API response shapes here.

## API Layer & Cross-Repo Constraints

- **Cross-Repo Blindspot:** The backend Node/Express codebase is in a separate repository that you cannot see. **Never hallucinate API payloads or endpoints.** Before wiring up any page, you MUST explicitly ask me to provide the exact JSON response or TypeScript interface from the backend API documentation.
- **API Client (`src/services/api/`):** `apiClient.ts` is a thin `fetch` wrapper. It prefixes `VITE_API_URL` and injects `Authorization: Bearer <token>` from `localStorage`.

- **API Unwrapping:** It treats the backend envelope `{ success, data, error/message }` as the contract and throws `ApiError` on `!ok` or `success:false`. Ensure the client explicitly throws errors on HTTP 400/500 responses so the UI can catch them.

- **Service Domain Pattern:** Each domain has its own `*.api.ts` exporting a service object. Add new endpoints as methods on these services, not by calling `fetch` directly in React components. Services often do defensive normalization on top of `apiClient` (e.g., mapping Mongo `_id` → `id`). Follow this pattern when a backend shape doesn't match the UI model.

## Conventions & Migration Interoperability

- **Ongoing JS→TS migration:** The codebase is a mix of `.jsx`/`.tsx` and `.js`/`.ts`. You must ensure seamless interoperability between JS and TS.

- **New Code:** Write **new** components and modules in TypeScript (`.tsx`/`.ts`) with explicit interfaces. If you make substantial changes to a `.jsx` or `.js` file, convert it to TS.

- **Import Safety:** Do not use TypeScript-exclusive export features (like isolated `export type`) in a way that breaks imports in legacy `.jsx` files. Ensure the code works flawlessly across both environments during this transition.
- **Folders:** `pages/` (route-level screens), `components/` (grouped into `admin/`, `cards/`, `modals/`, `ui/`, `Sections/`, `context/`), `layouts/` (Sidebar, Footer), `services/api/`, `types/`, `assets/icons/`.

- **Styling:** Tailwind utility classes inline in JSX (note existing arbitrary values like `bg-[#F0F0F5]`). There is no BEM/CSS-module system despite what the README claims.

- **Icons:** `lucide-react` and `react-icons` for inline icons, plus local SVGs in `assets/icons/`.

## File language check before editing

Before you modify **any** existing file, tell me what language it is written in and what you intend to do about it. Do not start editing until I confirm.

For every file you are about to touch, state:

1. **Its current language** — `.js` / `.jsx` (legacy JavaScript) or `.ts` / `.tsx` (TypeScript).
2. **Whether the change is substantial.** A substantial change (new state, new props, a new data flow, rewiring an API call) triggers a migration to TypeScript, per the migration rule above. A trivial change (a string, a class name, a one-line fix) does not.
3. **The migration plan, if one applies** — the new filename, the interfaces you will introduce, and every file importing it that could break.

Then wait for my confirmation.

**Never migrate a file silently.** A JS→TS conversion in the middle of a bugfix makes the diff unreviewable and mixes two unrelated concerns. If a file needs migrating, say so and let me decide whether it happens now or in a separate commit.

What I expect to read before you touch anything:

> `src/pages/UploadCV.jsx` is **legacy JavaScript**. The change (reporting per-file upload results) is substantial, so the migration rule applies: I would convert it to `UploadCV.tsx`, type the results as `UploadResult[]` from `src/types/api.types.ts`, and update the single import in `src/App.tsx`. Convert now, or keep it as `.jsx` for this change?

## Environment

The app reads `VITE_API_URL` (with a `http://localhost:5000/api` fallback in `apiClient.ts`) and demo credential vars via `import.meta.env`. Do **not** read the `.env` file to inspect these. `vercel.json` rewrites all non-`/api` paths to `index.html` for SPA routing on Vercel.

## Git & Commit Formatting

**Strict Commit Format (Conventional Commits):** Whenever I explicitly instruct you to generate a commit message or commit a specific set of changes, you MUST strictly adhere to the Conventional Commits specification.

- **Format:** `<type>(<scope>): <subject>`
- **Types allowed:** `feat`, `fix`, `refactor`, `test`, `docs`, `chore`.
- When generating the commit message, briefly ensure the subject line accurately reflects the actual architectural or code changes we just discussed.
- **Language:** commit messages (subject and body) must always be written in English.

## Code comment language

New or edited code comments must always be written in English going forward, even though existing legacy comments in the codebase are in Spanish. Don't bulk-translate untouched files — only apply this when writing new comments or editing lines that already have one.

## Deadline Execution

We are on a strict deadline to deliver this sprint.

- Focus purely on fixing data connections, state management, and critical bugs.
- **Do not** refactor messy UI code, reorganize folder structures, or rewrite working components just to make them "cleaner" unless it is strictly necessary to make the data flow work.

```

```
````
