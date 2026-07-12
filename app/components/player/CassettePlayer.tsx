'use client'

import { TrackedProfileLink } from '@/app/components/analytics/TrackedProfileLink'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Cassette } from './Cassette'
import { DialogBubble } from './DialogBubble'
import { DonationCluster } from './DonationCluster'
import { ProponRolaModal } from './ProponRolaModal'
import { TransportControls } from './TransportControls'

interface CassettePlayerProps {
  songTitle: string
  artist: string
  artistSlug?: string
  songId?: string | null
  cassetteId?: string | null
  date: string
  side: 'A' | 'B'
  isPlaying: boolean
  isStopped: boolean
  elapsedSeconds: number
  progress: number
  isAuthenticated: boolean
  onPlay: () => void
  onPause: () => void
  onStop: () => void
  onNext: () => void
  onPrev: () => void
  onSeek: (progress: number) => void
}

/** Carries the currently-playing song/cassette into the profile URL so the
 *  "Conectar" flow there can attribute the interest_click back to this song. */
function buildArtistQuery(songId?: string | null, cassetteId?: string | null) {
  const params = new URLSearchParams()
  if (songId) params.set('song', songId)
  if (cassetteId) params.set('cassette', cassetteId)
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export function CassettePlayer({
  songTitle,
  artist,
  artistSlug,
  songId,
  cassetteId,
  date,
  side,
  isPlaying,
  isStopped,
  elapsedSeconds,
  progress,
  isAuthenticated,
  onPlay,
  onPause,
  onStop,
  onNext,
  onPrev,
  onSeek
}: CassettePlayerProps) {
  const [showModal, setShowModal] = useState(false)

  // Same destination for the cassette artist label and the "Ir al artista" arrow.
  const artistHref = artistSlug ? `/perfil/${artistSlug}${buildArtistQuery(songId, cassetteId)}` : undefined

  function handleProponClick() {
    if (!isAuthenticated) {
      setShowModal(true)
    }
  }

  const proponButton = (
    <Image
      src='/assets/registro/modal/propon-rola.png'
      alt='Propón una rola'
      width={200}
      height={100}
      className='w-full'
      style={{ height: 'auto' }}
    />
  )

  return (
    <div
      className='relative mx-auto w-full'
      style={{ maxWidth: 793 }}
    >
      <div className='relative'>
        <Cassette
          songTitle={songTitle}
          artist={artist}
          date={date}
          side={side}
          isPlaying={isPlaying}
          artistHref={artistHref}
          artistSlug={artistSlug}
          songId={songId}
          cassetteId={cassetteId}
        />
        <DialogBubble isAuthenticated={isAuthenticated} />

        {/* "Ir al artista" arrow — replaces the old "Playing" señal, links to
         *  the current song's band profile when it has one. */}
        {artistHref && (
          <TrackedProfileLink
            href={artistHref}
            targetProfileSlug={artistSlug}
            songId={songId}
            cassetteId={cassetteId}
            source='player'
            title={`Ver perfil de ${artist}`}
            className='absolute top-8 right-2 z-20 w-[90px] drop-shadow-[2px_2px_3px_rgba(0,0,0,0.5)] transition-transform hover:scale-105 sm:top-15 sm:right-1 sm:w-[105px] md:w-[115px] lg:top-[20%] lg:right-0 lg:w-[130px] lg:-translate-y-1/2 lg:drop-shadow-none xl:right-[-16px] xl:w-[140px]'
          >
            <Image
              src='/assets/body1/ir-al-artista.png'
              alt={`Ir al artista: ${artist}`}
              width={251}
              height={102}
              className='w-full'
            />
          </TrackedProfileLink>
        )}

        {/* Desktop: Propón una Rola button */}
        {isAuthenticated ? (
          <Link
            href='/proponer-rola'
            className='absolute -right-30 bottom-0 z-10 hidden transition-transform hover:scale-105 xl:block'
            style={{ width: 200 }}
          >
            {proponButton}
          </Link>
        ) : (
          <button
            type='button'
            onClick={handleProponClick}
            className='absolute -right-30 -bottom-2 z-10 hidden cursor-pointer transition-transform hover:scale-105 xl:block'
            style={{ width: 200 }}
          >
            {proponButton}
          </button>
        )}

        {/* Desktop: donation cluster, floating below "Propón una rola" */}
        <div className='absolute -right-25 -bottom-60 hidden w-40 xl:block'>
          <DonationCluster />
        </div>
      </div>

      {/* Transport controls */}
      <div className='mt-6'>
        <TransportControls
          elapsedSeconds={elapsedSeconds}
          isPlaying={isPlaying}
          isStopped={isStopped}
          progress={progress}
          onPlay={onPlay}
          onPause={onPause}
          onStop={onStop}
          onNext={onNext}
          onPrev={onPrev}
          onSeek={onSeek}
        />
      </div>

      {/* Mobile/tablet: Propón una Rola button */}
      <div className='flex justify-center pt-8 pb-4 xl:hidden'>
        {isAuthenticated ? (
          <Link
            href='/proponer-rola'
            className='transition-transform hover:scale-105'
          >
            <div className='w-56'>{proponButton}</div>
          </Link>
        ) : (
          <button
            type='button'
            onClick={handleProponClick}
            className='w-56 cursor-pointer transition-transform hover:scale-105'
          >
            {proponButton}
          </button>
        )}
      </div>

      {/* Mobile/tablet: donation cluster */}
      <div className='flex justify-center pb-6 xl:hidden'>
        <div className='w-32'>
          <DonationCluster />
        </div>
      </div>

      {/* Modal for non-authenticated users */}
      <ProponRolaModal
        open={showModal}
        onOpenChange={setShowModal}
      />
    </div>
  )
}
