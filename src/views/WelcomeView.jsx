import React, { useState } from 'react'
import { useApp } from '../contexts/AppContext.jsx'
import StarsBg from '../components/StarsBg.jsx'

export default function WelcomeView() {
  const { tr, user, saveUsername } = useApp()
  const [name, setName]     = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    const trimmed = name.trim()
    if (!trimmed || saving) return
    setSaving(true)
    await saveUsername(trimmed)
    // App.jsx re-renders and routes to HomeView since user.username is now set
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSave()
  }

  return (
    <div className="login-space" style={{ justifyContent: 'center', gap: 24 }}>
      <StarsBg />
      <div style={{ fontSize: 72, animation: 'rocketFloat 3s ease-in-out infinite' }}>🚀</div>

      <div style={{ textAlign: 'center', color: '#fff', padding: '0 24px' }}>
        <p style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, opacity: .9 }}>
          {tr.welcomeCode}
        </p>
        <h2 style={{ fontSize: 26, fontWeight: 900, margin: 0 }}>
          {tr.welcomeAsk}
        </h2>
      </div>

      <div className="login-card" style={{ width: '100%', maxWidth: 340 }}>
        <input
          className="login-input"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={handleKey}
          placeholder={tr.welcomePlaceholder}
          maxLength={20}
          autoComplete="given-name"
          autoFocus
        />
        <button
          className="btn"
          style={{
            width: '100%', fontSize: 18, padding: '16px',
            background: 'linear-gradient(135deg,#4C6EF5,#7C3AED)',
            color: '#fff', marginTop: 8,
          }}
          onClick={handleSave}
          disabled={!name.trim() || saving}
        >
          {saving ? '...' : tr.welcomeBtn}
        </button>
      </div>
    </div>
  )
}
