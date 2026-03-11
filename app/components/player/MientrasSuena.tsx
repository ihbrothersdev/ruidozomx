import { useState, useEffect, useCallback } from 'react'

const FAKE_NAMES = [
  'Carlos',
  'María',
  'Diego',
  'Valentina',
  'Andrés',
  'Camila',
  'Santiago',
  'Sofía',
  'Mateo',
  'Isabella',
  'Sebastián',
  'Lucía',
  'Emiliano',
  'Regina',
  'Nicolás',
  'Fernanda',
  'Daniel',
  'Ximena',
  'Alejandro',
  'Paula'
]

type Message = { type: 'listeners'; count: number } | { type: 'registered'; name: string }

export function MientrasSuena() {
  const [listenerCount, setListenerCount] = useState(3)
  // const [message, setMessage] = useState<Message>({ type: 'listeners', count: 3 })

  const pickRandomName = useCallback(() => {
    return FAKE_NAMES[Math.floor(Math.random() * FAKE_NAMES.length)]
  }, [])

  useEffect(() => {
    const initial = Math.floor(Math.random() * 8) + 2
    setListenerCount(initial)
    // setMessage({ type: 'listeners', count: initial })

    const interval = setInterval(() => {
      const showRegistration = Math.random() < 0.3

      if (showRegistration) {
        // setMessage({ type: 'registered', name: pickRandomName() })
      } else {
        setListenerCount(prev => {
          const delta = Math.random() < 0.5 ? 1 : -1
          const next = Math.max(1, Math.min(15, prev + delta))
          // setMessage({ type: 'listeners', count: next })
          return next
        })
      }
    }, 10000)
    return () => clearInterval(interval)
  }, [pickRandomName])

  return (
    <div className='mx-auto mt-5 flex max-w-[793px] justify-center px-4'>
      <p className='font-impact-label text-[25px] text-green-300 uppercase'>
        {`${listenerCount} personas estan escuchando el mixtape`}
        {/* {message.type === 'listeners'
          ? `${message.count} personas estan escuchando el mixtape`
          : `Usuario ${message.name} se acaba de registrar`} */}
      </p>
    </div>
  )
}
