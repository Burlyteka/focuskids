import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'
import { t } from '../data/translations.js'
import {
  validateCode,
  validateAndLoad,
  loadProgress,
  saveProgress,
  loadChildProgressForParent,
  flushSaveQueue,
} from '../lib/supabase.js'

const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)

const LS_KEY = 'fk_v4_session'

function lsGet() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || null } catch { return null }
}
function lsSet(data) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(data)) } catch {}
}
function lsClear() {
  try { localStorage.removeItem(LS_KEY) } catch {}
}

export function celebrate() {
  confetti({
    particleCount: 130, spread: 80, origin: { y: 0.55 },
    colors: ['#7C3AED', '#4C6EF5', '#EC4899', '#F59E0B', '#10B981'],
  })
}

function playBeep() {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)()
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.frequency.value = 880; osc.type = 'sine'
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.8)
  } catch {}
}

export function AppProvider({ children }) {
  const [lang, setLang]       = useState('en')
  const [user, setUser]       = useState(null)
  const [stars, setStars]     = useState(0)
  const [routineState, setRoutineState] = useState({})
  const [gamesPlayed, setGamesPlayed]   = useState(0)
  const [focusMinutes, setFocusMinutes] = useState(0)
  const [routinesDone, setRoutinesDone] = useState(0)
  const [tasks, setTasks]     = useState([])
  const [childData, setChildData] = useState(null)

  const [view, setView]       = useState('home')
  const [subview, setSubview] = useState(null)
  const [toastMsg, setToastMsg]     = useState(null)
  const [medalNotif, setMedalNotif] = useState(null)
  const [celebration, setCelebration] = useState(null)
  const [rocketTip, setRocketTip]   = useState(null)
  const [sessionLoading, setSessionLoading] = useState(() => {
    try { const s = JSON.parse(localStorage.getItem(LS_KEY)); return !!(s?.user?.role === 'kid') } catch { return false }
  })

  // ── Timer state (persists across view navigation) ──
  const [timerPreset,     setTimerPreset]     = useState(10)
  const [timerTotal,      setTimerTotal]      = useState(600)
  const [timerEndTime,    setTimerEndTime]    = useState(null) // ms timestamp; null = stopped
  const [timerPausedLeft, setTimerPausedLeft] = useState(600) // secs remaining when paused
  const [timerFinished,   setTimerFinished]   = useState(false)

  const toastRef  = useRef(null)
  const medalRef  = useRef(null)
  const rocketRef = useRef(null)

  // Refs so timer finish callback always sees fresh state (avoids stale closures in setTimeout)
  const starsRef        = useRef(0)
  const focusMinRef     = useRef(0)
  const routinesDoneRef = useRef(0)
  const gamesPlayedRef  = useRef(0)
  const routineStateRef = useRef({})
  const userRef         = useRef(null)
  const timerTotalRef   = useRef(600)

  useEffect(() => { starsRef.current        = stars        }, [stars])
  useEffect(() => { focusMinRef.current      = focusMinutes }, [focusMinutes])
  useEffect(() => { routinesDoneRef.current  = routinesDone }, [routinesDone])
  useEffect(() => { gamesPlayedRef.current   = gamesPlayed  }, [gamesPlayed])
  useEffect(() => { routineStateRef.current  = routineState }, [routineState])
  useEffect(() => { userRef.current          = user         }, [user])
  useEffect(() => { timerTotalRef.current    = timerTotal   }, [timerTotal])

  const tr = t[lang]

  // On mount: restore session. For kid sessions always re-fetch from Supabase.
  useEffect(() => {
    const s = lsGet()
    if (!s) return
    setLang(s.lang || 'en')

    if (s.user?.role === 'kid') {
      ;(async () => {
        try {
          const progress = await loadProgress(s.user.nkCode)
          if (progress) {
            const u = { ...s.user, username: progress.username || null }
            setUser(u)
            setStars(progress.stars || 0)
            setRoutineState(progress.routine_state || {})
            setGamesPlayed(progress.games_played || 0)
            setFocusMinutes(progress.focus_minutes || 0)
            setRoutinesDone(progress.routines_done || 0)
            setTasks(s.tasks || [])
            lsSet({ lang: s.lang || 'en', user: u, tasks: s.tasks || [] })
          } else {
            // Supabase has no record (offline or deleted) — use localStorage fallback
            setUser(s.user)
            setStars(s.stars || 0)
            setRoutineState(s.routineState || {})
            setGamesPlayed(s.gamesPlayed || 0)
            setFocusMinutes(s.focusMinutes || 0)
            setRoutinesDone(s.routinesDone || 0)
            setTasks(s.tasks || [])
          }
        } catch {
          setUser(s.user)
          setStars(s.stars || 0)
          setRoutineState(s.routineState || {})
          setGamesPlayed(s.gamesPlayed || 0)
          setFocusMinutes(s.focusMinutes || 0)
          setRoutinesDone(s.routinesDone || 0)
          setTasks(s.tasks || [])
        } finally {
          setSessionLoading(false)
        }
      })()
    } else {
      setUser(s.user || null)
      setStars(s.stars || 0)
      setRoutineState(s.routineState || {})
      setGamesPlayed(s.gamesPlayed || 0)
      setFocusMinutes(s.focusMinutes || 0)
      setRoutinesDone(s.routinesDone || 0)
      setTasks(s.tasks || [])
      if (s.childData) setChildData(s.childData)
    }
  }, [])

  // ── Flush any offline-queued saves on mount ──
  useEffect(() => {
    flushSaveQueue().then(n => {
      if (n > 0) showToast(`☁️ ${n} guardado${n > 1 ? 's' : ''} sincronizado${n > 1 ? 's' : ''}`)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Background timer: fires even when TimerView is not mounted ──
  useEffect(() => {
    if (!timerEndTime) return
    const msLeft = timerEndTime - Date.now()

    const doFinish = () => {
      setTimerEndTime(null)
      setTimerPausedLeft(0)
      setTimerFinished(true)
      playBeep()
      celebrate()

      const u = userRef.current
      if (!u?.nkCode) return
      const oldStars  = starsRef.current
      const newStars  = oldStars + 2
      const newFocus  = focusMinRef.current + Math.round(timerTotalRef.current / 60)

      setStars(newStars)
      setFocusMinutes(newFocus)
      // toast
      setToastMsg(`+2 ⭐`)
      clearTimeout(toastRef.current)
      toastRef.current = setTimeout(() => setToastMsg(null), 2500)
      // medal check
      if (oldStars < 10 && newStars >= 10) setMedalNotif({ id: 'badge10', emoji: '🌟' })
      else if (oldStars < 30 && newStars >= 30) setMedalNotif({ id: 'badge30', emoji: '🏆' })

      saveProgress(u.nkCode, {
        username:      u.username,
        stars:         newStars,
        routines_done: routinesDoneRef.current,
        focus_minutes: newFocus,
        games_played:  gamesPlayedRef.current,
        routine_state: routineStateRef.current,
      })
    }

    if (msLeft <= 0) { doFinish(); return }
    const id = setTimeout(doFinish, msLeft)
    return () => clearTimeout(id)
  }, [timerEndTime])

  // Save session identifier + tasks to localStorage (not used for progress decisions)
  function persistSession(overrides = {}) {
    lsSet({ lang, user, tasks, ...overrides })
  }

  function showToast(msg) {
    setToastMsg(msg)
    clearTimeout(toastRef.current)
    toastRef.current = setTimeout(() => setToastMsg(null), 2500)
  }

  function showMedal(medal) {
    setMedalNotif(medal)
    clearTimeout(medalRef.current)
    medalRef.current = setTimeout(() => setMedalNotif(null), 4000)
  }

  function showRocket(msg) {
    setRocketTip(msg)
    clearTimeout(rocketRef.current)
    rocketRef.current = setTimeout(() => setRocketTip(null), 3500)
  }

  // ── Saves with toast feedback on failure ──
  async function save(nkCode, data) {
    const ok = await saveProgress(nkCode, data)
    if (!ok) showToast('📦 Sin conexión — guardado localmente')
    return ok
  }

  // ── Timer actions ──
  function timerSelectPreset(min) {
    if (timerEndTime) return
    const secs = min * 60
    setTimerPreset(min)
    setTimerTotal(secs)
    setTimerPausedLeft(secs)
    setTimerFinished(false)
    timerTotalRef.current = secs
  }
  function timerStart() {
    if (timerFinished || timerEndTime) return
    setTimerEndTime(Date.now() + timerPausedLeft * 1000)
  }
  function timerPause() {
    if (!timerEndTime) return
    const left = Math.max(0, Math.round((timerEndTime - Date.now()) / 1000))
    setTimerEndTime(null)
    setTimerPausedLeft(left)
  }
  function timerReset() {
    setTimerEndTime(null)
    setTimerPausedLeft(timerTotal)
    setTimerFinished(false)
  }

  async function login(code) {
    // Single parallel call: validates + loads progress in one shot
    const result = await validateAndLoad(code)
    if (!result.valid) return { ok: false }

    const { code: c, role, nkCode } = result
    let progress = result.progress

    if (role === 'parent') {
      const u = { code: c, role: 'parent', nkCode }
      setUser(u)
      setChildData(progress)
      lsSet({ lang, user: u, tasks: [], childData: progress })
      return { ok: true, role: 'parent' }
    }

    // Kid login
    if (!progress) {
      // New kid — create record in Supabase
      const empty = { username: null, stars: 0, routines_done: 0, focus_minutes: 0, games_played: 0, routine_state: {} }
      await save(c, empty)
      progress = { code: c, ...empty }
    }

    const u = { code: c, role: 'kid', nkCode: c, username: progress.username || null }
    setUser(u)
    setStars(progress.stars || 0)
    setRoutineState(progress.routine_state || {})
    setGamesPlayed(progress.games_played || 0)
    setFocusMinutes(progress.focus_minutes || 0)
    setRoutinesDone(progress.routines_done || 0)
    setTasks([])

    lsSet({ lang, user: u, tasks: [] })
    return { ok: true, role: 'kid', needsUsername: !progress.username }
  }

  async function saveUsername(name) {
    if (!user) return
    const u = { ...user, username: name }
    setUser(u)
    lsSet({ lang, user: u, tasks })
    await save(user.nkCode, {
      username: name,
      stars,
      routines_done: routinesDone,
      focus_minutes: focusMinutes,
      games_played: gamesPlayed,
      routine_state: routineState,
    })
  }

  async function spendStars(n, newRoutineState) {
    const next = Math.max(0, stars - n)
    setStars(next)
    if (newRoutineState) setRoutineState(newRoutineState)
    await save(user.nkCode, {
      username: user.username,
      stars: next,
      routines_done: routinesDone,
      focus_minutes: focusMinutes,
      games_played: gamesPlayed,
      routine_state: newRoutineState || routineState,
    })
    return next
  }

  async function addStars(n) {
    const next = stars + n
    setStars(next)
    showToast(tr.earned(n))

    await save(user.nkCode, {
      username: user.username,
      stars: next,
      routines_done: routinesDone,
      focus_minutes: focusMinutes,
      games_played: gamesPlayed,
      routine_state: routineState,
    })

    if (stars < 10 && next >= 10) showMedal({ id: 'badge10', emoji: '🌟' })
    else if (stars < 30 && next >= 30) showMedal({ id: 'badge30', emoji: '🏆' })

    return next
  }

  async function saveRoutineState(newState) {
    setRoutineState(newState)
    if (!user?.nkCode) return
    await save(user.nkCode, {
      username: user.username,
      stars,
      routines_done: routinesDone,
      focus_minutes: focusMinutes,
      games_played: gamesPlayed,
      routine_state: newState,
    })
  }

  async function incrementRoutinesDone() {
    const n = routinesDone + 1
    setRoutinesDone(n)
    await save(user.nkCode, {
      username: user.username,
      stars,
      routines_done: n,
      focus_minutes: focusMinutes,
      games_played: gamesPlayed,
      routine_state: routineState,
    })
  }

  async function incrementGamesPlayed() {
    const n = gamesPlayed + 1
    setGamesPlayed(n)
    await save(user.nkCode, {
      username: user.username,
      stars,
      routines_done: routinesDone,
      focus_minutes: focusMinutes,
      games_played: n,
      routine_state: routineState,
    })
  }

  async function addFocusMinutes(mins) {
    const n = focusMinutes + mins
    setFocusMinutes(n)
    await save(user.nkCode, {
      username: user.username,
      stars,
      routines_done: routinesDone,
      focus_minutes: n,
      games_played: gamesPlayed,
      routine_state: routineState,
    })
  }

  async function readParentMessage() {
    if (!user?.nkCode || !routineState?.parent_message) return
    const newRoutineState = { ...routineState, parent_message: { ...routineState.parent_message, read: true } }
    const newStars = stars + 1
    setStars(newStars)
    setRoutineState(newRoutineState)
    celebrate()
    showToast(tr.earned(1))
    await save(user.nkCode, {
      username: user.username,
      stars: newStars,
      routines_done: routinesDone,
      focus_minutes: focusMinutes,
      games_played: gamesPlayed,
      routine_state: newRoutineState,
    })
  }

  // ── Store: derived from routineState ──
  const activeBg    = routineState?.active_bg     || 'space'
  const unlockedBgs = routineState?.unlocked_bgs  || ['space']
  const kidAvatar   = routineState?.avatar        || '🧑'

  async function buyBg(id, cost) {
    if (!user?.nkCode || stars < cost) return
    const newStars       = stars - cost
    const newUnlocked    = [...new Set([...unlockedBgs, id])]
    const newRoutineState = { ...routineState, unlocked_bgs: newUnlocked, active_bg: id }
    setStars(newStars)
    setRoutineState(newRoutineState)
    celebrate()
    showToast(tr.storeBought())
    await save(user.nkCode, {
      username: user.username, stars: newStars,
      routines_done: routinesDone, focus_minutes: focusMinutes,
      games_played: gamesPlayed, routine_state: newRoutineState,
    })
    if (newUnlocked.length >= 7) showToast(tr.storeCollector)
  }

  async function setActiveBg(id) {
    if (!user?.nkCode) return
    const newRoutineState = { ...routineState, active_bg: id }
    setRoutineState(newRoutineState)
    await save(user.nkCode, {
      username: user.username, stars,
      routines_done: routinesDone, focus_minutes: focusMinutes,
      games_played: gamesPlayed, routine_state: newRoutineState,
    })
  }

  async function saveKidAvatar(emoji) {
    if (!user?.nkCode) return
    const newRoutineState = { ...routineState, avatar: emoji }
    setRoutineState(newRoutineState)
    await save(user.nkCode, {
      username: user.username, stars,
      routines_done: routinesDone, focus_minutes: focusMinutes,
      games_played: gamesPlayed, routine_state: newRoutineState,
    })
  }

  async function updateStreak() {
    if (!user?.nkCode) return
    const today     = new Date().toISOString().slice(0, 10)
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    const cur       = routineState.streak || { count: 0, last_date: null }

    // Already counted today
    if (cur.last_date === today) return

    const newCount  = cur.last_date === yesterday ? cur.count + 1 : 1
    const newStreak = { count: newCount, last_date: today }
    const newRoutineState = { ...routineState, streak: newStreak }
    setRoutineState(newRoutineState)

    // Milestone bonus stars
    let bonus = 0
    if      (newCount === 3)  bonus = 3
    else if (newCount === 7)  bonus = 5
    else if (newCount === 14) bonus = 10
    else if (newCount === 30) bonus = 20

    const newStars = stars + bonus
    if (bonus > 0) {
      setStars(newStars)
      const key = newCount === 3 ? 'streakBonus3'
                : newCount === 7 ? 'streakBonus7'
                : newCount === 14 ? 'streakBonus14'
                : 'streakBonus30'
      showToast(tr[key](newCount))
      celebrate()
    }

    await save(user.nkCode, {
      username:      user.username,
      stars:         bonus > 0 ? newStars : stars,
      routines_done: routinesDone,
      focus_minutes: focusMinutes,
      games_played:  gamesPlayed,
      routine_state: newRoutineState,
    })
    return newCount
  }

  async function saveMood(moodKey) {
    const today = new Date().toISOString().slice(0, 10)
    const newState = { ...routineState, mood: { value: moodKey, date: today } }
    await saveRoutineState(newState)
  }

  function logout() {
    lsClear()
    setUser(null); setStars(0); setRoutineState({}); setGamesPlayed(0)
    setFocusMinutes(0); setRoutinesDone(0); setTasks([]); setChildData(null)
    setView('home'); setSubview(null)
  }

  function toggleLang() {
    const next = lang === 'es' ? 'en' : 'es'
    setLang(next)
    persistSession({ lang: next })
  }

  return (
    <Ctx.Provider value={{
      lang, tr, toggleLang,
      user, login, logout, saveUsername, sessionLoading,
      stars, addStars,
      routineState, saveRoutineState,
      streak: routineState?.streak || { count: 0, last_date: null },
      updateStreak,
      gamesPlayed, incrementGamesPlayed,
      focusMinutes, addFocusMinutes,
      routinesDone, incrementRoutinesDone,
      saveMood,
      readParentMessage,
      activeBg, unlockedBgs, kidAvatar,
      buyBg, setActiveBg, saveKidAvatar,
      spendStars,
      tasks, setTasks,
      childData,
      view, setView,
      subview, setSubview,
      toastMsg, showToast,
      medalNotif, showMedal,
      celebration, setCelebration,
      rocketTip, showRocket,
      timerPreset, timerTotal, timerEndTime, timerPausedLeft, timerFinished,
      timerSelectPreset, timerStart, timerPause, timerReset,
    }}>
      {children}
    </Ctx.Provider>
  )
}
