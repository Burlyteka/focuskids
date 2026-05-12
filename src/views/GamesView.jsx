import React from 'react'
import { useApp } from '../contexts/AppContext.jsx'

export default function GamesView() {
  const { tr, setSubview } = useApp()

  const games = [
    {
      key: 'memory',
      emoji: '🧠',
      name: tr.gameMemory,
      desc: tr.gameMemoryDesc,
      grad: 'linear-gradient(135deg,#7C3AED,#A855F7)',
    },
    {
      key: 'tap',
      emoji: '⭐',
      name: tr.gameCatch,
      desc: tr.gameCatchDesc,
      grad: 'linear-gradient(135deg,#4C6EF5,#60A5FA)',
    },
    {
      key: 'simon',
      emoji: '🌈',
      name: tr.gameSimon,
      desc: tr.gameSimonDesc,
      grad: 'linear-gradient(135deg,#EC4899,#F97316)',
    },
    {
      key: 'odd',
      emoji: '🔵',
      name: tr.gameOdd,
      desc: tr.gameOddDesc,
      grad: 'linear-gradient(135deg,#3B82F6,#8B5CF6)',
    },
    {
      key: 'balloon',
      emoji: '🎈',
      name: tr.gameBalloon,
      desc: tr.gameBalloonDesc,
      grad: 'linear-gradient(135deg,#EC4899,#F97316)',
    },
    {
      key: 'maze',
      emoji: '🧩',
      name: tr.gameMaze,
      desc: tr.gameMazeDesc,
      grad: 'linear-gradient(135deg,#10B981,#3B82F6)',
    },
  ]

  return (
    <div className="page fade-in">
      <h2 className="section-title">{tr.gamesTitle}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {games.map((g, i) => (
          <button
            key={g.key}
            className="game-card pop"
            style={{ animationDelay: `${i * .08}s` }}
            onClick={() => setSubview(g.key)}
          >
            <div style={{
              background: g.grad, borderRadius: 16,
              width: 64, height: 64,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, flexShrink: 0,
            }}>{g.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text)', marginBottom: 4 }}>
                {g.name}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-soft)' }}>
                {g.desc}
              </div>
            </div>
            <span style={{ fontSize: 22, color: 'var(--purple)' }}>▶</span>
          </button>
        ))}
      </div>
    </div>
  )
}
