import React, { useState } from 'react'
import { useApp } from '../contexts/AppContext.jsx'
import { celebrate } from '../contexts/AppContext.jsx'

const MAX_TASKS = 5

export default function TaskView() {
  const { tr, user, tasks, setTasks, addStars } = useApp()
  const [input, setInput] = useState('')
  const [allDoneShown, setAllDoneShown] = useState(false)

  const addTask = () => {
    const trimmed = input.trim()
    if (!trimmed || tasks.length >= MAX_TASKS) return
    setTasks(prev => [...prev, { id: Date.now(), text: trimmed, done: false }])
    setInput('')
  }

  const toggleTask = async (id) => {
    const task = tasks.find(t => t.id === id)
    if (!task || task.done) return
    const next = tasks.map(t => t.id === id ? { ...t, done: true } : t)
    setTasks(next)
    await addStars(1)
    celebrate({ particleCount: 50, spread: 60 })

    // All done bonus
    if (next.every(t => t.done) && !allDoneShown) {
      setAllDoneShown(true)
      setTimeout(async () => {
        await addStars(3)
        celebrate()
      }, 600)
    }
  }

  const removeTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const doneCount = tasks.filter(t => t.done).length
  const allDone   = tasks.length > 0 && doneCount === tasks.length

  return (
    <div className="page fade-in">
      <h2 className="section-title">{tr.taskTitle}</h2>

      {/* Add task */}
      {tasks.length < MAX_TASKS && (
        <div className="task-add-row">
          <input
            className="task-input"
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTask()}
            placeholder={tr.taskPlaceholder}
            maxLength={80}
          />
          <button
            className="btn"
            style={{ padding: '14px 16px', flexShrink: 0, background: 'linear-gradient(135deg,#7C3AED,#4C6EF5)', color: '#fff' }}
            onClick={addTask}
            disabled={!input.trim()}
          >
            {tr.taskAdd}
          </button>
        </div>
      )}

      {/* Progress */}
      {tasks.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div className="routine-progress" style={{ flex: 1 }}>
            <div className="routine-progress-bar" style={{ width: `${(doneCount / tasks.length) * 100}%` }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--purple)', flexShrink: 0 }}>
            {doneCount}/{tasks.length} {tr.taskProgress}
          </span>
        </div>
      )}

      {/* Task list */}
      {tasks.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-soft)', fontWeight: 700, fontSize: 15, padding: '32px 0' }}>
          {tr.taskEmpty}
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {tasks.map(task => (
            <div
              key={task.id}
              className={`routine-item${task.done ? ' done' : ''}`}
              style={{ cursor: task.done ? 'default' : 'pointer' }}
              onClick={() => toggleTask(task.id)}
            >
              <span className="ri-text">{task.text}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                {!task.done && (
                  <span style={{ fontSize: 12, color: 'var(--purple)', fontWeight: 700 }}>+1⭐</span>
                )}
                <div className={`check-circle${task.done ? ' checked' : ''}`}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                    stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3,8 7,12 13,4" />
                  </svg>
                </div>
                {!task.done && (
                  <button
                    onClick={e => { e.stopPropagation(); removeTask(task.id) }}
                    style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: '#EF4444', padding: 2 }}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* All done banner */}
      {allDone && (
        <div className="routine-done-banner pop" style={{ marginTop: 16 }}>
          <div style={{ fontSize: 64, marginBottom: 8 }}>🎉</div>
          <h2>{tr.taskAllDone(user?.username || '')}</h2>
          <button
            className="btn"
            style={{ background: 'rgba(255,255,255,.25)', color: '#fff', marginTop: 12 }}
            onClick={() => { setTasks([]); setAllDoneShown(false) }}
          >
            {tr.routineReset}
          </button>
        </div>
      )}
    </div>
  )
}
