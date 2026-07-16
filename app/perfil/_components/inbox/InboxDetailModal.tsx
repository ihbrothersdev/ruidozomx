'use client'

import { LabelTag } from '@/app/admin/_components/kit'
import { Dialog, DialogContent, DialogTitle } from '@/app/components/ui/dialog'
import { ROLE_LABELS, type Role } from '@/lib/types'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { PersonAvatar } from './PersonAvatar'

interface InboxDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  other: {
    slug: string | null
    display_name: string | null
    role: Role | null
    photo_url: string | null
  }
  /** The full message (proposal text / connection note). Null when there's none. */
  message: string | null
  /** Already-formatted date string. */
  date: string
  /** Status / mutual badge shown next to the name. */
  badge?: ReactNode
  /** Action buttons (Aceptar / Rechazar / Retirar / Conectar de vuelta). */
  children?: ReactNode
}

/**
 * Detail view for an inbox item (connection or proposal). Shows the full
 * message — scrollable when long — plus a link to the sender's profile and the
 * action buttons. Reading the message no longer fights with navigation: the
 * list row opens this; the profile link lives inside.
 */
export function InboxDetailModal({ open, onOpenChange, other, message, date, badge, children }: InboxDetailModalProps) {
  const name = other.display_name || 'Perfil'

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        className='admin-hard border-admin-ink bg-admin-surface text-admin-ink border-2 p-0 sm:max-w-md'
        showCloseButton
      >
        <DialogTitle className='sr-only'>{name}</DialogTitle>

        <div className='px-6 py-6 sm:px-8 sm:py-7'>
          <div className='flex items-start gap-3'>
            <PersonAvatar
              photoUrl={other.photo_url}
              name={name}
            />
            <div className='flex min-w-0 flex-1 flex-col gap-1'>
              <div className='flex flex-wrap items-center gap-2'>
                <span className='font-impact-label text-admin-ink text-xl font-bold tracking-wider uppercase'>
                  {name}
                </span>
                {other.role && <LabelTag>{ROLE_LABELS[other.role]}</LabelTag>}
                {badge}
              </div>
              <span className='font-pt-mono text-admin-ink-faint text-[11px]'>{date}</span>
            </div>
          </div>

          {message && (
            <div className='font-pt-mono border-admin-red text-admin-ink-soft mt-4 max-h-60 overflow-y-auto border-l-2 pl-3 text-sm leading-relaxed whitespace-pre-wrap'>
              {message}
            </div>
          )}

          {other.slug && (
            <Link
              href={`/perfil/${other.slug}`}
              className='font-pt-mono text-admin-red hover:text-admin-red/70 mt-4 inline-block text-sm font-bold tracking-wider uppercase underline underline-offset-2 transition-colors'
            >
              Ver perfil
            </Link>
          )}

          {children && <div className='mt-5'>{children}</div>}
        </div>
      </DialogContent>
    </Dialog>
  )
}
