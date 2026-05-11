import React, { useRef } from 'react'

function rand(min, max) { return min + Math.random() * (max - min) }

const CANDY_COLORS = ['#FF9A9E', '#FECFEF', '#A18CD1', '#FBD786', '#C6426E', '#f9ca24']

const FISH = ['🐠','🐟','🐡','🦈']

export default function BgDecorations({ themeId }) {
  const ref = useRef(null)

  if (!ref.current || ref.current.themeId !== themeId) {
    if (themeId === 'ocean') {
      ref.current = {
        themeId,
        items: Array.from({ length: 28 }, () => ({
          left:  rand(3, 95),
          size:  rand(5, 22),
          dur:   rand(4, 14),
          delay: rand(-14, 0),
          opacity: rand(0.3, 0.7),
        })),
      }
    } else if (themeId === 'candy') {
      ref.current = {
        themeId,
        items: Array.from({ length: 12 }, () => ({
          left:  rand(5, 92),
          top:   rand(5, 92),
          size:  rand(10, 28),
          dur:   rand(3, 7),
          delay: rand(0, 5),
          color: CANDY_COLORS[Math.floor(Math.random() * CANDY_COLORS.length)],
        })),
      }
    } else if (themeId === 'superhero') {
      ref.current = {
        themeId,
        items: Array.from({ length: 8 }, () => ({
          left:  rand(5, 88),
          top:   rand(10, 85),
          dur:   rand(1.5, 3.5),
          delay: rand(0, 4),
        })),
      }
    } else {
      ref.current = { themeId, items: [] }
    }
  }

  const { items } = ref.current

  if (themeId === 'ocean') {
    return (
      <div className="bg-dec-wrap">
        {items.map((b, i) => (
          <div key={i} className="bg-dec-bubble" style={{
            left: `${b.left}%`,
            width: b.size, height: b.size,
            animationDuration: `${b.dur}s`,
            animationDelay: `${b.delay}s`,
            opacity: b.opacity,
          }} />
        ))}
      </div>
    )
  }

  if (themeId === 'candy') {
    return (
      <div className="bg-dec-wrap">
        {items.map((c, i) => (
          <div key={i} className="bg-dec-candy" style={{
            left: `${c.left}%`,
            top:  `${c.top}%`,
            width: c.size, height: c.size,
            background: c.color,
            animationDuration: `${c.dur}s`,
            animationDelay: `${c.delay}s`,
          }} />
        ))}
      </div>
    )
  }

  if (themeId === 'superhero') {
    return (
      <div className="bg-dec-wrap">
        {items.map((b, i) => (
          <div key={i} className="bg-dec-bolt" style={{
            left:  `${b.left}%`,
            top:   `${b.top}%`,
            animationDuration: `${b.dur}s`,
            animationDelay: `${b.delay}s`,
          }}>⚡</div>
        ))}
      </div>
    )
  }

  return null
}
