import { useState } from 'react'

const initialStats = {
  heightCm: '',
  weightKg: '',
  age: '',
  gender: 'male',
  dietPref: 'veg',
  activityLevel: 'moderate',
}

function StatsForm({ onSubmit }) {
  const [stats, setStats] = useState(initialStats)

  function handleChange(e) {
    const { name, value } = e.target
    setStats((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit(stats)
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Your Stats</h1>

      <label>
        Height (cm)
        <input
          type="number"
          name="heightCm"
          value={stats.heightCm}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Weight (kg)
        <input
          type="number"
          name="weightKg"
          value={stats.weightKg}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Age
        <input
          type="number"
          name="age"
          value={stats.age}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Gender
        <select name="gender" value={stats.gender} onChange={handleChange}>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </label>

      <label>
        Diet preference
        <select name="dietPref" value={stats.dietPref} onChange={handleChange}>
          <option value="veg">Vegetarian</option>
          <option value="nonveg">Non-vegetarian</option>
        </select>
      </label>

      <label>
        Activity level
        <select
          name="activityLevel"
          value={stats.activityLevel}
          onChange={handleChange}
        >
          <option value="sedentary">Sedentary</option>
          <option value="light">Light</option>
          <option value="moderate">Moderate</option>
          <option value="active">Active</option>
          <option value="very_active">Very active</option>
        </select>
      </label>

      <button type="submit">Continue</button>
    </form>
  )
}

export default StatsForm
