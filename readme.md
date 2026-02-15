# 🧪 LeetLab — Code Practice Platform

A full-stack LeetCode-inspired coding platform built with React, Node.js, Express, Prisma, and PostgreSQL. Features an online code editor, AI-powered hints, real-time code execution, and a fully responsive UI.

## 📸 Screenshots

### Homepage
![Homepage](./screenshots/homepage.png)

### Problems List
![Problems List](./screenshots/problems-list.png)

### Problem Page (Code Editor)
![Problem Page](./screenshots/problem-page.png)

### Mobile Responsive View
![Mobile View](./screenshots/mobile-view.png)

## ✨ Features

- **🔐 Authentication** — JWT-based signup/login with role-based access (admin/user)
- **📝 50+ Coding Problems** — Categorized by difficulty (Easy, Medium, Hard) and tags
- **💻 Online Code Editor** — Monaco editor with syntax highlighting, auto-complete, and multi-language support (Java, Python, JavaScript)
- **▶️ Code Execution** — Run code against test cases with real-time results via Judge0
- **📊 Submissions** — Track all past submissions with status, runtime, and memory usage
- **🤖 AI Assistant** — Get hints, code reviews, and solutions powered by Groq AI (Llama 3.3 70B)
- **💬 Discussions** — Comment threads on each problem with nested replies
- **📚 Playlists** — Organize problems into custom playlists
- **🏆 Leaderboard** — Competitive ranking system
- **📅 Daily Challenges** — Auto-rotating daily problems
- **🔖 Bookmarks & Likes** — Save and interact with problems
- **📱 Fully Responsive** — Works on desktop, tablet, and mobile with adaptive layouts

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, DaisyUI |
| Code Editor | Monaco Editor (`@monaco-editor/react`) |
| State Management | Zustand |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Code Execution | Judge0 API |
| AI | Groq API (Llama 3.3 70B) |
| Auth | JWT + bcrypt |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Judge0 API instance (for code execution)

### 1. Clone and Install

```bash
git clone https://github.com/JeetuPalhub/leetlab.git
cd leetlab

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Configure Environment

**Backend** (`backend/.env`):
```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB
JWT_SECRET=your-secret
JUDGE0_API_URL=your-judge0-api-url
```

**Frontend** (`frontend/.env.local`):
```env
VITE_BACKEND_API_BASEURL=http://localhost:3000/api/v1
VITE_GROQ_API_KEY=your-groq-api-key
```

### 3. Database Setup

```bash
cd backend
npx prisma generate
npx prisma migrate deploy
```

### 4. Run Development Servers

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Open **http://localhost:5173** in your browser.

## 📁 Project Structure

```
leetlab/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── libs/           # Utilities (Judge0, cron)
│   │   ├── middleware/     # Auth & error middleware
│   │   ├── routes/         # API routes
│   │   └── index.ts        # Express server
│   └── prisma/             # Schema & migrations
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Zustand state stores
│   │   └── libs/           # Utilities
│   └── public/
└── screenshots/            # README screenshots
```

## 🏗️ Build for Production

```bash
cd backend && npm run build
cd frontend && npm run build
```

## 📋 API Modules

- `auth` — Registration, login, session management
- `problems` — CRUD operations, filtering, daily challenges
- `execute-code` — Judge0 integration for code execution
- `submissions` — Submission tracking and history
- `playlist` — Problem playlist management
- `comments` — Discussion threads
- `interactions` — Likes, bookmarks
- `leaderboard` — User rankings
- `contest` — Contest management
- `ai` — AI roadmap generation

## 📄 License

MIT
