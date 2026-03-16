import type { TicketSection } from '../constants'

interface TicketTextProps {
  sections: TicketSection[]
  /** Additional classes for the outer wrapper */
  className?: string
}

function getSizeClass(sectionName: string, lineIndex: number, totalLines: number): string {
  switch (sectionName) {
    case 'headline':
      return lineIndex < totalLines - 1
        ? 'text-xl lg:text-2xl xl:text-5xl leading-tight'
        : 'text-6xl lg:text-8xl xl:text-7xl leading-none'
    case 'main':
      return 'text-sm lg:text-lg xl:text-xl'
    case 'share':
      return 'text-base lg:text-xl xl:text-2xl'
    case 'cta':
      return 'text-xl font-black lg:text-2xl xl:text-3xl'
    case 'footer':
      return 'text-xs lg:text-base xl:text-lg'
    default:
      return 'text-base lg:text-xl xl:text-2xl'
  }
}

export default function TicketText({ sections, className = '' }: TicketTextProps) {
  return (
    <div className={`font-akzidenz flex flex-col items-center justify-between pt-[8%] text-center ${className}`}>
      <div className='flex flex-col items-center gap-6 lg:gap-8 xl:gap-10'>
        {sections.map(sec => {
          if (sec.name === 'footer') return null
          return (
            <section
              key={sec.name}
              className='flex flex-col items-center'
            >
              {sec.lines.map((line, j) => (
                <p
                  key={j}
                  className={`uppercase ${getSizeClass(sec.name, j, sec.lines.length)} ${line.color === 'red' ? 'text-red-500' : 'text-black'}`}
                >
                  {line.text}
                </p>
              ))}
            </section>
          )
        })}
      </div>

      {sections
        .filter(sec => sec.name === 'footer')
        .map(sec => (
          <div
            key={sec.name}
            className='flex items-end gap-2'
          >
            <div className='aspect-square w-10 shrink-0 rounded bg-black/10 lg:w-12' />
            <div className='flex flex-col'>
              {sec.lines.map((line, j) => (
                <p
                  key={j}
                  className={`font-bold uppercase ${getSizeClass(sec.name, j, sec.lines.length)} ${line.color === 'red' ? 'text-red-700' : 'text-black'}`}
                >
                  {line.text}
                </p>
              ))}
            </div>
          </div>
        ))}
    </div>
  )
}
