'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Manifesto } from './_components/Manifesto'

type Phase = 'waiting' | 'video' | 'transition' | 'manifesto'

export default function QuienesSomosPage() {
  const router = useRouter()
  const desktopRef = useRef<HTMLVideoElement>(null)
  const mobileRef = useRef<HTMLVideoElement>(null)
  const startedRef = useRef(false)
  const [phase, setPhase] = useState<Phase>('waiting')
  const [needsTap, setNeedsTap] = useState(false)
  const [muted, setMuted] = useState(true)

  // The global player bar is hidden here, so drop the body padding that
  // reserves space for it — otherwise it leaves a blank gap below the manifesto.
  useEffect(() => {
    const { body } = document
    const prev = body.style.paddingBottom
    body.style.paddingBottom = '0'
    return () => {
      body.style.paddingBottom = prev
    }
  }, [])

  const handleVideoError = useCallback(() => setPhase('manifesto'), [])

  const getActiveVideo = useCallback(() => {
    return desktopRef.current?.offsetParent !== null ? desktopRef.current : mobileRef.current
  }, [])

  const startVideo = useCallback(() => {
    if (startedRef.current) return
    startedRef.current = true

    const video = getActiveVideo()
    if (!video) return

    // Try with sound first (works if user got here via in-page navigation/click).
    video.muted = false
    video.volume = 0.5
    video
      .play()
      .then(() => {
        setNeedsTap(false)
        setMuted(false)
        setTimeout(() => setPhase('video'), 300)
      })
      .catch(() => {
        // Autoplay-with-sound blocked (typical on iOS Safari / Chrome Android on hard
        // navigation or refresh). Fall back to muted autoplay so the video still plays.
        video.muted = true
        video
          .play()
          .then(() => {
            setNeedsTap(false)
            setMuted(true)
            setTimeout(() => setPhase('video'), 300)
          })
          .catch(() => {
            // Even muted autoplay was blocked → show the tap-to-play overlay.
            startedRef.current = false
            setNeedsTap(true)
          })
      })
  }, [getActiveVideo])

  // Filter by active video to avoid the hidden desktop element triggering
  // playback before the mobile video is ready.
  const handleCanPlay = useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      const active = getActiveVideo()
      if (!active || e.currentTarget !== active) return
      if (!needsTap) startVideo()
    },
    [getActiveVideo, needsTap, startVideo]
  )

  // Call video.load() on mount so mobile browsers (which ignore preload="auto")
  // start buffering and fire onCanPlay.
  useEffect(() => {
    const video = getActiveVideo()
    if (!video || startedRef.current) return

    if (video.readyState >= 3) {
      startVideo()
    } else {
      video.load()
    }
  }, [getActiveVideo, startVideo])

  const handleTap = useCallback(() => {
    const video = getActiveVideo()
    if (!video) return

    startedRef.current = true
    video.muted = false
    video.volume = 0.5
    video
      .play()
      .then(() => {
        setNeedsTap(false)
        setMuted(false)
        setTimeout(() => setPhase('video'), 300)
      })
      .catch(() => {
        // Some browsers still refuse with sound on the first gesture — retry muted.
        video.muted = true
        video
          .play()
          .then(() => {
            setNeedsTap(false)
            setMuted(true)
            setTimeout(() => setPhase('video'), 300)
          })
          .catch(() => {
            startedRef.current = false
          })
      })
  }, [getActiveVideo])

  // Toggle sound on the active video. The key fix: on first entry the video
  // often falls back to muted autoplay, and there was no way to unmute it.
  const toggleMute = useCallback(() => {
    const video = getActiveVideo()
    if (!video) return
    const next = !video.muted
    video.muted = next
    if (!next && video.volume === 0) video.volume = 0.5
    setMuted(next)
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
            />
          </div>

          {/* Sound toggle — lets users unmute when the video fell back to muted autoplay */}
          {phase === 'video' && (
            <button
              onClick={toggleMute}
              aria-label={muted ? 'Activar sonido' : 'Silenciar'}
              className='font-pt-mono absolute bottom-6 left-4 z-20 flex cursor-pointer items-center gap-2 rounded-sm border px-4 py-1.5 text-xs tracking-widest uppercase transition-colors sm:left-6'
              style={{
                borderColor: muted ? 'rgba(220,38,38,0.6)' : 'rgba(255,255,255,0.2)',
                color: muted ? 'rgba(248,113,113,0.9)' : 'rgba(255,255,255,0.5)'
              }}
            >
              {muted ? (
                <svg
                  viewBox='0 0 24 24'
                  fill='currentColor'
                  className='h-4 w-4'
                >
                  <path d='M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.8 8.8 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z' />
                </svg>
              ) : (
                <svg
                  viewBox='0 0 24 24'
                  fill='currentColor'
                  className='h-4 w-4'
                >
                  <path d='M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z' />
                </svg>
              )}
              {muted ? 'Activar sonido' : 'Silenciar'}
            </button>
          )}

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
              />
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
              onCanPlay={handleCanPlay}
              onEnded={handleEnded}
              onError={handleVideoError}
            >
              <source
                src='/assets/quienes-somos/identity-desktop.mp4'
                type='video/mp4'
              />
            </video>
            <video
              ref={mobileRef}
              className='block h-screen w-screen object-contain md:hidden'
              playsInline
              preload='auto'
              onCanPlay={handleCanPlay}
              onEnded={handleEnded}
              onError={handleVideoError}
            >
              <source
                src='/assets/quienes-somos/identity-mobile.mp4'
                type='video/mp4'
              />
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
