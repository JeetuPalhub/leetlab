# LeetLab (LeetCode-inspired)

## Project Structure
- `backend`: Express + TypeScript + Prisma API
- `frontend`: React + Vite client

## Quick Start
1. Install dependencies:
```bash
cd backend && npm install
cd ../frontend && npm install
```
2. Configure backend env in `backend/.env`:
```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB
JWT_SECRET=your-secret
GEMINI_API_KEY=your-gemini-key-optional
```
3. Generate Prisma client and run migrations (backend):
```bash
cd backend
npx prisma generate
npx prisma migrate deploy
```
4. Run apps in separate terminals:
```bash
cd backend && npm run dev
cd frontend && npm run dev
```

## Build
```bash
cd backend && npm run build
cd frontend && npm run build
```

## Smoke Check
Start backend first, then run:
```bash
cd backend && npm run smoke
```

## Health Check
- Backend health endpoint: `GET http://localhost:3000/health`

## Current Module Status
- Enabled: auth, problems, execute-code, submissions, playlist, user, interactions, leaderboard, contest, ai roadmap
