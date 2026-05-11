import React from 'react'
import { useApp } from '../contexts/AppContext.jsx'
import StarsBg from '../components/StarsBg.jsx'

export default function RoleSelectView({ onSelect }) {
  const { tr, toggleLang, lang, startDemo } = useApp()

  return (
    <div className="login-space">
      <StarsBg />

      <button
        className="lang-btn"
        onClick={toggleLang}
        style={{
          position: 'absolute', top: 20, right: 20,
          background: 'rgba(255,255,255,.15)',
          border: '2px solid rgba(255,255,255,.4)',
          color: 'rgba(255,255,255,.9)',
        }}
      >
        {lang === 'es' ? '🇬🇧 EN' : '🇪🇸 ES'}
      </button>

      <div className="login-logo" style={{ marginBottom: 4 }}>
        <h1 style={{ fontSize: 26, lineHeight: 1.3 }}>{tr.roleWho}</h1>
      </div>

      <div className="role-cards">
        <button className="role-card role-card-kid" onClick={() => onSelect('kid')}>
          <span className="role-card-emoji">👦</span>
          <span className="role-card-label">{tr.roleKid}</span>
          <span className="role-card-hint">{tr.roleKidCode}</span>
        </button>

        <button className="role-card role-card-parent" onClick={() => onSelect('parent')}>
          <span className="role-card-emoji">👨‍👩‍👧</span>
          <span className="role-card-label">{tr.roleParent}</span>
          <span className="role-card-hint">{tr.roleParentCode}</span>
        </button>
      </div>

      {/* Demo button */}
      <button
        onClick={startDemo}
        style={{
          marginTop: 8,
          background: 'rgba(255,255,255,.12)',
          border: '2px dashed rgba(255,255,255,.4)',
          borderRadius: 16, padding: '14px 32px',
          fontFamily: 'var(--font)', fontWeight: 800, fontSize: 15,
          color: 'rgba(255,255,255,.85)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8,
        }}
      >
        🎮 {lang === 'es' ? 'Probar Demo' : 'Try Demo'}
      </button>
      <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.4)', marginTop: 6 }}>
        {lang === 'es' ? 'Sin código — solo explorar' : 'No code needed — just explore'}
      </p>
    </div>
  )
}
