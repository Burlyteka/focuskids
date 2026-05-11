import React from 'react'
import { useApp } from '../contexts/AppContext.jsx'

const MILESTONES = [
  { stars: 10, emoji: '🌟', key: 'badge10' },
  { stars: 30, emoji: '🏆', key: 'badge30' },
  { stars: 50, emoji: '🚀', label: '¡Héroe del Enfoque!' },
]

export default function RewardsView() {
  const { tr, stars } = useApp()

  const next = MILESTONES.find(m => stars < m.stars)
  const reached = MILESTONES.filter(m => stars >= m.stars)

  return (
    <div className="page fade-in">
      <h2 className="section-title">🏆 Mis Logros</h2>

      <div style={{
        background: 'linear-gradient(135deg,#FFFBEB,#FEF3C7)',
        border: '2px solid #FDE68A', borderRadius: 20,
        padding: '24px 20px', textAlign: 'center', marginBottom: 20,
      }}>
        <div style={{ fontSize: 48 }}>⭐</div>
        <div style={{ fontSize: 42, fontWeight: 900, color: '#92400E', lineHeight: 1 }}>{stars}</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#B45309', marginTop: 4 }}>{tr.starsLabel}</div>
      </div>

      {next && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-soft)' }}>
              Próxima medalla: {next.emoji}
            </span>
            <span style={{ fontSize: 13, fontWeight: 900, color: 'var(--purple)' }}>
              {stars}/{next.stars} ⭐
            </span>
          </div>
          <div style={{ background: '#E5E7EB', borderRadius: 999, height: 12, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 999,
              width: `${Math.min(100, (stars / next.stars) * 100)}%`,
              background: 'linear-gradient(90deg,var(--purple),var(--blue))',
              transition: 'width .5s ease',
            }} />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {MILESTONES.map(m => {
          const unlocked = stars >= m.stars
          return (
            <div key={m.stars} style={{
              background: unlocked ? 'linear-gradient(135deg,#EDE9FE,#DBEAFE)' : '#F9FAFB',
              border: `2px solid ${unlocked ? '#A78BFA' : '#E5E7EB'}`,
              borderRadius: 16, padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: 14,
              opacity: unlocked ? 1 : .5,
            }}>
              <span style={{ fontSize: 36 }}>{unlocked ? m.emoji : '🔒'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--text)' }}>
                  {m.key ? tr[m.key] : m.label}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-soft)', marginTop: 2 }}>
                  {m.stars} ⭐ {unlocked ? '✅' : `(${m.stars - stars} más)`}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
