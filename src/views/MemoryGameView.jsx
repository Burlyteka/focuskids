import React, { useState, useEffect } from 'react'
import { useApp } from '../contexts/AppContext.jsx'
import { celebrate } from '../contexts/AppContext.jsx'

const ANIMALS = ['🐶','🐱','🐭','🐹','🐰','🦊']

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildDeck() {
  return shuffle([...ANIMALS, ...ANIMALS].map((emoji, id) => ({ id, emoji, matched: false })))
}

export default function MemoryGameView() {
  const { tr, user, setSubview, addStars, incrementGamesPlayed } = useApp()

  const [deck, setDeck]         = useState(buildDeck)
  const [flipped, setFlipped]   = useState([])
  const [moves, setMoves]       = useState(0)
  const [pairs, setPairs]       = useState(0)
  const [elapsed, setElapsed]   = useState(0)
  const [locked, setLocked]     = useState(false)
  const [won, setWon]           = useState(false)
  const [starsWon, setStarsWon] = useState(0)

  useEffect(() => {
    if (won) return
    const id = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(id)
  }, [won])

  useEffect(() => {
    if (flipped.length !== 2) return
    setLocked(true)
    const [a, b] = flipped
    if (deck[a].emoji === deck[b].emoji) {
      setDeck(d => d.map((c, i) => i === a || i === b ? { ...c, matched: true } : c))
      const newPairs = pairs + 1
      setPairs(newPairs)
      setFlipped([])
      setLocked(false)
      if (newPairs === ANIMALS.length) {
        celebrate()
        const n = elapsed < 60 ? 3 : 2
        setStarsWon(n)
        setWon(true)
        addStars(n)
        incrementGamesPlayed()
      }
    } else {
      setTimeout(() => { setFlipped([]); setLocked(false) }, 900)
    }
  }, [flipped])

  const flip = (i) => {
    if (locked || flipped.includes(i) || deck[i].matched || flipped.length === 2) return
    const next = [...flipped, i]
    setFlipped(next)
    if (next.length === 2) setMoves(m => m + 1)
  }

  const restart = () => {
    setDeck(buildDeck())
    setFlipped([])
    setMoves(0)
    setPairs(0)
    setElapsed(0)
    setLocked(false)
    setWon(false)
    setStarsWon(0)
  }

  const fmtTime = (s) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

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
          {tr.memoryTitle}
        </h2>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexShrink: 0 }}>
        {[
          { label: tr.memPairs, val: `${pairs}/${ANIMALS.length}` },
          { label: tr.memMoves, val: moves },
          { label: tr.memTime,  val: fmtTime(elapsed) },
        ].map(s => (
          <div key={s.label} style={{
            flex: 1, background: '#fff', borderRadius: 12,
            padding: '8px 6px', textAlign: 'center',
            boxShadow: '0 2px 8px rgba(76,110,245,.1)',
          }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--blue)' }}>{s.val}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--soft)', marginTop: 1 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Grid — flex:1 fills remaining height */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        gap: 8,
        minHeight: 0,
      }}>
        {deck.map((card, i) => {
          const isFlipped = flipped.includes(i) || card.matched
          return (
            <div
              key={card.id + '-' + i}
              className={`mem-card${isFlipped ? ' flipped' : ''}${card.matched ? ' matched' : ''}`}
              style={{ minHeight: 0 }}
              onClick={() => flip(i)}
            >
              <div className="mem-front">❓</div>
              <div className="mem-back">{card.emoji}</div>
            </div>
          )
        })}
      </div>

      {won && (
        <div className="result-overlay">
          <div className="result-card">
            <div style={{ fontSize: 64, marginBottom: 8 }}>🎉</div>
            <h2>{tr.memWin(user?.username || '')}</h2>
            <p>{elapsed < 60 ? tr.memWinFast : tr.memWinNormal}</p>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#F59E0B', margin: '12px 0' }}>
              +{starsWon} ⭐
            </div>
            <button className="btn" style={{ background: 'linear-gradient(135deg,#7C3AED,#4C6EF5)', color: '#fff', width: '100%' }} onClick={restart}>
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
