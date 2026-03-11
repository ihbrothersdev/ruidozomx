'use client'

import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

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
          src={`/assets/contador/${digitValue}.png`}
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
  const [previous, setPrevious] = useState(value)
  const prevRef = useRef(value)

  useEffect(() => {
    setPrevious(prevRef.current)
    prevRef.current = value
  }, [value])

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

      {/* Animated top flap: shows PREVIOUS digit, folds down to reveal current */}
      <AnimatePresence
        initial={false}
        mode='popLayout'
      >
        <motion.div
          key={value}
          className='absolute top-0 left-0 z-10 overflow-hidden'
          style={{
            width: CARD_W,
            height: HALF_H,
            transformOrigin: 'bottom center',
            backfaceVisibility: 'hidden'
          }}
          initial={{ rotateX: 0 }}
          animate={{ rotateX: -90 }}
          exit={{ rotateX: -90, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeIn' }}
        >
          <HalfCard
            bgSrc={topSrc}
            digitValue={previous}
            position='top'
          />
        </motion.div>
      </AnimatePresence>

      {/* Animated bottom flap: shows CURRENT digit, unfolds from top */}
      <AnimatePresence
        initial={false}
        mode='popLayout'
      >
        <motion.div
          key={value}
          className='absolute bottom-0 left-0 z-10 overflow-hidden'
          style={{
            width: CARD_W,
            height: HALF_H,
            transformOrigin: 'top center',
            backfaceVisibility: 'hidden'
          }}
          initial={{ rotateX: 90 }}
          animate={{ rotateX: 0 }}
          exit={{ rotateX: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut', delay: 0.15 }}
        >
          <HalfCard
            bgSrc={bottomSrc}
            digitValue={value}
            position='bottom'
          />
        </motion.div>
      </AnimatePresence>

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
        src='/assets/contador/_.png'
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
