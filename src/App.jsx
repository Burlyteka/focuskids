import React, { useState } from 'react'
import { AppProvider, useApp } from './contexts/AppContext.jsx'
import SplashView        from './views/SplashView.jsx'
import RoleSelectView    from './views/RoleSelectView.jsx'
import LoginView         from './views/LoginView.jsx'
import WelcomeView       from './views/WelcomeView.jsx'
import HomeView          from './views/HomeView.jsx'
import RoutineView       from './views/RoutineView.jsx'
import TimerView         from './views/TimerView.jsx'
import GamesView         from './views/GamesView.jsx'
import MemoryGameView    from './views/MemoryGameView.jsx'
import TapGameView       from './views/TapGameView.jsx'
import ColorSequenceView from './views/ColorSequenceView.jsx'
import BreatheView       from './views/BreatheView.jsx'
import MoodView          from './views/MoodView.jsx'
import MoveView          from './views/MoveView.jsx'
import TaskView          from './views/TaskView.jsx'
import RewardsView       from './views/RewardsView.jsx'
import StoreView         from './views/StoreView.jsx'
import ParentDashboard   from './views/ParentDashboard.jsx'
import BottomNav         from './components/BottomNav.jsx'
import BgDecorations     from './components/BgDecorations.jsx'
import StarsBg           from './components/StarsBg.jsx'
import { BG_MAP }        from './data/themes.js'

function RocketMascot() {
  const { rocketTip } = useApp()
  if (!rocketTip) return null
  return (
    <div className="rocket-mascot">
      <div className="rm-bubble">{rocketTip}</div>
      <div className="rm-icon">🚀</div>
    </div>
  )
}

const INTRO_KEY = 'fk_intro_seen'

function Inner() {
  const {
    user, sessionLoading, view, subview, setView, setSubview,
    stars, toggleLang, lang,
    toastMsg, medalNotif, celebration, setCelebration, tr,
    logout, rocketTip,
    activeBg,
  } = useApp()

  // Pre-login flow state
  const [loginStage, setLoginStage] = useState(() =>
    localStorage.getItem(INTRO_KEY) ? 'roleSelect' : 'splash'
  )
  const [loginRole, setLoginRole] = useState(null)

  if (sessionLoading) return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100dvh', gap: 16,
      background: 'radial-gradient(ellipse at 30% 20%,#1a237e 0%,#0d0d2b 55%,#050510 100%)',
    }}>
      <div style={{ fontSize: 64, animation: 'rocketFloat 3s ease-in-out infinite' }}>🚀</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: '#A5B4FC' }}>Cargando...</div>
    </div>
  )

  if (!user) {
    if (loginStage === 'splash') {
      return (
        <SplashView onDone={() => {
          localStorage.setItem(INTRO_KEY, '1')
          setLoginStage('roleSelect')
        }} />
      )
    }
    if (loginStage === 'roleSelect') {
      return (
        <RoleSelectView onSelect={(role) => {
          setLoginRole(role)
          setLoginStage('login')
        }} />
      )
    }
    return (
      <LoginView
        role={loginRole}
        onBack={() => setLoginStage('roleSelect')}
      />
    )
  }

  if (user.role === 'kid' && !user.username) return <WelcomeView />
  if (user.role === 'parent') return <ParentDashboard />

  const renderView = () => {
    if (view === 'games') {
      if (subview === 'memory') return <MemoryGameView />
      if (subview === 'tap')    return <TapGameView />
      if (subview === 'simon')  return <ColorSequenceView />
      return <GamesView />
    }
    switch (view) {
      case 'home':    return <HomeView />
      case 'routine': return <RoutineView />
      case 'timer':   return <TimerView />
      case 'breathe': return <BreatheView />
      case 'mood':    return <MoodView />
      case 'move':    return <MoveView />
      case 'task':    return <TaskView />
      case 'rewards': return <RewardsView />
      case 'store':   return <StoreView />
      default:        return <HomeView />
    }
  }

  const showBack = view !== 'home'

  const theme       = BG_MAP[activeBg] || BG_MAP.space
  const isSpace     = activeBg === 'space'
  const themeStyle  = isSpace ? {} : {
    background:   theme.gradient,
    '--bg':       theme.dark ? 'rgba(10,8,30,.25)'      : 'rgba(255,255,255,.18)',
    '--card':     theme.dark ? 'rgba(255,255,255,.13)'  : 'rgba(255,255,255,.88)',
    '--text':     theme.dark ? '#EEF2FF'                : '#1E1B4B',
    '--soft':     theme.dark ? 'rgba(238,242,255,.65)'  : '#374151',
    '--purple':   theme.dark ? '#A78BFA'                : '#7C3AED',
    '--panel':    theme.dark ? 'rgba(255,255,255,.12)'  : 'rgba(0,0,0,.08)',
    '--bar-bg':   theme.dark ? 'rgba(255,255,255,.15)'  : '#E5E7EB',
    '--item-done-bg':    theme.dark ? 'rgba(134,239,172,.15)' : '#F0FDF4',
    '--item-done-text':  theme.dark ? '#86EFAC'               : '#166534',
    '--input-bg': theme.dark ? 'rgba(255,255,255,.1)'   : '#fff',
    '--border-c': theme.dark ? 'rgba(255,255,255,.2)'   : '#C7D2FE',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative', ...themeStyle }}>
      <BgDecorations themeId={activeBg} />
      {/* Top bar */}
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {showBack && (
            <button
              onClick={() => { setSubview(null); setView('home') }}
              style={{
                background: 'transparent', border: '2px solid var(--purple-light)',
                borderRadius: 999, padding: '6px 12px',
                fontFamily: 'var(--font)', fontWeight: 800, fontSize: 13,
                color: 'var(--purple)', cursor: 'pointer',
              }}
            >
              ← {tr.navHome}
            </button>
          )}
          <div className="topbar-stars"><span>⭐</span><span>{stars}</span></div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="lang-btn" onClick={toggleLang}>
            {lang === 'es' ? '🇬🇧 EN' : '🇪🇸 ES'}
          </button>
          <button
            onClick={logout}
            style={{
              background: 'transparent', border: '2px solid #EF4444',
              borderRadius: 999, padding: '6px 12px',
              fontFamily: 'var(--font)', fontWeight: 800, fontSize: 12,
              color: '#EF4444', cursor: 'pointer',
            }}
          >
            {tr.logout}
          </button>
        </div>
      </div>

      {/* Demo banner */}
      {user?.isDemo && (
        <div style={{
          background: 'linear-gradient(90deg,#7C3AED,#EC4899)',
          color: '#fff', textAlign: 'center',
          padding: '7px 12px', fontSize: 13, fontWeight: 800,
          letterSpacing: .3, flexShrink: 0,
        }}>
          🎮 {lang === 'es'
            ? 'Modo Demo — Consigue tu código en '
            : 'Demo Mode — Get your code at '}
          <span style={{ textDecoration: 'underline' }}>Etsy</span>
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {renderView()}
      </div>

      <BottomNav />
      <RocketMascot />

      {toastMsg && <div className="star-earned">{toastMsg}</div>}

      {medalNotif && (
        <div className="medal-unlocked">
          <div className="medal-unlocked-inner">
            <div className="mu-emoji">{medalNotif.emoji}</div>
            <h3>{medalNotif.id === 'badge10' ? tr.badge10 : tr.badge30}</h3>
          </div>
        </div>
      )}

      {celebration && (
        <div className="celebration-overlay">
          <div className="celebration-card">
            <div className="cel-emoji">{celebration.emoji}</div>
            <h2>{celebration.title}</h2>
            <p>{celebration.msg}</p>
            <button
              className="btn"
              style={{ background: 'rgba(255,255,255,.25)', color: '#fff', fontSize: 16 }}
              onClick={() => setCelebration(null)}
            >
              🎉
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Inner />
    </AppProvider>
  )
}
