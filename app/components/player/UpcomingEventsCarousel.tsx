'use client'

import type { UpcomingEvent } from '@/lib/supabase/events'
import { cn, formatLongDateMX } from '@/lib/utils'
import { motion, useAnimationFrame, useMotionValue } from 'framer-motion'
import { CalendarDays, MapPin } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useLayoutEffect, useRef, useState } from 'react'
import { Card } from '../ui/card'

interface UpcomingEventsCarouselProps {
  events: UpcomingEvent[]
}

const GAP_PX = 16 // matches gap-4 on the track; keeps the loop seam gapless
const BASE_VELOCITY = -40 // px/s; negative = drifts left
const MAX_FLING = 1400 // px/s cap so a hard flick can't launch it off
const RETURN_TAU = 0.6 // s; how fast a flick eases back to the base drift
const DRAG_THRESHOLD = 6 // px of movement before a press counts as a drag (vs a click)

/** Keep the offset within one copy's width so the loop stays seamless either way. */
function wrap(value: number, copyWidth: number): number {
  if (copyWidth <= 0) return value
  let n = value % copyWidth
  if (n > 0) n -= copyWidth
  return n
}

export function UpcomingEventsCarousel({ events }: UpcomingEventsCarouselProps) {
  const x = useMotionValue(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  // Only scroll when one copy of the list is wider than the viewport. With few
  // events the strip can't fill the width, so animating just slides a short row
  // around awkwardly — we center it statically instead.
  const [shouldScroll, setShouldScroll] = useState(false)

  // Drag/inertia state lives in refs so it never triggers re-renders per frame.
  const velocity = useRef(BASE_VELOCITY)
  const pressing = useRef(false) // pointer is down (pauses the drift)
  const dragging = useRef(false) // movement crossed the threshold → really dragging
  const moved = useRef(false)
  const startX = useRef(0)
  const lastPointerX = useRef(0)
  const lastMoveTime = useRef(0)

  const copyWidth = () => {
    const track = trackRef.current
    if (!track) return 0
    return (track.scrollWidth + GAP_PX) / 2
  }

  useLayoutEffect(() => {
    const container = containerRef.current
    const track = trackRef.current
    if (!container || !track) return

    const measure = () => {
      // When scrolling, the track holds two copies; a single copy's content
      // width is (scrollWidth - gap) / 2. When static it's just scrollWidth.
      const single = shouldScroll ? (track.scrollWidth - GAP_PX) / 2 : track.scrollWidth
      const next = single > container.clientWidth
      setShouldScroll(next)
      if (!next) x.set(0)
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(container)
    return () => ro.disconnect()
  }, [shouldScroll, events.length, x])

  useAnimationFrame((_, delta) => {
    if (!shouldScroll || pressing.current) return
    const width = copyWidth()
    if (width <= GAP_PX) return
    const dt = delta / 1000
    // Ease the current velocity back toward the base drift after a flick.
    const k = 1 - Math.exp(-dt / RETURN_TAU)
    velocity.current += (BASE_VELOCITY - velocity.current) * k
    x.set(wrap(x.get() + velocity.current * dt, width))
  })

  const onPointerDown = (e: React.PointerEvent) => {
    if (!shouldScroll) return
    pressing.current = true
    dragging.current = false
    moved.current = false
    startX.current = e.clientX
    lastPointerX.current = e.clientX
    lastMoveTime.current = e.timeStamp
    // NOTE: capture is deferred until a real drag — capturing here would
    // redirect the follow-up click to this container and break card links.
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pressing.current) return
    const dx = e.clientX - lastPointerX.current

    // Promote to a drag only once movement clears the threshold; that's also
    // when we grab pointer capture, so plain taps/clicks reach the card link.
    if (!dragging.current && Math.abs(e.clientX - startX.current) > DRAG_THRESHOLD) {
      dragging.current = true
      moved.current = true
      e.currentTarget.setPointerCapture(e.pointerId)
    }

    if (dragging.current) {
      if (dx !== 0) {
        const dt = Math.max(1, e.timeStamp - lastMoveTime.current) / 1000
        velocity.current = Math.max(-MAX_FLING, Math.min(MAX_FLING, dx / dt))
      }
      x.set(wrap(x.get() + dx, copyWidth()))
    }
    lastPointerX.current = e.clientX
    lastMoveTime.current = e.timeStamp
  }

  const endDrag = (e: React.PointerEvent) => {
    if (!pressing.current) return
    pressing.current = false
    dragging.current = false
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
  }

  // Swallow the click that follows a real drag so a fling doesn't open a card.
  const onClickCapture = (e: React.MouseEvent) => {
    if (moved.current) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  // Duplicate the list only when scrolling so the loop seams seamlessly.
  const items = shouldScroll ? [...events, ...events] : events

  return (
    <div className='w-full'>
      <h2 className='font-impact-label mx-auto mb-3 max-w-5xl px-4 text-center text-[22px] text-green-300 uppercase md:text-left'>
        Próximos eventos
      </h2>

      {/* Full-bleed marquee: the scrolling strip runs edge-to-edge while the
          title stays aligned with the page content above. */}
      <div
        ref={containerRef}
        className={cn(
          'relative overflow-hidden',
          shouldScroll && 'cursor-grab touch-pan-y select-none active:cursor-grabbing'
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
      >
        {/* Fade edges so cards melt in/out at the real screen edges */}
        {shouldScroll && (
          <>
            <div className='pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-black/40 to-transparent' />
            <div className='pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-black/40 to-transparent' />
          </>
        )}

        <motion.div
          ref={trackRef}
          style={{ x }}
          className={cn('flex gap-4 py-2', shouldScroll ? 'w-max' : 'w-full justify-center')}
        >
          {items.map((event, i) => (
            <EventCard
              key={`${event.id}-${i}`}
              event={event}
            />
          ))}
        </motion.div>
      </div>
    </div>
  )
}

function EventCard({ event }: { event: UpcomingEvent }) {
  const place = [event.venue_name, event.city, event.state].filter(Boolean).join(', ')

  const card = (
    <Card className='h-full w-[260px] gap-0 overflow-hidden border-2 border-red-700/70 bg-yellow-100/95 py-0 shadow-[4px_4px_0_rgba(0,0,0,0.4)] transition-transform duration-300 hover:-translate-y-1 hover:rotate-1'>
      <div className='relative h-20 w-full bg-neutral-800'>
        {event.cover_image_url ? (
          <Image
            src={event.cover_image_url}
            alt={event.title}
            fill
            sizes='260px'
            draggable={false}
            className='object-cover'
          />
        ) : (
          <div className='flex h-full items-center justify-center'>
            <CalendarDays className='h-8 w-8 text-yellow-100/70' />
          </div>
        )}
        <span className='font-baby-doll absolute top-2 left-2 rounded-sm border border-red-700 bg-yellow-100 px-2 py-0.5 text-xs tracking-wide text-red-700 uppercase shadow-[2px_2px_0_rgba(0,0,0,0.4)]'>
          {formatLongDateMX(event.event_date)}
        </span>
      </div>

      <div className='flex flex-col gap-1 px-3 py-3'>
        <p className='font-impact-label line-clamp-2 text-lg leading-tight text-red-700 uppercase'>{event.title}</p>
        {place && (
          <p className='flex items-center gap-1 text-xs text-neutral-700'>
            <MapPin className='h-3 w-3 shrink-0' />
            <span className='line-clamp-1'>{place}</span>
          </p>
        )}
      </div>
    </Card>
  )

  // Prefer the event's own link; fall back to the organizer's profile.
  const href = event.external_link ?? (event.proposer_slug ? `/perfil/${event.proposer_slug}` : null)
  if (!href) return <div className='shrink-0'>{card}</div>

  const external = Boolean(event.external_link)
  return (
    <Link
      href={href}
      draggable={false}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={cn('block shrink-0')}
    >
      {card}
    </Link>
  )
}
