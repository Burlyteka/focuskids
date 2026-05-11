import React, { useState, useRef } from 'react'
import { useApp } from '../contexts/AppContext.jsx'
import StarsBg from '../components/StarsBg.jsx'

function formatCode(raw) {
  const clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (clean.length <= 2) return clean
  return clean.slice(0, 2) + '-' + clean.slice(2, 8)
}

export default function LoginView({ role, onBack }) {
  const { tr, login, toggleLang, lang } = useApp()
  const [code, setCode]           = useState('')
  const [error, setError]         = useState(false)
  const [wrongRole, setWrongRole] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [shake, setShake]         = useState(false)
  const inputRef = useRef(null)

  const isKid    = role === 'kid'
  const isParent = role === 'parent'

  const titleText    = isKid    ? tr.loginKidTitle
                     : isParent ? tr.loginParentTitle
                     : tr.appName + ' 🚀'

  const subtitleText = isKid    ? tr.loginKidSub
                     : isParent ? tr.loginParentSub
                     : tr.splashSub

  const placeholder  = isKid    ? tr.loginKidPh
                     : isParent ? tr.loginParentPh
                     : tr.loginPlaceholder

  const hintText     = isKid    ? tr.loginKidHint
                     : isParent ? tr.loginParentHint
                     : tr.loginHint

  const wrongRoleMsg = isKid    ? tr.loginWrongKid
                     : isParent ? tr.loginWrongParent
                     : null

  const handleChange = (e) => {
    const formatted = formatCode(e.target.value)
    setCode(formatted)
    setError(false)
    setWrongRole(
      (isKid    && formatted.startsWith('PD-')) ||
      (isParent && formatted.startsWith('NK-'))
    )
  }

  const handleSubmit = async () => {
    if (loading || code.length < 3) return
    if (wrongRole) { setShake(true); setTimeout(() => setShake(false), 600); return }
    setLoading(true)
    const result = await login(code)
    setLoading(false)
    if (!result.ok) {
      setError(true)
      setShake(true)
      setTimeout(() => setShake(false), 600)
    }
  }

  const handleKey = (e) => { if (e.key === 'Enter') handleSubmit() }

  return (
    <div className="login-space">
      <StarsBg />

      {/* Back button — absolute top-left */}
      {onBack && (
        <button
          className="login-back-btn"
          onClick={onBack}
          style={{ position: 'absolute', top: 16, left: 16, zIndex: 10 }}
        >
          ← {tr.backBtn?.replace('← ', '') || 'Volver'}
        </button>
      )}

      {/* Lang button — absolute top-right */}
      <button
        className="lang-btn"
        onClick={toggleLang}
        style={{
          position: 'absolute', top: 16, right: 16, zIndex: 10,
          background: 'rgba(255,255,255,.15)',
          border: '2px solid rgba(255,255,255,.4)',
          color: 'rgba(255,255,255,.9)',
        }}
      >
        {lang === 'es' ? '🇬🇧 EN' : '🇪🇸 ES'}
      </button>

      <div className="login-rocket">🚀</div>

      <div className="login-logo">
        <h1>{titleText}</h1>
        <p>{subtitleText}</p>
      </div>

      <div className={`login-card${shake ? ' shake' : ''}`}>
        <input
          ref={inputRef}
          className="login-input"
          type="text"
          value={code}
          onChange={handleChange}
          onKeyDown={handleKey}
          placeholder={placeholder}
          maxLength={9}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="characters"
          spellCheck={false}
        />

        <button
          className="btn"
          style={{
            width: '100%', fontSize: 18, padding: '16px',
            background: isParent
              ? 'linear-gradient(135deg,#059669,#0891B2)'
              : 'linear-gradient(135deg,#4C6EF5,#7C3AED)',
            color: '#fff', marginTop: 8,
          }}
          onClick={handleSubmit}
          disabled={loading || code.length < 3}
        >
          {loading ? tr.loginLoading : tr.loginBtn}
        </button>

        {wrongRole && <p className="login-error">{wrongRoleMsg}</p>}
        {error && !wrongRole && <p className="login-error">{tr.loginError}</p>}

        <p className="login-hint">{hintText}</p>
      </div>
    </div>
  )
}
