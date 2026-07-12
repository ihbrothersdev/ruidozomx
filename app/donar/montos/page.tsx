import type { Metadata } from 'next'
import { Lock } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import BackButton from '../../components/layout/BackButton'

export const metadata: Metadata = {
  title: 'Elige tu cooperación',
  description: 'Selecciona un monto y coopera con Ruidozo MX. Pago seguro con Stripe.'
}

// One-time amounts. `href` → each amount's Stripe Payment Link.
const ONE_TIME = [
  { img: '30mxn.png', alt: '30 MXN (1.50 USD)', href: 'https://buy.stripe.com/dRm8wP6kQc3C2m47v6c3m00' },
  { img: '50mxn.png', alt: '50 MXN (2.50 USD)', href: 'https://buy.stripe.com/cNibJ1gZu0kUgcUg1Cc3m01' },
  { img: '100mxn.png', alt: '100 MXN (5.00 USD)', href: 'https://buy.stripe.com/cNicN5fVq0kUaSA02Ec3m03' },
  { img: '200mxn.png', alt: '200 MXN (10.00 USD)', href: 'https://buy.stripe.com/8x28wP6kQgjS4uceXyc3m04' }
]

// Monthly (recurring) amounts. `href` → each amount's Stripe Payment Link.
const MONTHLY = [
  { img: '35.png', alt: '35 MXN al mes (1.75 USD)', href: 'https://buy.stripe.com/8x228r5gMebKf8Q16Ic3m05' },
  { img: '55.png', alt: '55 MXN al mes (2.75 USD)', href: 'https://buy.stripe.com/bJe00jaB63x6aSA3eQc3m07' },
  { img: '75.png', alt: '75 MXN al mes (3.75 USD)', href: 'https://buy.stripe.com/3cIeVdaB6d7GbWE7v6c3m06' }
]

// Custom amount — the donor sets the value on Stripe.
const OTHER_AMOUNT_HREF = 'https://buy.stripe.com/00w5kD24AebK5ygeXyc3m08'

interface AmountBoxProps {
  href: string
  img: string
  alt: string
}

function AmountBox({ href, img, alt }: AmountBoxProps) {
  return (
    <a
      href={href}
      target='_blank'
      rel='noopener noreferrer'
      className='block transition-transform hover:-translate-y-0.5 hover:scale-[1.03] active:translate-y-0 active:scale-100'
    >
      <Image
        src={`/assets/cooperacha/${img}`}
        alt={alt}
        width={256}
        height={224}
        className='h-auto w-full'
      />
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
            <Image
              src='/assets/cooperacha/stripe.png'
              alt='Stripe'
              width={243}
              height={108}
              className='h-5 w-auto'
            />
          </div>

          {/* Amounts: one-time | jar | monthly */}
          <div className='grid w-full grid-cols-2 items-start gap-4 lg:grid-cols-[1fr_auto_1fr] lg:gap-6'>
            {/* One-time */}
            <div className='flex flex-col items-center gap-3'>
              <Image
                src='/assets/cooperacha/onetime.png'
                alt='Cooperación única'
                width={456}
                height={172}
                className='h-auto w-full max-w-[210px]'
              />
              <div className='flex w-full max-w-[135px] flex-col gap-3'>
                {ONE_TIME.map(a => (
                  <AmountBox
                    key={a.img}
                    {...a}
                  />
                ))}
                {/* Custom amount */}
                <a
                  href={OTHER_AMOUNT_HREF}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='font-pt-mono block rounded-md border-2 border-dashed border-black bg-[#e5a838]/40 px-4 py-2 text-center text-black transition-all hover:-translate-y-0.5 hover:bg-[#e5a838]/70 active:translate-y-0'
                >
                  <div className='text-sm leading-tight font-bold tracking-wide uppercase'>Otro monto</div>
                  <div className='text-[11px] text-black/70'>elige tú</div>
                </a>
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
              <Image
                src='/assets/cooperacha/monthly.png'
                alt='Apoyo mensual'
                width={465}
                height={154}
                className='h-auto w-full max-w-[210px]'
              />
              <Image
                src='/assets/cooperacha/fire.png'
                alt=''
                width={157}
                height={233}
                className='h-8 w-auto'
              />
              <div className='flex w-full max-w-[135px] flex-col gap-3'>
                {MONTHLY.map(a => (
                  <AmountBox
                    key={a.img}
                    {...a}
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
