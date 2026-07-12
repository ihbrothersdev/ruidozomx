'use client'

import { useMemo } from 'react'

// Ruidozo palette.
const COLORS = ['#e23b2e', '#e5a838', '#e8531f', '#6fae2f', '#635bff', '#f5e9c8']

/** Tiny seeded PRNG so the layout is identical on server and client (no
 *  hydration mismatch) while still looking scattered. */
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * One-time confetti burst for the thank-you page. Pieces are generated
 * deterministically during render, so SSR and client match. They fall once —
 * no infinite loop, so the page settles after the celebration. Decorative and
 * pointer-events-none, so it never blocks interaction. Hidden under
 * prefers-reduced-motion (see globals.css).
 */
export function Confetti({ count = 110 }: { count?: number }) {
  const pieces = useMemo(() => {
    const rnd = mulberry32(0x9e3779b9)
    return Array.from({ length: count }, () => ({
      left: rnd() * 100,
      delay: rnd() * 1.2,
      duration: 3 + rnd() * 2.5,
      drift: (rnd() - 0.5) * 240,
      spin: (rnd() > 0.5 ? 1 : -1) * (360 + rnd() * 720),
      color: COLORS[Math.floor(rnd() * COLORS.length)],
      w: 6 + rnd() * 6,
      h: 10 + rnd() * 8
    }))
  }, [count])

  return (
    <div
      aria-hidden
      className='pointer-events-none fixed inset-0 z-40 overflow-hidden'
    >
      {pieces.map((p, i) => (
        <span
          key={i}
          className='confetti-piece'
          style={
            {
              left: `${p.left}%`,
              width: `${p.w}px`,
              height: `${p.h}px`,
              background: p.color,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              '--drift': `${p.drift}px`,
              '--spin': `${p.spin}deg`
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
