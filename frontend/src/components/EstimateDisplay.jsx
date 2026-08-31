function EstimateDisplay({ result, onContinue }) {
  const { bmi, bmr, tdee, estimateRange, estimateNote } = result

  return (
    <div>
      <h1>Your Estimate</h1>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="value">{bmi.toFixed(1)}</div>
          <div className="label">BMI</div>
        </div>
        <div className="stat-card">
          <div className="value">{Math.round(bmr)}</div>
          <div className="label">BMR (kcal/day)</div>
        </div>
        <div className="stat-card">
          <div className="value">{Math.round(tdee)}</div>
          <div className="label">TDEE (kcal/day)</div>
        </div>
      </div>

      {estimateRange ? (
        <div className="estimate-box">
          <strong>Visual body composition estimate: {estimateRange}</strong>
          <p>{estimateNote}</p>
          <p className="disclaimer">
            This is a rough visual estimate only, not a medical or clinical
            measurement.
          </p>
        </div>
      ) : (
        <div className="estimate-box">
          <p className="note">
            The visual estimate wasn't available this time. Your BMI, BMR, and
            calorie numbers above are still accurate.
          </p>
        </div>
      )}

      <button type="button" onClick={onContinue}>
        Continue
      </button>
    </div>
  )
}

export default EstimateDisplay
