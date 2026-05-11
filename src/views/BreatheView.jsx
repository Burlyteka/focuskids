import React, { useState, useEffect, useRef } from 'react'
import { useApp } from '../contexts/AppContext.jsx'
import { celebrate } from '../contexts/AppContext.jsx'

// 4-7-8 technique
const PHASES = [
  { key: 'inhale',  labelKey: 'breatheInhale', dur: 4  },
  { key: 'hold',    labelKey: 'breatheHold',   dur: 7  },
  { key: 'exhale',  labelKey: 'breatheExhale', dur: 8  },
]
const TOTAL_ROUNDS = 3

export default function BreatheView() {
  const { tr, addStars } = useApp()

  const [started, setStarted]   = useState(false)
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [count, setCount]       = useState(PHASES[0].dur)
  const [round, setRound]       = useState(0)
  const [done, setDone]         = useState(false)

  const timerRef  = useRef(null)
  const phaseRef  = useRef(0)
  const countRef  = useRef(PHASES[0].dur)
  const roundRef  = useRef(0)

  const tick = () => {
    countRef.current -= 1
    if (countRef.current <= 0) {
      phaseRef.current = (phaseRef.current + 1) % PHASES.length
      if (phaseRef.current === 0) {
        roundRef.current += 1
        setRound(roundRef.current)
        if (roundRef.current >= TOTAL_ROUNDS) {
          clearInterval(timerRef.current)
          setDone(true)
          celebrate({ particleCount: 60 })
          addStars(2)
          return
        }
      }
      countRef.current = PHASES[phaseRef.current].dur
    }
    setPhaseIdx(phaseRef.current)
    setCount(countRef.current)
  }

  useEffect(() => {
    if (!started || done) return
    timerRef.current = setInterval(tick, 1000)
    return () => clearInterval(timerRef.current)
  }, [started, done])

  const start = () => {
    clearInterval(timerRef.current)
    phaseRef.current = 0
    countRef.current = PHASES[0].dur
    roundRef.current = 0
    setPhaseIdx(0)
    setCount(PHASES[0].dur)
    setRound(0)
    setDone(false)
    setStarted(true)
  }

  const phase = PHASES[phaseIdx]
  return (
    <div className="page fade-in">
      <h2 className="section-title">{tr.breatheTitle}</h2>

      {!started && !done ? (
        <div style={{ textAlign: 'center', paddingTop: 20 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🌬️</div>
          <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-soft)', marginBottom: 32, lineHeight: 1.6 }}>
            4 – 7 – 8
          </p>
          <button
            className="btn"
            style={{ background: 'linear-gradient(135deg,#0891B2,#10B981)', color: '#fff', fontSize: 18, padding: '16px 48px' }}
            onClick={start}
          >
            {tr.breatheStart}
          </button>
        </div>
      ) : done ? (
        <div className="routine-done-banner pop" style={{ marginTop: 24 }}>
          <div style={{ fontSize: 64, marginBottom: 8 }}>😌</div>
          <h2>{tr.breatheDone}</h2>
          <p style={{ marginBottom: 20 }}>{tr.breatheDoneSub}</p>
          <button
            className="btn"
            style={{ background: 'rgba(255,255,255,.25)', color: '#fff' }}
            onClick={start}
          >
            {tr.breatheStart}
          </button>
        </div>
      ) : (
        <>
          <div className="breathe-circle-wrap">
            <div className={`breathe-ring ${phase.key}`}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 4 }}>
                {tr[phase.labelKey]}
              </div>
              <div style={{ fontSize: 48, fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                {count}
              </div>
            </div>
          </div>

          <p style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: 'var(--text-soft)', marginTop: 16, marginBottom: 10 }}>
            {tr.breatheRound} {round + 1} {tr.breatheOf} {TOTAL_ROUNDS}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
            {Array.from({ length: TOTAL_ROUNDS }, (_, i) => (
              <div key={i} style={{
                width: 12, height: 12, borderRadius: '50%',
                background: i < round ? 'var(--purple)' : i === round ? 'var(--blue)' : '#E5E7EB',
                transition: 'background .3s',
              }} />
            ))}
          </div>

          {/* Phase bar */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 14 }}>
            {PHASES.map((p, i) => (
              <div key={p.key} style={{
                height: 6, width: 52, borderRadius: 999,
                background: i === phaseIdx ? 'var(--purple)' : i < phaseIdx ? 'var(--blue)' : '#E5E7EB',
                transition: 'background .3s',
              }} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
