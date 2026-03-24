import type { ReactNode } from 'react'

interface ProfileLayoutProps {
  leftColumn: ReactNode
  rightColumn: ReactNode
  bottomSection?: ReactNode
}

export default function ProfileLayout({ leftColumn, rightColumn, bottomSection }: ProfileLayoutProps) {
  return (
    <div className='relative min-h-screen'>
      {/* Paper texture background */}
      <div
        className='fixed inset-0 z-0 bg-cover bg-center bg-no-repeat'
        style={{ backgroundImage: "url('/assets/registro/explicacion-rol/shared/fondo.png')" }}
      />

      <div className='relative z-10 mx-auto max-w-5xl px-4 py-8'>
        {/* Two-column grid */}
        <div className='grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]'>
          {/* Left column */}
          <div className='space-y-6'>{leftColumn}</div>

          {/* Right column */}
          <div className='space-y-6'>{rightColumn}</div>
        </div>

        {/* Bottom section (full width) */}
        {bottomSection && <div className='mt-10'>{bottomSection}</div>}
      </div>
    </div>
  )
}
