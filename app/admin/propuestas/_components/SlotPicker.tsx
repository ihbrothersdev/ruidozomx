'use client'

import { acceptProposal } from '@/app/admin/actions'
import { AdminButton, LabelTag } from '@/app/admin/_components/kit'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/app/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/components/ui/tooltip'
import { Sparkles } from 'lucide-react'
import { useState } from 'react'

export interface OccupiedSlot {
  side: 'A' | 'B'
  position: number
  title: string
  artist: string
}

interface SlotPickerProps {
  proposalId: string
  proposalTitle: string
  proposalArtist: string
  cassetteName: string
  occupied: OccupiedSlot[]
  listing: string
  onClose: () => void
}

const POSITIONS = Array.from({ length: 13 }, (_, i) => i + 1)
const SIDES: Array<'A' | 'B'> = ['A', 'B']

export function SlotPicker({
  proposalId,
  proposalTitle,
  proposalArtist,
  cassetteName,
  occupied,
  listing,
  onClose
}: SlotPickerProps) {
  const [selected, setSelected] = useState<{ side: 'A' | 'B'; position: number } | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const isOccupied = (side: 'A' | 'B', position: number) =>
    occupied.find(o => o.side === side && o.position === position)

  const findFirstFree = (): { side: 'A' | 'B'; position: number } | null => {
    const aCount = occupied.filter(o => o.side === 'A').length
    const bCount = occupied.filter(o => o.side === 'B').length
    const preferredSide: 'A' | 'B' = aCount <= bCount ? 'A' : 'B'
    for (const side of [preferredSide, preferredSide === 'A' ? 'B' : 'A'] as ('A' | 'B')[]) {
      for (const pos of POSITIONS) {
        if (!isOccupied(side, pos)) return { side, position: pos }
      }
    }
    return null
  }

  return (
    <Dialog
      open
      onOpenChange={open => !open && onClose()}
    >
      <DialogContent className='gap-0 overflow-hidden border-2 border-admin-ink bg-admin-surface p-0 text-admin-ink admin-hard sm:max-w-2xl'>
        <DialogHeader className='space-y-1.5 px-6 py-5 text-left'>
          <LabelTag tone='red'>Asignar slot · {cassetteName}</LabelTag>
          <DialogTitle className='font-baby-doll truncate text-2xl tracking-wider text-admin-ink uppercase'>
            {proposalArtist}
          </DialogTitle>
          <DialogDescription className='font-pt-mono truncate text-xs text-admin-ink-soft'>
            {proposalTitle}
          </DialogDescription>
        </DialogHeader>

        <div className='admin-sprocket' />

        <div className='bg-admin-surface-2 px-6 py-3'>
          <AdminButton
            type='button'
            variant='outline'
            size='sm'
            onClick={() => {
              const free = findFirstFree()
              if (free) setSelected(free)
            }}
          >
            <Sparkles className='h-3 w-3' />
            Auto-asignar siguiente libre
          </AdminButton>
        </div>

        <div className='admin-sprocket' />

        <div className='space-y-6 px-6 py-5'>
          {SIDES.map(side => (
            <div key={side}>
              <div className='mb-2 flex items-center gap-2'>
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-admin-ink text-xs font-bold ${
                    side === 'A' ? 'bg-admin-red/12 text-admin-red' : 'bg-admin-blue/12 text-admin-blue'
                  }`}
                >
                  {side}
                </div>
                <p className='font-pt-mono text-[11px] font-bold tracking-widest text-admin-ink-soft uppercase'>
                  Lado {side}
                </p>
                <LabelTag>{occupied.filter(o => o.side === side).length}/13</LabelTag>
              </div>
              <div className='grid grid-cols-7 gap-1.5 sm:grid-cols-13'>
                <TooltipProvider>
                  {POSITIONS.map(pos => {
                    const occ = isOccupied(side, pos)
                    const isSelected = selected?.side === side && selected.position === pos
                    const cls = `font-pt-mono flex h-12 flex-col items-center justify-center rounded-sm border-2 text-[11px] font-bold transition-all ${
                      occ
                        ? 'cursor-not-allowed border-admin-ink/15 bg-admin-ink/8 text-admin-ink-faint'
                        : isSelected
                          ? side === 'A'
                            ? 'border-admin-ink bg-admin-red text-admin-surface admin-hard-sm'
                            : 'border-admin-ink bg-admin-blue text-admin-surface admin-hard-sm'
                          : 'cursor-pointer border-admin-ink bg-admin-surface text-admin-ink hover:bg-admin-paper-deep'
                    }`
                    const btn = (
                      <button
                        key={pos}
                        type='button'
                        onClick={() => !occ && setSelected({ side, position: pos })}
                        disabled={!!occ}
                        className={cls}
                      >
                        <span className='text-[10px] opacity-60'>#{pos}</span>
                      </button>
                    )
                    if (!occ) return btn
                    return (
                      <Tooltip key={pos}>
                        <TooltipTrigger asChild>{btn}</TooltipTrigger>
                        <TooltipContent className='border-2 border-admin-ink bg-admin-surface text-admin-ink'>
                          <span className='font-pt-mono text-[11px]'>
                            <strong>{occ.artist}</strong> — {occ.title}
                          </span>
                        </TooltipContent>
                      </Tooltip>
                    )
                  })}
                </TooltipProvider>
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <>
            <div className='admin-sprocket' />
            <div className='bg-admin-olive/12 px-6 py-3'>
              <p className='font-pt-mono text-[11px] text-admin-ink-soft'>
                Insertar en{' '}
                <span className='font-bold text-admin-ink'>
                  Lado {selected.side} · Posición #{selected.position}
                </span>
              </p>
            </div>
          </>
        )}

        <div className='admin-sprocket' />

        <form
          action={acceptProposal}
          onSubmit={() => setSubmitting(true)}
          className='bg-admin-surface-2 px-6 py-4'
        >
          <input
            type='hidden'
            name='proposal_id'
            value={proposalId}
          />
          <input
            type='hidden'
            name='side'
            value={selected?.side ?? ''}
          />
          <input
            type='hidden'
            name='position'
            value={selected?.position ?? ''}
          />
          <input
            type='hidden'
            name='listing'
            value={listing}
          />
          <DialogFooter className='gap-2'>
            <AdminButton
              type='button'
              variant='ghost'
              onClick={onClose}
            >
              Cancelar
            </AdminButton>
            <AdminButton
              type='submit'
              disabled={!selected || submitting}
              className='bg-admin-olive text-admin-surface'
            >
              {submitting ? 'Guardando…' : 'Aceptar y asignar'}
            </AdminButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
