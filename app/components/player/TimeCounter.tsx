import Image from 'next/image'

interface TimeCounterProps {
  seconds: number
}

function Digit({ topSrc, bottomSrc, value }: { topSrc: string; bottomSrc: string; value: string }) {
  return (
    <div className='flex flex-col'>
      <div
        className='relative flex items-end justify-center'
        style={{ width: 24, height: 29 }}
      >
        <Image
          src={topSrc}
          alt=''
          width={24}
          height={29}
          unoptimized
        />
        <span className='font-thanjhirs absolute inset-0 flex items-center justify-center text-sm text-amber-100'>
          {value}
        </span>
      </div>
      <div
        className='relative flex items-start justify-center'
        style={{ width: 24, height: 29 }}
      >
        <Image
          src={bottomSrc}
          alt=''
          width={24}
          height={29}
          unoptimized
        />
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
    <div className='flex items-center gap-px'>
      <Digit
        topSrc='/assets/controles/min-left-top.png'
        bottomSrc='/assets/controles/min-left-bottom.png'
        value={minStr[0]}
      />
      <Digit
        topSrc='/assets/controles/min-right-top.png'
        bottomSrc='/assets/controles/min-right-bottom.png'
        value={minStr[1]}
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
