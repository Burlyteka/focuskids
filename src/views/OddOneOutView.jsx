import React, { useState } from 'react'
import { useApp } from '../contexts/AppContext.jsx'
import { celebrate } from '../contexts/AppContext.jsx'

const ALL_ROUNDS = [
  { group: ['🐶', '🐱', '🐰'], odd: '🍎', hint: { es: 'Animales', en: 'Animals' } },
  { group: ['🚗', '🚲', '✈️'], odd: '🍕', hint: { es: 'Vehículos', en: 'Vehicles' } },
  { group: ['⚽', '🏀', '🎾'], odd: '👕', hint: { es: 'Deportes', en: 'Sports' } },
  { group: ['🌧️', '⛄', '☀️'], odd: '🐸', hint: { es: 'El tiempo', en: 'Weather' } },
  { group: ['🍰', '🍭', '🍦'], odd: '🥦', hint: { es: 'Dulces', en: 'Sweets' } },
  { group: ['🎸', '🎹', '🥁'], odd: '🐺', hint: { es: 'Instrumentos', en: 'Instruments' } },
  { group: ['🌟', '🚀', '🪐'], odd: '🐋', hint: { es: 'Espacio', en: 'Space' } },
  { group: ['🌹', '🌻', '🌿'], odd: '🏆', hint: { es: 'Plantas', en: 'Plants' } },
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function OddOneOutView() {
  const { tr, lang, setSubview, addStars, incrementGamesPlayed } = useApp()

  const [started, setStarted] = useState(false)
  const [rounds, setRounds]   = useState([])
  const [current, setCurrent] = useState(0)
  const [score, setScore]     = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [done, setDone]       = useState(false)
  const [starsWon, setStarsWon] = useState(0)

  const startGame = () => {
    const built = shuffle(ALL_ROUNDS).slice(0, 5).map(def => {
      const items = shuffle([...def.group, def.odd])
      return { items, oddIndex: items.indexOf(def.odd), hint: def.hint[lang] }
    })
    setRounds(built)
    setCurrent(0)
    setScore(0)
    setFeedback(null)
    setDone(false)
    setStarted(true)
  }

  const handleTap = (idx) => {
    if (feedback) return
    const round = rounds[current]
    const correct = idx === round.oddIndex
    setFeedback(correct ? 'correct' : 'wrong')
    const newScore = correct ? score + 1 : score
    if (correct) setScore(newScore)

    setTimeout(() => {
      setFeedback(null)
      if (current + 1 >= rounds.length) {
        const n = newScore >= 4 ? 3 : newScore >= 2 ? 2 : 1
        setStarsWon(n)
        if (newScore >= 4) celebrate()
        addStars(n)
        incrementGamesPlayed()
        setDone(true)
      } else {
        setCurrent(c => c + 1)
      }
    }, 800)
  }

  const round = rounds[current]

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: 'calc(100% - var(--nav-h))',
      padding: '12px 14px', overflow: 'hidden',
    }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexShrink: 0 }}>
        <button className="back-btn" style={{ marginBottom: 0 }} onClick={() => setSubview(null)}>
          {tr.backBtn}
        </button>
        <h2 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text)', margin: 0 }}>
          {tr.oddTitle}
        </h2>
      </div>

      {/* Start screen */}
      {!started && !done && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 80, marginBottom: 16 }}>🔵</div>
          <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-soft)', marginBottom: 8, textAlign: 'center' }}>
            {tr.gameOddDesc}
          </p>
          <button className="btn"
            style={{ background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)', color: '#fff', fontSize: 18, padding: '16px 40px' }}
            onClick={startGame}>
            {tr.oddStart}
          </button>
        </div>
      )}

      {/* Game screen */}
      {started && !done && round && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-soft)' }}>
            {current + 1} / {rounds.length}
          </div>

          <div style={{
            background: 'rgba(124,58,237,.12)', color: 'var(--purple)',
            borderRadius: 999, padding: '8px 20px', fontSize: 15, fontWeight: 800,
          }}>
            {lang === 'es'
              ? `¿Cuál NO es ${round.hint}?`
              : `Which is NOT ${round.hint}?`}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, width: '100%', maxWidth: 300 }}>
            {round.items.map((item, idx) => {
              let bg = 'var(--card)'
              let border = '3px solid transparent'
              if (feedback && idx === round.oddIndex) {
                bg     = feedback === 'correct' ? 'rgba(16,185,129,.2)' : 'rgba(239,68,68,.2)'
                border = feedback === 'correct' ? '3px solid #10B981'  : '3px solid #EF4444'
              }
              return (
                <button key={idx} onClick={() => handleTap(idx)} style={{
                  fontSize: 54, background: bg, border,
                  borderRadius: 20, padding: '18px 0',
                  cursor: 'pointer', transition: 'all .2s',
                  boxShadow: '0 2px 10px rgba(0,0,0,.08)',
                }}>
                  {item}
                </button>
              )
            })}
          </div>

          {feedback && (
            <div style={{ fontSize: 20, fontWeight: 900, color: feedback === 'correct' ? '#10B981' : '#EF4444' }}>
              {feedback === 'correct'
                ? (lang === 'es' ? '¡Correcto! ✅' : 'Correct! ✅')
                : (lang === 'es' ? '¡Uy! ❌' : 'Oops! ❌')}
            </div>
          )}
        </div>
      )}

      {/* Result overlay */}
      {done && (
        <div className="result-overlay">
          <div className="result-card">
            <div style={{ fontSize: 64, marginBottom: 8 }}>
              {score >= 4 ? '🏆' : score >= 2 ? '🌟' : '😅'}
            </div>
            <h2>
              {lang === 'es'
                ? `${score}/${rounds.length} correctas`
                : `${score}/${rounds.length} correct`}
            </h2>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#F59E0B', margin: '12px 0' }}>
              +{starsWon} ⭐
            </div>
            <button className="btn"
              style={{ background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)', color: '#fff', width: '100%' }}
              onClick={startGame}>
              {tr.playAgain}
            </button>
            <button className="btn"
              style={{ marginTop: 10, width: '100%', background: 'rgba(0,0,0,.06)', color: 'var(--text)' }}
              onClick={() => setSubview(null)}>
              {tr.backBtn}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
