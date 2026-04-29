'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

export default function QuienesSomosPage() {
  const router = useRouter()
  const desktopRef = useRef<HTMLVideoElement>(null)
  const mobileRef = useRef<HTMLVideoElement>(null)
  const startedRef = useRef(false)
  const [phase, setPhase] = useState<'intro' | 'playing' | 'outro'>('intro')

  const getActiveVideo = useCallback(() => {
    return desktopRef.current?.offsetParent !== null ? desktopRef.current : mobileRef.current
  }, [])

  const startPlayback = useCallback((video: HTMLVideoElement) => {
    if (startedRef.current) return
    startedRef.current = true

    video.muted = false
    video.volume = 0.5
    video.play().catch(() => {
      video.muted = true
      video.play().catch(() => {})
    })

    setTimeout(() => setPhase('playing'), 300)
  }, [])

  const handleCanPlay = useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      const active = getActiveVideo()
      if (!active || e.currentTarget !== active) return
      startPlayback(active)
    },
    [getActiveVideo, startPlayback]
  )

  useEffect(() => {
    const video = getActiveVideo()
    if (!video || startedRef.current) return

    if (video.readyState >= 3) {
      startPlayback(video)
    } else {
      video.load()
    }
  }, [getActiveVideo, startPlayback])

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
          className='font-pt-mono absolute right-4 bottom-6 z-20 rounded-sm border border-white/20 px-4 py-1.5 text-xs tracking-widest text-white/50 uppercase transition-colors hover:border-white/40 hover:text-white/80 sm:right-6'
        >
          Saltar
        </button>
      )}

      {/* Video container */}
      <div
        className={`relative z-10 flex w-full items-center justify-center transition-opacity duration-1000 ${
          phase === 'intro' ? 'opacity-0' : phase === 'outro' ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {/* Desktop video */}
        <video
          ref={desktopRef}
          className='hidden h-screen w-screen object-contain md:block'
          playsInline
          preload='auto'
          onCanPlay={handleCanPlay}
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
          onCanPlay={handleCanPlay}
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
