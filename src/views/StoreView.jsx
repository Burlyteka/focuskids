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
          <div
            className="store-card"
            style={{
              background: customReward.active
                ? 'linear-gradient(135deg,#7C3AED,#EC4899)'
                : 'linear-gradient(135deg,#9CA3AF,#6B7280)',
              boxShadow: customReward.active ? '0 8px 28px rgba(124,58,237,.4)' : 'none',
            }}
          >
            <div className="sc-emoji">{customReward.emoji || '🎁'}</div>
            <div className="sc-name">{customReward.name}</div>

            <div className={`sc-badge ${!customReward.active ? 'sc-badge-owned' : ''}`}>
              {customReward.active
                ? `${customReward.stars} ⭐`
                : (lang === 'es' ? '✅ Canjeado' : '✅ Redeemed')}
            </div>

            {customReward.active && (
              stars >= customReward.stars ? (
                <button className="sc-btn sc-btn-buy" onClick={redeemReward} disabled={redeeming}>
                  {redeeming ? '...' : (lang === 'es' ? '✨ Canjear' : '✨ Redeem')}
                </button>
              ) : (
                <button className="sc-btn sc-btn-locked" disabled>
                  🔒 {customReward.stars - stars} ⭐
                </button>
              )
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
