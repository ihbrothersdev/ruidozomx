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

const PIXELS_PER_SECOND = 40
const GAP_PX = 16 // matches gap-4 on the track; keeps the loop seam gapless

export function UpcomingEventsCarousel({ events }: UpcomingEventsCarouselProps) {
  const x = useMotionValue(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)
  // Only scroll when one copy of the list is wider than the viewport. With few
  // events the strip can't fill the width, so animating just slides a short row
  // around awkwardly — we center it statically instead.
  const [shouldScroll, setShouldScroll] = useState(false)

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
    if (!shouldScroll || paused || !trackRef.current) return
    // One copy's advance = (full strip + one gap) / 2, since the duplicated
    // strip has an odd number of gaps; using scrollWidth/2 leaves a half-gap jump.
    const halfWidth = (trackRef.current.scrollWidth + GAP_PX) / 2
    if (halfWidth <= GAP_PX) return
    let next = x.get() - (PIXELS_PER_SECOND * delta) / 1000
    if (next <= -halfWidth) next += halfWidth
    x.set(next)
  })

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
        className='group relative overflow-hidden'
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
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
      <div className='relative h-32 w-full bg-neutral-800'>
        {event.cover_image_url ? (
          <Image
            src={event.cover_image_url}
            alt={event.title}
            fill
            sizes='260px'
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
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={cn('block shrink-0')}
    >
      {card}
    </Link>
  )
}
