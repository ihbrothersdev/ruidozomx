'use client'

/* eslint-disable @next/next/no-img-element */
import { signout } from '@/app/(auth)/actions'
import { BarChart3, Disc3, Inbox, LayoutDashboard, LogOut, Menu, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

interface AdminShellProps {
  displayName: string
  photoUrl: string | null
  children: React.ReactNode
}

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/propuestas', label: 'Propuestas', icon: Inbox },
  { href: '/admin/cassettes', label: 'Cassettes', icon: Disc3 },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 }
]

export function AdminShell({ displayName, photoUrl, children }: AdminShellProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')

  return (
    <div className='relative flex min-h-screen bg-neutral-950 text-white'>
      {/* Background texture */}
      <div
        className='pointer-events-none fixed inset-0 z-0 opacity-15'
        style={{ backgroundImage: "url('/assets/textura/background-textura.jpg')", backgroundSize: 'cover' }}
      />

      {/* ── Sidebar (desktop) ── */}
      <aside className='sticky top-0 z-10 hidden h-screen w-64 shrink-0 flex-col self-start overflow-y-auto border-r border-white/5 bg-black/40 md:flex'>
        <SidebarContent
          displayName={displayName}
          photoUrl={photoUrl}
          isActive={isActive}
        />
      </aside>

      {/* ── Mobile top bar ── */}
      <div className='fixed top-0 right-0 left-0 z-40 flex items-center justify-between border-b border-white/5 bg-black/80 px-4 py-3 backdrop-blur md:hidden'>
        <Link
          href='/admin'
          className='flex items-center gap-2'
        >
          <Image
            src='/assets/header/logo.png'
            alt='Ruidozo MX'
            width={120}
            height={60}
            className='h-7 w-auto invert'
            unoptimized
          />
          <span className='font-pt-mono text-[10px] font-bold tracking-widest text-red-500 uppercase'>Admin</span>
        </Link>
        <button
          onClick={() => setOpen(true)}
          className='flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70'
          aria-label='Menú'
        >
          <Menu className='h-5 w-5' />
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      {open && (
        <div className='fixed inset-0 z-50 md:hidden'>
          <div
            className='absolute inset-0 bg-black/70'
            onClick={() => setOpen(false)}
          />
          <aside className='absolute top-0 left-0 flex h-full w-72 flex-col border-r border-white/10 bg-neutral-950 shadow-2xl'>
            <button
              onClick={() => setOpen(false)}
              className='absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-lg text-white/60 hover:bg-white/5'
              aria-label='Cerrar'
            >
              <X className='h-5 w-5' />
            </button>
            <div onClick={() => setOpen(false)}>
              <SidebarContent
                displayName={displayName}
                photoUrl={photoUrl}
                isActive={isActive}
              />
            </div>
          </aside>
        </div>
      )}

      {/* ── Main content ── */}
      <main className='relative z-10 min-w-0 flex-1 pt-16 md:pt-0'>{children}</main>
    </div>
  )
}

function SidebarContent({
  displayName,
  photoUrl,
  isActive
}: {
  displayName: string
  photoUrl: string | null
  isActive: (href: string, exact?: boolean) => boolean
}) {
  return (
    <div className='flex h-full flex-col'>
      {/* Header */}
      <div className='border-b border-white/5 px-5 py-6'>
        <Link
          href='/'
          className='inline-block transition-opacity hover:opacity-70'
        >
          <Image
            src='/assets/header/logo.png'
            alt='Ruidozo MX'
            width={160}
            height={80}
            className='mb-3 h-9 w-auto invert'
            unoptimized
          />
        </Link>
        <p className='font-pt-mono text-[10px] font-bold tracking-[0.25em] text-red-500 uppercase'>Panel admin</p>
      </div>

      {/* Nav */}
      <nav className='flex-1 space-y-1 px-3 py-4'>
        {NAV.map(item => {
          const Icon = item.icon
          const active = isActive(item.href, item.exact)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`font-pt-mono group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold tracking-wide uppercase transition-all ${
                active
                  ? 'bg-red-600/20 text-red-300 shadow-[inset_2px_0_0_0_rgb(239_68_68)]'
                  : 'text-white/50 hover:bg-white/5 hover:text-white/90'
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? 'text-red-400' : 'text-white/40 group-hover:text-white/70'}`} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer: profile + signout */}
      <div className='border-t border-white/5 p-3'>
        <div className='mb-2 flex items-center gap-3 rounded-lg bg-white/[0.03] px-3 py-2.5'>
          <div className='h-9 w-9 shrink-0 overflow-hidden rounded-full bg-neutral-800'>
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={displayName}
                className='h-full w-full object-cover'
              />
            ) : (
              <div className='flex h-full w-full items-center justify-center text-sm font-bold text-white/40'>
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className='min-w-0 flex-1'>
            <p className='font-pt-mono truncate text-xs font-bold text-white'>{displayName}</p>
            <p className='font-pt-mono text-[10px] tracking-widest text-red-400 uppercase'>Admin</p>
          </div>
        </div>
        <form>
          <button
            formAction={signout}
            className='font-pt-mono flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold tracking-wider text-white/40 uppercase transition-colors hover:bg-red-500/10 hover:text-red-300'
          >
            <LogOut className='h-3.5 w-3.5' />
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  )
}
