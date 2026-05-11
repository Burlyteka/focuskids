import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://reszwwbjqgogtmjigflz.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlc3p3d2JqcWdvZ3RtamlnZmx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNzM3NTcsImV4cCI6MjA5Mzc0OTc1N30.TzwitOrQSSAW7RwxsmMJ5PeMS34mWkqJpB9xxxvGiIY'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const CODE_REGEX = /^(NK|PD)-[A-Z0-9]{4,8}$/
const QUEUE_KEY  = 'fk_save_queue'

/* ── Offline save queue ── */
function queueSave(nkCode, data) {
  try {
    const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')
    const idx   = queue.findIndex(q => q.nkCode === nkCode)
    const entry = { nkCode, data, ts: Date.now() }
    if (idx >= 0) queue[idx] = entry
    else queue.push(entry)
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
    console.warn('📦 Guardado en cola local (Supabase no disponible)')
  } catch {}
}

/* ── Flush pending saves — call on app mount ── */
export async function flushSaveQueue() {
  try {
    const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')
    if (!queue.length) return 0
    const failed = []
    for (const { nkCode, data } of queue) {
      const payload = {
        code:          nkCode,
        username:      data.username      ?? null,
        stars:         data.stars         ?? 0,
        routines_done: data.routines_done ?? 0,
        focus_minutes: data.focus_minutes ?? 0,
        games_played:  data.games_played  ?? 0,
        routine_state: data.routine_state ?? {},
        last_seen:     new Date().toISOString(),
      }
      const { error } = await supabase.from('kid_progress').upsert(payload, { onConflict: 'code' })
      if (error) failed.push({ nkCode, data, ts: Date.now() })
    }
    localStorage.setItem(QUEUE_KEY, JSON.stringify(failed))
    const sent = queue.length - failed.length
    if (sent > 0) console.log(`✅ ${sent} guardado(s) pendiente(s) sincronizados con Supabase`)
    return sent
  } catch {
    return 0
  }
}

/* ── Sync format check (used for input validation) ── */
export function validateCode(code) {
  const c = code.trim().toUpperCase()
  if (!CODE_REGEX.test(c)) return { valid: false, code: c }
  return { valid: true, code: c }
}

/* ── Validate format + load progress in one shot ──
   Accepts ANY properly-formatted NK-/PD- code.
   Does NOT reject based on access_codes table. ── */
export async function validateAndLoad(code) {
  const c = code.trim().toUpperCase()
  if (!CODE_REGEX.test(c)) return { valid: false }

  const isParent = c.startsWith('PD-')
  const nkCode   = isParent ? 'NK-' + c.slice(3) : c

  let progress = null
  try {
    const { data } = await supabase
      .from('kid_progress')
      .select('*')
      .eq('code', nkCode)
      .single()
    progress = data || null
  } catch (e) {
    console.warn('validateAndLoad: no se pudo cargar progreso', e)
  }

  return {
    valid:    true,
    code:     c,
    role:     isParent ? 'parent' : 'kid',
    nkCode,
    progress,
  }
}

/* ── Load kid_progress row (returns null if not found) ── */
export async function loadProgress(nkCode) {
  const { data, error } = await supabase
    .from('kid_progress')
    .select('*')
    .eq('code', nkCode)
    .single()
  if (error && error.code !== 'PGRST116') console.error('ERROR cargando:', error)
  return data || null
}

/* ── Save (upsert) full kid_progress row ──
   On network failure: queues locally and syncs on next mount. ── */
export async function saveProgress(nkCode, data) {
  const payload = {
    code:          nkCode,
    username:      data.username      ?? null,
    stars:         data.stars         ?? 0,
    routines_done: data.routines_done ?? 0,
    focus_minutes: data.focus_minutes ?? 0,
    games_played:  data.games_played  ?? 0,
    routine_state: data.routine_state ?? {},
    last_seen:     new Date().toISOString(),
  }

  console.log('💾 Guardando en Supabase:', payload)

  const { error } = await supabase
    .from('kid_progress')
    .upsert(payload, { onConflict: 'code' })

  if (error) {
    console.error('ERROR SUPABASE:', error)
    queueSave(nkCode, data)
    return false
  }

  console.log('✅ Guardado en Supabase correctamente')
  return true
}

/* ── Load parent view of a child ── */
export async function loadChildProgressForParent(nkCode) {
  const { data, error } = await supabase
    .from('kid_progress')
    .select('*')
    .eq('code', nkCode)
    .single()
  if (error && error.code !== 'PGRST116') console.error('ERROR loadChildProgress:', error)
  return data || null
}
