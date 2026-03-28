'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'

export default function QuienesSomosPage() {
  const router = useRouter()
  const desktopRef = useRef<HTMLVideoElement>(null)
  const mobileRef = useRef<HTMLVideoElement>(null)
  const startedRef = useRef(false)
  const [phase, setPhase] = useState<'waiting' | 'playing' | 'outro'>('waiting')
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
        setTimeout(() => setPhase('playing'), 300)
      })
      .catch(() => {
        // Unmuted play failed — this is mobile. Show tap-to-play.
        startedRef.current = false
        setNeedsTap(true)
      })
  }, [getActiveVideo])

  // Desktop: auto-start when video is buffered
  const handleCanPlay = useCallback(() => {
    if (!needsTap) startVideo()
  }, [needsTap, startVideo])

  // Mobile: user taps the screen to start
  const handleTap = useCallback(() => {
    const video = getActiveVideo()
    if (!video) return

    startedRef.current = true
    video.muted = false
    video.volume = 0.5
    video.play().then(() => {
      setNeedsTap(false)
      setTimeout(() => setPhase('playing'), 300)
    })
  }, [getActiveVideo])

  const handleEnded = useCallback(() => {
    setPhase('outro')
    setTimeout(() => router.push('/'), 1500)
  }, [router])

  return (
    <main className='relative flex min-h-screen items-center justify-center overflow-hidden bg-black'>
      {/* Subtle paper texture */}
      <div
        className='pointer-events-none absolute inset-0 z-0 opacity-5'
        style={{ backgroundImage: "url('/assets/textura/background-textura.jpg')", backgroundSize: 'cover' }}
      />

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
      {phase === 'playing' && (
        <button
          onClick={() => router.push('/')}
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
          {/* Dark overlay on texture */}
          <div className='pointer-events-none absolute inset-0 bg-black/70' />

          {/* Logo */}
          <Image
            src='/assets/header/logo.png'
            alt='Ruidozo MX'
            width={380}
            height={183}
            className='relative z-10 h-12 w-auto invert'
            unoptimized
          />

          {/* Play button — matches cassette control style */}
          <div className='relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-2 border-red-600 bg-red-600/20 transition-transform hover:scale-110'>
            <svg
              viewBox='0 0 24 24'
              fill='#dc2626'
              className='h-7 w-7 translate-x-0.5'
            >
              <path d='M8 5v14l11-7z' />
            </svg>
          </div>

          <span className='font-pt-mono relative z-10 text-xs tracking-[0.25em] text-white/50 uppercase'>
            Toca para ver
          </span>
        </button>
      )}

      {/* Video container */}
      <div
        className={`relative z-10 flex w-full items-center justify-center transition-opacity duration-1000 ${
          phase === 'waiting' ? 'opacity-0' : phase === 'outro' ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {/* Desktop video */}
        <video
          ref={desktopRef}
          className='hidden h-screen w-screen object-contain md:block'
          playsInline
          preload='auto'
          onCanPlayThrough={handleCanPlay}
          onEnded={handleEnded}
        >
          <source
            src='/assets/quienes-somos/identity-desktop.mp4'
            type='video/mp4'
          />
        </video>

        {/* Mobile video */}
        <video
          ref={mobileRef}
          className='block h-screen w-screen object-contain md:hidden'
          playsInline
          preload='auto'
          onCanPlayThrough={handleCanPlay}
          onEnded={handleEnded}
        >
          <source
            src='/assets/quienes-somos/identity-mobile.mp4'
            type='video/mp4'
          />
        </video>
      </div>

      {/* Vignette overlay */}
      <div
        className='pointer-events-none absolute inset-0 z-10'
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)'
        }}
      />
    </main>
  )
}
