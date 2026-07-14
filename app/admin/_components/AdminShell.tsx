'use client'

/* eslint-disable @next/next/no-img-element */
import { signout } from '@/app/(auth)/actions'
import { cn } from '@/lib/utils'
import { BarChart3, CalendarDays, Disc3, HandCoins, Heart, Inbox, LayoutDashboard, LogOut, Menu, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard; exact?: boolean; track?: string }

interface AdminShellProps {
  displayName: string
  photoUrl: string | null
  canViewDonations?: boolean
  children: React.ReactNode
}

const NAV: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true, track: '00' },
  { href: '/admin/propuestas', label: 'Propuestas', icon: Inbox, track: '01' },
  { href: '/admin/cassettes', label: 'Cassettes', icon: Disc3, track: '02' },
  { href: '/admin/eventos', label: 'Eventos', icon: CalendarDays, track: '03' },
  { href: '/admin/conexiones', label: 'Conexiones', icon: Heart, track: '04' },
  { href: '/admin/metricas', label: 'Métricas', icon: BarChart3, track: '05' }
]

export function AdminShell({ displayName, photoUrl, canViewDonations = false, children }: AdminShellProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const navItems: NavItem[] = canViewDonations
    ? [...NAV, { href: '/admin/donaciones', label: 'Donaciones', icon: HandCoins, track: '06' }]
    : NAV

  // Admin runs as a fixed-height shell where only the content column scrolls,
  // so drop the global body padding that reserves space for the floating player.
  useEffect(() => {
    const { body } = document
    const prev = body.style.paddingBottom
    body.style.paddingBottom = '0'
    return () => {
      body.style.paddingBottom = prev
    }
  }, [])

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')

  return (
    <div className='admin-root relative flex h-[100dvh] overflow-hidden'>
      {/* Letterhead paper wash over the kraft desk */}
      <div
        aria-hidden
        className='pointer-events-none fixed inset-0 z-0 opacity-[0.12] mix-blend-multiply'
        style={{ backgroundImage: "url('/assets/membrete-background.png')", backgroundSize: 'cover' }}
      />

      {/* ── Sidebar (desktop) ── */}
      <aside className='border-admin-ink bg-admin-surface fixed top-0 left-0 z-40 hidden h-[100dvh] w-64 flex-col overflow-y-auto border-r-2 md:flex'>
        <SidebarContent
          displayName={displayName}
          photoUrl={photoUrl}
          isActive={isActive}
          navItems={navItems}
        />
      </aside>

      {/* ── Mobile top bar ── */}
      <div className='border-admin-ink bg-admin-surface fixed top-0 right-0 left-0 z-40 flex items-center justify-between border-b-2 px-4 py-2.5 md:hidden'>
        <Link
          href='/admin'
          className='flex items-center gap-2'
        >
          <Image
            src='/assets/logo.png'
            alt='Ruidozo MX'
            width={120}
            height={60}
            className='h-6 w-auto'
            unoptimized
          />
          <span className='admin-dymo px-1.5 py-0.5 text-[9px]'>Admin</span>
        </Link>
        <button
          onClick={() => setOpen(true)}
          className='admin-press border-admin-ink bg-admin-red text-admin-surface flex h-9 w-9 items-center justify-center border-2'
          aria-label='Menú'
        >
          <Menu className='h-5 w-5' />
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      {open && (
        <div className='fixed inset-0 z-[70] md:hidden'>
          <div
            className='bg-admin-ink/50 absolute inset-0'
            onClick={() => setOpen(false)}
          />
          <aside className='admin-root border-admin-ink bg-admin-surface absolute top-0 left-0 flex h-full w-72 flex-col border-r-2 shadow-[8px_0_0_0_rgba(23,19,13,0.15)]'>
            <button
              onClick={() => setOpen(false)}
              className='border-admin-ink text-admin-ink absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center border-2'
              aria-label='Cerrar'
            >
              <X className='h-4 w-4' />
            </button>
            <div
              className='flex min-h-0 flex-1 flex-col'
              onClick={() => setOpen(false)}
            >
              <SidebarContent
                displayName={displayName}
                photoUrl={photoUrl}
                isActive={isActive}
                navItems={navItems}
              />
            </div>
          </aside>
        </div>
      )}

      {/* ── Main content ── */}
      <main className='relative z-10 min-w-0 flex-1 overflow-y-auto pt-14 pb-40 md:pt-0 md:pb-16 md:pl-64'>
        {children}
      </main>
    </div>
  )
}

function SidebarContent({
  displayName,
  photoUrl,
  isActive,
  navItems
}: {
  displayName: string
  photoUrl: string | null
  isActive: (href: string, exact?: boolean) => boolean
  navItems: NavItem[]
}) {
  return (
    <div className='flex h-full flex-col'>
      {/* Masthead */}
      <div className='border-admin-ink border-b-2 px-5 py-5'>
        <Link
          href='/'
          className='inline-block transition-transform hover:-rotate-2'
        >
          <Image
            src='/assets/logo.png'
            alt='Ruidozo MX'
            width={160}
            height={80}
            className='mb-3 h-8 w-auto'
            unoptimized
          />
        </Link>
        <div className='flex items-center gap-2'>
          <span className='admin-dymo px-2 py-1 text-[9px]'>Mesa de control</span>
        </div>
      </div>

      {/* Nav — a stack of press-buttons on the control panel */}
      <nav className='flex-1 space-y-1.5 px-3 py-4'>
        {navItems.map(item => {
          const Icon = item.icon
          const active = isActive(item.href, item.exact)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'font-pt-mono group flex items-center gap-3 border-2 px-3 py-2.5 text-xs font-bold tracking-[0.12em] uppercase transition-all',
                active
                  ? 'border-admin-ink bg-admin-red text-admin-surface admin-hard-sm'
                  : 'text-admin-ink-soft hover:border-admin-ink hover:bg-admin-paper-deep hover:text-admin-ink border-transparent'
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4',
                  active ? 'text-admin-surface' : 'text-admin-ink-faint group-hover:text-admin-ink'
                )}
              />
              <span className='flex-1'>{item.label}</span>
              <span
                className={cn(
                  'font-pt-mono text-[9px] tracking-normal tabular-nums',
                  active ? 'text-admin-surface/70' : 'text-admin-ink-faint/60'
                )}
              >
                {item.track}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Footer: staff ID card + signout */}
      <div className='border-admin-ink border-t-2 p-3'>
        <div className='border-admin-ink bg-admin-paper mb-2 flex items-center gap-3 border-2 px-3 py-2.5'>
          <div className='border-admin-ink bg-admin-paper-deep h-9 w-9 shrink-0 overflow-hidden border-2'>
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={displayName}
                className='h-full w-full object-cover'
              />
            ) : (
              <div className='font-baby-doll text-admin-ink flex h-full w-full items-center justify-center text-lg font-bold'>
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className='min-w-0 flex-1'>
            <p className='font-pt-mono text-admin-ink truncate text-xs font-bold'>{displayName}</p>
            <p className='font-pt-mono text-admin-red text-[9px] tracking-[0.2em] uppercase'>Staff · Ruidozo</p>
          </div>
        </div>
        <form>
          <button
            formAction={signout}
            className='font-pt-mono admin-press border-admin-ink bg-admin-surface text-admin-ink hover:bg-admin-red hover:text-admin-surface flex w-full cursor-pointer items-center justify-center gap-2 border-2 px-3 py-2 text-[11px] font-bold tracking-[0.14em] uppercase'
          >
            <LogOut className='h-3.5 w-3.5' />
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  )
}
