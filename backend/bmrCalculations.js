const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
}

export function calculateBMR({ weightKg, heightCm, age, gender }) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  return gender === 'female' ? base - 161 : base + 5
}

export function calculateTDEE(bmr, activityLevel) {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel]
  if (!multiplier) {
    throw new Error(`Unknown activityLevel: ${activityLevel}`)
  }
  return bmr * multiplier
}

if (process.argv[1] && process.argv[1].endsWith('bmrCalculations.js')) {
  // Hand-calculated: 30yo male, 80kg, 180cm
  // BMR = 10*80 + 6.25*180 - 5*30 + 5 = 800 + 1125 - 150 + 5 = 1780
  const bmr = calculateBMR({ weightKg: 80, heightCm: 180, age: 30, gender: 'male' })
  const bmrExpected = 1780
  const bmrPass = Math.abs(bmr - bmrExpected) < 0.001
  console.log(`calculateBMR: got ${bmr}, expected ${bmrExpected} -> ${bmrPass ? 'PASS' : 'FAIL'}`)

  // TDEE at moderate (1.55): 1780 * 1.55 = 2759
  const tdee = calculateTDEE(bmr, 'moderate')
  const tdeeExpected = 2759
  const tdeePass = Math.abs(tdee - tdeeExpected) < 0.001
  console.log(`calculateTDEE: got ${tdee}, expected ${tdeeExpected} -> ${tdeePass ? 'PASS' : 'FAIL'}`)

  // Hand-calculated: 25yo female, 60kg, 165cm
  // BMR = 10*60 + 6.25*165 - 5*25 - 161 = 600 + 1031.25 - 125 - 161 = 1345.25
  const bmrF = calculateBMR({ weightKg: 60, heightCm: 165, age: 25, gender: 'female' })
  const bmrFExpected = 1345.25
  const bmrFPass = Math.abs(bmrF - bmrFExpected) < 0.001
  console.log(`calculateBMR (female): got ${bmrF}, expected ${bmrFExpected} -> ${bmrFPass ? 'PASS' : 'FAIL'}`)

  if (!bmrPass || !tdeePass || !bmrFPass) {
    process.exit(1)
  }
}
