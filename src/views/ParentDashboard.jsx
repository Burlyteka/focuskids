import React, { useState, useEffect } from 'react'
import { useApp } from '../contexts/AppContext.jsx'
import { loadChildProgressForParent, saveProgress } from '../lib/supabase.js'
import { MOOD_OPTS } from '../data/translations.js'

const PARENT_AVATARS = ['👨','👩','👴','👵','👨‍👩‍👧','👩‍👦','👨‍👦','👩‍👧','👨‍👧','🧑‍💼','👮','🦸‍♀️','🦸‍♂️']

/* ── helpers ─────────────────────────────────────── */
function getMood(key) { return MOOD_OPTS.find(m => m.key === key) || null }
function getStarProgress(stars) {
  if (stars < 10)  return { pct: stars / 10,        next: 10 }
  if (stars < 30)  return { pct: (stars - 10) / 20, next: 30 }
  if (stars < 50)  return { pct: (stars - 30) / 20, next: 50 }
  return                  { pct: 1,                  next: null }
}
function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000)
}

/* ── daily tips ─────────────────────────────────── */
const DAILY_TIPS = {
  es: [
    'Usa un timer visual cuando tu hijo/a hace tarea. El tiempo abstracto no existe para el cerebro TDAH.',
    'Antes de salir, repasa la rutina juntos en voz alta como si fuera un juego.',
    'Cada logro pequeño merece celebración real. El cerebro TDAH necesita dopamina inmediata.',
    'Reduce las pantallas 1 hora antes de dormir. El TDAH ya tiene dificultad para bajar revoluciones.',
    'Dale opciones en lugar de ordenes: Haces la tarea antes o despues de merendar?',
    'El contacto visual antes de hablar aumenta la atención. Agáchate a su nivel.',
    'Instrucciones de UN solo paso a la vez. El cerebro TDAH se satura con múltiples comandos.',
    '20 minutos de actividad física antes de la tarea mejora la concentración hasta 4 horas.',
    'Un espacio libre de distracciones visuales ayuda más que horas de castigo.',
    'El TDAH no es falta de querer. Es dificultad para HACER lo que se quiere.',
    'Celebra el esfuerzo, no el resultado: Qué bien que lo intentaste! vale mucho.',
    'La consistencia en los horarios es la medicina más barata y efectiva para el TDAH.',
    'Cuando haya crisis, no razones durante ella. Espera a que pase y habla después en calma.',
    'La naturaleza reduce síntomas TDAH. 20 min al aire libre = mejor regulación emocional.',
    'Usa recordatorios visuales: post-its con dibujos en los lugares clave de la rutina.',
    'El sueño regula la dopamina. Sin buen sueño, los síntomas TDAH empeoran significativamente.',
    'Dale responsabilidades pequeñas con consecuencias naturales — construye autonomía real.',
    'Antes de dormirse, recuerden 3 cosas buenas del día. El TDAH tiende a recordar solo lo negativo.',
    'Evita comparar con hermanos o compañeros. El TDAH ya genera mucha vergüenza interna.',
    'El deporte de equipo desarrolla habilidades sociales Y ayuda con la regulación emocional.',
    'Cuando dice que hizo algo y no lo hizo, puede ser memoria de trabajo fallando, no mentira.',
    'Los abrazos y el contacto físico positivo regulan el sistema nervioso del niño con TDAH.',
    'Una lista visual para la mañana puede reemplazar 10 recordatorios verbales.',
    'Las transiciones son momentos de alta tensión para el TDAH. Avisa con anticipación.',
    'El humor y la conexión emocional contigo son el mayor motivador para tu hijo/a.',
    'Un hobby apasionante puede convertirse en su mayor fortaleza en el futuro.',
    'Terapia conductual + rutinas + apoyo familiar = combinación más efectiva para el TDAH.',
    'Tu bienestar como padre/madre también importa. Cuídate para poder cuidar mejor.',
    'El TDAH puede ser un superpoder: creatividad, energía, pensamiento divergente.',
    'Recuerda: el objetivo no es un niño perfecto, sino un niño que aprende a conocerse.',
  ],
  en: [
    'Use a visual timer during homework. Abstract time does not exist for the ADHD brain.',
    'Before leaving, review the routine together out loud — make it a game.',
    'Every small win deserves real celebration. The ADHD brain needs immediate dopamine.',
    'Reduce screens 1 hour before bed. ADHD already struggles to wind down.',
    'Give choices instead of orders: Do you want to do homework before or after a snack?',
    'Make eye contact before speaking — it increases attention. Get down to their level.',
    'One instruction at a time. The ADHD brain gets overwhelmed by multiple commands.',
    '20 minutes of physical activity before homework improves concentration for up to 4 hours.',
    'A distraction-free space helps more than hours of punishment.',
    'ADHD is not a lack of wanting. It is difficulty DOING what one wants.',
    'Celebrate effort, not just results: I am so proud you tried! goes a long way.',
    'Consistent schedules are the cheapest and most effective medicine for ADHD.',
    'During a meltdown, do not reason — wait for it to pass, then talk calmly.',
    'Nature reduces ADHD symptoms. 20 min outdoors = better emotional regulation.',
    'Use visual reminders: sticky notes with drawings in key spots of the routine.',
    'Sleep regulates dopamine. Poor sleep significantly worsens ADHD symptoms.',
    'Give small responsibilities with natural consequences — it builds real independence.',
    'Before bed, name 3 good things from the day. ADHD tends to remember only the negatives.',
    'Avoid comparing them to siblings or classmates. ADHD already creates a lot of inner shame.',
    'Team sports build social skills AND help with emotional regulation.',
    'When they say they did something and did not, it may be working memory failing, not lying.',
    'Hugs and positive physical contact regulate the nervous system of a child with ADHD.',
    'A visual morning checklist can replace 10 verbal reminders.',
    'Transitions are high-tension moments for ADHD. Give advance warning.',
    'Humor and emotional connection with you are the greatest motivators for your child.',
    'A passionate hobby can become their greatest strength in the future.',
    'Behavioral therapy + routines + family support = most effective combo for ADHD.',
    'Your wellbeing as a parent matters too. Take care of yourself to better care for them.',
    'ADHD can be a superpower: creativity, energy, divergent thinking.',
    'Remember: the goal is not a perfect child, but a child who learns to know themselves.',
  ]
}
const todayTipIndex = new Date().getDate() % DAILY_TIPS.length

/* ── quiz ────────────────────────────────────────── */
const QUIZ = {
  es: [
    { q: '¿Cuántos años de retraso tienen normalmente las funciones ejecutivas en el TDAH?', opts: ['1 año', '2–3 años', '5 años', 'Ningún retraso'], correct: 1, explain: 'Las funciones ejecutivas en TDAH se desarrollan 2–3 años más lento — no por falta de inteligencia, sino por diferencias neurológicas.' },
    { q: '¿Cuántos minutos de ejercicio antes de la tarea mejoran la concentración?', opts: ['5 min', '10 min', '20 min', '60 min'], correct: 2, explain: '20 minutos de actividad física activan neurotransmisores que mejoran la concentración hasta 4 horas después.' },
    { q: 'Tu hijo/a olvidó lo que prometió ayer. Lo más probable es:', opts: ['Está mintiendo', 'Memoria de trabajo fallando', 'No le importa', 'Te está probando'], correct: 1, explain: 'La memoria de trabajo es una de las funciones más afectadas en el TDAH. El olvido no es intencional.' },
  ],
  en: [
    { q: 'How many years behind are executive functions in ADHD?', opts: ['1 year', '2–3 years', '5 years', 'No delay'], correct: 1, explain: 'Executive functions in ADHD develop 2–3 years slower — not due to lack of intelligence but neurological differences.' },
    { q: 'How many minutes of exercise before homework improve focus?', opts: ['5 min', '10 min', '20 min', '60 min'], correct: 2, explain: '20 minutes of physical activity activates neurotransmitters that improve concentration for up to 4 hours.' },
    { q: "Your child forgot what they promised yesterday. Most likely:", opts: ["They're lying", 'Working memory failing', "They don't care", 'Testing you'], correct: 1, explain: 'Working memory is one of the most affected functions in ADHD. Forgetting is not intentional.' },
  ],
}

/* ── mini calendar — fits inside card ───────────── */
function MiniCalendar({ lastSeenStr }) {
  const today    = new Date()
  const DAY_ABBR = ['D', 'L', 'M', 'M', 'J', 'V', 'S']
  const last7    = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - 6 + i)
    return { date: d.toISOString().slice(0, 10), abbr: DAY_ABBR[d.getDay()] }
  })
  return (
    <div style={{ display: 'flex', gap: 2, justifyContent: 'space-between', marginTop: 8, width: '100%' }}>
      {last7.map(d => {
        const active = d.date === lastSeenStr
        return (
          <div key={d.date} style={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
            <div style={{ fontSize: 7, fontWeight: 800, color: '#aaa', marginBottom: 2 }}>{d.abbr}</div>
            <div style={{
              margin: '0 auto', width: 18, height: 18, borderRadius: '50%',
              background: active ? '#8DB5A0' : '#EEF2EE',
              color: active ? '#fff' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: 9,
              boxShadow: active ? '0 2px 6px rgba(141,181,160,.5)' : 'none',
            }}>
              {active ? '✓' : ''}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── shared card components ─────────────────────── */
function StatCard({ bg, children, style = {} }) {
  return (
    <div style={{ background: bg || '#fff', borderRadius: 20, padding: '20px 18px', boxShadow: '0 4px 18px rgba(0,0,0,.07)', overflow: 'hidden', ...style }}>
      {children}
    </div>
  )
}
function StatTitle({ icon, label, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <span style={{ fontSize: 12, fontWeight: 900, color, letterSpacing: .5, textTransform: 'uppercase' }}>{label}</span>
    </div>
  )
}
function BigNum({ value, color }) {
  return <div style={{ fontSize: 42, fontWeight: 900, color, lineHeight: 1, marginBottom: 6 }}>{value}</div>
}
function Hint({ text }) {
  return <p style={{ fontSize: 12, fontWeight: 600, color: '#999', margin: '8px 0 0', lineHeight: 1.5 }}>{text}</p>
}
function ProgressBar({ pct, color }) {
  return (
    <div style={{ background: '#EEE', borderRadius: 999, height: 10, overflow: 'hidden', margin: '10px 0 6px' }}>
      <div style={{ width: `${Math.min(1, pct) * 100}%`, height: '100%', background: color, borderRadius: 999, transition: 'width .6s ease' }} />
    </div>
  )
}

/* ── resource body components ───────────────────── */
function IcebergBody({ lang }) {
  const visible = lang === 'es'
    ? ['😤 Irritable', '🙈 Distraído', '💨 Inquieto', '⚡ Impulsivo']
    : ['😤 Irritable', '🙈 Distracted', '💨 Restless', '⚡ Impulsive']
  const hidden = lang === 'es'
    ? ['Vergüenza interna', 'Regulación emocional difícil', 'Memoria de trabajo débil', 'Ansiedad interna', 'Procesamiento sensorial']
    : ['Inner shame', 'Difficult emotional regulation', 'Weak working memory', 'Inner anxiety', 'Sensory processing']
  const footer = lang === 'es'
    ? 'Tu hijo/a no lo hace a propósito. Su cerebro funciona diferente. 💙'
    : 'Your child does not do it on purpose. Their brain works differently. 💙'
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 900, color: '#A8C4D4', marginBottom: 6 }}>
        {lang === 'es' ? 'A LA VISTA' : 'ABOVE WATER'}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
        {visible.map(t => (
          <span key={t} style={{ fontSize: 11, fontWeight: 700, background: '#A8C4D4', color: '#fff', borderRadius: 99, padding: '3px 8px' }}>{t}</span>
        ))}
      </div>
      <div style={{ fontSize: 11, fontWeight: 900, color: '#6699BB', marginBottom: 6 }}>
        {lang === 'es' ? 'DEBAJO DEL AGUA' : 'BELOW THE SURFACE'}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
        {hidden.map(t => (
          <span key={t} style={{ fontSize: 10, fontWeight: 600, background: '#6699BB', color: '#fff', borderRadius: 99, padding: '3px 7px' }}>{t}</span>
        ))}
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#5580A0', lineHeight: 1.5 }}>{footer}</div>
    </div>
  )
}

function StopBody({ lang }) {
  const steps = lang === 'es'
    ? [['S','STOP','Para lo que estás haciendo'],['T','TAKE A BREATH','Respira profundo 3 veces'],['O','OBSERVE','¿Qué está pasando realmente?'],['P','PROCEED','Responde con calma, no reacciones']]
    : [['S','STOP','Stop what you are doing'],['T','TAKE A BREATH','Breathe deeply 3 times'],['O','OBSERVE','What is really happening?'],['P','PROCEED','Respond calmly, do not react']]
  return (
    <div>
      {steps.map(([letter, word, desc]) => (
        <div key={letter} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: '#F4A58A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900 }}>{letter}</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 900, color: '#C07060' }}>{word}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#8B6355' }}>{desc}</div>
          </div>
        </div>
      ))}
      <div style={{ fontSize: 12, fontWeight: 700, color: '#A07060' }}>
        {lang === 'es' ? 'Responder vs reaccionar cambia todo 💛' : 'Responding vs reacting changes everything 💛'}
      </div>
    </div>
  )
}

function ExecutiveFxBody({ lang }) {
  const desc = lang === 'es'
    ? <p style={{ fontSize: 12, fontWeight: 600, color: '#5A8A74', lineHeight: 1.5, margin: '0 0 10px' }}>Organiza, planifica y controla impulsos. En TDAH se desarrollan más lento <strong>(2–3 años de retraso)</strong>, no por falta de inteligencia.</p>
    : <p style={{ fontSize: 12, fontWeight: 600, color: '#5A8A74', lineHeight: 1.5, margin: '0 0 10px' }}>Organizes, plans and controls impulses. In ADHD they develop slower <strong>(2–3 year delay)</strong>, not due to lack of intelligence.</p>
  const strats = lang === 'es'
    ? ['Listas visuales en lugar de instrucciones verbales', 'Una tarea a la vez, siempre', 'Timers visibles en el escritorio', 'Rutinas predecibles todos los días']
    : ['Visual checklists instead of verbal instructions', 'One task at a time, always', 'Visible timers on the desk', 'Predictable routines every day']
  return (
    <div>
      {desc}
      <div style={{ fontSize: 12, fontWeight: 900, color: '#5A8A74', marginBottom: 8 }}>
        {lang === 'es' ? '⚙️ Estrategias:' : '⚙️ Strategies:'}
      </div>
      {strats.map(s => (
        <div key={s} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
          <span style={{ color: '#8DB5A0', fontWeight: 900, fontSize: 13 }}>✓</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#5A8A74', lineHeight: 1.4 }}>{s}</span>
        </div>
      ))}
    </div>
  )
}

function EmotionBody({ lang }) {
  const intro = lang === 'es' ? 'Cuando tu hijo/a se desborda:' : 'When your child overflows:'
  const steps = lang === 'es'
    ? [['1','No razones durante la crisis — espera a que pase'],['2','Valida: "Veo que estás muy enojado/a, eso está bien"'],['3','Ofrece el ejercicio de respiración de la app'],['4','Después (en calma): habla sobre lo que pasó']]
    : [["1","Do not reason during the meltdown — wait for it to pass"],["2","Validate: I see you are very angry, that is okay"],["3","Offer the breathing exercise in the app"],["4","Afterwards (calmly): talk about what happened"]]
  const footer = lang === 'es' ? 'Tu calma regula la de ellos 🌿' : 'Your calm regulates theirs 🌿'
  return (
    <div>
      <p style={{ fontSize: 12, fontWeight: 600, color: '#7A6AA0', lineHeight: 1.5, margin: '0 0 10px' }}>{intro}</p>
      {steps.map(([n, t]) => (
        <div key={n} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, background: '#B8A9D9', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900 }}>{n}</div>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#6A5A90', lineHeight: 1.5 }}>{t}</span>
        </div>
      ))}
      <div style={{ fontSize: 12, fontWeight: 700, color: '#7A6AA0' }}>{footer}</div>
    </div>
  )
}

function StrategiesBody({ lang }) {
  const dos = lang === 'es'
    ? ['Una instrucción a la vez', 'Contacto visual antes de hablar', 'Celebra el esfuerzo, no solo el resultado', 'Descansos activos cada 20 minutos', 'Ambiente organizado y predecible', 'Tiempo en naturaleza reduce síntomas']
    : ['One instruction at a time', 'Eye contact before speaking', 'Celebrate effort, not just results', 'Active breaks every 20 minutes', 'Organized and predictable environment', 'Time in nature reduces symptoms']
  const donts = lang === 'es'
    ? ['Repetir: "¿Cuántas veces te tengo que decir?"', 'Comparar con otros niños']
    : ['"How many times do I have to tell you?"', 'Comparing them to other children']
  return (
    <div>
      {dos.map(s => (
        <div key={s} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
          <span style={{ color: '#8DB5A0', fontWeight: 900, fontSize: 14 }}>✅</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#7A6A20', lineHeight: 1.4 }}>{s}</span>
        </div>
      ))}
      <div style={{ marginTop: 8 }}>
        {donts.map(s => (
          <div key={s} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
            <span style={{ color: '#F4A58A', fontWeight: 900, fontSize: 14 }}>❌</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#A07060', lineHeight: 1.4 }}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DailyTipBody({ lang }) {
  const tips = DAILY_TIPS[lang] || DAILY_TIPS.es
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#aaa', marginBottom: 10 }}>
        {new Date().toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
      </div>
      <div style={{ padding: '14px 12px', background: '#fff', borderRadius: 14, boxShadow: '0 2px 10px rgba(141,181,160,.2)', fontSize: 13, fontWeight: 700, color: '#3A7060', lineHeight: 1.7 }}>
        "{tips[todayTipIndex]}"
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#8DB5A0', marginTop: 10 }}>
        {lang === 'es' ? 'Un tip diferente cada día 🌱' : 'A different tip every day 🌱'}
      </div>
    </div>
  )
}

function getResources(lang) {
  return [
    { id: 'iceberg',    emoji: '🧊',
      title: lang === 'es' ? 'El Iceberg del TDAH'   : 'The ADHD Iceberg',
      sub:   lang === 'es' ? 'Lo que ves vs. lo que hay debajo' : 'What you see vs. what lies beneath',
      Body: IcebergBody },
    { id: 'stop',       emoji: '🛑',
      title: lang === 'es' ? 'La Técnica STOP'        : 'The STOP Technique',
      sub:   lang === 'es' ? 'Para momentos de crisis' : 'For crisis moments',
      Body: StopBody },
    { id: 'executive',  emoji: '🧠',
      title: lang === 'es' ? 'Funciones Ejecutivas'   : 'Executive Functions',
      sub:   lang === 'es' ? 'El "jefe" del cerebro'  : "The brain's manager",
      Body: ExecutiveFxBody },
    { id: 'emotion',    emoji: '❤️',
      title: lang === 'es' ? 'Regulación Emocional'  : 'Emotional Regulation',
      sub:   lang === 'es' ? 'Las emociones son más intensas' : 'Emotions run more intense',
      Body: EmotionBody },
    { id: 'strategies', emoji: '⚡',
      title: lang === 'es' ? 'Estrategias Diarias'   : 'Daily Strategies',
      sub:   lang === 'es' ? 'Lo que sí y lo que no' : "What works and what doesn't",
      Body: StrategiesBody },
    { id: 'tip',        emoji: '💡',
      title: lang === 'es' ? 'Tip del Día'           : 'Tip of the Day',
      sub:   lang === 'es' ? '¡Uno nuevo cada día!'  : 'A new one every day!',
      Body: DailyTipBody },
  ]
}

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════ */
export default function ParentDashboard() {
  const { tr, user, childData: initialData, logout, toggleLang, lang } = useApp()
  const [data,    setData]    = useState(initialData)
  const [loading, setLoading] = useState(!initialData)

  // Message
  const [msgText,    setMsgText]    = useState('')
  const [msgSending, setMsgSending] = useState(false)
  const [msgSent,    setMsgSent]    = useState(false)
  const [msgEditing, setMsgEditing] = useState(false)

  // Premio especial
  const REWARD_EMOJIS = ['🎁','🍦','🎬','🎮','🧸','🍕','🎡','🏖️','🍭','🚀','⚽','🎨','🍫','🎪','🏆']
  const [rewardName,   setRewardName]   = useState('')
  const [rewardEmoji,  setRewardEmoji]  = useState('🎁')
  const [rewardStars,  setRewardStars]  = useState('')
  const [rewardSaving, setRewardSaving] = useState(false)
  const [rewardSaved,  setRewardSaved]  = useState(false)

  // Accordion
  const [openRes, setOpenRes] = useState(null)
  const [applied, setApplied] = useState({})

  // Quiz
  const [quizAnswers,   setQuizAnswers]   = useState({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)

  // Parent avatar
  const [parentAvatarOpen, setParentAvatarOpen] = useState(false)
  const parentAvatar = data?.routine_state?.parent_avatar || '👨‍👩‍👧'

  async function saveParentAvatar(emoji) {
    if (!user?.nkCode || !data) return
    const newState = { ...(data.routine_state || {}), parent_avatar: emoji }
    setData(prev => ({ ...prev, routine_state: newState }))
    await saveProgress(user.nkCode, { ...data, routine_state: newState })
  }

  useEffect(() => {
    if (!user?.nkCode) return
    ;(async () => {
      setLoading(true)
      const d = await loadChildProgressForParent(user.nkCode)
      setData(d)
      setLoading(false)
    })()
  }, [user?.nkCode])

  const childName    = data?.username      || '—'
  const childStars   = data?.stars         ?? 0
  const routinesDone = data?.routines_done ?? 0
  const focusMins    = data?.focus_minutes ?? 0
  const lastMoodKey  = data?.routine_state?.mood?.value || null
  const lastMoodDate = data?.routine_state?.mood?.date  || null
  const lastSeenStr  = data?.last_seen ? new Date(data.last_seen).toISOString().slice(0, 10) : null
  const todayStr     = new Date().toISOString().slice(0, 10)
  const diffDays     = lastSeenStr ? daysBetween(lastSeenStr, todayStr) : null
  const streakCount  = data?.routine_state?.streak?.count ?? 0
  const streakLast   = data?.routine_state?.streak?.last_date ?? null
  const mood         = getMood(lastMoodKey)
  const { pct: starPct, next: starNext } = getStarProgress(childStars)
  const existingMsg  = data?.routine_state?.parent_message || null

  const starLabel  = starNext ? `${tr.pdNextGoal} ${starNext} ⭐` : '🌟'
  const milestones = [
    { at: 10, emoji: '🏆', msg: tr.pdMilestone10(childName) },
    { at: 30, emoji: '🚀', msg: tr.pdMilestone30(childName) },
    { at: 50, emoji: '🌟', msg: tr.pdMilestone50()          },
  ]
  const reached = milestones.filter(m => childStars >= m.at)
  const quiz     = QUIZ[lang] || QUIZ.es
  const quizScore = quiz.filter((q, i) => quizAnswers[i] === q.correct).length

  async function saveReward() {
    if (!rewardName.trim() || !user?.nkCode || !data) return
    setRewardSaving(true)
    const newState = {
      ...(data.routine_state || {}),
      custom_reward: { name: rewardName.trim(), emoji: rewardEmoji, stars: Number(rewardStars) || 1, active: true },
    }
    const ok = await saveProgress(user.nkCode, { ...data, routine_state: newState })
    setRewardSaving(false)
    if (ok) {
      setData(prev => ({ ...prev, routine_state: newState }))
      setRewardSaved(true)
      setTimeout(() => setRewardSaved(false), 4000)
    }
  }

  async function clearReward() {
    if (!user?.nkCode || !data) return
    const newState = { ...(data.routine_state || {}), custom_reward: null }
    await saveProgress(user.nkCode, { ...data, routine_state: newState })
    setData(prev => ({ ...prev, routine_state: newState }))
    setRewardName('')
    setRewardEmoji('🎁')
    setRewardStars(50)
  }

  async function sendMessage() {
    const text = msgText.trim()
    if (!text || !user?.nkCode || !data) return
    setMsgSending(true)
    const newState = {
      ...(data.routine_state || {}),
      parent_message: { text, date: new Date().toISOString().slice(0, 10), read: false },
    }
    const ok = await saveProgress(user.nkCode, { ...data, routine_state: newState })
    setMsgSending(false)
    if (ok) {
      setData(prev => ({ ...prev, routine_state: newState }))
      setMsgText('')
      setMsgEditing(false)
      setMsgSent(true)
      setTimeout(() => setMsgSent(false), 4000)
    }
  }

  return (
    <div className="pd-wrap">

      {/* ── Parent avatar picker modal ── */}
      {parentAvatarOpen && (
        <div className="avatar-overlay" onClick={() => setParentAvatarOpen(false)}>
          <div className="avatar-modal" onClick={e => e.stopPropagation()}>
            <p className="avatar-modal-title">{tr.avatarPickParent}</p>
            <div className="avatar-grid">
              {PARENT_AVATARS.map(em => (
                <button
                  key={em}
                  className={`avatar-opt${parentAvatar === em ? ' avatar-opt-active' : ''}`}
                  onClick={() => { saveParentAvatar(em); setParentAvatarOpen(false) }}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ──────────────────────────────────── */}
      <div className="pd-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <button className="pd-logout-btn" onClick={logout}>{tr.pdLogout}</button>
          <button
            onClick={toggleLang}
            style={{ background: 'rgba(255,255,255,.5)', border: '2px solid rgba(244,165,138,.5)', borderRadius: 999, padding: '7px 14px', fontFamily: 'Nunito, var(--font)', fontWeight: 800, fontSize: 13, color: '#8B6355', cursor: 'pointer' }}
          >
            {lang === 'es' ? '🇬🇧 EN' : '🇪🇸 ES'}
          </button>
        </div>
        <div style={{ textAlign: 'center' }}>
          <button
            className="avatar-circle avatar-circle-lg"
            style={{ margin: '0 auto 6px' }}
            onClick={() => setParentAvatarOpen(true)}
          >
            {parentAvatar}
          </button>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#5C3D2E', margin: '0 0 4px' }}>{tr.pdHello}</h2>
          {data && <p style={{ fontSize: 14, fontWeight: 700, color: '#A07060', margin: 0 }}>{tr.pdProgressOf(childName)}</p>}
        </div>
      </div>

      {/* ── BODY ────────────────────────────────────── */}
      <div className="pd-body">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 48 }}>⏳</div>
            <p style={{ fontWeight: 700, color: '#aaa', marginTop: 12 }}>{tr.pdLoading}</p>
          </div>
        ) : !data ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 48 }}>🔍</div>
            <p style={{ fontWeight: 700, color: '#aaa', marginTop: 12 }}>{tr.pdNoData2}</p>
          </div>
        ) : (
          <>

            {/* ── MENSAJE ─────────────────────────────── */}
            <div className="pd-section-title">
              {tr.pdMsgSection(childName === '—' ? 'tu hijo/a' : childName)}
            </div>
            <div style={{ background: 'linear-gradient(135deg,#EDE9F8,#E8F4FB)', borderRadius: 20, padding: '18px 18px 14px', marginBottom: 24, boxShadow: '0 4px 18px rgba(124,58,237,.08)' }}>
              {existingMsg && !msgEditing ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: 28 }}>💌</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#7A6AA0', marginBottom: 4, textTransform: 'uppercase' }}>{tr.pdMsgLast}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#3D2A60', lineHeight: 1.5, wordBreak: 'break-word' }}>"{existingMsg.text}"</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: existingMsg.read ? '#8DB5A0' : '#B8A9D9' }}>
                          {existingMsg.read ? tr.pdMsgReadStatus : tr.pdMsgUnreadStatus}
                        </span>
                        <span style={{ fontSize: 10, color: '#ccc' }}>·</span>
                        <span style={{ fontSize: 10, color: '#bbb' }}>{existingMsg.date}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => { setMsgText(existingMsg.text); setMsgEditing(true) }}
                    style={{ background: 'rgba(124,58,237,.1)', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 12, fontWeight: 800, color: '#7C3AED', cursor: 'pointer' }}
                  >
                    ✏️ {tr.pdMsgEdit}
                  </button>
                </div>
              ) : msgSent ? (
                <div style={{ textAlign: 'center', padding: '12px 0' }}>
                  <div style={{ fontSize: 36 }}>💙</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#5A4A80', marginTop: 8 }}>{tr.pdMsgSent}</div>
                </div>
              ) : (
                <div>
                  <textarea
                    className="pd-msg-input"
                    value={msgText}
                    onChange={e => setMsgText(e.target.value.slice(0, 80))}
                    placeholder={tr.pdMsgPlaceholder}
                    rows={3}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <span style={{ fontSize: 11, color: '#bbb' }}>{msgText.length}/80</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {msgEditing && (
                        <button
                          onClick={() => { setMsgText(''); setMsgEditing(false) }}
                          style={{ background: 'rgba(0,0,0,.06)', border: 'none', borderRadius: 10, padding: '9px 14px', fontSize: 12, fontWeight: 800, color: '#999', cursor: 'pointer' }}
                        >✕</button>
                      )}
                      <button
                        onClick={sendMessage}
                        disabled={!msgText.trim() || msgSending}
                        style={{
                          background: msgText.trim() ? 'linear-gradient(135deg,#7C3AED,#4C6EF5)' : '#ddd',
                          border: 'none', borderRadius: 10, padding: '9px 18px',
                          fontSize: 13, fontWeight: 800, color: '#fff',
                          cursor: msgText.trim() ? 'pointer' : 'default',
                          transition: 'background .2s',
                        }}
                      >
                        {msgSending ? '...' : tr.pdMsgSend}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── PREMIO ESPECIAL ─────────────────────── */}
            <div className="pd-section-title">
              {lang === 'es' ? '🏆 Premio especial para ' + (childName === '—' ? 'tu hijo/a' : childName)
                             : '🏆 Special prize for ' + (childName === '—' ? 'your child' : childName)}
            </div>
            {(() => {
              const cr = data?.routine_state?.custom_reward
              if (cr) {
                return (
                  <div style={{ background: cr.active
                    ? 'linear-gradient(135deg,#EDE9F8,#FCE7F3)'
                    : 'linear-gradient(135deg,#F0FDF4,#ECFDF5)',
                    borderRadius: 20, padding: '18px', marginBottom: 24,
                    boxShadow: '0 4px 18px rgba(124,58,237,.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <div style={{ fontSize: 40 }}>{cr.emoji}</div>
                      <div>
                        <div style={{ fontWeight: 900, fontSize: 16, color: '#3D2A60' }}>{cr.name}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#7A6AA0' }}>{cr.stars} ⭐ requeridas</div>
                        <div style={{ fontSize: 12, fontWeight: 700, marginTop: 4,
                          color: cr.active ? '#7C3AED' : '#059669' }}>
                          {cr.active
                            ? (lang === 'es' ? '⏳ Esperando canje' : '⏳ Waiting to redeem')
                            : (lang === 'es' ? '✅ ¡Ya fue canjeado!' : '✅ Already redeemed!')}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={clearReward}
                      style={{ background: 'rgba(239,68,68,.1)', border: '2px solid rgba(239,68,68,.2)',
                        borderRadius: 10, padding: '8px 16px', fontSize: 12, fontWeight: 800,
                        color: '#DC2626', cursor: 'pointer' }}
                    >
                      🗑️ {lang === 'es' ? 'Eliminar premio' : 'Remove prize'}
                    </button>
                  </div>
                )
              }
              return (
                <div style={{ background: 'linear-gradient(135deg,#EDE9F8,#FCE7F3)',
                  borderRadius: 20, padding: '18px', marginBottom: 24,
                  boxShadow: '0 4px 18px rgba(124,58,237,.08)' }}>
                  {rewardSaved ? (
                    <div style={{ textAlign: 'center', padding: '12px 0' }}>
                      <div style={{ fontSize: 36 }}>🎉</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#5A4A80', marginTop: 8 }}>
                        {lang === 'es' ? '¡Premio guardado! Tu hijo/a lo verá en la tienda.' : 'Prize saved! Your child will see it in the store.'}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#7A6AA0', marginBottom: 14 }}>
                        {lang === 'es'
                          ? 'Pon un premio real como motivación — aparecerá en la tienda de tu hijo/a.'
                          : 'Set a real prize as motivation — it will appear in your child\'s store.'}
                      </div>
                      {/* Emoji picker */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                        {REWARD_EMOJIS.map(em => (
                          <button key={em} onClick={() => setRewardEmoji(em)}
                            style={{ fontSize: 24, padding: '6px', borderRadius: 10, border: '2px solid',
                              borderColor: rewardEmoji === em ? '#7C3AED' : '#E5E7EB',
                              background: rewardEmoji === em ? '#EDE9FE' : '#fff',
                              cursor: 'pointer', lineHeight: 1 }}>
                            {em}
                          </button>
                        ))}
                      </div>
                      {/* Name input */}
                      <input
                        className="pd-msg-input"
                        style={{ marginBottom: 10, fontSize: 15, fontWeight: 700 }}
                        value={rewardName}
                        onChange={e => setRewardName(e.target.value.slice(0, 25))}
                        placeholder={lang === 'es' ? 'Nombre del premio (ej: Helado 🍦)' : 'Prize name (e.g. Ice cream 🍦)'}
                        maxLength={25}
                      />
                      {/* Stars input */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#7A6AA0' }}>
                          ⭐ {lang === 'es' ? 'Estrellas necesarias:' : 'Stars needed:'}
                        </span>
                        <input type="number" min={1} value={rewardStars}
                          onChange={e => setRewardStars(e.target.value === '' ? '' : Math.max(1, Number(e.target.value)))}
                          placeholder="0"
                          style={{ width: 70, padding: '6px 10px', borderRadius: 8,
                            border: '2px solid #C7D2FE', fontFamily: 'var(--font)',
                            fontWeight: 900, fontSize: 15, color: '#4C6EF5', textAlign: 'center' }}
                        />
                      </div>
                      <button
                        onClick={saveReward}
                        disabled={!rewardName.trim() || rewardSaving}
                        style={{
                          width: '100%', padding: '12px',
                          background: rewardName.trim() ? 'linear-gradient(135deg,#7C3AED,#EC4899)' : '#ddd',
                          border: 'none', borderRadius: 12,
                          fontFamily: 'var(--font)', fontWeight: 900, fontSize: 14,
                          color: '#fff', cursor: rewardName.trim() ? 'pointer' : 'default',
                        }}
                      >
                        {rewardSaving ? '...' : (lang === 'es' ? '🎁 Guardar premio' : '🎁 Save prize')}
                      </button>
                    </>
                  )}
                </div>
              )
            })()}

            {/* ── SECCIÓN 1: PROGRESO ─────────────────── */}
            <div className="pd-section-title">{tr.pdSection1}</div>
            <div className="pd-cards-grid">

              <StatCard bg="#FFF4EF">
                <StatTitle icon="⭐" label={tr.pdStars} color="#D47A55" />
                <BigNum value={childStars} color="#F4A58A" />
                <ProgressBar pct={starPct} color="#F4A58A" />
                <div style={{ fontSize: 11, fontWeight: 800, color: '#F4A58A' }}>{starLabel}</div>
                <Hint text={tr.pdStarMsg} />
              </StatCard>

              <StatCard bg="#EFF5F2">
                <StatTitle icon="📋" label={tr.pdRoutines} color="#5A8A74" />
                <BigNum value={routinesDone} color="#8DB5A0" />
                <MiniCalendar lastSeenStr={lastSeenStr} />
                <Hint text={tr.pdCalHint} />
              </StatCard>

              {/* ── STREAK CARD ── */}
              <StatCard bg={streakCount >= 7 ? 'linear-gradient(135deg,#FFF1E6,#FFE0CC)' : streakCount >= 3 ? 'linear-gradient(135deg,#FFF7ED,#FFEDD5)' : '#FFF7ED'} style={{ gridColumn: '1 / -1' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <StatTitle icon="🔥" label={lang === 'es' ? 'Racha de días' : 'Day streak'} color="#C2410C" />
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1, color: streakCount >= 7 ? '#EA4500' : streakCount >= 3 ? '#F97316' : '#FB923C' }}>
                        {streakCount}
                      </div>
                      <span style={{ fontSize: 16, fontWeight: 800, color: '#C2410C' }}>
                        {lang === 'es' ? 'días seguidos' : 'days in a row'}
                      </span>
                    </div>
                    {streakLast && (
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#9A6040', marginTop: 4 }}>
                        {lang === 'es' ? 'Último día: ' : 'Last day: '}
                        {new Date(streakLast + 'T12:00:00').toLocaleDateString(
                          lang === 'es' ? 'es-ES' : 'en-US',
                          { weekday: 'long', day: 'numeric', month: 'short' }
                        )}
                      </div>
                    )}
                    <Hint text={
                      streakCount === 0
                        ? (lang === 'es' ? 'Aún no ha completado ninguna rutina hoy.' : 'No routine completed yet today.')
                        : streakCount >= 7
                        ? (lang === 'es' ? `¡Increíble! ${childName} lleva ${streakCount} días seguidos. 🏆` : `Amazing! ${childName} has ${streakCount} days in a row. 🏆`)
                        : streakCount >= 3
                        ? (lang === 'es' ? `¡Buen ritmo! Anímale a llegar a 7 días. 💪` : `Great rhythm! Encourage them to reach 7 days. 💪`)
                        : (lang === 'es' ? 'Cada día cuenta. ¡Sigue así! 🌟' : 'Every day counts. Keep it up! 🌟')
                    } />
                  </div>
                  <div style={{
                    fontSize: streakCount >= 7 ? 72 : 56,
                    filter: streakCount >= 7 ? 'drop-shadow(0 0 12px rgba(255,100,0,.5))' : 'none',
                    lineHeight: 1, flexShrink: 0, marginLeft: 16,
                  }}>
                    {streakCount >= 7 ? '🔥' : streakCount >= 3 ? '🔥' : streakCount > 0 ? '🔥' : '💤'}
                  </div>
                </div>
                {streakCount >= 3 && (
                  <div style={{ display: 'flex', gap: 4, marginTop: 12, flexWrap: 'wrap' }}>
                    {Array.from({ length: Math.min(streakCount, 14) }, (_, i) => (
                      <div key={i} style={{
                        width: 20, height: 20, borderRadius: '50%',
                        background: i < streakCount ? 'linear-gradient(135deg,#F97316,#EF4444)' : '#E5E7EB',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10,
                      }}>
                        {i < streakCount ? '🔥' : ''}
                      </div>
                    ))}
                    {streakCount > 14 && <span style={{ fontSize: 12, fontWeight: 800, color: '#F97316', alignSelf: 'center' }}>+{streakCount - 14}</span>}
                  </div>
                )}
              </StatCard>

              <StatCard bg="#EEF3F7">
                <StatTitle icon="⏱️" label={tr.pdFocus} color="#5580A0" />
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <BigNum value={focusMins} color="#A8C4D4" />
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#A8C4D4' }}>min</span>
                </div>
                <Hint text={tr.pdFocusMsg} />
              </StatCard>

              <StatCard bg="#F5F2FA">
                <StatTitle icon="😊" label={tr.pdMoodCard} color="#7A6AA0" />
                {mood ? (
                  <>
                    <div style={{ fontSize: 48, lineHeight: 1, marginBottom: 6 }}>{mood.emoji}</div>
                    {lastMoodDate && (
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#B8A9D9' }}>
                        {new Date(lastMoodDate + 'T12:00:00').toLocaleDateString(
                          lang === 'es' ? 'es-ES' : 'en-US',
                          { weekday: 'long', day: 'numeric', month: 'short' }
                        )}
                      </div>
                    )}
                    {!mood.good && (
                      <div style={{ marginTop: 10, padding: '10px 12px', background: '#EDE9F8', borderRadius: 12, fontSize: 12, fontWeight: 700, color: '#7A6AA0', lineHeight: 1.5 }}>
                        {tr.pdMoodBad}
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#ccc', marginTop: 8 }}>{tr.pdNoMood}</div>
                )}
              </StatCard>

              <StatCard bg="#FEFAED" style={{ gridColumn: '1 / -1' }}>
                <StatTitle icon="🔥" label={tr.pdActivity} color="#9A7A20" />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    {diffDays === null  ? <div style={{ fontSize: 15, fontWeight: 700, color: '#ccc' }}>{tr.pdNoActivity}</div>
                    : diffDays === 0    ? <div style={{ fontSize: 20, fontWeight: 900, color: '#C8A040' }}>{tr.pdActiveToday}</div>
                    : diffDays === 1    ? <div style={{ fontSize: 16, fontWeight: 900, color: '#C8A040' }}>{tr.pdActiveYesterday}</div>
                    :                    <div style={{ fontSize: 16, fontWeight: 900, color: '#aaa' }}>{tr.pdActiveDaysAgo(diffDays)}</div>}
                    <Hint text={tr.pdConsistency} />
                  </div>
                  {diffDays === 0 && <div style={{ fontSize: 56 }}>🚀</div>}
                </div>
              </StatCard>

            </div>

            {/* ── MILESTONES ──────────────────────────── */}
            {reached.length > 0 && (
              <>
                <div className="pd-section-title">{tr.pdMilestones}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {reached.map(m => (
                    <div key={m.at} style={{ background: '#fff', borderRadius: 16, padding: '16px 18px', boxShadow: '0 4px 14px rgba(0,0,0,.06)', display: 'flex', alignItems: 'center', gap: 14, border: '2px solid #F7E08A' }}>
                      <span style={{ fontSize: 36 }}>{m.emoji}</span>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#5C3D2E', margin: 0, flex: 1 }}>{m.msg}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── SECCIÓN 2: RECURSOS ACORDEÓN ────────── */}
            <div className="pd-section-title" style={{ marginTop: 28 }}>{tr.pdSection2}</div>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#aaa', margin: '-6px 0 14px' }}>{tr.pdResourceSub}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {getResources(lang).map(res => {
                const isOpen = openRes === res.id
                const ResBody = res.Body
                return (
                  <div key={res.id} className="pd-acc-item">
                    <button
                      className="pd-acc-header"
                      onClick={() => setOpenRes(isOpen ? null : res.id)}
                    >
                      <span style={{ fontSize: 22 }}>{res.emoji}</span>
                      <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                        <div className="pd-acc-title">{res.title}</div>
                        <div className="pd-acc-sub">{res.sub}</div>
                      </div>
                      <span className="pd-acc-chevron" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                    </button>
                    {isOpen && (
                      <div className="pd-acc-body">
                        <ResBody lang={lang} />
                        <label className={`pd-applied-label${applied[res.id] ? ' checked' : ''}`}>
                          <input
                            type="checkbox"
                            checked={!!applied[res.id]}
                            onChange={e => setApplied(p => ({ ...p, [res.id]: e.target.checked }))}
                            style={{ marginRight: 8, accentColor: applied[res.id] ? '#5A8A74' : '#7C3AED' }}
                          />
                          {tr.pdApplied}
                        </label>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* ── QUIZ ────────────────────────────────── */}
            <div className="pd-section-title">{tr.pdQuizTitle}</div>
            <div style={{ background: '#fff', borderRadius: 20, padding: '20px 18px', boxShadow: '0 4px 18px rgba(0,0,0,.07)', marginBottom: 24 }}>
              {quiz.map((q, qi) => (
                <div key={qi} style={{ marginBottom: qi < quiz.length - 1 ? 22 : 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#4A3A6A', marginBottom: 10, lineHeight: 1.4 }}>
                    {qi + 1}. {q.q}
                  </div>
                  {q.opts.map((opt, oi) => {
                    const selected = quizAnswers[qi] === oi
                    const correct  = oi === q.correct
                    let bg     = '#F5F0FF'
                    let color  = '#6A5A90'
                    let border = '2px solid transparent'
                    if (selected && !quizSubmitted) { bg = '#E8E0FB'; border = '2px solid #7C3AED'; color = '#4A2A80' }
                    if (quizSubmitted && correct)    { bg = '#E8F5EE'; border = '2px solid #5A8A74'; color = '#3A6A54' }
                    if (quizSubmitted && selected && !correct) { bg = '#FDECEA'; border = '2px solid #E07070'; color = '#A04040' }
                    return (
                      <button
                        key={oi}
                        disabled={quizSubmitted}
                        onClick={() => !quizSubmitted && setQuizAnswers(p => ({ ...p, [qi]: oi }))}
                        style={{ display: 'block', width: '100%', textAlign: 'left', background: bg, border, borderRadius: 10, padding: '10px 14px', marginBottom: 6, fontSize: 12, fontWeight: 700, color, cursor: quizSubmitted ? 'default' : 'pointer', transition: 'background .15s, border-color .15s', fontFamily: 'inherit' }}
                      >
                        {quizSubmitted && correct ? '✓ ' : ''}{opt}
                      </button>
                    )
                  })}
                  {quizSubmitted && (
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#5A8A74', background: '#EFF5F2', borderRadius: 8, padding: '8px 12px', marginTop: 2, lineHeight: 1.5 }}>
                      💡 {q.explain}
                    </div>
                  )}
                </div>
              ))}

              {!quizSubmitted ? (
                <button
                  onClick={() => Object.keys(quizAnswers).length === quiz.length && setQuizSubmitted(true)}
                  disabled={Object.keys(quizAnswers).length < quiz.length}
                  style={{ width: '100%', padding: 14, background: Object.keys(quizAnswers).length === quiz.length ? 'linear-gradient(135deg,#7C3AED,#4C6EF5)' : '#ddd', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 800, color: '#fff', cursor: Object.keys(quizAnswers).length === quiz.length ? 'pointer' : 'default', transition: 'background .2s', marginTop: 8, fontFamily: 'inherit' }}
                >
                  {tr.pdQuizCheck}
                </button>
              ) : (
                <div style={{ textAlign: 'center', marginTop: 14 }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>{quizScore === 3 ? '🌟' : quizScore >= 2 ? '💛' : '💪'}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#4A3A6A', marginBottom: 14, lineHeight: 1.4 }}>
                    {tr.pdQuizDone(quizScore)}
                  </div>
                  <button
                    onClick={() => { setQuizAnswers({}); setQuizSubmitted(false) }}
                    style={{ background: 'rgba(124,58,237,.1)', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 800, color: '#7C3AED', cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    {tr.pdQuizRetry}
                  </button>
                </div>
              )}
            </div>

            {/* ── PRINT ───────────────────────────────── */}
            <button className="pd-print-btn" onClick={() => window.print()}>
              {tr.pdSave}
            </button>

          </>
        )}
      </div>
    </div>
  )
}
