import Image from 'next/image'

interface TimeCounterProps {
  seconds: number
}

function Digit({
  topSrc,
  bottomSrc,
  value,
  flip = false
}: {
  topSrc: string
  bottomSrc: string
  value: string
  flip?: boolean
}) {
  const digitSrc = `/assets/controles/digit-${value}.png`

  return (
    <div className='flex flex-col' style={{ width: 24, height: 58, perspective: flip ? 80 : undefined }}>
      {/* Top half — clips bottom of the digit */}
      <div
        key={flip ? value : undefined}
        className={`relative overflow-hidden ${flip ? 'animate-flip-down' : ''}`}
        style={{ width: 24, height: 29, transformOrigin: 'bottom center' }}
      >
        <Image src={topSrc} alt='' width={24} height={29} unoptimized />
        <div
          className='absolute inset-x-0 flex justify-center'
          style={{ top: 0, height: 58 }}
        >
          <Image
            src={digitSrc}
            alt={value}
            width={14}
            height={33}
            className='mt-auto mb-auto'
            unoptimized
          />
        </div>
      </div>
      {/* Bottom half — clips top of the digit */}
      <div className='relative overflow-hidden' style={{ width: 24, height: 29 }}>
        <Image src={bottomSrc} alt='' width={24} height={29} unoptimized />
        <div
          className='absolute inset-x-0 flex justify-center'
          style={{ bottom: 0, height: 58 }}
        >
          <Image
            src={digitSrc}
            alt={value}
            width={14}
            height={33}
            className='mt-auto mb-auto'
            unoptimized
          />
        </div>
      </div>
    </div>
  )
}

export function TimeCounter({ seconds }: TimeCounterProps) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const minStr = String(mins).padStart(2, '0')
  const secStr = String(secs).padStart(2, '0')

  return (
    <div className='flex items-center'>
      <Digit
        topSrc='/assets/controles/min-left-top.png'
        bottomSrc='/assets/controles/min-left-bottom.png'
        value={minStr[0]}
        flip
      />
      <Digit
        topSrc='/assets/controles/min-right-top.png'
        bottomSrc='/assets/controles/min-right-bottom.png'
        value={minStr[1]}
        flip
      />
      <span className='font-thanjhirs px-px text-sm text-amber-100'>:</span>
      <Digit
        topSrc='/assets/controles/sec-left-top.png'
        bottomSrc='/assets/controles/sec-left-bottom.png'
        value={secStr[0]}
      />
      <Digit
        topSrc='/assets/controles/sec-right-top.png'
        bottomSrc='/assets/controles/sec-right-bottom.png'
        value={secStr[1]}
      />
    </div>
  )
}
