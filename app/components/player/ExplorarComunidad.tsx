'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

/** True when the current browser can't (or won't) play WebM. iOS Safari is
 *  the main offender — it sometimes lies via `canPlayType` so we also UA-sniff. */
function shouldSkipWebm(): boolean {
  if (typeof window === 'undefined') return false
  const ua = navigator.userAgent || ''
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && 'ontouchend' in document)
  // iOS Safari + iPadOS Safari — never plays WebM reliably.
  if (isIOS) return true
  // Desktop Safari also can't play VP8/VP9 WebM in many versions.
  const isSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(ua)
  if (isSafari) return true
  // Last-resort: ask the browser. Empty string = definitely no.
  const probe = document.createElement('video')
  return probe.canPlayType('video/webm') === ''
}

export function ExplorarComunidad() {
  const videoRef = useRef<HTMLVideoElement>(null)
  // Default to the static image; flip to video only after we confirm the
  // current browser can play WebM. Avoids the black-frame flash on iOS.
  const [showVideo, setShowVideo] = useState(false)

  useEffect(() => {
    if (shouldSkipWebm()) {
      setShowVideo(false)
      return
    }
    setShowVideo(true)

    // Safety net: if the video doesn't actually start within 2s (e.g. some
    // Android browsers report support but stall), drop back to the image.
    const v = videoRef.current
    if (!v) return
    let cancelled = false
    const timer = window.setTimeout(() => {
      if (!cancelled && v.readyState < 3 /* HAVE_FUTURE_DATA */) {
        setShowVideo(false)
      }
    }, 2000)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [])

  return (
    <Link
      href='/comunidad'
      className='flex flex-col items-center transition-transform hover:scale-105'
    >
      <div
        className='relative w-52 overflow-hidden lg:w-[340px]'
        style={{ aspectRatio: '1206 / 759' }}
      >
        <Image
          src='/assets/body2/textura-back-video.png'
          alt=''
          fill
          className='z-0 object-cover'
          style={{ width: '100%', height: '100%' }}
        />

        {showVideo ? (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            poster='/assets/binoculares.png'
            onError={() => setShowVideo(false)}
            className='absolute inset-[8%] -top-3 z-[3] object-cover'
            style={{ width: '100%', height: '100%' }}
            aria-label='Video de la comunidad Ruidozo'
          >
            <source
              src='/assets/body2/binoculares.webm'
              type='video/webm'
            />
          </video>
        ) : (
          <Image
            src='/assets/binoculares.png'
            alt='Explorar comunidad'
            fill
            className='absolute inset-[8%] -top-3 z-[3] object-cover'
            style={{ width: '100%', height: '100%' }}
          />
        )}
      </div>

      <p className='font-impact-label mt-2 text-2xl tracking-wider text-green-300 uppercase'>Explorar Comunidad</p>
    </Link>
  )
}
