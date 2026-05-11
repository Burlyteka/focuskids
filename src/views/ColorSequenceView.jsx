import React, { useState, useCallback } from 'react'
import { useApp } from '../contexts/AppContext.jsx'
import { celebrate } from '../contexts/AppContext.jsx'

const BUTTONS = [
  { id: 0, color: '#EF4444', emoji: '❤️' },
  { id: 1, color: '#10B981', emoji: '💚' },
  { id: 2, color: '#4C6EF5', emoji: '💙' },
  { id: 3, color: '#F59E0B', emoji: '💛' },
]

const SHOW_DUR    = 500
const INTER_DELAY = 300

export default function ColorSequenceView() {
  const { tr, setSubview, addStars, incrementGamesPlayed } = useApp()

  const [started, setStarted]   = useState(false)
  const [sequence, setSequence] = useState([])
  const [input, setInput]       = useState([])
  const [lit, setLit]           = useState(null)
  const [phase, setPhase]       = useState('idle')
  const [level, setLevel]       = useState(0)
  const [starsWon, setStarsWon] = useState(0)

  const showSequence = useCallback((seq) => {
    setPhase('showing')
    let i = 0
    const step = () => {
      if (i >= seq.length) {
        setLit(null)
        setTimeout(() => setPhase('player'), INTER_DELAY)
        return
      }
      setLit(seq[i])
      setTimeout(() => {
        setLit(null)
        i++
        setTimeout(step, INTER_DELAY)
      }, SHOW_DUR)
    }
    setTimeout(step, 600)
  }, [])

  const startGame = () => {
    const first = [Math.floor(Math.random() * 4)]
    setSequence(first)
    setInput([])
    setLevel(1)
    setStarted(true)
    setPhase('showing')
    showSequence(first)
  }

  const handlePress = (id) => {
    if (phase !== 'player') return
    const next = [...input, id]
    const pos = next.length - 1

    setLit(id)
    setTimeout(() => setLit(null), 250)

    if (next[pos] !== sequence[pos]) {
      const n = Math.max(1, Math.floor(level / 2))
      setStarsWon(n)
      setPhase('done')
      if (level >= 8) celebrate()
      addStars(n)
      incrementGamesPlayed()
      return
    }

    if (next.length === sequence.length) {
      const newLevel = level + 1
      setLevel(newLevel)
      if (newLevel > 3) celebrate({ particleCount: 40, spread: 50 })
      const newSeq = [...sequence, Math.floor(Math.random() * 4)]
      setSequence(newSeq)
      setInput([])
      setTimeout(() => showSequence(newSeq), 800)
    } else {
      setInput(next)
    }
  }

  const statusText = {
    showing: `${tr.simonWatch} — ${tr.simonLevel} ${level}`,
    player:  `${tr.simonGo} — ${tr.simonLevel} ${level}`,
    done:    tr.simonDone(level),
    idle:    '',
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: 'calc(100% - var(--nav-h))',
      padding: '12px 14px',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexShrink: 0 }}>
        <button className="back-btn" style={{ marginBottom: 0 }} onClick={() => setSubview(null)}>
          {tr.backBtn}
        </button>
        <h2 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text)', margin: 0 }}>
          {tr.simonTitle}
        </h2>
      </div>

      {!started ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 80, marginBottom: 16 }}>🌈</div>
          <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-soft)', marginBottom: 24, textAlign: 'center' }}>
            {tr.gameSimonDesc}
          </p>
          <button
            className="btn"
            style={{ background: 'linear-gradient(135deg,#EC4899,#F97316)', color: '#fff', fontSize: 18, padding: '16px 40px' }}
            onClick={startGame}
          >
            {tr.simonStart}
          </button>
        </div>
      ) : (
        <>
          {/* Level + status */}
          <div style={{ textAlign: 'center', marginBottom: 10, flexShrink: 0 }}>
            <span style={{
              display: 'inline-block', background: 'var(--purple-xlight)',
              color: 'var(--purple)', borderRadius: 999, padding: '6px 18px',
              fontSize: 15, fontWeight: 800,
            }}>
              {tr.simonLevel} {level}
            </span>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-soft)', marginTop: 8, minHeight: 22 }}>
              {statusText[phase]}
            </div>
          </div>

          {/* Buttons — flex:1 fills remaining height */}
          <div style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: '1fr 1fr',
            gap: 14,
            minHeight: 0,
          }}>
            {BUTTONS.map(btn => (
              <button
                key={btn.id}
                className={`simon-btn${lit === btn.id ? ' lit' : ''}`}
                style={{
                  background: btn.color, color: '#fff', borderRadius: 24, fontSize: 48,
                  width: '100%', height: '100%', aspectRatio: 'auto',
                }}
                onClick={() => handlePress(btn.id)}
                disabled={phase !== 'player'}
              >
                {btn.emoji}
              </button>
            ))}
          </div>
        </>
      )}

      {phase === 'done' && (
        <div className="result-overlay">
          <div className="result-card">
            <div style={{ fontSize: 64, marginBottom: 8 }}>
              {level >= 8 ? '🏆' : level >= 5 ? '🌟' : '😅'}
            </div>
            <h2>{tr.simonDone(level)}</h2>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#F59E0B', margin: '12px 0' }}>
              +{starsWon} ⭐
            </div>
            <button className="btn" style={{ background: 'linear-gradient(135deg,#EC4899,#F97316)', color: '#fff', width: '100%' }} onClick={startGame}>
              {tr.playAgain}
            </button>
            <button className="btn" style={{ marginTop: 10, width: '100%', background: 'rgba(0,0,0,.06)', color: 'var(--text)' }} onClick={() => setSubview(null)}>
              {tr.backBtn}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
