import React, { useState, useEffect, useRef } from 'react'
import { useApp } from '../contexts/AppContext.jsx'
import { celebrate } from '../contexts/AppContext.jsx'
import { EXERCISES } from '../data/translations.js'

export default function MoveView() {
  const { tr, addStars } = useApp()

  const [started, setStarted]   = useState(false)
  const [exIdx, setExIdx]       = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [done, setDone]         = useState(false)
  const [transitioning, setTransitioning] = useState(false)

  const timerRef = useRef(null)
  const timeRef  = useRef(0)
  const exRef    = useRef(0)

  const startExercise = (idx) => {
    clearInterval(timerRef.current)
    const dur = EXERCISES[idx].dur
    timeRef.current = dur
    setTimeLeft(dur)
    setExIdx(idx)
    exRef.current = idx

    timerRef.current = setInterval(() => {
      timeRef.current -= 1
      setTimeLeft(timeRef.current)
      if (timeRef.current <= 0) {
        clearInterval(timerRef.current)
        const next = exRef.current + 1
        if (next >= EXERCISES.length) {
          setDone(true)
          celebrate()
          addStars(3)
        } else {
          setTransitioning(true)
          setTimeout(() => {
            setTransitioning(false)
            startExercise(next)
          }, 700)
        }
      }
    }, 1000)
  }

  useEffect(() => () => clearInterval(timerRef.current), [])

  const start = () => {
    setDone(false)
    setStarted(true)
    setTransitioning(false)
    startExercise(0)
  }

  const ex = EXERCISES[exIdx]
  const dur = EXERCISES[exIdx]?.dur || 1
  const CIRC = 2 * Math.PI * 52

  return (
    <div className="page fade-in">
      <h2 className="section-title">{tr.moveTitle}</h2>

      {!started && !done ? (
        <div style={{ textAlign: 'center', paddingTop: 16 }}>
          <div style={{ fontSize: 72, marginBottom: 12 }}>🏃</div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 28, flexWrap: 'wrap' }}>
            {EXERCISES.map((e, i) => (
              <div key={e.key} style={{
                background: 'var(--purple-xlight)', borderRadius: 12,
                padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{ fontSize: 24 }}>{e.emoji}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--purple)' }}>{e.dur}s</span>
              </div>
            ))}
          </div>

          <button
            className="btn"
            style={{ background: 'linear-gradient(135deg,#EF4444,#F97316)', color: '#fff', fontSize: 18, padding: '16px 40px' }}
            onClick={start}
          >
            {tr.moveStart}
          </button>
        </div>
      ) : done ? (
        <div className="routine-done-banner pop" style={{ marginTop: 16 }}>
          <div style={{ fontSize: 64, marginBottom: 8 }}>💪</div>
          <h2>{tr.moveDone}</h2>
          <p style={{ marginBottom: 20 }}>{tr.moveDoneSub}</p>
          <button
            className="btn"
            style={{ background: 'rgba(255,255,255,.25)', color: '#fff' }}
            onClick={start}
          >
            {tr.moveStart}
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
            {EXERCISES.map((e, i) => (
              <div key={e.key} style={{
                width: 32, height: 32, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14,
                background: i < exIdx ? 'var(--purple)' : i === exIdx && !transitioning ? 'var(--blue)' : '#E5E7EB',
                color: i <= exIdx ? '#fff' : 'var(--text-soft)',
                fontWeight: 900,
                transition: 'background .3s',
              }}>
                {i < exIdx ? '✓' : i + 1}
              </div>
            ))}
          </div>

          <p style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: 'var(--text-soft)', marginBottom: 16 }}>
            {exIdx + 1} {tr.moveOf} {EXERCISES.length}
          </p>

          <div style={{ textAlign: 'center' }} className={transitioning ? 'fade-in' : ''}>
            <div
              style={{ fontSize: 80, marginBottom: 8 }}
              className={`anim-${ex.anim}`}
            >
              {ex.emoji}
            </div>

            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', margin: '8px 0' }}>
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#E5E7EB" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r="52"
                  fill="none"
                  stroke={timeLeft <= 5 ? '#EF4444' : timeLeft <= 10 ? '#F59E0B' : '#7C3AED'}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={CIRC}
                  strokeDashoffset={CIRC * (1 - timeLeft / dur)}
                  transform="rotate(-90 60 60)"
                  style={{ transition: 'stroke-dashoffset 1s linear, stroke .5s' }}
                />
                <text x="60" y="67" textAnchor="middle" fill="var(--text)"
                  style={{ fontSize: 28, fontWeight: 900, fontFamily: 'var(--font)' }}>
                  {timeLeft}
                </text>
              </svg>
            </div>

            <h3 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)', marginBottom: 4, marginTop: 8 }}>
              {tr[ex.key]}
            </h3>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-soft)' }}>
              {tr[ex.key + '_d']}
            </p>
          </div>
        </>
      )}
    </div>
  )
}
