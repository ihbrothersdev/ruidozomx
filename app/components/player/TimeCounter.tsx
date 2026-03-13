'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'

const CARD_W = 24
const CARD_H = 58
const HALF_H = 29

function HalfCard({ bgSrc, digitValue, position }: { bgSrc: string; digitValue: string; position: 'top' | 'bottom' }) {
  const isTop = position === 'top'
  return (
    <>
      <Image
        src={bgSrc}
        alt=''
        width={CARD_W}
        height={HALF_H}
        unoptimized
      />
      <div
        className='absolute inset-x-0 flex justify-center'
        style={isTop ? { top: 0, height: CARD_H } : { bottom: 0, height: CARD_H }}
      >
        <Image
          src={`/assets/controles/${digitValue}.png`}
          alt={digitValue}
          width={15}
          height={37}
          className='m-auto'
          style={{ objectFit: 'contain' }}
          unoptimized
        />
      </div>
    </>
  )
}

function FlipDigit({ topSrc, bottomSrc, value }: { topSrc: string; bottomSrc: string; value: string }) {
  const prevRef = useRef(value)

  // Read previous value DURING render (before effect updates it)
  // This ensures 'previous' is correct on the first render after value changes
  const previous = prevRef.current

  // Update ref AFTER render completes
  useEffect(() => {
    prevRef.current = value
  })

  return (
    <div
      className='relative'
      style={{ width: CARD_W, height: CARD_H, perspective: 300 }}
    >
      {/* Static top half: always shows CURRENT digit */}
      <div
        className='absolute top-0 left-0 z-0 overflow-hidden'
        style={{ width: CARD_W, height: HALF_H }}
      >
        <HalfCard
          bgSrc={topSrc}
          digitValue={value}
          position='top'
        />
      </div>

      {/* Static bottom half: always shows CURRENT digit */}
      <div
        className='absolute bottom-0 left-0 z-0 overflow-hidden'
        style={{ width: CARD_W, height: HALF_H }}
      >
        <HalfCard
          bgSrc={bottomSrc}
          digitValue={value}
          position='bottom'
        />
      </div>

      {/* Top flap: shows PREVIOUS digit, folds down.
          key change → React unmounts old, mounts new → CSS animation restarts */}
      <div
        key={`top-${value}`}
        className='animate-flip-fold absolute top-0 left-0 z-10 overflow-hidden'
        style={{
          width: CARD_W,
          height: HALF_H,
          transformOrigin: 'bottom center',
          backfaceVisibility: 'hidden'
        }}
      >
        <HalfCard
          bgSrc={topSrc}
          digitValue={previous}
          position='top'
        />
      </div>

      {/* Bottom flap: shows CURRENT digit, unfolds from top */}
      <div
        key={`bot-${value}`}
        className='animate-flip-unfold absolute bottom-0 left-0 z-10 overflow-hidden'
        style={{
          width: CARD_W,
          height: HALF_H,
          transformOrigin: 'top center',
          backfaceVisibility: 'hidden'
        }}
      >
        <HalfCard
          bgSrc={bottomSrc}
          digitValue={value}
          position='bottom'
        />
      </div>

      {/* Center divider line */}
      <div
        className='pointer-events-none absolute left-0 z-20 h-px w-full bg-black/20'
        style={{ top: HALF_H }}
      />
    </div>
  )
}

export function TimeCounter({ seconds }: { seconds: number }) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const minStr = String(mins).padStart(2, '0')
  const secStr = String(secs).padStart(2, '0')

  return (
    <div className='flex items-center'>
      <FlipDigit
        topSrc='/assets/controles/min-left-top.png'
        bottomSrc='/assets/controles/min-left-bottom.png'
        value={minStr[0]}
      />
      <FlipDigit
        topSrc='/assets/controles/min-right-top.png'
        bottomSrc='/assets/controles/min-right-bottom.png'
        value={minStr[1]}
      />
      <Image
        src='/assets/controles/colon.png'
        alt=':'
        width={5}
        height={17}
        className='mx-px self-center'
        unoptimized
      />
      <FlipDigit
        topSrc='/assets/controles/sec-left-top.png'
        bottomSrc='/assets/controles/sec-left-bottom.png'
        value={secStr[0]}
      />
      <FlipDigit
        topSrc='/assets/controles/sec-right-top.png'
        bottomSrc='/assets/controles/sec-right-bottom.png'
        value={secStr[1]}
      />
    </div>
  )
}
