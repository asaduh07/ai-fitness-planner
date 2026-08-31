function PlanDashboard({ plan }) {
  const { dietPlan, workoutPlan } = plan

  return (
    <div>
      <h1>Your Plan</h1>

      <h2>Diet ({dietPlan.calorieTarget} kcal/day)</h2>
      <div className="card-list">
        {dietPlan.meals.map((meal) => (
          <div className="plan-card" key={meal.name}>
            <strong>{meal.name}</strong>
            <span className="note">{meal.approxCalories} kcal</span>
            <ul>
              {meal.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <h2>Workout ({workoutPlan.daysPerWeek} days/week)</h2>
      <div className="card-list">
        {workoutPlan.split.map((day) => (
          <div className="plan-card" key={day.day}>
            <strong>{day.day}</strong>
            <span className="note">{day.focus}</span>
            <ul>
              {day.exercises.map((ex) => (
                <li key={ex.name}>
                  {ex.name} — {ex.sets}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PlanDashboard
