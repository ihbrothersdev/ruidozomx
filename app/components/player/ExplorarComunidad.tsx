'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

export function ExplorarComunidad() {
  // Some browsers (most notably iOS Safari) can't play WebM and just render
  // a black rectangle for the <video>. We detect that up-front via
  // `canPlayType` and also listen to `onError` as a safety net — in either
  // case we swap to the static image fallback.
  const videoRef = useRef<HTMLVideoElement>(null)
  const [showVideo, setShowVideo] = useState(true)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    // Empty string from canPlayType means "definitely no" — swap immediately.
    const canPlay = v.canPlayType('video/webm')
    if (!canPlay) {
      setShowVideo(false)
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
          unoptimized
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
            unoptimized
          />
        )}
      </div>

      <p className='font-impact-label mt-2 text-2xl tracking-wider text-green-300 uppercase'>Explorar Comunidad</p>
    </Link>
  )
}
