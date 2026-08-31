import { Fragment, useState } from 'react'
import { API_BASE_URL } from './config'
import StatsForm from './components/StatsForm'
import PhotoCapture from './components/PhotoCapture'
import EstimateDisplay from './components/EstimateDisplay'
import BodyPicker3D from './components/BodyPicker3D'
import PlanDashboard from './components/PlanDashboard'
import './App.css'

const STEP_LABELS = ['Stats', 'Photos', 'Estimate', 'Focus', 'Plan']

function App() {
  const [step, setStep] = useState(1)
  const [stats, setStats] = useState(null)
  const [result, setResult] = useState(null)
  const [focusRegions, setFocusRegions] = useState([])
  const [plan, setPlan] = useState(null)
  const [planLoading, setPlanLoading] = useState(false)
  const [planError, setPlanError] = useState(null)

  function handleStatsSubmit(submittedStats) {
    setStats(submittedStats)
    setStep(2)
  }

  function handleAnalyzed(data) {
    setResult(data)
    setStep(3)
  }

  async function handleGeneratePlan() {
    setPlanLoading(true)
    setPlanError(null)

    try {
      const res = await fetch(`${API_BASE_URL}/api/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dietPref: stats.dietPref,
          estimateRange: result.estimateRange,
          tdee: result.tdee,
          focusRegions,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || `Server responded with ${res.status}`)
      }
      setPlan(data)
      setStep(5)
    } catch (err) {
      setPlanError(err.message)
    } finally {
      setPlanLoading(false)
    }
  }

  return (
    <div className="app">
      <div className="steps">
        {STEP_LABELS.map((label, i) => {
          const num = i + 1
          const className = num === step ? 'step-item active' : num < step ? 'step-item done' : 'step-item'
          return (
            <Fragment key={label}>
              <div className={className}>
                <span className="step-num">{num}</span>
                <span className="step-label">{label}</span>
              </div>
              {i < STEP_LABELS.length - 1 && <div className="step-line" />}
            </Fragment>
          )
        })}
      </div>

      <div className="step-content" key={step}>
        {step === 1 && <StatsForm onSubmit={handleStatsSubmit} />}
        {step === 2 && <PhotoCapture stats={stats} onAnalyzed={handleAnalyzed} />}
        {step === 3 && <EstimateDisplay result={result} onContinue={() => setStep(4)} />}
        {step === 4 && (
          <>
            <BodyPicker3D onSelectionChange={setFocusRegions} />
            {planError && <p className="error-box">{planError}</p>}
            <button type="button" onClick={handleGeneratePlan} disabled={planLoading}>
              {planLoading && <span className="spinner" />}
              {planLoading ? 'Putting your plan together...' : 'Generate Plan'}
            </button>
          </>
        )}
        {step === 5 && <PlanDashboard plan={plan} />}
      </div>
    </div>
  )
}

export default App
