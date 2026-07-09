# 🚀 TalentMatch AI — Frontend

<div align="center">

### Intelligent Recruitment Platform powered by AI

Transforming technical recruitment through data-driven candidate evaluation, vacancy management, and intelligent talent matching.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss)
![React Router](https://img.shields.io/badge/React_Router-7-CA4245?logo=reactrouter)

</div>

---

## 📚 Documentation

Full documentation lives in [**`docs/`**](./docs/), available in both English and Spanish:

| | |
| --- | --- |
| 🇬🇧 **English** | [`docs/en/README.md`](./docs/en/README.md) |
| 🇪🇸 **Español** | [`docs/es/README.md`](./docs/es/README.md) |

Start with `front-documentation.md` — it describes the codebase as it actually is (architecture, routing, the API layer, and which screens are connected vs. still on mock data). `bugs.md` and `issues.md` track what's broken and what to do next.

---

## 📖 Overview

**TalentMatch AI** is a recruitment dashboard SPA. It is the workspace recruiters use to:

- Create and manage vacancies, positions, and departments
- Upload candidate CVs (PDF) and have them evaluated by AI against a vacancy
- Review AI-generated candidate rankings (MatchScore)
- Browse historical records for every entity
- Administer platform users

The domain model is **Departments → Positions → Vacancies → Candidates**.

> **Note:** the UI copy and most legacy comments are in Spanish; identifiers mix Spanish and English. New code comments are written in English.

---

## 🛠 Tech Stack

| Technology | Purpose |
| --- | --- |
| **React 19** | UI library |
| **TypeScript** | Static typing (JS→TS migration in progress) |
| **Vite 5** | Build tool and dev server |
| **Tailwind CSS v4** | Styling, via the `@tailwindcss/vite` plugin (configured in CSS, not `tailwind.config.js`) |
| **React Router v7** | Routing |
| **React Context** | Global state (`AuthContext`) — no Redux |
| Hand-rolled `fetch` client | API communication (`src/services/api/apiClient.ts`) — no Axios |
| **JWT** | Authentication (token in `localStorage`) |
| `vite-plugin-checker` | Runs `tsc` in-process — **type errors fail `dev` and `build`** |
| **ESLint 9** | Linting, with `no-explicit-any` as an error |

> `package.json` still declares `express`, `cors`, and `dotenv`. They are **unused** — this is a 100% client-side app.

---

## 📂 Project Structure

```bash
src/
├── App.tsx              # Router, ProtectedRoute, protected layout
├── main.tsx             # React bootstrap
├── index.css            # Tailwind v4 entry + custom scrollbar
├── assets/icons/        # Local SVGs, re-exported as an `Icons` object
├── components/
│   ├── admin/           # Admin panel modules
│   ├── cards/           # MetricCard, CandidateMatchRow
│   ├── context/         # AuthContext
│   ├── modals/          # Candidate details, department edit/delete, timeout warning
│   ├── routes/          # AdminRoute (role guard)
│   ├── Sections/        # Tables and success screens
│   └── ui/              # LoginForm, PillInput, SessionTimeoutGuard, …
├── layouts/             # Sidebar, Footer
├── pages/               # Route-level screens
├── services/api/        # apiClient + one *.api.ts per domain
├── types/               # Per-domain TypeScript contracts
└── utils/
```

There is **no** `routes/`, `hooks/`, or `styles/` folder, and no CSS modules — Tailwind utilities are written inline in the JSX.

---

## 🔐 Authentication Flow

```text
User submits login
     │
     ▼
POST /users/login → { success, token, user }
     │
     ▼
AuthContext.login(email, token, role)
     │
     ├─→ localStorage: `token` + `tm_user`
     │
     ▼
apiClient injects `Authorization: Bearer <token>` on every request
     │
     ▼
ProtectedRoute gates all app routes · AdminRoute additionally gates /admin
```

A global `SessionTimeoutGuard` warns after 9 minutes of inactivity and logs the user out at 10, syncing activity across browser tabs.

---

## ⚙️ Environment Variables

Create a `.env` file at the project root:

```env
VITE_API_URL=http://localhost:5000/api
```

> ⚠️ **`VITE_API_URL` is required and has no fallback.** If it's missing, `apiClient` throws on the first request.

---

## 🚀 Getting Started

```bash
git clone <repository-url>
cd talentmatch-frontend
npm install
npm run dev
```

The app is served at `http://localhost:5173`.

### Commands

```bash
npm run dev      # Vite dev server
npm run build    # Production build (fails on type errors)
npm run lint     # ESLint
npm run preview  # Serve the built dist/
```

---

## 🧪 Verifying changes

There is **no test runner** configured — no Jest, no Vitest, no test files. "Run the tests" does not apply here.

Verify a change with:

1. `npm run build` — type-checks the whole project and fails on any error.
2. `npm run lint`
3. **Manual QA in the browser.**

Step 3 is not optional. Neither `tsc` nor ESLint validates Tailwind class names or stray JSX text — a typo like `roundTomaed-[24px]` compiles cleanly and silently breaks the UI. A green build does not mean a correct screen.

---

## 🤝 Contributing

### Branching

```bash
git checkout -b feat/your-feature
```

### Commit convention

Commits follow [Conventional Commits](https://www.conventionalcommits.org/) and are always written in English:

```bash
<type>(<scope>): <subject>
```

Allowed types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`.

```bash
feat(auth): persist user role in AuthContext
fix(upload-cv): route uploads through the vacancy endpoint
refactor(dashboard): migrate to TypeScript
docs(issues): mark P0 as resolved
```

### Code conventions

- New components and modules in **TypeScript**, with explicit interfaces.
- Never call `fetch` (or `apiClient`) directly from a page — add a method to the relevant `*.api.ts` service.
- Services return already-unwrapped types; don't re-unwrap in the caller.
- Avoid `any`; ESLint flags it as an error.
- New code comments in English.

See [`CLAUDE.md`](./CLAUDE.md) for the full working rules.

---

## 📄 License

This project is proprietary software developed as part of the TalentMatch AI platform.

All rights reserved © TalentMatch AI.
