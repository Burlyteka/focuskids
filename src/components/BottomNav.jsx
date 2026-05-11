import React from 'react'
import { useApp } from '../contexts/AppContext.jsx'

const NAV = [
  { key: 'home',    emojiKey: '🏠', labelKey: 'navHome'    },
  { key: 'routine', emojiKey: '📋', labelKey: 'navRoutine' },
  { key: 'timer',   emojiKey: '⏱️', labelKey: 'navTimer'   },
  { key: 'games',   emojiKey: '🎮', labelKey: 'navGames'   },
  { key: 'task',    emojiKey: '📚', labelKey: 'navMore'    },
]

export default function BottomNav() {
  const { view, setView, setSubview, tr } = useApp()

  return (
    <nav className="bottom-nav">
      {NAV.map(item => (
        <button
          key={item.key}
          className={`nav-item${view === item.key ? ' active' : ''}`}
          onClick={() => { setSubview(null); setView(item.key) }}
        >
          <span className="ni-e">{item.emojiKey}</span>
          <span className="ni-l">{tr[item.labelKey]}</span>
          <span className="ni-dot" />
        </button>
      ))}
    </nav>
  )
}
