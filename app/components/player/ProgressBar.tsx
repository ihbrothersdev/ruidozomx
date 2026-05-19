'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'

interface ProgressBarProps {
  progress: number
  onSeek: (progress: number) => void
}

// Matches the rendered ball: h-5 (20px) preserving the 26×28 source aspect → ~19px wide.
// Set on the wrapper so the absolutely-positioned element doesn't get shrink-to-fit
// down to ~0px when `left` approaches 100% (which was squishing the ball at the end).
const BALL_W = 19
const BALL_H = 20

export function ProgressBar({ progress, onSeek }: ProgressBarProps) {
  const barRef = useRef<HTMLDivElement>(null)
  // While the user is scrubbing, we track the desired position locally and
  // commit it to the actual audio only on pointerup. Writing `currentTime`
  // on every pointermove (60+/sec) restarts the decoder continuously and
  // produces audible distortion.
  const [scrubProgress, setScrubProgress] = useState<number | null>(null)
  const isDraggingRef = useRef(false)

  // Once the parent's progress catches up to the scrub target (i.e. the seek
  // we committed has been reflected via timeupdate), clear the local override
  // so the bar tracks live progress again. Without this we'd flicker back to
  // the pre-seek position for ~1 frame.
  useEffect(() => {
    if (scrubProgress === null || isDraggingRef.current) return
    if (Math.abs(progress - scrubProgress) < 0.01) {
      setScrubProgress(null)
    }
  }, [progress, scrubProgress])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const bar = barRef.current
      if (!bar) return
      e.preventDefault()
      try {
        bar.setPointerCapture(e.pointerId)
      } catch {
        // ignore — capture is best-effort
      }

      const pctFromClientX = (clientX: number) => {
        const rect = bar.getBoundingClientRect()
        return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      }

      isDraggingRef.current = true
      setScrubProgress(pctFromClientX(e.clientX))

      const onMove = (ev: PointerEvent) => {
        setScrubProgress(pctFromClientX(ev.clientX))
      }
      const cleanup = (ev: PointerEvent) => {
        try {
          bar.releasePointerCapture(ev.pointerId)
        } catch {
          // ignore
        }
        bar.removeEventListener('pointermove', onMove)
        bar.removeEventListener('pointerup', onUp)
        bar.removeEventListener('pointercancel', onCancel)
        isDraggingRef.current = false
      }
      const onUp = (ev: PointerEvent) => {
        const final = pctFromClientX(ev.clientX)
        cleanup(ev)
        // Commit the seek in a single write. The effect above clears
        // `scrubProgress` once the parent's `progress` prop reflects this.
        setScrubProgress(final)
        onSeek(final)
      }
      const onCancel = (ev: PointerEvent) => {
        cleanup(ev)
        // Abandon the scrub — keep the audio where it was.
        setScrubProgress(null)
      }
      bar.addEventListener('pointermove', onMove)
      bar.addEventListener('pointerup', onUp)
      bar.addEventListener('pointercancel', onCancel)
    },
    [onSeek]
  )

  const displayProgress = scrubProgress ?? progress

  return (
    <div
      ref={barRef}
      className='relative flex h-3 w-[81%] cursor-grab touch-none items-center select-none active:cursor-grabbing'
      onPointerDown={handlePointerDown}
    >
      {/* Orange elapsed bar */}
      <div
        className='pointer-events-none h-3 overflow-hidden'
        style={{ width: `${displayProgress * 100}%` }}
      >
        <Image
          src='/assets/controles/barra-naranja.png'
          alt=''
          width={230}
          height={9}
          className='h-full w-full object-cover object-left'
          draggable={false}
        />
      </div>

      {/* Scrubber ball */}
      <div
        className='pointer-events-none absolute z-10 -translate-x-1/2'
        style={{ left: `${displayProgress * 100}%`, width: BALL_W, height: BALL_H }}
      >
        <Image
          src='/assets/controles/bolita.png'
          alt='Scrubber'
          width={26}
          height={28}
          className='h-full w-full'
          draggable={false}
        />
      </div>

      {/* Black remaining bar */}
      <div className='pointer-events-none h-3 flex-1 overflow-hidden'>
        <Image
          src='/assets/controles/barra-negra.png'
          alt=''
          width={424}
          height={9}
          className='h-full w-full object-cover object-right'
          draggable={false}
        />
      </div>
    </div>
  )
}
