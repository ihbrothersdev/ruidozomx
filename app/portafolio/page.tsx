import type { Metadata } from 'next'
import Image from 'next/image'
import BackButton from '../components/layout/BackButton'

export const metadata: Metadata = {
  title: 'Portafolio',
  description: 'Trabajos recientes: carteles, portadas, press kits y más.'
}

const labelCls = 'font-akzidenz text-xs tracking-wide text-red-500 uppercase sm:text-sm md:text-xl'

/** Rotated label reading bottom-to-top, like the printed sheet in the design. */
const verticalLabelCls = `${labelCls} [writing-mode:vertical-rl] rotate-180 self-stretch text-center`

export default function PortafolioPage() {
  return (
    <main className='relative min-h-screen bg-[#d9d5cc]'>
      {/* Grey paper background */}
      <div
        className='fixed inset-0 z-0 bg-[#d9d5cc] bg-cover bg-center bg-no-repeat'
        style={{ backgroundImage: "url('/assets/gray-bg.png')" }}
      />

      <div className='relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12'>
        <div className='grid grid-cols-2 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.45fr)_minmax(0,1fr)] lg:gap-8'>
          {/* Gustavo Santaolalla — hero. Full width first on mobile, centre column on desktop. */}
          <figure className='order-1 col-span-2 lg:order-2 lg:col-span-1'>
            <figcaption className={`${labelCls} mb-1.5 text-center`}>Cartel concierto Gustavo Santaolalla</figcaption>
            <Image
              src='/assets/portafolio/img.png'
              alt='Cartel del concierto de Gustavo Santaolalla — Valencia, España'
              width={699}
              height={872}
              priority
              className='h-auto w-full'
            />
          </figure>

          {/* Left stack. Markup order is festival → single (desktop); reversed on
              mobile so the single sits on top, as in the mobile design. */}
          <div className='order-2 flex flex-col-reverse gap-5 lg:order-1 lg:flex-col'>
            {/* Cartel festival */}
            <figure>
              <figcaption className={`${labelCls} mb-1.5 text-center`}>Cartel festival</figcaption>
              <Image
                src='/assets/portafolio/img4.png'
                alt='Cartel del festival ENROK2 — Sala Multiusos Zaragoza'
                width={348}
                height={436}
                className='h-auto w-full'
              />
            </figure>

            {/* Single — Atercipelados */}
            <figure className='flex gap-1.5'>
              <figcaption className={verticalLabelCls}>Atercipelados portada</figcaption>
              <div className='min-w-0 flex-1'>
                <p className={`${labelCls} mb-1.5 text-center`}>Single</p>
                <Image
                  src='/assets/portafolio/img2.png'
                  alt='Portada del single “Quisiera Ser” — Sara Curruchich y Atercipelados'
                  width={278}
                  height={277}
                  className='h-auto w-full'
                />
              </div>
            </figure>
          </div>

          {/* Press kit — Monsieur Periné */}
          <figure className='order-3 flex gap-1.5'>
            <figcaption className={verticalLabelCls}>Monsieur Periné</figcaption>
            <div className='min-w-0 flex-1'>
              <p className={`${labelCls} mb-1.5 text-center`}>Press kit</p>
              <Image
                src='/assets/portafolio/img3.png'
                alt='Press kit de Monsieur Periné'
                width={332}
                height={875}
                className='h-auto w-full'
              />
            </div>
          </figure>
        </div>

        {/* Volver — back to the profile dashboard with the quote modal already
            open, since that's the only place this page is reached from. */}
        <div className='mt-10 flex justify-center lg:justify-start'>
          <BackButton href='/perfil?portafolio=1' />
        </div>
      </div>
    </main>
  )
}
