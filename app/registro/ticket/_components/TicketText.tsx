import Link from 'next/link'
import type { TicketSection } from '../constants'

interface TicketTextProps {
  sections: TicketSection[]
  /** Additional classes for the outer wrapper */
  className?: string
}

export default function TicketText({ sections, className = '' }: TicketTextProps) {
  const headline = sections.find(s => s.name === 'headline')
  const main = sections.find(s => s.name === 'main')
  const top = sections.find(s => s.name === 'top')

  /* The headline pre-text (e.g. "PROPÓN UNA") is the first line(s) before the last line */
  const headlinePre = headline ? headline.lines.slice(0, -1) : []
  /* The big headline (e.g. "ROLA") is the last line */
  const headlineMain = headline ? headline.lines[headline.lines.length - 1] : null

  return (
    <div className={`font-akzidenz grid grid-rows-5 text-center ${className}`}>
      {/* Row 1: Headline pre-text (e.g. "PROPÓN UNA") */}
      <div className='flex flex-col items-center justify-end px-1 lg:px-2'>
        {/* {top &&
          top.lines.map((line, j) => (
            <p
              key={`top-${j}`}
              className={`text-[0.35rem] leading-tight uppercase sm:text-[0.5rem] lg:text-sm xl:text-base ${line.color === 'red' ? 'text-red-500' : 'text-black'}`}
            >
              {line.text}
            </p>
          ))}
        {headlinePre.map((line, j) => (
          <p
            key={`pre-${j}`}
            className={`text-[0.55rem] leading-tight font-bold uppercase sm:text-xs lg:text-xl xl:text-2xl ${line.color === 'red' ? 'text-red-500' : 'text-black'}`}
          >
            {line.text}
          </p>
        ))} */}
      </div>

      {/* Row 2: Big headline (e.g. "ROLA") + detail text */}
      <div className='flex flex-col items-center justify-center px-1 lg:px-2'>
        {/* {headlineMain && (
          <p
            className={`text-2xl leading-none font-black uppercase sm:text-3xl lg:text-6xl xl:text-7xl ${headlineMain.color === 'red' ? 'text-red-500' : 'text-black'}`}
          >
            {headlineMain.text}
          </p>
        )}
        {main &&
          main.lines.map((line, j) => (
            <p
              key={`main-${j}`}
              className={`mt-0.5 text-[0.35rem] leading-tight uppercase sm:text-[0.45rem] lg:mt-1 lg:text-xs xl:text-sm ${line.color === 'red' ? 'text-red-500' : 'text-black'}`}
            >
              {line.text}
            </p>
          ))} */}
      </div>

      <div className='pointer-events-auto flex flex-col items-center justify-center px-1 lg:px-2'></div>

      {/* Row 3: Static share text — clickable */}
      <div className='pointer-events-auto flex flex-col items-center justify-center px-1 lg:px-2'>
        <p className='text-[0.4rem] leading-tight text-black uppercase sm:text-[0.55rem] lg:text-3xl xl:text-3xl'>
          CORRE LA VOZ,
        </p>
        <p className='text-[0.4rem] leading-tight text-black uppercase sm:text-[0.55rem] lg:text-3xl xl:text-3xl'>
          HAZ RUIDO ALLÁ AFUERA
        </p>
        <p className='text-[0.4rem] leading-tight text-black uppercase sm:text-[0.55rem] lg:text-3xl xl:text-3xl'>
          COMPÁRTENOS EN TUS REDES
        </p>
      </div>

      {/* Row 4: Static CTA — clickable */}
      <div className='pointer-events-auto flex items-center justify-center px-1 lg:px-2'>
        <Link
          href='/comunidad'
          className='text-[0.55rem] leading-tight text-black uppercase hover:underline sm:text-xs lg:text-5xl xl:text-5xl'
        >
          EXPLORAR LA ESCENA
        </Link>
      </div>
    </div>
  )
}
