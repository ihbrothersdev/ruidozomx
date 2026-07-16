import type { ReactNode } from 'react'

interface ProfileLayoutProps {
  leftColumn: ReactNode
  rightColumn?: ReactNode
  bottomSection?: ReactNode
  topDecoration?: ReactNode
  /** Top-of-page nav (Volver / Home). Rendered above the topDecoration. */
  floatingNav?: ReactNode
  /** When true, render leftColumn at a centered max-width and ignore rightColumn.
   *  Used for edit mode so all form fields flow top-to-bottom without dead
   *  space on the right. */
  singleColumn?: boolean
}

export default function ProfileLayout({
  leftColumn,
  rightColumn,
  bottomSection,
  topDecoration,
  floatingNav,
  singleColumn = false
}: ProfileLayoutProps) {
  // `admin-root` is the shared "Mesa de Control" paper theme (kraft base, ink
  // text, riso grain). Reused here to bring the profile into the same fanzine
  // control-desk language as /admin.
  return (
    <div className='admin-root relative min-h-screen'>
      <div
        aria-hidden
        className='pointer-events-none fixed inset-0 z-0 opacity-[0.12] mix-blend-multiply'
        style={{ backgroundImage: "url('/assets/membrete-background.png')", backgroundSize: 'cover' }}
      />

      <div className='relative z-10 mx-auto max-w-5xl px-4 py-8'>
        {floatingNav && <div className='mb-4'>{floatingNav}</div>}

        {topDecoration && <div className='mb-6 lg:hidden'>{topDecoration}</div>}

        {singleColumn ? (
          <div className='mx-auto max-w-2xl space-y-6'>{leftColumn}</div>
        ) : (
          <div className='grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]'>
            <div className='flex h-full flex-col gap-6'>{leftColumn}</div>
            <div className='flex h-full flex-col gap-6'>{rightColumn}</div>
          </div>
        )}

        {bottomSection && <div className='mt-10'>{bottomSection}</div>}
      </div>
    </div>
  )
}
