import React, { useState } from 'react'
import { useApp } from '../contexts/AppContext.jsx'

const KID_AVATARS = ['🧑','👦','👧','🧒','🧑‍🚀','🧑‍🎨','🧑‍🔬','🧑‍💻','🦸','🧙','🐱','🦊']

const CARDS = [
  { key: 'routine', emoji: '📋', grad: 'linear-gradient(135deg,#7C3AED,#A855F7)' },
  { key: 'timer',   emoji: '⏱️', grad: 'linear-gradient(135deg,#4C6EF5,#60A5FA)' },
  { key: 'games',   emoji: '🎮', grad: 'linear-gradient(135deg,#EC4899,#F43F5E)' },
  { key: 'breathe', emoji: '🌬️', grad: 'linear-gradient(135deg,#0891B2,#10B981)' },
  { key: 'mood',    emoji: '😊', grad: 'linear-gradient(135deg,#F59E0B,#F97316)' },
  { key: 'move',    emoji: '🏃', grad: 'linear-gradient(135deg,#EF4444,#F97316)' },
  { key: 'task',    emoji: '📚', grad: 'linear-gradient(135deg,#7C3AED,#4C6EF5)' },
  { key: 'rewards', emoji: '🏆', grad: 'linear-gradient(135deg,#F97316,#F59E0B)' },
  { key: 'store',   emoji: '🎨', grad: 'linear-gradient(135deg,#10B981,#4C6EF5)', wide: true },
]

const SECTION_KEYS = {
  routine: 'secMorning',
  timer:   'secTimer',
  games:   'secGames',
  breathe: 'secBreathe',
  mood:    'secMood',
  move:    'secMove',
  task:    'secTask',
  rewards: 'starsLabel',
  store:   'storeTitle',
}

export default function HomeView() {
  const { tr, user, stars, setView, routineState, readParentMessage, kidAvatar, saveKidAvatar, streak } = useApp()
  const [avatarOpen, setAvatarOpen] = useState(false)

  const name      = user?.username || ''
  const parentMsg = routineState?.parent_message
  const showMsg   = !!(parentMsg?.text && parentMsg?.read === false)

  return (
    <div className="page fade-in">

      {/* ── Parent message popup ── */}
      {showMsg && (
        <div className="msg-overlay">
          <div className="msg-popup">
            <div style={{ fontSize: 60, marginBottom: 10 }}>💌</div>
            <h3 style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: '0 0 8px' }}>
              {tr.msgTitle}
            </h3>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.7)', margin: '0 0 14px' }}>
              {tr.msgFrom}
            </p>
            <div style={{
              background: 'rgba(255,255,255,.15)',
              border: '2px solid rgba(255,255,255,.25)',
              borderRadius: 18,
              padding: '16px 18px',
              fontSize: 16, fontWeight: 700, color: '#fff',
              lineHeight: 1.6, marginBottom: 22,
              fontStyle: 'italic',
            }}>
              "{parentMsg.text}"
            </div>
            <button
              className="btn"
              style={{
                background: 'rgba(255,255,255,.25)',
                border: '2px solid rgba(255,255,255,.4)',
                color: '#fff', fontWeight: 900,
                fontSize: 16, padding: '14px 32px',
              }}
              onClick={readParentMessage}
            >
              {tr.msgReadBtn}
            </button>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginTop: 12 }}>+1 ⭐</p>
          </div>
        </div>
      )}

      {/* ── Avatar picker modal ── */}
      {avatarOpen && (
        <div className="avatar-overlay" onClick={() => setAvatarOpen(false)}>
          <div className="avatar-modal" onClick={e => e.stopPropagation()}>
            <p className="avatar-modal-title">{tr.avatarPickKid}</p>
            <div className="avatar-grid">
              {KID_AVATARS.map(em => (
                <button
                  key={em}
                  className={`avatar-opt${kidAvatar === em ? ' avatar-opt-active' : ''}`}
                  onClick={() => { saveKidAvatar(em); setAvatarOpen(false) }}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button className="avatar-circle" onClick={() => setAvatarOpen(true)} title={tr.avatarPickKid}>
          {kidAvatar}
        </button>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)' }}>
            {tr.hi} <span style={{ color: 'var(--purple)' }}>{name}</span>
            {name ? '!' : ''}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 2, flexWrap: 'wrap' }}>
            {stars > 0 && (
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--soft)', margin: 0 }}>
                ⭐ {stars} {tr.starsLabel}
                {stars >= 30 && <span style={{ marginLeft: 8 }}>{tr.badge30}</span>}
                {stars >= 10 && stars < 30 && <span style={{ marginLeft: 8 }}>{tr.badge10}</span>}
              </p>
            )}
            {streak.count > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: streak.count >= 7 ? 'linear-gradient(135deg,#F97316,#EF4444)'
                          : streak.count >= 3 ? 'linear-gradient(135deg,#F59E0B,#F97316)'
                          : 'linear-gradient(135deg,#FEF3C7,#FDE68A)',
                borderRadius: 999, padding: '3px 10px',
              }}>
                <span style={{ fontSize: 14 }}>🔥</span>
                <span style={{
                  fontSize: 13, fontWeight: 900,
                  color: streak.count >= 3 ? '#fff' : '#92400E',
                }}>
                  {streak.count} {tr.streakLabel}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="home-grid">
        {CARDS.map((c, i) => (
          <button
            key={c.key}
            className={`home-card${c.wide ? ' home-card-wide' : ''}`}
            style={{ background: c.grad, animationDelay: `${i * 0.06}s` }}
            onClick={() => setView(c.key)}
          >
            <span style={{ fontSize: 36 }}>{c.emoji}</span>
            <span style={{ fontSize: 13, fontWeight: 800, marginTop: 6, color: '#fff' }}>
              {tr[SECTION_KEYS[c.key]]}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
