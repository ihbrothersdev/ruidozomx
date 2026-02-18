import Image from 'next/image'

interface CassetteReelsProps {
  isPlaying?: boolean
}

export function CassetteReels({ isPlaying }: CassetteReelsProps) {
  const spinClass = isPlaying ? 'animate-spin-slow' : ''
  return (
    <>
      {/* Left spool */}
      <div
        className='absolute z-[2]'
        style={{ left: '22%', top: '25%', width: '14%', height: '42%' }}
      >
        <Image
          src='/assets/cassette/carrete-izquierdo.png'
          alt=''
          fill
          className='object-contain'
          unoptimized
        />
      </div>
      {/* Left roller (centered on spool) */}
      <div
        className='absolute z-[3]'
        style={{ left: '22%', top: '25%', width: '14%', height: '42%' }}
      >
        <Image
          src='/assets/cassette/rodillo-izquierdo.png'
          alt=''
          fill
          className={`object-contain ${spinClass}`}
          unoptimized
        />
      </div>

      {/* Right spool */}
      <div
        className='absolute z-[2]'
        style={{ right: '20%', top: '25%', width: '14%', height: '42%' }}
      >
        <Image
          src='/assets/cassette/carrete-derecho.png'
          alt=''
          fill
          className='object-contain'
          unoptimized
        />
      </div>
      {/* Right roller (centered on spool) */}
      <div
        className='absolute z-[3]'
        style={{ right: '20%', top: '35%', width: '14%', height: '22%' }}
      >
        <Image
          src='/assets/cassette/rodillo-derecho.png'
          alt=''
          fill
          className={`object-contain ${spinClass}`}
          unoptimized
        />
      </div>
    </>
  )
}
