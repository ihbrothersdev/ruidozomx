'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'
import { Manifesto } from './_components/Manifesto'

type Phase = 'waiting' | 'video' | 'transition' | 'manifesto'

export default function QuienesSomosPage() {
  const router = useRouter()
  const desktopRef = useRef<HTMLVideoElement>(null)
  const mobileRef = useRef<HTMLVideoElement>(null)
  const startedRef = useRef(false)
  const [phase, setPhase] = useState<Phase>('waiting')
  const [needsTap, setNeedsTap] = useState(false)

  const getActiveVideo = useCallback(() => {
    return desktopRef.current?.offsetParent !== null ? desktopRef.current : mobileRef.current
  }, [])

  const startVideo = useCallback(() => {
    if (startedRef.current) return
    startedRef.current = true

    const video = getActiveVideo()
    if (!video) return

    video.muted = false
    video.volume = 0.5
    video
      .play()
      .then(() => {
        setNeedsTap(false)
        setTimeout(() => setPhase('video'), 300)
      })
      .catch(() => {
        startedRef.current = false
        setNeedsTap(true)
      })
  }, [getActiveVideo])

  const handleCanPlay = useCallback(() => {
    if (!needsTap) startVideo()
  }, [needsTap, startVideo])

  const handleTap = useCallback(() => {
    const video = getActiveVideo()
    if (!video) return

    startedRef.current = true
    video.muted = false
    video.volume = 0.5
    video.play().then(() => {
      setNeedsTap(false)
      setTimeout(() => setPhase('video'), 300)
    })
  }, [getActiveVideo])

  // Video ends → transition → manifesto
  const handleEnded = useCallback(() => {
    setPhase('transition')
    setTimeout(() => setPhase('manifesto'), 1500)
  }, [])

  return (
    <main className='relative min-h-screen overflow-hidden bg-black'>
      {/* ── VIDEO PHASE ── */}
      {phase !== 'manifesto' && (
        <div
          className={`fixed inset-0 z-10 flex items-center justify-center bg-black transition-opacity duration-1500 ${
            phase === 'transition' ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {/* Corner logo */}
          <div className='absolute top-4 left-4 z-20 sm:top-6 sm:left-6'>
            <Image
              src='/assets/header/logo.png'
              alt='Ruidozo MX'
              width={380}
              height={183}
              className='h-8 w-auto opacity-40 invert sm:h-10'
              unoptimized
            />
          </div>

          {/* Skip button */}
          {phase === 'video' && (
            <button
              onClick={() => {
                const video = getActiveVideo()
                if (video) {
                  video.pause()
                  video.currentTime = 0
                }
                setPhase('transition')
                setTimeout(() => setPhase('manifesto'), 1000)
              }}
              className='font-pt-mono absolute right-4 bottom-6 z-20 cursor-pointer rounded-sm border border-white/20 px-4 py-1.5 text-xs tracking-widest text-white/50 uppercase transition-colors hover:border-white/40 hover:text-white/80 sm:right-6'
            >
              Saltar
            </button>
          )}

          {/* Tap-to-play overlay for mobile */}
          {needsTap && (
            <button
              onClick={handleTap}
              className='absolute inset-0 z-30 flex cursor-pointer flex-col items-center justify-center gap-6'
              style={{
                backgroundImage: "url('/assets/textura/background-textura.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className='pointer-events-none absolute inset-0 bg-black/70' />
              <Image
                src='/assets/header/logo.png'
                alt='Ruidozo MX'
                width={380}
                height={183}
                className='relative z-10 h-12 w-auto invert'
                unoptimized
              />
              <div className='relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-2 border-red-600 bg-red-600/20 transition-transform hover:scale-110'>
                <svg viewBox='0 0 24 24' fill='#dc2626' className='h-7 w-7 translate-x-0.5'>
                  <path d='M8 5v14l11-7z' />
                </svg>
              </div>
              <span className='font-pt-mono relative z-10 text-xs tracking-[0.25em] text-white/50 uppercase'>
                Toca para ver
              </span>
            </button>
          )}

          {/* Videos */}
          <div
            className={`relative flex w-full items-center justify-center transition-opacity duration-1000 ${
              phase === 'waiting' ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <video
              ref={desktopRef}
              className='hidden h-screen w-screen object-contain md:block'
              playsInline
              preload='auto'
              onCanPlayThrough={handleCanPlay}
              onEnded={handleEnded}
            >
              <source src='/assets/quienes-somos/identity-desktop.mp4' type='video/mp4' />
            </video>
            <video
              ref={mobileRef}
              className='block h-screen w-screen object-contain md:hidden'
              playsInline
              preload='auto'
              onCanPlayThrough={handleCanPlay}
              onEnded={handleEnded}
            >
              <source src='/assets/quienes-somos/identity-mobile.mp4' type='video/mp4' />
            </video>
          </div>

          {/* Vignette */}
          <div
            className='pointer-events-none absolute inset-0 z-10'
            style={{
              background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)'
            }}
          />
        </div>
      )}

      {/* ── MANIFESTO PHASE ── */}
      {phase === 'manifesto' && <Manifesto onExit={() => router.push('/')} />}
    </main>
  )
}
