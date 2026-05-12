import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useApp } from '../contexts/AppContext.jsx'
import { celebrate } from '../contexts/AppContext.jsx'

const GAME_SECS  = 30
const COLOR_KEYS = ['red', 'blue', 'green', 'yellow']
const EMOJI      = { red: '🔴', blue: '🔵', green: '🟢', yellow: '🟡' }
const NAMES      = {
  es: { red: 'Rojo',     blue: 'Azul',  green: 'Verde',  yellow: 'Amarillo' },
  en: { red: 'Red',      blue: 'Blue',  green: 'Green',  yellow: 'Yellow'   },
}

function randomPos() {
  return { top: 8 + Math.random() * 76, left: 4 + Math.random() * 84 }
}

export default function BalloonPopView() {
  const { tr, lang, setSubview, addStars, incrementGamesPlayed } = useApp()

  const [started, setStarted]   = useState(false)
  const [timeLeft, setTimeLeft] = useState(GAME_SECS)
  const [score, setScore]       = useState(0)
  const [target, setTarget]     = useState('red')
  const [balloons, setBalloons] = useState([])
  const [done, setDone]         = useState(false)
  const [starsWon, setStarsWon] = useState(0)
  const [flash, setFlash]       = useState(null) // 'good' | 'bad'

  const timerRef  = useRef(null)
  const spawnRef  = useRef(null)
  const targetRef = useRef('red')
  const scoreRef  = useRef(0)

  const changeTarget = useCallback(() => {
    const t = COLOR_KEYS[Math.floor(Math.random() * COLOR_KEYS.length)]
    setTarget(t)
    targetRef.current = t
  }, [])

  const spawnBalloon = useCallback(() => {
    // Bias 40% towards target colour so there are always some to pop
    const pick = Math.random() < 0.4
      ? targetRef.current
      : COLOR_KEYS[Math.floor(Math.random() * COLOR_KEYS.length)]
    const id = Date.now() + Math.random()
    setBalloons(prev => [...prev, { id, color: pick, ...randomPos() }])
    setTimeout(() => setBalloons(prev => prev.filter(b => b.id !== id)), 2000)
  }, [])

  const start = () => {
    clearInterval(timerRef.current)
    clearInterval(spawnRef.current)
    setStarted(true)
    setDone(false)
    setScore(0)
    scoreRef.current = 0
    setBalloons([])
    setTimeLeft(GAME_SECS)
    changeTarget()

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

    spawnRef.current = setInterval(spawnBalloon, 700)
    spawnBalloon()
  }

  useEffect(() => {
    if (!done) return
    const n = scoreRef.current >= 10 ? 3 : scoreRef.current >= 5 ? 2 : 1
    setStarsWon(n)
    if (scoreRef.current >= 10) celebrate()
    addStars(n)
    incrementGamesPlayed()
  }, [done])

  useEffect(() => () => {
    clearInterval(timerRef.current)
    clearInterval(spawnRef.current)
  }, [])

  const popBalloon = (id, color) => {
    setBalloons(prev => prev.filter(b => b.id !== id))
    if (color === targetRef.current) {
      const ns = scoreRef.current + 1
      scoreRef.current = ns
      setScore(ns)
      setFlash('good')
      if (ns % 5 === 0) changeTarget()
    } else {
      setFlash('bad')
    }
    setTimeout(() => setFlash(null), 300)
  }

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
          {tr.balloonTitle}
        </h2>
      </div>

      {/* Start screen */}
      {!started && !done && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 80, marginBottom: 16 }}>🎈</div>
          <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-soft)', marginBottom: 8, textAlign: 'center' }}>
            {tr.gameBalloonDesc}
          </p>
          <button className="btn"
            style={{ background: 'linear-gradient(135deg,#EC4899,#F97316)', color: '#fff', fontSize: 18, padding: '16px 40px' }}
            onClick={start}>
            {tr.balloonStart}
          </button>
        </div>
      )}

      {/* Game screen */}
      {started && !done && (
        <>
          {/* HUD */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexShrink: 0 }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#F59E0B' }}>🎈 {score}</div>

            {/* Target colour badge — flashes on correct/wrong tap */}
            <div style={{
              background: flash === 'good' ? 'rgba(16,185,129,.25)'
                        : flash === 'bad'  ? 'rgba(239,68,68,.25)'
                        : 'rgba(124,58,237,.12)',
              color: 'var(--purple)',
              borderRadius: 999, padding: '6px 14px',
              fontSize: 14, fontWeight: 800, transition: 'background .15s',
            }}>
              {lang === 'es' ? 'Explota:' : 'Pop:'}&nbsp;
              {EMOJI[target]} {NAMES[lang][target]}
            </div>

            <div style={{ fontSize: 18, fontWeight: 900, color: timeLeft <= 10 ? '#EF4444' : 'var(--purple)' }}>
              ⏱ {timeLeft}s
            </div>
          </div>

          {/* Arena — reuse existing CSS class from TapGame */}
          <div className="catch-arena" style={{ flex: 1, height: 'auto', minHeight: 0 }}>
            {balloons.map(b => (
              <button key={b.id} onClick={() => popBalloon(b.id, b.color)} style={{
                position: 'absolute',
                top: `${b.top}%`, left: `${b.left}%`,
                fontSize: 44,
                background: 'none', border: 'none',
                cursor: 'pointer', padding: 4, lineHeight: 1,
                animation: 'catchStar .3s ease-out',
                touchAction: 'manipulation',
                userSelect: 'none', WebkitUserSelect: 'none',
                filter: b.color === target
                  ? 'drop-shadow(0 0 10px rgba(255,255,255,.85))'
                  : 'opacity(0.7)',
                transition: 'filter .2s',
              }}>
                {EMOJI[b.color]}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Result overlay */}
      {done && (
        <div className="result-overlay">
          <div className="result-card">
            <div style={{ fontSize: 64, marginBottom: 8 }}>🎈</div>
            <h2>
              {lang === 'es' ? `¡${score} globos!` : `${score} balloons!`}
            </h2>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#F59E0B', margin: '12px 0' }}>
              +{starsWon} ⭐
            </div>
            <button className="btn"
              style={{ background: 'linear-gradient(135deg,#EC4899,#F97316)', color: '#fff', width: '100%' }}
              onClick={start}>
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
