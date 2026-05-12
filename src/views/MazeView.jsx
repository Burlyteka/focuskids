import React, { useState, useCallback, useRef } from 'react'
import { useApp } from '../contexts/AppContext.jsx'
import { celebrate } from '../contexts/AppContext.jsx'

// 0 = open path, 1 = wall
const MAZES = [
  {
    // Level 1 — 5×5, simple L-shape with small decoy
    grid: [
      [1,1,1,1,1],
      [1,0,0,0,1],
      [1,0,1,0,1],
      [1,0,0,0,1],
      [1,1,1,1,1],
    ],
    start: [1,1], end: [3,3], size: 5,
  },
  {
    // Level 2 — 7×7, multiple corridors
    grid: [
      [1,1,1,1,1,1,1],
      [1,0,0,1,0,0,1],
      [1,0,1,1,0,1,1],
      [1,0,0,0,0,0,1],
      [1,1,1,0,1,0,1],
      [1,0,0,0,1,0,1],
      [1,1,1,1,1,1,1],
    ],
    start: [1,1], end: [5,5], size: 7,
  },
  {
    // Level 3 — 7×7, trickier path
    grid: [
      [1,1,1,1,1,1,1],
      [1,0,0,0,1,0,1],
      [1,1,1,0,1,0,1],
      [1,0,0,0,0,0,1],
      [1,0,1,1,1,1,1],
      [1,0,0,0,0,0,1],
      [1,1,1,1,1,1,1],
    ],
    start: [1,1], end: [5,5], size: 7,
  },
]

const ARROW_BTN = {
  width: 52, height: 52,
  fontSize: 26,
  background: 'var(--card)',
  border: '2px solid rgba(124,58,237,.25)',
  borderRadius: 14,
  cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  boxShadow: '0 2px 8px rgba(0,0,0,.1)',
  touchAction: 'manipulation',
  userSelect: 'none', WebkitUserSelect: 'none',
}

export default function MazeView() {
  const { tr, lang, setSubview, addStars, incrementGamesPlayed } = useApp()

  const [levelIdx, setLevelIdx]   = useState(0)
  const [pos, setPos]             = useState([1, 1])
  const [won, setWon]             = useState(false)
  const [starsWon, setStarsWon]   = useState(0)
  const [moves, setMoves]         = useState(0)
  const countedRef                = useRef(false)

  const maze = MAZES[levelIdx]

  const move = useCallback((dr, dc) => {
    if (won) return
    setPos(prev => {
      const nr = prev[0] + dr
      const nc = prev[1] + dc
      if (nr < 0 || nc < 0 || nr >= maze.size || nc >= maze.size) return prev
      if (maze.grid[nr][nc] === 1) return prev
      return [nr, nc]
    })
    setMoves(m => m + 1)
  }, [won, maze])

  // Check win condition separately so we have the updated pos
  const checkPos = useCallback((r, c) => {
    if (r === maze.end[0] && c === maze.end[1]) {
      const n = levelIdx + 1  // 1, 2, or 3 stars per level
      setStarsWon(n)
      celebrate()
      addStars(n)
      if (!countedRef.current) {
        incrementGamesPlayed()
        countedRef.current = true
      }
      setWon(true)
    }
  }, [maze, levelIdx, addStars, incrementGamesPlayed])

  // Wrap move so we can check win after position update
  const handleMove = (dr, dc) => {
    if (won) return
    const [r, c] = pos
    const nr = r + dr
    const nc = c + dc
    if (nr < 0 || nc < 0 || nr >= maze.size || nc >= maze.size) return
    if (maze.grid[nr][nc] === 1) return
    setPos([nr, nc])
    setMoves(m => m + 1)
    checkPos(nr, nc)
  }

  const nextLevel = () => {
    const next = levelIdx + 1
    setLevelIdx(next)
    setPos([...MAZES[next].start])
    setMoves(0)
    setWon(false)
  }

  const restart = () => {
    setLevelIdx(0)
    setPos([...MAZES[0].start])
    setMoves(0)
    setWon(false)
    countedRef.current = false
  }

  const cellSize = maze.size === 5 ? 54 : 40
  const isLastLevel = levelIdx === MAZES.length - 1

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
          {tr.mazeTitle}
        </h2>
      </div>

      {/* Level + moves bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexShrink: 0 }}>
        <span style={{
          background: 'rgba(124,58,237,.12)', color: 'var(--purple)',
          borderRadius: 999, padding: '5px 14px', fontSize: 13, fontWeight: 800,
        }}>
          {lang === 'es' ? 'Nivel' : 'Level'} {levelIdx + 1}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-soft)' }}>
          {lang === 'es' ? 'Pasos' : 'Steps'}: {moves}
        </span>
      </div>

      {/* Maze + controls */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${maze.size}, ${cellSize}px)`,
          gap: 3,
        }}>
          {maze.grid.map((row, r) =>
            row.map((cell, c) => {
              const isPlayer = pos[0] === r && pos[1] === c
              const isEnd    = maze.end[0] === r && maze.end[1] === c
              const isWall   = cell === 1
              return (
                <div key={`${r}-${c}`} style={{
                  width: cellSize, height: cellSize,
                  background: isWall
                    ? 'linear-gradient(135deg,#4C1D95,#6D28D9)'
                    : isEnd && !isPlayer
                    ? 'rgba(16,185,129,.18)'
                    : 'var(--card)',
                  borderRadius: isWall ? 6 : 10,
                  border: isEnd && !isPlayer ? '2px solid #10B981' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: cellSize * 0.54,
                  boxShadow: isWall
                    ? 'inset 0 2px 4px rgba(0,0,0,.3)'
                    : '0 1px 4px rgba(0,0,0,.08)',
                }}>
                  {isPlayer ? '🧒' : isEnd ? '🏁' : ''}
                </div>
              )
            })
          )}
        </div>

        {/* Arrow buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 52px)', gridTemplateRows: 'repeat(3, 52px)', gap: 8 }}>
          <div /><button style={ARROW_BTN} onClick={() => handleMove(-1, 0)}>⬆️</button><div />
          <button style={ARROW_BTN} onClick={() => handleMove(0, -1)}>⬅️</button>
          <div style={{ width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🧒</div>
          <button style={ARROW_BTN} onClick={() => handleMove(0, 1)}>➡️</button>
          <div /><button style={ARROW_BTN} onClick={() => handleMove(1, 0)}>⬇️</button><div />
        </div>
      </div>

      {/* Win overlay */}
      {won && (
        <div className="result-overlay">
          <div className="result-card">
            <div style={{ fontSize: 64, marginBottom: 8 }}>🏁</div>
            <h2>{lang === 'es' ? '¡Saliste del laberinto!' : 'You escaped the maze!'}</h2>
            <p style={{ color: 'var(--text-soft)', fontSize: 14 }}>
              {lang === 'es'
                ? `Nivel ${levelIdx + 1} — ${moves} pasos`
                : `Level ${levelIdx + 1} — ${moves} steps`}
            </p>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#F59E0B', margin: '12px 0' }}>
              +{starsWon} ⭐
            </div>

            {!isLastLevel ? (
              <button className="btn"
                style={{ background: 'linear-gradient(135deg,#10B981,#3B82F6)', color: '#fff', width: '100%' }}
                onClick={nextLevel}>
                {lang === 'es' ? 'Siguiente nivel ▶' : 'Next level ▶'}
              </button>
            ) : (
              <button className="btn"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#EC4899)', color: '#fff', width: '100%' }}
                onClick={restart}>
                {tr.playAgain}
              </button>
            )}

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
