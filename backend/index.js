import express from 'express'
import cors from 'cors'
import multer from 'multer'
import 'dotenv/config'
import { calculateBMR, calculateTDEE } from './bmrCalculations.js'
import { analyzeBodyComposition, generatePlan } from './llmService.js'

const upload = multer({ storage: multer.memoryStorage() })

const allowedOrigins = (process.env.ALLOWED_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())

const app = express()
app.use(cors({ origin: allowedOrigins }))
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

app.post('/api/analyze', upload.array('photos', 4), async (req, res) => {
  if (!req.files || req.files.length < 2) {
    return res.status(400).json({ error: 'At least front and side photos are required' })
  }

  const { heightCm, weightKg, age, gender, activityLevel } = req.body

  const stats = {
    heightCm: Number(heightCm),
    weightKg: Number(weightKg),
    age: Number(age),
    gender,
  }

  const bmr = calculateBMR(stats)
  const tdee = calculateTDEE(bmr, activityLevel)
  const bmi = stats.weightKg / (stats.heightCm / 100) ** 2

  const result = { bmi, bmr, tdee, estimateRange: null, estimateNote: null }

  try {
    const photosBase64Array = (req.files || []).map((f) => f.buffer.toString('base64'))
    const { estimateRange, estimateNote } = await analyzeBodyComposition(photosBase64Array, stats)
    result.estimateRange = estimateRange
    result.estimateNote = estimateNote
  } catch (err) {
    console.error('analyzeBodyComposition failed:', err.message)
    result.estimateNote = 'Visual estimate unavailable right now.'
  }

  res.json(result)
})

app.post('/api/plan', async (req, res) => {
  const { dietPref, estimateRange, tdee, focusRegions } = req.body

  try {
    const { dietPlan, workoutPlan } = await generatePlan({ dietPref, estimateRange, tdee, focusRegions })
    res.json({ dietPlan, workoutPlan })
  } catch (err) {
    console.error('generatePlan failed:', err.message)
    res.status(502).json({ error: 'Could not generate a plan right now. Please try again.' })
  }
})

const port = process.env.PORT || 5000
app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`)
})
