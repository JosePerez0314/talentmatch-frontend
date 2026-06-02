# 🚀 TalentMatch AI — Frontend Experience & Recruitment Dashboard

<div align="center">

### Intelligent Recruitment Platform powered by AI

Transforming technical recruitment through data-driven candidate evaluation, vacancy management, and intelligent talent matching.

![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-Latest-646CFF?logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4+-06B6D4?logo=tailwindcss)
![Axios](https://img.shields.io/badge/Axios-API-5A29E4?logo=axios)

</div>

---

## 📖 Overview

**TalentMatch AI** is a modern SaaS recruitment platform designed to streamline the hiring process through intelligent candidate analysis and data visualization.

The frontend serves as the primary workspace for recruiters, providing a clean and responsive dashboard where they can:

* Create and manage vacancies
* Upload and process candidate CVs
* Analyze AI-generated candidate rankings
* Manage departments and positions
* Monitor recruitment metrics through dashboards
* Access historical records and reports

Rather than acting as a simple file uploader, TalentMatch AI provides recruiters with actionable insights that accelerate hiring decisions.

---

## ✨ Core Features

### 📊 Analytics Dashboard

* Real-time recruitment metrics
* Candidate activity monitoring
* Vacancy tracking
* Executive KPI visualization

### 📄 CV Management

* Drag & Drop CV uploads
* Upload status tracking
* Historical CV records
* Candidate profile management

### 🎯 AI Candidate Ranking

* Match Score visualization
* Candidate leaderboard
* Skills evaluation
* Position compatibility analysis

### 💼 Vacancy Management

* Vacancy creation workflow
* Position configuration
* Department assignment
* Historical vacancy records

### 🏢 Department Management

* Department creation
* Department history
* Edit and delete workflows
* Position association tracking

### 🔐 Authentication & Security

* JWT Authentication
* Protected Routes
* Session persistence
* Idle session management

### 📱 Responsive Design

* Desktop-first experience
* Large-screen optimization
* Mobile compatibility
* Modern SaaS interface

---

# 🛠 Tech Stack

## Frontend

| Technology   | Purpose           |
| ------------ | ----------------- |
| React 18     | UI Library        |
| TypeScript   | Static Typing     |
| Vite         | Build Tool        |
| React Router | Routing           |
| Axios        | API Communication |
| Tailwind CSS | Styling           |
| Context API  | Global State      |
| JWT          | Authentication    |

---

# 📂 Project Structure

```bash
src/
│
├── assets/              # Images, icons, logos
├── components/          # Reusable UI components
├── contexts/            # React Context providers
├── pages/               # Application pages
├── services/            # API services
│   ├── auth.api.ts
│   ├── uploads.api.ts
│   ├── vacancies.api.ts
│   └── ...
│
├── types/               # TypeScript interfaces
├── utils/               # Utility functions
├── routes/              # Route definitions
├── hooks/               # Custom React hooks
└── styles/              # Global styles
```

---

# 🎨 Design Principles

The project follows modern frontend development practices:

* Component-based architecture
* TypeScript-first development
* DRY (Don't Repeat Yourself)
* Responsive UI design
* Reusable design system
* Separation of concerns
* Clean code principles

---

# 🔐 Authentication Flow

```text
User Login
     │
     ▼
 JWT Token Received
     │
     ▼
 Stored in AuthContext
     │
     ▼
 API Client Interceptor
     │
     ▼
 Protected Requests
```

---

# ⚙️ Environment Variables

Create a `.env` file at the project root:

```env
VITE_API_URL=http://localhost:3000/api
```

Example:

```env
VITE_API_URL=https://api.talentmatchai.com/api
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/your-organization/talentmatch-frontend.git
cd talentmatch-frontend
```

## Install Dependencies

```bash
npm install
```

## Run Development Server

```bash
npm run dev
```

Application available at:

```text
http://localhost:5173
```

---

# 🏗 Build for Production

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

---

# 🧪 Development Guidelines

### Commit Convention

```bash
feat(scope): add new feature
fix(scope): resolve issue
refactor(scope): improve structure
docs(scope): update documentation
chore(scope): maintenance tasks
```

Examples:

```bash
feat(auth): implement JWT authentication
fix(upload-cv): resolve file upload issue
refactor(dashboard): migrate to TypeScript
```

---

# 📸 Main Modules

* Dashboard
* Positions
* Vacancies
* Candidates
* Departments
* Results
* Authentication
* Records & History

---

# 🤝 Contributing

1. Create a feature branch

```bash
git checkout -b feature/new-feature
```

2. Commit your changes

```bash
git commit -m "feat(module): add functionality"
```

3. Push your branch

```bash
git push origin feature/new-feature
```

4. Open a Pull Request

---

# 📄 License

This project is proprietary software developed as part of the TalentMatch AI platform.

All rights reserved © TalentMatch AI.
