'use client'

import { acceptProposal } from '@/app/admin/actions'
import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/app/components/ui/dialog'
import { Separator } from '@/app/components/ui/separator'
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
      <DialogContent className='gap-0 overflow-hidden border-white/10 bg-neutral-900 p-0 text-white sm:max-w-2xl'>
        <DialogHeader className='space-y-1 px-6 py-5 text-left'>
          <p className='font-pt-mono text-[10px] font-bold tracking-[0.25em] text-red-400 uppercase'>
            Asignar slot · {cassetteName}
          </p>
          <DialogTitle className='font-baby-doll truncate text-2xl tracking-wider text-white uppercase'>
            {proposalArtist}
          </DialogTitle>
          <DialogDescription className='font-pt-mono truncate text-xs text-white/40'>{proposalTitle}</DialogDescription>
        </DialogHeader>

        <Separator className='bg-white/5' />

        <div className='bg-white/2 px-6 py-3'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => {
              const free = findFirstFree()
              if (free) setSelected(free)
            }}
            className='font-pt-mono border-white/10 bg-white/5 text-[11px] tracking-wider text-white/70 uppercase hover:bg-white/10 hover:text-white'
          >
            <Sparkles className='h-3 w-3' />
            Auto-asignar siguiente libre
          </Button>
        </div>

        <Separator className='bg-white/5' />

        <div className='space-y-6 px-6 py-5'>
          {SIDES.map(side => (
            <div key={side}>
              <div className='mb-2 flex items-center gap-2'>
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                    side === 'A' ? 'bg-red-600/20 text-red-300' : 'bg-blue-500/20 text-blue-300'
                  }`}
                >
                  {side}
                </div>
                <p className='font-pt-mono text-[11px] font-bold tracking-widest text-white/50 uppercase'>
                  Lado {side}
                </p>
                <Badge
                  variant='secondary'
                  className='font-pt-mono bg-white/5 text-[10px] text-white/40'
                >
                  {occupied.filter(o => o.side === side).length}/13
                </Badge>
              </div>
              <div className='grid grid-cols-7 gap-1.5 sm:grid-cols-13'>
                <TooltipProvider>
                  {POSITIONS.map(pos => {
                    const occ = isOccupied(side, pos)
                    const isSelected = selected?.side === side && selected.position === pos
                    const cls = `font-pt-mono flex h-12 flex-col items-center justify-center rounded-lg border text-[11px] font-bold transition-all ${
                      occ
                        ? 'cursor-not-allowed border-white/5 bg-white/5 text-white/30'
                        : isSelected
                          ? side === 'A'
                            ? 'border-red-500 bg-red-500/30 text-white shadow-[0_0_0_2px_rgba(239,68,68,0.3)]'
                            : 'border-blue-500 bg-blue-500/30 text-white shadow-[0_0_0_2px_rgba(59,130,246,0.3)]'
                          : 'cursor-pointer border-white/10 bg-white/3 text-white/50 hover:border-white/30 hover:bg-white/10 hover:text-white'
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
                        <TooltipContent>
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
            <Separator className='bg-white/5' />
            <div className='bg-green-500/5 px-6 py-3'>
              <p className='font-pt-mono text-[11px] text-white/60'>
                Insertar en{' '}
                <span className='font-bold text-white'>
                  Lado {selected.side} · Posición #{selected.position}
                </span>
              </p>
            </div>
          </>
        )}

        <Separator className='bg-white/5' />

        <form
          action={acceptProposal}
          onSubmit={() => setSubmitting(true)}
          className='bg-white/2 px-6 py-4'
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
          <DialogFooter className='gap-2'>
            <Button
              type='button'
              variant='ghost'
              onClick={onClose}
              className='font-pt-mono text-xs tracking-wider text-white/60 uppercase hover:bg-white/5 hover:text-white'
            >
              Cancelar
            </Button>
            <Button
              type='submit'
              disabled={!selected || submitting}
              className='font-pt-mono bg-green-600 text-xs tracking-wider text-white uppercase hover:bg-green-500'
            >
              {submitting ? 'Guardando…' : 'Aceptar y asignar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
