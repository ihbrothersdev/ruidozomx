'use client'

import { logEvent } from '@/app/analytics/actions'
import { getAnonSessionId } from '@/lib/analytics/session'
import Link from 'next/link'
import type { ReactNode } from 'react'

interface TrackedProfileLinkProps {
  href: string
  children: ReactNode
  className?: string
  /** Profile slug or id we are linking to (for analytics metadata) */
  targetProfileSlug?: string
  targetProfileId?: string
  /** Optional context that originated the click (e.g. song currently playing) */
  songId?: string | null
  cassetteId?: string | null
  /** Where in the app the click happened (e.g. 'song_list', 'header', 'perfil_modal') */
  source?: string
  onClick?: () => void
}

/**
 * Drop-in replacement for next/link that fires a `profile_click` analytics
 * event before navigation. Works for both authenticated and anonymous visitors.
 *
 * The event is fire-and-forget: navigation never waits for the network request.
 */
export function TrackedProfileLink({
  href,
  children,
  className,
  targetProfileSlug,
  targetProfileId,
  songId,
  cassetteId,
  source,
  onClick
}: TrackedProfileLinkProps) {
  function handleClick() {
    void logEvent({
      type: 'profile_click',
      songId: songId ?? null,
      cassetteId: cassetteId ?? null,
      sessionId: getAnonSessionId() || null,
      metadata: {
        target_profile_slug: targetProfileSlug,
        target_profile_id: targetProfileId,
        source
      }
    }).catch(() => {})
    onClick?.()
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={className}
    >
      {children}
    </Link>
  )
}
