import React, { useState } from 'react'
import { useApp } from '../contexts/AppContext.jsx'
import { celebrate } from '../contexts/AppContext.jsx'

const MORNING = [
  { key: 'mi0' }, { key: 'mi1' }, { key: 'mi2' },
  { key: 'mi3' }, { key: 'mi4' }, { key: 'mi5' },
]
const NIGHT = [
  { key: 'ni0' }, { key: 'ni1' }, { key: 'ni2' },
  { key: 'ni3' }, { key: 'ni4' }, { key: 'ni5' },
]

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export default function RoutineView() {
  const { tr, user, routineState, saveRoutineState, addStars, incrementRoutinesDone, updateStreak } = useApp()
  const [type, setType]       = useState('morning')
  const [showInput, setShowInput] = useState(false)
  const [inputVal, setInputVal]   = useState('')

  const defaultItems = type === 'morning' ? MORNING : NIGHT
  const today        = todayStr()
  const saved        = routineState[type]
  const isToday      = saved?.date === today

  const checked        = isToday ? (saved.items         || []) : []
  const customChecked  = isToday ? (saved.custom_checked || []) : []
  const customSteps    = routineState.custom_steps?.[type] || []

  const totalItems   = defaultItems.length + customSteps.length
  const totalChecked = checked.length + customChecked.length
  const isDone       = totalItems > 0 && isToday && totalChecked === totalItems

  // helpers
  const buildUpdate = (newChecked, newCustomChecked) => ({
    ...routineState,
    [type]: {
      ...(routineState[type] || {}),
      items: newChecked,
      custom_checked: newCustomChecked,
      date: today,
    },
  })

  const checkComplete = async (nc, ncc) => {
    if (nc.length + ncc.length === totalItems) {
      await addStars(5)
      await incrementRoutinesDone()
      await updateStreak()
      celebrate()
    }
  }

  const toggleDefault = async (idx) => {
    if (isDone || checked.includes(idx)) return
    const next = [...checked, idx]
    await saveRoutineState(buildUpdate(next, customChecked))
    await addStars(1)
    await checkComplete(next, customChecked)
  }

  const toggleCustom = async (idx) => {
    if (isDone || customChecked.includes(idx)) return
    const next = [...customChecked, idx]
    await saveRoutineState(buildUpdate(checked, next))
    await addStars(1)
    await checkComplete(checked, next)
  }

  const addCustomStep = async () => {
    const trimmed = inputVal.trim()
    if (!trimmed) return
    const existing = routineState.custom_steps || {}
    const newCustomSteps = { ...existing, [type]: [...(existing[type] || []), trimmed] }
    await saveRoutineState({ ...routineState, custom_steps: newCustomSteps })
    setInputVal('')
    setShowInput(false)
  }

  const deleteCustomStep = async (idx) => {
    const existing = routineState.custom_steps || {}
    const newSteps = (existing[type] || []).filter((_, i) => i !== idx)
    const newCustomSteps = { ...existing, [type]: newSteps }
    // fix checked indices after removal
    const newCustomChecked = customChecked
      .filter(i => i !== idx)
      .map(i => (i > idx ? i - 1 : i))
    await saveRoutineState({
      ...routineState,
      custom_steps: newCustomSteps,
      [type]: { ...(routineState[type] || {}), custom_checked: newCustomChecked, date: today },
    })
  }

  const reset = async () => {
    await saveRoutineState({
      ...routineState,
      [type]: { items: [], custom_checked: [], date: today },
    })
  }

  const progress = totalItems > 0 ? totalChecked / totalItems : 0

  return (
    <div className="page fade-in">
      <h2 className="section-title">
        {type === 'morning' ? tr.secMorning : tr.secNight}
      </h2>

      {/* Tab toggle */}
      <div className="routine-toggle">
        <button className={`routine-tab${type === 'morning' ? ' active' : ''}`} onClick={() => { setType('morning'); setShowInput(false) }}>
          {tr.morning}
        </button>
        <button className={`routine-tab${type === 'night' ? ' active' : ''}`} onClick={() => { setType('night'); setShowInput(false) }}>
          {tr.night}
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div className="routine-progress" style={{ flex: 1 }}>
          <div className="routine-progress-bar" style={{ width: `${progress * 100}%` }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--purple)', flexShrink: 0 }}>
          {totalChecked}/{totalItems} {tr.routineProgress}
        </span>
      </div>

      {isDone ? (
        <div className="routine-done-banner pop">
          <div style={{ fontSize: 64, marginBottom: 8 }}>🎉</div>
          <h2>{tr.routineDone(user?.username || '')}</h2>
          <p style={{ marginBottom: 20 }}>{tr.routineDoneSub}</p>
          <button className="btn" style={{ background: 'rgba(255,255,255,.25)', color: '#fff' }} onClick={reset}>
            {tr.routineReset}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* ── Default items ── */}
          {defaultItems.map((item, i) => {
            const isChecked = checked.includes(i)
            return (
              <button
                key={item.key}
                className={`routine-item${isChecked ? ' done' : ''}`}
                onClick={() => toggleDefault(i)}
              >
                <span className="ri-text">{tr[item.key]}</span>
                <div className={`check-circle${isChecked ? ' checked' : ''}`}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                    stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3,8 7,12 13,4" />
                  </svg>
                </div>
              </button>
            )
          })}

          {/* ── Custom items ── */}
          {customSteps.map((step, i) => {
            const isChecked = customChecked.includes(i)
            return (
              <div
                key={`custom-${i}`}
                className={`routine-item${isChecked ? ' done' : ''}`}
                style={{ cursor: 'default' }}
              >
                <span style={{ fontSize: 20, flexShrink: 0 }}>✏️</span>
                <span
                  className="ri-text"
                  style={{ flex: 1, cursor: isChecked ? 'default' : 'pointer' }}
                  onClick={() => toggleCustom(i)}
                >
                  {step}
                </span>
                {!isChecked && (
                  <button
                    onClick={() => deleteCustomStep(i)}
                    style={{
                      background: 'none', border: 'none',
                      fontSize: 18, cursor: 'pointer',
                      color: '#EF4444', padding: '4px 6px',
                      flexShrink: 0, lineHeight: 1,
                    }}
                  >
                    🗑️
                  </button>
                )}
                <div
                  className={`check-circle${isChecked ? ' checked' : ''}`}
                  onClick={() => toggleCustom(i)}
                  style={{ cursor: isChecked ? 'default' : 'pointer', flexShrink: 0 }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                    stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3,8 7,12 13,4" />
                  </svg>
                </div>
              </div>
            )
          })}

          {/* ── Add custom step ── */}
          {!showInput ? (
            <button
              className="btn"
              style={{
                width: '100%', marginTop: 4,
                background: 'linear-gradient(135deg,#7C3AED,#A855F7)',
                color: '#fff', fontSize: 16,
              }}
              onClick={() => setShowInput(true)}
            >
              {tr.addMyStep}
            </button>
          ) : (
            <div style={{
              background: '#fff', borderRadius: 16,
              padding: '16px', boxShadow: '0 4px 16px rgba(124,58,237,.15)',
              border: '2px solid var(--purple-light)',
              display: 'flex', flexDirection: 'column', gap: 10,
            }}>
              <input
                autoFocus
                className="task-input"
                type="text"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomStep()}
                placeholder="¿Qué quieres agregar? (ej: Darle agua al perro 🐶)"
                maxLength={30}
                style={{ width: '100%', fontSize: 15 }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn"
                  style={{ flex: 1, background: 'rgba(0,0,0,.06)', color: 'var(--text)', fontSize: 15 }}
                  onClick={() => { setShowInput(false); setInputVal('') }}
                >
                  Cancelar
                </button>
                <button
                  className="btn"
                  style={{ flex: 2, background: 'linear-gradient(135deg,#7C3AED,#4C6EF5)', color: '#fff', fontSize: 15 }}
                  onClick={addCustomStep}
                  disabled={!inputVal.trim()}
                >
                  Agregar ✅
                </button>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}
