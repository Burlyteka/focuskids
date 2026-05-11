import React, { useRef } from 'react'

function rand(min, max) { return min + Math.random() * (max - min) }

/* ── StarField: 3-layer depth + floating stars ── */
export default function StarsBg() {
  const layers = useRef(null)

  if (!layers.current) {
    layers.current = {
      // Layer 1 — back: 180 tiny (1 px), slow twinkle — extra density top 40%
      tiny: Array.from({ length: 180 }, (_, i) => ({
        top:  i < 70 ? Math.random() * 40 : Math.random() * 100,
        left: Math.random() * 100,
        dur:  rand(2.5, 4.5), delay: rand(0, 6),
      })),
      // Layer 2 — mid: 80 medium (2 px), medium twinkle
      mid: Array.from({ length: 80 }, (_, i) => ({
        top:  i < 30 ? Math.random() * 40 : Math.random() * 100,
        left: Math.random() * 100,
        dur:  rand(1.8, 3.5), delay: rand(0, 5),
      })),
      // Layer 3 — front: 30 large (3–4 px), fast twinkle
      large: Array.from({ length: 30 }, () => ({
        top:  Math.random() * 100, left: Math.random() * 100,
        dur:  rand(1.2, 2.5), delay: rand(0, 4),
        size: rand(3, 4),
      })),
      // Floating: 30 stars drifting upward
      float: Array.from({ length: 30 }, () => ({
        left:  rand(0, 100),
        size:  rand(2.5, 5),
        dur:   rand(15, 32),
        delay: rand(-30, 0),
        dx:    rand(-22, 22),
      })),
    }
  }

  const { tiny, mid, large, float } = layers.current

  return (
    <div className="sf-wrap">
      {tiny.map((s, i) => (
        <div key={`t${i}`} className="sf-star sf-tiny" style={{
          top: `${s.top}%`, left: `${s.left}%`,
          animationDuration: `${s.dur}s`,
          animationDelay:    `${s.delay}s`,
        }} />
      ))}
      {mid.map((s, i) => (
        <div key={`m${i}`} className="sf-star sf-mid" style={{
          top: `${s.top}%`, left: `${s.left}%`,
          animationDuration: `${s.dur}s`,
          animationDelay:    `${s.delay}s`,
        }} />
      ))}
      {large.map((s, i) => (
        <div key={`l${i}`} className="sf-star sf-large" style={{
          top: `${s.top}%`, left: `${s.left}%`,
          width: s.size, height: s.size,
          animationDuration: `${s.dur}s`,
          animationDelay:    `${s.delay}s`,
        }} />
      ))}
      {float.map((s, i) => (
        <div key={`f${i}`} className="sf-float" style={{
          left:              `${s.left}%`,
          width:             s.size,
          height:            s.size,
          animationDuration: `${s.dur}s`,
          animationDelay:    `${s.delay}s`,
          '--fdx':           `${s.dx}px`,
        }} />
      ))}
    </div>
  )
}
