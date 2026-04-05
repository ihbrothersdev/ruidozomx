'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

interface ManifestoProps {
  onExit: () => void
}

/* ── Palette ── */
const C = {
  red: '#FF3B3B',
  white: '#E8E8E8'
}

/** Glitch/scanline bar */
function GlitchBar({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ scaleX: 0, opacity: 0 }}
      whileInView={{ scaleX: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay }}
      className='my-3 origin-left overflow-hidden'
      style={{ height: 6 }}
    >
      <div
        className='h-full w-full'
        style={{
          background: `repeating-linear-gradient(90deg, ${C.red}44 0px, ${C.red}22 4px, ${C.red}55 8px, transparent 12px, ${C.red}33 16px, transparent 20px, ${C.red}22 24px)`,
          filter: 'blur(0.5px)'
        }}
      />
    </motion.div>
  )
}

/** Fade-in wrapper */
function Reveal({
  children,
  delay = 0,
  className = '',
  direction = 'up'
}: {
  children: React.ReactNode
  delay?: number
  className?: string
  direction?: 'up' | 'left' | 'right'
}) {
  const initial =
    direction === 'left'
      ? { opacity: 0, x: -15 }
      : direction === 'right'
        ? { opacity: 0, x: 15 }
        : { opacity: 0, y: 12 }
  const animate = direction === 'left' || direction === 'right' ? { opacity: 1, x: 0 } : { opacity: 1, y: 0 }

  return (
    <motion.div
      initial={initial}
      whileInView={animate}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ── Style helpers ── */
const hl = (size: string) => `font-baby-doll font-black uppercase leading-[0.9] tracking-tight ${size}`

const term = () => 'font-pt-mono text-sm sm:text-base leading-relaxed'

export function Manifesto({ onExit }: ManifestoProps) {
  return (
    <div
      className='relative min-h-screen'
      style={{ backgroundColor: '#0a0a0a' }}
    >
      <Image
        src='/assets/quienes-somos/background.png'
        alt=''
        fill
        className='object-cover opacity-30'
        priority
        unoptimized
      />

      <div className='relative z-10 mx-auto max-w-4xl px-6 py-16 sm:px-10 sm:py-28'>
        {/* Rayo */}
        <Reveal className='mb-6 flex justify-center'>
          <Image
            src='/assets/quienes-somos/rayo.png'
            alt=''
            width={80}
            height={120}
            className='h-16 w-auto sm:h-24'
            unoptimized
          />
        </Reveal>

        {/* ── RU!DOZO ES UN ERROR / DEL SISTEMA ── */}
        <GlitchBar />
        <Reveal>
          <h2
            className={hl('text-[2.5rem] sm:text-[4rem] md:text-[5rem]')}
            style={{ color: C.red }}
          >
            RU!DOZO ES UN ERROR
          </h2>
        </Reveal>
        <Reveal
          delay={0.1}
          className='pl-[20%]'
        >
          <h2
            className={hl('text-[2.5rem] sm:text-[4rem] md:text-[5rem]')}
            style={{ color: C.red }}
          >
            DEL SISTEMA
          </h2>
        </Reveal>
        <GlitchBar delay={0.15} />

        {/* RU!DOZO no debería existir */}
        <Reveal
          delay={0.1}
          className='mt-4 pl-4'
        >
          <span
            className='font-baby-doll text-2xl font-black uppercase sm:text-3xl'
            style={{ color: C.white }}
          >
            RU!DOZO
          </span>
        </Reveal>
        <Reveal
          delay={0.15}
          className='pl-12'
        >
          <p
            className={term()}
            style={{ color: `${C.white}80` }}
          >
            no debería de existir.
          </p>
        </Reveal>
        <GlitchBar delay={0.2} />

        <Reveal
          delay={0.15}
          className='mt-2 max-w-[34rem] pl-4'
        >
          <p
            className={term()}
            style={{ color: `${C.white}66` }}
          >
            <span style={{ color: C.red }}>&gt; </span>
            En teoría ya hay todo: plataformas, distribución, herramientas, &quot;estrategias&quot; para crecer. Se
            supone que nunca había sido tan fácil hacer música y compartirla.
          </p>
        </Reveal>

        {/* ── PERO ALGO NO ESTA PASANDO ── */}
        <div className='h-14 sm:h-20' />
        <Reveal>
          <h2
            className={hl('text-[2rem] sm:text-[3rem] md:text-[3.8rem]')}
            style={{ color: C.red }}
          >
            PERO ALGO NO ESTA PASANDO
          </h2>
        </Reveal>
        <GlitchBar />

        <Reveal
          delay={0.1}
          className='mt-3 max-w-[32rem] pl-4'
        >
          <p
            className={term()}
            style={{ color: C.red }}
          >
            <span style={{ color: `${C.red}99` }}>&gt; </span>
            Hay más música que nunca, pero cada vez es más difícil que alguien la escuche de verdad.
          </p>
        </Reveal>

        <Reveal
          delay={0.15}
          className='mt-3 max-w-[28rem]'
        >
          <p
            className={term()}
            style={{ color: C.white }}
          >
            <span style={{ color: C.red }}>&gt; </span>
            No porque falte talento, sino porque todo está diseñado para competir por atención, no para
          </p>
          <h3
            className={`${hl('text-2xl sm:text-4xl')} mt-1 pl-6`}
            style={{ color: C.white }}
          >
            CONECTAR
          </h3>
        </Reveal>
        <GlitchBar delay={0.2} />

        <Reveal
          delay={0.15}
          className='mt-3 max-w-[30rem] pl-[30%]'
        >
          <p
            className={term()}
            style={{ color: C.red }}
          >
            <span style={{ color: `${C.red}99` }}>&gt; </span>
            Todo empuja a moverte más rápido, a publicar más, a optimizar, a entender un juego que cambia todo el
            tiempo... y que casi nunca está a favor de quien está empezando.
          </p>
        </Reveal>

        {/* ── se pierde: EL ENCUENTRO ── */}
        <div className='h-16 sm:h-24' />
        <GlitchBar />

        <Reveal className='mt-4'>
          <p
            className='font-pt-mono text-lg sm:text-2xl'
            style={{ color: `${C.white}aa` }}
          >
            <span style={{ color: `${C.white}55` }}>&gt; </span>
            se pierde:{' '}
            <strong
              className='font-baby-doll text-2xl font-black uppercase sm:text-4xl'
              style={{ color: C.white }}
            >
              EL ENCUENTRO.
            </strong>
          </p>
        </Reveal>

        <Reveal
          delay={0.1}
          className='mt-6 pl-[15%]'
        >
          <p
            className={term()}
            style={{ color: `${C.white}77` }}
          >
            <span style={{ color: C.red }}>&gt; </span>
            RU!DOZO nace desde ahí.
          </p>
        </Reveal>

        <Reveal
          delay={0.15}
          className='mt-3 max-w-[26rem] pl-[25%]'
        >
          <p
            className={term()}
            style={{ color: `${C.white}55` }}
          >
            <span style={{ color: `${C.red}88` }}>&gt; </span>
            como un intento de abrir un espacio distinto. Uno donde la música no tenga que pelear por segundos de
            atención, sino encontrar a quien sí quiere escucharla.
          </p>
        </Reveal>

        {/* ── El cassette semanal ── */}
        <div className='h-14 sm:h-20' />

        <Reveal>
          <p
            className='font-pt-mono text-base font-bold sm:text-xl'
            style={{ color: C.white }}
          >
            <span style={{ color: `${C.white}55` }}>&gt; </span>
            Por eso existe el cassette semanal.
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <p
            className='font-pt-mono text-base font-bold sm:text-xl'
            style={{ color: C.red }}
          >
            <span style={{ color: `${C.red}99` }}>&gt; </span>
            90 minutos. No más.
          </p>
        </Reveal>

        <Reveal
          delay={0.15}
          className='mt-2 max-w-[28rem] pl-[35%]'
        >
          <p
            className={term()}
            style={{ color: `${C.white}55` }}
          >
            <span style={{ color: `${C.red}77` }}>&gt; </span>
            No se trata de consumir más música, sino de relacionarnos distinto con ella.
          </p>
        </Reveal>

        {/* ── ES LA GENTE ── */}
        <div className='h-16 sm:h-24' />
        <GlitchBar />

        <Reveal className='text-center'>
          <h2
            className='font-baby-doll text-xl leading-[1.1] font-black sm:text-3xl'
            style={{ color: C.red }}
          >
            RU!DOZO no es solo lo que
            <br />
            suena.
          </h2>
        </Reveal>
        <GlitchBar delay={0.1} />

        <Reveal
          delay={0.15}
          className='text-center'
        >
          <h2
            className={hl('text-[2.5rem] sm:text-[4.5rem] md:text-[5.5rem]')}
            style={{ color: C.white }}
          >
            ES LA GENTE
          </h2>
        </Reveal>

        <Reveal
          delay={0.2}
          className='text-center'
        >
          <p
            className='font-pt-mono text-base font-bold sm:text-lg'
            style={{ color: C.white }}
          >
            &gt; PORQUE NADIE CONSTRUYE UNA ESCENA SOLO
          </p>
        </Reveal>
        <GlitchBar delay={0.25} />

        {/* Two columns */}
        <div className='mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8'>
          <Reveal
            direction='left'
            className='max-w-[26rem]'
          >
            <p
              className={term()}
              style={{ color: `${C.white}55` }}
            >
              <span style={{ color: C.red }}>&gt; </span>
              La idea es simple: que quienes hacen música se encuentren. Que aparezcan conexiones reales. Que alguien
              encuentre a su banda, a su venue, a su siguiente proyecto. Que las oportunidades no dependan únicamente de
              números, sino de afinidad, de cercanía, de estar en el lugar correcto con la gente correcta.
            </p>
          </Reveal>
          <Reveal
            direction='right'
            delay={0.15}
            className='max-w-[26rem] sm:mt-8'
          >
            <p
              className={term()}
              style={{ color: `${C.white}55` }}
            >
              <span style={{ color: C.red }}>&gt; </span>
              RU!DOZO quiere ser un puente. Entre quienes hacen que la música exista: bandas, músicos, managers, venues,
              gente que escucha y gente que mueve las cosas.
            </p>
          </Reveal>
        </div>

        {/* ── Cierre ── */}
        <div className='h-16 sm:h-24' />
        <GlitchBar />

        <Reveal className='mt-4'>
          <p
            className='font-pt-mono text-base sm:text-lg'
            style={{ color: C.red }}
          >
            <span style={{ color: `${C.red}99` }}>&gt; </span>
            Que la música no se quede atorada.
          </p>
        </Reveal>
        <GlitchBar delay={0.05} />

        <Reveal
          delay={0.08}
          className='pl-4'
        >
          <p
            className='font-pt-mono text-base sm:text-lg'
            style={{ color: C.red }}
          >
            <span style={{ color: `${C.red}99` }}>&gt; </span>Que circule.
          </p>
        </Reveal>
        <Reveal
          delay={0.12}
          className='pl-8'
        >
          <p
            className='font-pt-mono text-base sm:text-lg'
            style={{ color: C.red }}
          >
            <span style={{ color: `${C.red}99` }}>&gt; </span>Que encuentre.
          </p>
        </Reveal>
        <Reveal
          delay={0.16}
          className='pl-12'
        >
          <p
            className='font-pt-mono text-base sm:text-lg'
            style={{ color: C.red }}
          >
            <span style={{ color: `${C.red}99` }}>&gt; </span>Que suene.
          </p>
        </Reveal>

        <div className='h-12 sm:h-16' />

        <Reveal
          delay={0.1}
          className='text-center'
        >
          <h2
            className={hl('text-[2.2rem] sm:text-[3.5rem] md:text-[4.5rem]')}
            style={{ color: C.red }}
          >
            Y QUE SUENE BIEN FUERTE
          </h2>
        </Reveal>

        {/* Salir */}
        <Reveal
          delay={0.15}
          className='mt-16 flex justify-center sm:justify-end'
        >
          <button
            onClick={onExit}
            className='cursor-pointer transition-transform hover:scale-105 active:scale-95'
          >
            <Image
              src='/assets/quienes-somos/boton-salir.png'
              alt='Salir'
              width={200}
              height={60}
              className='w-32 sm:w-40'
              style={{ height: 'auto' }}
              unoptimized
            />
          </button>
        </Reveal>
      </div>
    </div>
  )
}
