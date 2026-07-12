'use client'

import { logDonationClick, type LogDonationInput } from '@/app/analytics/actions'
import { getAnonSessionId } from '@/lib/analytics/session'
import Link from 'next/link'
import type { ReactNode } from 'react'

interface TrackedDonationLinkProps {
  href: string
  /** Event payload (sessionId is filled in here from the anon session). */
  event: Omit<LogDonationInput, 'sessionId'>
  /** External (Stripe) links open in a new tab; internal links use the router. */
  external?: boolean
  className?: string
  children: ReactNode
}

/**
 * Link that fires a donation-flow analytics event before navigating. Works for
 * authenticated and anonymous visitors. The event is fire-and-forget:
 * navigation never waits on the network request.
 */
export function TrackedDonationLink({
  href,
  event,
  external = true,
  className,
  children
}: TrackedDonationLinkProps) {
  function handleClick() {
    void logDonationClick({ ...event, sessionId: getAnonSessionId() || null }).catch(() => {})
  }

  if (external) {
    return (
      <a
        href={href}
        target='_blank'
        rel='noopener noreferrer'
        onClick={handleClick}
        className={className}
      >
        {children}
      </a>
    )
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
