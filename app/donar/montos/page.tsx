import type { Metadata } from 'next'
import { Flame, Lock } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import BackButton from '../../components/layout/BackButton'

export const metadata: Metadata = {
  title: 'Elige tu cooperación',
  description: 'Selecciona un monto y coopera con Ruidozo MX. Pago seguro con Stripe.'
}

// One-time amounts. `href` → each amount's Stripe Payment Link (pending).
const ONE_TIME = [
  { mxn: 30, usd: '1.50', href: '#' },
  { mxn: 50, usd: '2.50', href: '#' },
  { mxn: 100, usd: '5.00', href: '#' },
  { mxn: 200, usd: '10.00', href: '#' }
]

// Monthly (recurring) amounts. `href` → each amount's Stripe Payment Link (pending).
const MONTHLY = [
  { mxn: 35, usd: '1.75', href: '#' },
  { mxn: 55, usd: '2.75', href: '#' },
  { mxn: 75, usd: '3.75', href: '#' }
]

interface AmountBoxProps {
  href: string
  mxn: number
  usd: string
  monthly?: boolean
}

function AmountBox({ href, mxn, usd, monthly = false }: AmountBoxProps) {
  return (
    <a
      href={href}
      target='_blank'
      rel='noopener noreferrer'
      className={`font-pt-mono block rounded-md border-2 border-black px-4 py-2 text-center text-black shadow-[3px_3px_0_rgba(0,0,0,0.45)] transition-all hover:-translate-y-0.5 hover:shadow-[4px_5px_0_rgba(0,0,0,0.5)] active:translate-y-0 active:shadow-[2px_2px_0_rgba(0,0,0,0.45)] ${
        monthly ? 'bg-[#a4c93f]' : 'bg-[#e5a838]'
      }`}
    >
      <div className='text-2xl leading-none font-bold'>{mxn}</div>
      <div className='text-sm font-bold tracking-wide'>{monthly ? 'MXN/MES' : 'MXN'}</div>
      <div className='text-[11px] text-black/70'>({usd} USD)</div>
    </a>
  )
}

export default function MontosPage() {
  return (
    <main className='relative min-h-screen bg-[#e7dfce]'>
      {/* Aged-paper background */}
      <div
        className='fixed inset-0 z-0 bg-[#e7dfce] bg-cover bg-top bg-no-repeat'
        style={{ backgroundImage: "url('/assets/donations/background.png')" }}
      />

      <div className='relative z-10'>
        {/* Logo — centered on mobile, left on desktop */}
        <div className='flex justify-center px-4 pt-4 sm:justify-start'>
          <Link
            href='/'
            aria-label='Inicio'
            className='inline-block transition-transform hover:scale-105'
          >
            <Image
              src='/assets/logo.png'
              alt='Ruidozo MX'
              width={380}
              height={183}
              className='h-10 w-auto sm:h-12'
            />
          </Link>
        </div>

        <div className='mx-auto flex max-w-2xl flex-col items-center gap-6 px-6 pb-16 text-center'>
          {/* "Tú Coperacha — hace la diferencia" */}
          <Image
            src='/assets/cooperacha/cooperacha-header.png'
            alt='Tu coperacha hace la diferencia'
            width={386}
            height={305}
            priority
            className='h-auto w-full max-w-xs'
          />

          {/* Instruction banner */}
          <div className='font-baby-doll w-full max-w-md rounded-sm border-2 border-black bg-[#e23b2e] px-4 py-3 text-xl tracking-wide text-white uppercase shadow-[3px_3px_0_rgba(0,0,0,0.4)] sm:text-2xl'>
            Selecciona un monto y continúa
          </div>

          {/* Secure payment note */}
          <div className='flex items-center justify-center gap-2 text-neutral-800'>
            <Lock
              className='h-4 w-4'
              aria-hidden
            />
            <span className='font-pt-mono text-xs font-bold tracking-widest uppercase'>Pago seguro con</span>
            <span className='text-lg font-bold tracking-tight text-[#635bff]'>stripe</span>
          </div>

          {/* Amounts: one-time | jar | monthly */}
          <div className='grid w-full grid-cols-2 items-start gap-4 lg:grid-cols-[1fr_auto_1fr] lg:gap-6'>
            {/* One-time */}
            <div className='flex flex-col items-center gap-3'>
              <div className='font-baby-doll w-fit rounded-md border-2 border-black bg-[#e8531f] px-3 py-1 text-sm tracking-wide text-white uppercase shadow-[2px_2px_0_rgba(0,0,0,0.4)]'>
                Cooperación única
              </div>
              <div className='flex w-full max-w-[150px] flex-col gap-3'>
                {ONE_TIME.map(a => (
                  <AmountBox
                    key={a.mxn}
                    {...a}
                  />
                ))}
              </div>
            </div>

            {/* Jar — desktop only, sits between the two columns */}
            <div className='hidden self-center lg:block'>
              <Image
                src='/assets/cooperacha/jar.png'
                alt=''
                width={515}
                height={837}
                className='h-auto w-40'
              />
            </div>

            {/* Monthly */}
            <div className='flex flex-col items-center gap-3'>
              <div className='font-baby-doll w-fit rounded-md border-2 border-black bg-[#6fae2f] px-3 py-1 text-sm tracking-wide text-white uppercase shadow-[2px_2px_0_rgba(0,0,0,0.4)]'>
                Apoyo mensual
              </div>
              <Flame
                className='h-7 w-7 text-[#e23b2e]'
                fill='currentColor'
                aria-hidden
              />
              <div className='flex w-full max-w-[150px] flex-col gap-3'>
                {MONTHLY.map(a => (
                  <AmountBox
                    key={a.mxn}
                    {...a}
                    monthly
                  />
                ))}
              </div>
              <p className='font-pt-mono text-xs font-bold tracking-wide text-[#e23b2e] uppercase'>
                Cancela cuando quieras
              </p>
            </div>
          </div>

          {/* Gracias */}
          <Image
            src='/assets/cooperacha/gracias.png'
            alt='Gracias'
            width={552}
            height={217}
            className='mt-2 h-auto w-full max-w-sm'
          />

          {/* Volver */}
          <div className='self-start'>
            <BackButton href='/donar' />
          </div>
        </div>
      </div>
    </main>
  )
}
