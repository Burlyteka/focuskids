import React, { useState, useEffect } from 'react'
import { useApp } from '../contexts/AppContext.jsx'

const PRESETS = [5, 10, 15, 20]

function fmtTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function TimerView() {
  const {
    tr, user,
    timerPreset, timerTotal, timerEndTime, timerPausedLeft, timerFinished,
    timerSelectPreset, timerStart, timerPause, timerReset,
  } = useApp()

  // Tick every 200ms while running to keep display fresh
  const [, tick] = useState(0)
  useEffect(() => {
    if (!timerEndTime) return
    const id = setInterval(() => tick(n => n + 1), 200)
    return () => clearInterval(id)
  }, [timerEndTime])

  const running = !!timerEndTime
  const left    = running
    ? Math.max(0, Math.round((timerEndTime - Date.now()) / 1000))
    : timerPausedLeft

  const ratio = timerTotal > 0 ? left / timerTotal : 1
  const pct   = (1 - ratio) * 100
  const color = ratio > 0.6 ? '#10B981' : ratio > 0.3 ? '#F59E0B' : '#EF4444'

  const handleToggle = () => running ? timerPause() : timerStart()

  return (
    <div className="page fade-in">
      <h2 className="section-title">{tr.timerTitle}</h2>

      {/* Presets */}
      <div className="timer-presets" style={{ marginBottom: 28 }}>
        {PRESETS.map(m => (
          <button
            key={m}
            className={`timer-preset${timerPreset === m ? ' active' : ''}`}
            onClick={() => timerSelectPreset(m)}
            disabled={running}
          >
            {m} {tr.timerMin}
          </button>
        ))}
      </div>

      {/* Pie timer */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="timer-pie-outer" style={{
          background: `conic-gradient(${color} ${pct}%, #E5E7EB ${pct}%)`,
        }}>
          <div className="timer-pie-inner">
            <div style={{
              fontSize: 38, fontWeight: 900,
              color: timerFinished ? color : 'var(--text)',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {fmtTime(left)}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-soft)', marginTop: 4 }}>
              {timerFinished ? '🎉' : running ? '●' : '○'}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 28 }}>
        {!timerFinished && (
          <button
            className="btn"
            style={{
              background: running
                ? 'linear-gradient(135deg,#F59E0B,#EF4444)'
                : 'linear-gradient(135deg,#10B981,#4C6EF5)',
              color: '#fff', fontSize: 17, padding: '14px 28px',
            }}
            onClick={handleToggle}
          >
            {running ? tr.timerPause : tr.timerStart}
          </button>
        )}
        <button
          className="btn"
          style={{ background: 'rgba(0,0,0,.06)', color: 'var(--text)', fontSize: 17, padding: '14px 28px' }}
          onClick={timerReset}
        >
          {tr.timerReset}
        </button>
      </div>

      {/* Done banner */}
      {timerFinished && (
        <div className="routine-done-banner pop" style={{ marginTop: 24 }}>
          <div style={{ fontSize: 64, marginBottom: 8 }}>🚀</div>
          <h2>{tr.timerDone(user?.username || '')}</h2>
          <p>{tr.timerDoneSub}</p>
          <button
            className="btn"
            style={{ background: 'rgba(255,255,255,.25)', color: '#fff', marginTop: 12 }}
            onClick={timerReset}
          >
            {tr.timerReset}
          </button>
        </div>
      )}
    </div>
  )
}
