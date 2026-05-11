import React, { useState } from 'react'
import { useApp } from '../contexts/AppContext.jsx'
import { MOOD_OPTS } from '../data/translations.js'

export default function MoodView() {
  const { tr, addStars, saveMood, setView } = useApp()
  const [selected, setSelected] = useState(null)
  const [saved, setSaved]       = useState(false)

  const handleSave = async (moodKey) => {
    if (saved) return
    const mood = MOOD_OPTS.find(m => m.key === moodKey)
    setSelected(moodKey)
    setSaved(true)
    await saveMood(moodKey)
    await addStars(1)
  }

  const selectedMood = MOOD_OPTS.find(m => m.key === selected)

  return (
    <div className="page fade-in">
      <h2 className="section-title">{tr.moodTitle}</h2>

      {!saved ? (
        <div className="mood-grid">
          {MOOD_OPTS.map(m => (
            <button
              key={m.key}
              className="mood-btn"
              onClick={() => handleSave(m.key)}
            >
              <span style={{ fontSize: 44 }}>{m.emoji}</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', marginTop: 6 }}>
                {tr[m.labelKey]}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', paddingTop: 16 }}>
          <div style={{ fontSize: 72, marginBottom: 12 }}>{selectedMood?.emoji}</div>
          <h3 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)', marginBottom: 8 }}>
            {tr.moodSaved}
          </h3>

          {/* Follow-up */}
          <div style={{
            background: selectedMood?.good ? '#D1FAE5' : '#FEE2E2',
            borderRadius: 16, padding: '16px 20px', margin: '16px 0',
          }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', lineHeight: 1.5 }}>
              {selectedMood?.good ? tr.moodFollowGood : tr.moodFollowBad}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8, flexDirection: 'column' }}>
            {!selectedMood?.good && (
              <button
                className="btn"
                style={{ background: 'linear-gradient(135deg,#0891B2,#10B981)', color: '#fff', width: '100%' }}
                onClick={() => setView('breathe')}
              >
                🌬️ {tr.secBreathe}
              </button>
            )}
            {selectedMood?.good && (
              <button
                className="btn"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#4C6EF5)', color: '#fff', width: '100%' }}
                onClick={() => setView('task')}
              >
                📚 {tr.secTask}
              </button>
            )}
            <button
              className="btn"
              style={{ background: 'rgba(0,0,0,.06)', color: 'var(--text)', width: '100%' }}
              onClick={() => { setSelected(null); setSaved(false) }}
            >
              ↺ {tr.routineReset}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
