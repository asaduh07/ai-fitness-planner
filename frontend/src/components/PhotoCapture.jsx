import { useState } from 'react'
import { API_BASE_URL } from '../config'

const FRONT_GUIDE = (
  <svg viewBox="0 0 100 140" className="pose-guide">
    <ellipse cx="50" cy="18" rx="12" ry="14" fill="none" stroke="currentColor" strokeWidth="2" />
    <path
      d="M50 32 L50 85 M50 40 L25 70 M50 40 L75 70 M50 85 L30 135 M50 85 L70 135"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path d="M35 40 L65 40 L70 85 L30 85 Z" fill="none" stroke="currentColor" strokeWidth="2" />
  </svg>
)

const SIDE_GUIDE = (
  <svg viewBox="0 0 100 140" className="pose-guide">
    <ellipse cx="52" cy="18" rx="11" ry="14" fill="none" stroke="currentColor" strokeWidth="2" />
    <path
      d="M50 32 L50 85 M50 45 L35 70 M50 85 L42 135 M50 85 L58 135"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path d="M42 40 L60 38 L64 85 L44 85 Z" fill="none" stroke="currentColor" strokeWidth="2" />
  </svg>
)

const SLOTS = [
  { key: 'front', label: 'Front', guide: FRONT_GUIDE, required: true },
  { key: 'side', label: 'Side', guide: SIDE_GUIDE, required: true },
  { key: 'back', label: 'Back (optional)', guide: FRONT_GUIDE, required: false },
]

function PhotoCapture({ stats, onAnalyzed }) {
  const [photos, setPhotos] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function handleFileChange(key, file) {
    if (!file) return
    setPhotos((prev) => {
      if (prev[key]) URL.revokeObjectURL(prev[key].url)
      return { ...prev, [key]: { file, url: URL.createObjectURL(file) } }
    })
  }

  const canSubmit = photos.front && photos.side && !loading

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData()
    Object.entries(photos).forEach(([, { file }]) => formData.append('photos', file))
    Object.entries(stats).forEach(([key, value]) => formData.append(key, value))

    try {
      const res = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`)
      }
      const data = await res.json()
      onAnalyzed(data)
    } catch (err) {
      console.error('Photo analysis failed:', err.message)
      setError('Something went wrong analyzing your photos. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Photos</h1>
      <p className="note">
        Line up with the outline as a rough guide, then upload each photo.
      </p>

      <div className="photo-slots">
        {SLOTS.map((slot) => (
          <div className="photo-slot" key={slot.key}>
            <label>
              {slot.label}
              <div className="photo-slot-preview">
                {photos[slot.key] ? (
                  <img src={photos[slot.key].url} alt={`${slot.label} preview`} />
                ) : (
                  slot.guide
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(slot.key, e.target.files[0])}
              />
            </label>
          </div>
        ))}
      </div>

      {error && <p className="error-box">{error}</p>}

      <button type="submit" disabled={!canSubmit}>
        {loading && <span className="spinner" />}
        {loading ? 'Calculating your estimate...' : 'Analyze'}
      </button>
    </form>
  )
}

export default PhotoCapture
