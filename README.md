TalentMatch AI — Frontend
=========================

🇬🇧 English · [🇪🇸 Español](./README.es.md)

Recruitment dashboard SPA for HR teams and recruiters: upload CVs, manage vacancies and get an explainable, AI-assisted candidate ranking. Backend repo: [talentmatch-backend](https://github.com/JosePerez0314/talentmatch-backend/).

---

What it does
------------

- **Hierarchy management:** full CRUD for **Departments → Positions → Vacancies**, including position requirements (technical skills, soft skills, languages, years of experience, education), position duplication and editing via shared routes (`/vacancy/edit/:id`, `/position/edit/:id`).
- **Bulk CV upload:** send up to 100 PDFs (max 5 MB each) to a vacancy and see per-file upload results.
- **Explicit evaluation + explainable ranking:** evaluation is a separate step from upload. Results show each candidate's 0–100 score with its breakdown, and the recruiter changes each application status (`PENDIENTE`, `EN_PROCESO`, `SELECCIONADO`, `RECHAZADO`) with optimistic updates.
- **Dashboard and history views:** per-user metrics plus history tables for CVs, candidates, positions, vacancies, departments and evaluations (results can be copied as an image).
- **Admin panel (`ADMIN` role):** global stats, paginated user list, user creation, role changes and deletion.

Architecture
------------

```
User ──► Browser (React SPA, Vite)
              │  fetch + Authorization: Bearer <JWT>
              ▼
        Express API (/api) ──► MySQL (Prisma)
              ├──► OpenAI API   (CV text → structured profile)
              └──► Cloudinary   (PDF storage)
```

The frontend only talks to the Express API. Uploading CVs sends a `multipart/form-data` request (`pdfs` field) to `POST /vacancies/:id/upload`; the backend extracts and structures each profile. The recruiter then triggers `POST /vacancies/:id/evaluations` and reads the ranking from `GET /vacancies/:id/results`. Scores come from a deterministic engine in the backend — the AI never assigns them.

Tech stack
----------

| Area | Technology |
| --- | --- |
| UI | React 19.2 |
| Language | TypeScript 6 (JS → TS migration in progress) |
| Build / dev server | Vite 5.4 + `vite-plugin-checker` (type errors fail `dev` and `build`) |
| Styling | Tailwind CSS 4.2 (`@tailwindcss/vite`) |
| Routing | react-router-dom 7.13 |
| Global state | React Context (`AuthContext`) |
| HTTP | Hand-rolled `fetch` wrapper (`apiClient.ts`) |
| Icons | lucide-react, react-icons, local SVGs |
| Misc | html-to-image (copy results as image) |
| Lint | ESLint 9 + typescript-eslint |

Getting started
---------------

**Prerequisites:** Node.js 20+ and a running backend.

```bash
git clone https://github.com/JosePerez0314/talentmatch-frontend.git
cd talentmatch-frontend
npm install
cp .env.example .env     # then edit VITE_API_URL if needed
```

1. Start the backend by following its [README](https://github.com/JosePerez0314/talentmatch-backend/#getting-started). Locally it listens on `http://localhost:3000`.
2. Make sure `http://localhost:5173` is included in the backend's `ALLOWED_ORIGINS`.
3. Run the frontend:

```bash
npm run dev
```

The app is served at `http://localhost:5173`. The port is strict: if it is taken, Vite fails instead of moving to another port, because a different origin would silently break the backend's CORS whitelist.

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with in-process type checking |
| `npm run build` | Production build (fails on type errors) |
| `npm run lint` | ESLint |
| `npm run preview` | Serves the built `dist/` |

Environment variables
---------------------

| Name | What it is | Example |
| --- | --- | --- |
| `VITE_API_URL` | Base URL of the backend API, including the `/api` prefix. Required: there is no fallback. | `http://localhost:3000/api` |

> ⚠️ **Every `VITE_*` variable is embedded in the browser bundle and is publicly readable.** Never put secrets, API keys or credentials in them. Real `.env` files are git-ignored; only `.env.example` is committed.

Project structure
-----------------

```
src/
├── pages/            # Route-level screens (Login, Dashboard, Vacancy, Resultados, AdminPanel…)
├── components/
│   ├── admin/        # Admin panel modules (stats, user table, roles, delete, create)
│   ├── cards/        # Metric and candidate cards
│   ├── context/      # AuthContext (useAuth)
│   ├── modals/       # Reusable dialogs
│   ├── routes/       # AdminRoute guard
│   ├── Sections/     # Page sections and success screens
│   └── ui/           # Inputs, login form, SessionTimeoutGuard…
├── layouts/          # Sidebar, Footer
├── services/
│   ├── api/          # apiClient + one *.api.ts service per domain
│   └── session.ts    # localStorage session helpers
├── types/            # *.types.ts API contracts
├── utils/
└── assets/icons/
docs/                 # Bilingual documentation (en/, es/)
```

Backend integration
-------------------

- **Auth:** login returns a JWT. The token and the user (`tm_user`) are stored in `localStorage`; `apiClient` injects `Authorization: Bearer <token>` on every request except public routes (`/users/login`, `/users`). A user without a token (or with a corrupted stored user) is treated as signed out.
- **Expiration / 401:** a 401 on an authenticated request clears the session and redirects to `/login`. A 401 on login is surfaced as a form error instead. In addition, `SessionTimeoutGuard` warns after 9 minutes of inactivity and logs out at 10.
- **Rate limit (429):** the client retries up to 3 attempts with exponential backoff and jitter, honoring `Retry-After`.
- **Response envelope:** `{ success, data }` is unwrapped by `apiClient`; `{ success: false, error, details? }` or any non-OK status throws an `ApiError` the UI can catch (validation errors carry `details[]`).
- **CORS:** the backend whitelists origins; the frontend origin must be in its `ALLOWED_ORIGINS` (`http://localhost:5173` locally).
- **Tenant isolation:** resources from another user return `404`, not `403`.
- **File upload:** `FormData` with one `pdfs` entry per file; the `Content-Type` boundary is left to the browser.

Design decisions & tradeoffs
----------------------------

**React Context instead of Redux or a data-fetching library.** The only truly global state is the session, so `AuthContext` is enough; everything else is local `useState`/`useEffect` per screen. This keeps dependencies minimal and the data flow easy to follow. The cost is no request caching, deduplication or shared server state: screens refetch on mount.

**Hand-rolled `fetch` client.** `apiClient.ts` centralizes the base URL, the bearer token, envelope unwrapping, `ApiError`, 401 session teardown and 429 backoff in one small file without adding Axios. The cost is that features such as interceptors, cancellation or retries for other statuses must be written by hand.

**One service object per domain.** Components never call `fetch`; they call services (`vacanciesApi`, `departmentsApi`…) that also normalize backend shapes (e.g. Mongo-style `_id` → `id`). This isolates contract changes from the UI, at the price of some defensive mapping code.

**Tailwind v4 inline utilities, no component library.** Styling lives in JSX with a small set of reusable `ui/` components and modals. It is fast to iterate on, but there is no design-token system and some arbitrary values (`bg-[#F0F0F5]`) are repeated.

**Shared screens through URL params.** Create and edit flows reuse the same page (`Vacancy`, `Position`) and branch on `useParams`. This avoids duplicated forms, but pages carry both modes' logic.

**Progressive JS → TS migration and strict typing at build time.** New code is TypeScript with contracts in `src/types/`, and `vite-plugin-checker` makes type errors fail `dev` and `build`. A few legacy `.jsx` files remain. Forms are plain controlled components with no validation library; the backend's `details[]` errors are the source of truth.

Tests
-----

There is no test runner configured. Changes are verified with `npm run build` (type check), `npm run lint` and manual QA in the dev server.

Status
------

- **Done:** every screen is wired to the real API (auth, dashboard, departments, positions, vacancies, CV upload, evaluations, candidate status, admin panel).
- **Pending:** a few minor bugs and legacy `.jsx` files (see [`docs/en/bugs.md`](./docs/en/bugs.md)), automated tests, and the remaining JS → TS migration.
- **What I would do differently:** start on **Next.js** instead of a plain Vite SPA, to get routing, layouts, server-side rendering and a more structured data layer out of the box instead of building many of those pieces from scratch.

Documentation
-------------

- [Frontend documentation](./docs/en/front-documentation.md)
- [API contract](./docs/en/api-documentation.md)
- [Known bugs](./docs/en/bugs.md) · [Issues](./docs/en/issues.md) · [Changelog](./docs/en/last-changes.md)
- Spanish versions in [`docs/es/`](./docs/es/).

Team
----

| Name | Role |
| --- | --- |
| **José Gabriel Pérez Calcaño** — [LinkedIn](https://www.linkedin.com/in/im-jose/) | Tech Lead. Architecture, full backend and supervision of the team's work. |
| Justin Antonio Sánchez Melo | Frontend |
| Bryam Smith Pérez Hernández | AI prompts and frontend support |

License
-------

Private / proprietary. All rights reserved.
