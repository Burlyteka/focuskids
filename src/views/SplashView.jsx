import React, { useEffect } from 'react'
import StarsBg from '../components/StarsBg.jsx'

const PARTICLES = [
  { dx:  0,   dy: -90, color: '#F59E0B' },
  { dx:  64,  dy: -64, color: '#EC4899' },
  { dx:  90,  dy:   0, color: '#4C6EF5' },
  { dx:  64,  dy:  64, color: '#10B981' },
  { dx:  0,   dy:  90, color: '#7C3AED' },
  { dx: -64,  dy:  64, color: '#F97316' },
  { dx: -90,  dy:   0, color: '#06B6D4' },
  { dx: -64,  dy: -64, color: '#EF4444' },
  { dx:  30,  dy:-100, color: '#A855F7' },
  { dx: -30,  dy:-100, color: '#FBBF24' },
  { dx: 100,  dy: -30, color: '#34D399' },
  { dx:-100,  dy:  30, color: '#F472B6' },
]

export default function SplashView({ onDone }) {
  useEffect(() => {
    const id = setTimeout(onDone, 4000)
    return () => clearTimeout(id)
  }, [onDone])

  return (
    <div className="splash-screen">
      <StarsBg count={40} />

      {/* Rocket + burst particles, all in a relative wrapper */}
      <div className="splash-center">
        <div className="splash-rocket">🚀</div>
        {PARTICLES.map((p, i) => (
          <div
            key={i}
            className="splash-particle"
            style={{ '--dx': `${p.dx}px`, '--dy': `${p.dy}px`, background: p.color }}
          />
        ))}
      </div>

      <div className="splash-title">FocusKids 🚀</div>
      <div className="splash-sub">Tu aventura espacial</div>
    </div>
  )
}
