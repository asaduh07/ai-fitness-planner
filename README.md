# Physique AI — Body Composition & Indian Diet/Workout Planner

React + Three.js web app that estimates body composition from guided
photo capture, calculates real BMR/TDEE targets, and generates
India-specific veg/non-veg diet and workout plans through an interactive
3D body-region picker.

Body composition estimates are shown as a **rough visual range**, never
a precise number — this is not a medical or clinical measurement. BMI/
BMR/TDEE are calculated with standard formulas (Mifflin-St Jeor). Photos
are processed per-request only and are never written to disk or a
database.

## Project structure

- `backend/` — Node.js + Express API (BMR/TDEE math, Gemini calls)
- `frontend/` — Vite + React app (stats form, photo capture, 3D body
  picker, plan dashboard)

## Local dev setup

### Backend

```
cd backend
npm install
cp .env.example .env   # if you don't already have one
```

Set in `backend/.env`:
- `GEMINI_API_KEY` — get a free key at https://aistudio.google.com/app/apikey
- `PORT` — defaults to `5000`
- `ALLOWED_ORIGIN` — defaults to `http://localhost:5173`; comma-separate
  multiple origins if needed

```
npm run dev
```

### Frontend

```
cd frontend
npm install
cp .env.example .env
```

Set in `frontend/.env`:
- `VITE_API_URL` — defaults to `http://localhost:5000`

```
npm run dev
```

Open http://localhost:5173.

## Deployment

Backend and frontend deploy as two separate services from this same repo.

### Backend — Render

- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Environment variables:
  - `GEMINI_API_KEY`
  - `ALLOWED_ORIGIN` — set to the deployed Vercel URL once it exists
    (e.g. `https://your-app.vercel.app`)

### Frontend — Vercel

- Root directory: `frontend`
- Framework preset: Vite
- Environment variables:
  - `VITE_API_URL` — set to the deployed Render backend URL (e.g.
    `https://your-api.onrender.com`)

Deploy the backend first, then set `VITE_API_URL` on Vercel to its URL,
then set `ALLOWED_ORIGIN` on Render to the resulting Vercel URL and
redeploy the backend so CORS allows it.
