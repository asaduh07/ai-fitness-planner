# CLAUDE.md — Physique AI (Body Composition & Indian Diet/Workout Planner)

## What this project is
A web app that takes 3-4 body photos (front, side, optional back) plus
height/weight/age/gender, gives a rough VISUAL ESTIMATE (a range, never a
fake-precise number) of body composition, calculates real BMI/BMR/calorie
needs with standard formulas, then generates a personalized Indian
diet plan (veg/non-veg) and a workout plan — with the user selecting focus
areas by clicking on a 3D humanoid figure instead of a dropdown/checklist.

## Responsible framing — non-negotiable rules
- NEVER present the body composition estimate as a precise number
  (e.g. "19.3% body fat"). Always show a RANGE (e.g. "roughly 18-22%,
  visual estimate only") with a one-line disclaimer that this is not a
  medical or clinical measurement.
- BMI/BMR/TDEE calorie targets ARE calculated with real, standard formulas
  (Mifflin-St Jeor for BMR) — these are objective and fine to show precisely.
  Only the photo-derived body-fat/muscle read is a soft range.
- UI copy stays calm and factual, never hype-y, about body image
  ("Here's your estimate" not "Check out your gains!").
- Body photos are processed per-request only — NOT stored server-side
  beyond the analysis call. State this in the README and enforce it in
  code (no writing uploaded images to disk/DB).
- No diagnostic claims about health conditions. If BMI/inputs suggest an
  extreme range, the generated plan should suggest consulting a doctor/
  dietitian rather than prescribing an aggressive deficit/surplus.

## Tech stack
- **Frontend:** React + Vite, `@react-three/fiber` + `@react-three/drei`
  for the interactive 3D body picker, plain CSS/Tailwind for the rest of
  the UI (wizard flow, results dashboard).
- **Backend:** Node.js + Express.
- **LLM:** Google Gemini via the `@google/genai` Node SDK (multimodal —
  same family already in use on the Hindi Live-Dub project; current model:
  gemini-3.6-flash, confirm still current before hardcoding).
- **3D body model (Phase 3):** simplified low-poly humanoid built from
  primitive Three.js geometries (capsules/spheres/boxes for arms, chest,
  core, back, legs, shoulders) — NOT a photorealistic anatomical asset.
  Each region is a separately raycast-clickable mesh that highlights on
  hover/select.
- **Planned, not built yet (log in DECISIONS.md, do not attempt now):**
  Docker Compose for both services, React Native port, Android build.

## User flow (build in this order)
1. Quick stats form — height, weight, age, gender, veg/non-veg preference,
   activity level.
2. Guided photo capture — front, side, optional back, with a pose
   silhouette overlay guiding the user to stand consistently.
3. Estimate screen — visual body composition range (LLM) + calculated
   BMI/BMR/TDEE (plain JS math, not LLM).
4. Focus selection — interactive 3D humanoid; user clicks region(s) to
   focus on (arms, chest, back, legs, core, shoulders, or "full body").
5. Generated plan — Indian diet plan (veg/non-veg, structured by meal)
   + workout split targeting the selected regions, shown in a clean
   dashboard.
6. Adjust anytime — user can change focus regions or diet preference and
   regenerate the plan without restarting the whole flow.

## API contract (Express backend)
- `POST /api/analyze`
  - body: multipart form — `photos[]` (3-4 images), `heightCm`, `weightKg`,
    `age`, `gender`, `activityLevel`
  - does: calculates BMI/BMR/TDEE server-side with Mifflin-St Jeor; sends
    photos + stats to Gemini for a visual composition RANGE estimate
  - returns: `{ bmi, bmr, tdee, estimateRange: string, estimateNote: string }`
- `POST /api/plan`
  - body: `{ estimateRange, tdee, dietPref: "veg"|"nonveg", focusRegions: string[] }`
  - does: single Gemini call generating a structured Indian diet plan +
    workout split based on inputs
  - returns: `{ dietPlan: {...}, workoutPlan: {...} }`

## Project structure (target)
- `/frontend` — Vite React app
  - `/src/components/StatsForm.jsx`
  - `/src/components/PhotoCapture.jsx`
  - `/src/components/EstimateDisplay.jsx`
  - `/src/components/BodyPicker3D.jsx` (react-three-fiber scene)
  - `/src/components/PlanDashboard.jsx`
- `/backend` — Express app
  - `main.js` (or `index.js`) — Express setup, routes
  - `bmrCalculations.js` — Mifflin-St Jeor + TDEE math, pure functions, unit-testable
  - `llmService.js` — Gemini client wrapper, swappable provider pattern
    (same dispatch-by-env-var pattern used in the Hindi Live-Dub project)
  - `.env` — `GEMINI_API_KEY`, `PORT`

## Environment & run commands
- Backend: `cd backend && npm install && npm run dev` (nodemon)
- Frontend: `cd frontend && npm install && npm run dev` (Vite dev server)
- Set `GEMINI_API_KEY` in `backend/.env` — get free key at
  https://aistudio.google.com/app/apikey

## Build phases (multi-day — do NOT try to build all at once)
1. **Scaffold** — Vite React app + Express app, basic routing, stats form
   working end to end (no LLM yet, just form → console.log).
2. **Backend analysis** — BMR/TDEE math + Gemini multimodal call wired up,
   tested via curl/Postman before touching frontend photo upload UI.
3. **Photo capture UI** — upload + pose overlay guide, wired to
   `/api/analyze`.
4. **3D body picker** — react-three-fiber scene with clickable primitive
   regions, hover/select highlighting.
5. **Plan generation** — `/api/plan` wired to a results dashboard UI.
6. **Polish** — animations, transitions, responsive layout.
7. **Later** — Docker Compose, React Native port, Android build.

## Resume framing
Project name: **Physique AI — Interactive Body Composition & Indian
Fitness Planner**
Repo: https://github.com/asaduh07/ai-fitness-planner (the repo slug is
`ai-fitness-planner` — "Physique AI" is the display/product name only)
One-liner: React + Three.js web app that estimates body composition from
guided photo capture, calculates real BMR/TDEE targets, and generates
India-specific veg/non-veg diet and workout plans through an interactive
3D body-region picker — architected with Node/Express, a swappable
multimodal LLM layer, and honest, range-based (not falsely precise)
health estimates.