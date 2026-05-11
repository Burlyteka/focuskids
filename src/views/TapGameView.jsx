import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useApp } from '../contexts/AppContext.jsx'
import { celebrate } from '../contexts/AppContext.jsx'

const GAME_SECS = 30

function randomPos() {
  return {
    top:  8 + Math.random() * 78,
    left: 4 + Math.random() * 84,
  }
}

export default function TapGameView() {
  const { tr, setSubview, addStars, incrementGamesPlayed } = useApp()

  const [started, setStarted]     = useState(false)
  const [timeLeft, setTimeLeft]   = useState(GAME_SECS)
  const [score, setScore]         = useState(0)
  const [starItems, setStarItems] = useState([])
  const [done, setDone]           = useState(false)
  const [starsWon, setStarsWon]   = useState(0)

  const timerRef = useRef(null)
  const spawnRef = useRef(null)

  const spawnStar = useCallback(() => {
    const id = Date.now() + Math.random()
    setStarItems(prev => [...prev, { id, ...randomPos() }])
    setTimeout(() => setStarItems(prev => prev.filter(s => s.id !== id)), 1800)
  }, [])

  const start = () => {
    clearInterval(timerRef.current)
    clearInterval(spawnRef.current)
    setStarted(true)
    setDone(false)
    setScore(0)
    setStarItems([])
    setTimeLeft(GAME_SECS)

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          clearInterval(spawnRef.current)
          setDone(true)
          return 0
        }
        return t - 1
      })
    }, 1000)

    spawnRef.current = setInterval(spawnStar, 650)
    spawnStar()
  }

  useEffect(() => {
    if (!done) return
    const n = score >= 15 ? 3 : 1
    setStarsWon(n)
    if (score >= 15) celebrate()
    addStars(n)
    incrementGamesPlayed()
  }, [done])

  useEffect(() => () => {
    clearInterval(timerRef.current)
    clearInterval(spawnRef.current)
  }, [])

  const catchStar = (id) => {
    setStarItems(prev => prev.filter(s => s.id !== id))
    setScore(s => s + 1)
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
          {tr.catchTitle}
        </h2>
      </div>

      {!started && !done && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 80, marginBottom: 16 }}>⭐</div>
          <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-soft)', marginBottom: 8 }}>
            {tr.catchReady}
          </p>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--purple)', marginBottom: 32 }}>
            {tr.catchTap}
          </p>
          <button
            className="btn"
            style={{ background: 'linear-gradient(135deg,#4C6EF5,#7C3AED)', color: '#fff', fontSize: 18, padding: '16px 40px' }}
            onClick={start}
          >
            {tr.catchStart}
          </button>
        </div>
      )}

      {started && !done && (
        <>
          {/* Score + timer bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexShrink: 0 }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#F59E0B' }}>⭐ {score}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: timeLeft <= 10 ? '#EF4444' : 'var(--purple)' }}>
              ⏱ {timeLeft}s
            </div>
          </div>

          {/* Arena — flex:1 fills remaining height */}
          <div
            className="catch-arena"
            style={{ flex: 1, height: 'auto', minHeight: 0 }}
          >
            {starItems.map(s => (
              <button
                key={s.id}
                onClick={() => catchStar(s.id)}
                style={{
                  position: 'absolute',
                  top: `${s.top}%`,
                  left: `${s.left}%`,
                  fontSize: 44,
                  background: 'none', border: 'none',
                  cursor: 'pointer', padding: 4, lineHeight: 1,
                  animation: 'catchStar .3s ease-out',
                  touchAction: 'manipulation',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  filter: 'drop-shadow(0 0 8px rgba(245,158,11,.9))',
                }}
              >⭐</button>
            ))}
          </div>
        </>
      )}

      {done && (
        <div className="result-overlay">
          <div className="result-card">
            <div style={{ fontSize: 64, marginBottom: 8 }}>🚀</div>
            <h2>{tr.catchDone(score)}</h2>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#F59E0B', margin: '12px 0' }}>
              +{starsWon} ⭐
            </div>
            <button className="btn" style={{ background: 'linear-gradient(135deg,#4C6EF5,#7C3AED)', color: '#fff', width: '100%' }} onClick={start}>
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
