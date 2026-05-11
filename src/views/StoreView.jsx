import React, { useState } from 'react'
import { useApp } from '../contexts/AppContext.jsx'
import { BG_THEMES } from '../data/themes.js'
import { celebrate } from '../contexts/AppContext.jsx'

export default function StoreView() {
  const { tr, stars, activeBg, unlockedBgs, buyBg, setActiveBg, lang,
          routineState, saveRoutineState, spendStars } = useApp()
  const allUnlocked = unlockedBgs.length >= BG_THEMES.length
  const customReward = routineState?.custom_reward || null
  const [redeeming, setRedeeming] = useState(false)

  async function redeemReward() {
    if (!customReward || redeeming) return
    setRedeeming(true)
    const newState = {
      ...routineState,
      custom_reward: { ...customReward, active: false, redeemed_at: new Date().toISOString() },
    }
    await spendStars(customReward.stars, newState)
    celebrate()
    setRedeeming(false)
  }

  return (
    <div className="page fade-in">
      <h2 className="section-title">{tr.storeTitle}</h2>
      <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--soft)', marginBottom: 20 }}>
        {tr.storeSub} · ⭐ {stars} {tr.starsLabel}
      </p>

      <div className="store-grid">
        {BG_THEMES.map(theme => {
          const owned  = theme.cost === 0 || unlockedBgs.includes(theme.id)
          const active = activeBg === theme.id
          const canBuy = !owned && stars >= theme.cost

          return (
            <div
              key={theme.id}
              className={`store-card${active ? ' sc-active' : ''}${!owned && !canBuy ? ' sc-locked' : ''}`}
              style={{ background: theme.gradient }}
            >
              <div className="sc-emoji">{theme.emoji}</div>
              <div className="sc-name">{lang === 'es' ? theme.es : theme.en}</div>

              <div className={`sc-badge ${owned ? 'sc-badge-owned' : ''}`}>
                {owned
                  ? (theme.cost === 0 ? tr.storeFree : tr.storeOwned)
                  : `${theme.cost} ⭐`}
              </div>

              {!owned && (
                <button
                  className={`sc-btn ${canBuy ? 'sc-btn-buy' : 'sc-btn-locked'}`}
                  disabled={!canBuy}
                  onClick={() => buyBg(theme.id, theme.cost)}
                >
                  {canBuy ? tr.storeBuy : `🔒 ${theme.cost - stars} ⭐`}
                </button>
              )}
              {owned && !active && (
                <button className="sc-btn sc-btn-use" onClick={() => setActiveBg(theme.id)}>
                  {tr.storeUse}
                </button>
              )}
              {active && (
                <div className="sc-active-label">✓ {tr.storeActive}</div>
              )}
            </div>
          )
        })}

        {/* ── Premio Especial del padre ── */}
        {customReward && (
          <div style={{
            borderRadius: 20,
            background: customReward.active
              ? 'linear-gradient(135deg,#7C3AED,#EC4899)'
              : 'linear-gradient(135deg,#9CA3AF,#6B7280)',
            padding: '20px 16px 16px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            position: 'relative',
            boxShadow: customReward.active ? '0 8px 28px rgba(124,58,237,.4)' : 'none',
          }}>
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: 1.5,
              color: 'rgba(255,255,255,.75)', textTransform: 'uppercase', marginBottom: 2 }}>
              {lang === 'es' ? '🏆 Premio Especial' : '🏆 Special Prize'}
            </div>
            <div style={{ fontSize: 40 }}>{customReward.emoji || '🎁'}</div>
            <div style={{ fontSize: 15, fontWeight: 900, color: '#fff', textAlign: 'center' }}>
              {customReward.name}
            </div>
            {customReward.active ? (
              <>
                <div style={{ fontSize: 13, fontWeight: 800,
                  background: 'rgba(255,255,255,.2)', borderRadius: 999,
                  padding: '4px 14px', color: '#fff', marginTop: 2 }}>
                  {customReward.stars} ⭐
                </div>
                {stars >= customReward.stars ? (
                  <button
                    onClick={redeemReward}
                    disabled={redeeming}
                    style={{
                      marginTop: 8, width: '100%', padding: '12px',
                      background: 'rgba(255,255,255,.95)', borderRadius: 12, border: 'none',
                      fontFamily: 'var(--font)', fontWeight: 900, fontSize: 14,
                      color: '#7C3AED', cursor: 'pointer',
                    }}
                  >
                    {redeeming ? '...' : (lang === 'es' ? '✨ ¡Canjear!' : '✨ Redeem!')}
                  </button>
                ) : (
                  <div style={{ marginTop: 8, width: '100%', padding: '10px',
                    background: 'rgba(0,0,0,.25)', borderRadius: 12,
                    textAlign: 'center', fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,.7)' }}>
                    🔒 {lang === 'es'
                      ? `Te faltan ${customReward.stars - stars} ⭐`
                      : `You need ${customReward.stars - stars} more ⭐`}
                  </div>
                )}
              </>
            ) : (
              <div style={{ marginTop: 4, fontSize: 13, fontWeight: 800,
                background: 'rgba(255,255,255,.2)', borderRadius: 999,
                padding: '6px 16px', color: '#fff' }}>
                {lang === 'es' ? '✅ ¡Canjeado!' : '✅ Redeemed!'}
              </div>
            )}
          </div>
        )}
      </div>

      {allUnlocked && (
        <div style={{
          marginTop: 20, padding: '18px 20px',
          background: 'linear-gradient(135deg,#F59E0B,#EF4444)',
          borderRadius: 18, textAlign: 'center',
          color: '#fff', fontWeight: 900, fontSize: 16,
          animation: 'pop .5s cubic-bezier(.34,1.56,.64,1) both',
        }}>
          🏅 {tr.storeCollector}
        </div>
      )}
    </div>
  )
}
