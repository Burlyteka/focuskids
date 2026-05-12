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
        {lang === 'es' ? 'EN' : 'ES'}
      </button>

      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 52, marginBottom: 4, filter: 'drop-shadow(0 0 18px rgba(124,58,237,.7))' }}>🚀</div>
        <h1 style={{
          fontSize: 32, fontWeight: 900, color: '#fff', margin: '0 0 6px',
          textShadow: '0 0 30px rgba(124,58,237,.8)',
          letterSpacing: -0.5,
        }}>FocusKids</h1>
        <p style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,.6)', margin: 0 }}>
          {tr.roleWho}
        </p>
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

      <button
        onClick={startDemo}
        style={{
          marginTop: 16,
          background: 'linear-gradient(135deg,rgba(124,58,237,.4),rgba(236,72,153,.4))',
          border: '2px solid rgba(255,255,255,.35)',
          borderRadius: 16, padding: '14px 36px',
          fontFamily: 'var(--font)', fontWeight: 900, fontSize: 15,
          color: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: '0 4px 20px rgba(124,58,237,.3)',
        }}
      >
        🎮 {lang === 'es' ? 'Probar Demo gratis' : 'Try Demo for free'}
      </button>
      <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.45)', marginTop: 6 }}>
        {lang === 'es' ? 'Sin código — explora todo' : 'No code needed — explore everything'}
      </p>
    </div>
  )
}
