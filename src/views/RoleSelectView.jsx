import React from 'react'
import { useApp } from '../contexts/AppContext.jsx'
import StarsBg from '../components/StarsBg.jsx'

export default function RoleSelectView({ onSelect }) {
  const { tr, toggleLang, lang } = useApp()

  return (
    <div className="login-space">
      <StarsBg />

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
    </div>
  )
}
