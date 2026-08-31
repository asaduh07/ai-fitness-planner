import 'dotenv/config'
import { GoogleGenAI, Type } from '@google/genai'

const MODEL = 'gemini-3.6-flash'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    estimateRange: { type: Type.STRING },
    estimateNote: { type: Type.STRING },
  },
  required: ['estimateRange', 'estimateNote'],
}

const PROMPT = `You are looking at body photos (front/side/back) alongside
these stats: {{STATS}}

Give a rough VISUAL estimate of body composition (body fat %). This is
NOT a clinical measurement, so:
- estimateRange MUST be a range like "18-22%", never a single precise
  number like "19.3%".
- estimateNote is one calm, factual sentence about what you visually
  observed (e.g. "Moderate muscle definition with some fat coverage
  around the midsection"). Do not diagnose any health condition and do
  not use hype-y language.

Respond only with the JSON fields requested.`

export async function analyzeBodyComposition(photosBase64Array, stats) {
  const imageParts = photosBase64Array.map((base64) => ({
    inlineData: { mimeType: 'image/jpeg', data: base64 },
  }))

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: 'user',
        parts: [{ text: PROMPT.replace('{{STATS}}', JSON.stringify(stats)) }, ...imageParts],
      },
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
    },
  })

  return JSON.parse(response.text)
}

const PLAN_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    dietPlan: {
      type: Type.OBJECT,
      properties: {
        calorieTarget: { type: Type.NUMBER },
        meals: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              items: { type: Type.ARRAY, items: { type: Type.STRING } },
              approxCalories: { type: Type.NUMBER },
            },
            required: ['name', 'items', 'approxCalories'],
          },
        },
      },
      required: ['calorieTarget', 'meals'],
    },
    workoutPlan: {
      type: Type.OBJECT,
      properties: {
        daysPerWeek: { type: Type.NUMBER },
        split: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              day: { type: Type.STRING },
              focus: { type: Type.STRING },
              exercises: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    sets: { type: Type.STRING },
                  },
                  required: ['name', 'sets'],
                },
              },
            },
            required: ['day', 'focus', 'exercises'],
          },
        },
      },
      required: ['daysPerWeek', 'split'],
    },
  },
  required: ['dietPlan', 'workoutPlan'],
}

const PLAN_PROMPT = `Create a personalized Indian diet and workout plan from
these inputs: {{INPUTS}}

Diet plan rules:
- Indian home-style food only (dal, sabzi, roti/chapati, rice, curd, etc) —
  do NOT default to American/European foods (no oatmeal-and-toast style
  Western defaults).
- Respect dietPref strictly: "veg" means no meat, egg, or fish anywhere in
  the plan; "nonveg" may include meat, egg, or fish.
- Derive calorieTarget sensibly from tdee — a moderate deficit or surplus
  is fine depending on context, but never prescribe an extreme deficit or
  surplus. Do not just echo tdee as calorieTarget.
- Include 4-5 meals across the day with realistic Indian dish names.

Workout plan rules:
- split should prioritize the muscle groups listed in focusRegions, but
  still include at least one full-body or complementary day so the plan
  isn't narrowly one-sided.
- daysPerWeek should match the number of entries in split.
- Keep exercise sets realistic (e.g. "3x12").

Respond only with the JSON fields requested.`

export async function generatePlan({ dietPref, estimateRange, tdee, focusRegions }) {
  const inputs = { dietPref, estimateRange, tdee, focusRegions }

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: 'user',
        parts: [{ text: PLAN_PROMPT.replace('{{INPUTS}}', JSON.stringify(inputs)) }],
      },
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: PLAN_RESPONSE_SCHEMA,
    },
  })

  try {
    return JSON.parse(response.text)
  } catch (err) {
    throw new Error(`Gemini returned malformed plan JSON: ${err.message}`)
  }
}
