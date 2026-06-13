'use client'

import { Card, CardContent } from '@/app/components/ui/card'
import { ArrowLeftRight, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export type ConnectionProfile = { name: string; slug: string | null; photo: string | null }

export interface ConnectionEdge {
  id: string
  kind: 'interest' | 'proposal'
  createdAt: string
  from: ConnectionProfile
  to: ConnectionProfile
  detail: string
  mutual: boolean
}

type KindFilter = 'all' | 'interest' | 'proposal'

const PAGE_SIZE = 10

export function ConnectionsList({ edges }: { edges: ConnectionEdge[] }) {
  const [kind, setKind] = useState<KindFilter>('all')
  const [page, setPage] = useState(0)

  const filtered = kind === 'all' ? edges : edges.filter(e => e.kind === kind)
  const interestCount = edges.filter(e => e.kind === 'interest').length
  const proposalCount = edges.length - interestCount

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const visible = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)

  function selectKind(next: KindFilter) {
    setKind(next)
    setPage(0)
  }

  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-1 self-start rounded-md border border-white/10 bg-white/3 p-0.5'>
        <FilterTab
          active={kind === 'all'}
          onClick={() => selectKind('all')}
        >
          Todos ({edges.length})
        </FilterTab>
        <FilterTab
          active={kind === 'interest'}
          onClick={() => selectKind('interest')}
        >
          Interés ({interestCount})
        </FilterTab>
        <FilterTab
          active={kind === 'proposal'}
          onClick={() => selectKind('proposal')}
        >
          Mensaje ({proposalCount})
        </FilterTab>
      </div>

      {filtered.length === 0 ? (
        <Card className='border-dashed border-white/10 bg-transparent py-10'>
          <CardContent className='font-pt-mono text-center text-xs text-white/30'>
            Aún no hay conexiones de este tipo.
          </CardContent>
        </Card>
      ) : (
        <>
          <ul className='space-y-2'>
            {visible.map(edge => (
              <ConnectionRow
                key={edge.id}
                edge={edge}
              />
            ))}
          </ul>

          {filtered.length > PAGE_SIZE && (
            <div className='flex items-center justify-between border-t border-white/5 pt-2'>
              <span className='font-pt-mono text-[10px] tracking-widest text-white/30 uppercase'>
                {safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, filtered.length)} de {filtered.length}
              </span>
              <div className='flex items-center gap-1'>
                <PagerButton
                  disabled={safePage === 0}
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                >
                  <ChevronLeft className='h-3.5 w-3.5' />
                </PagerButton>
                <span className='font-pt-mono px-1 text-[10px] tracking-widest text-white/40 uppercase'>
                  {safePage + 1}/{totalPages}
                </span>
                <PagerButton
                  disabled={safePage >= totalPages - 1}
                  onClick={() => setPage(p => p + 1)}
                >
                  <ChevronRight className='h-3.5 w-3.5' />
                </PagerButton>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function FilterTab({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={`font-pt-mono cursor-pointer rounded px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase transition-colors ${
        active ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'
      }`}
    >
      {children}
    </button>
  )
}

function ConnectionRow({ edge }: { edge: ConnectionEdge }) {
  const isInterest = edge.kind === 'interest'
  const date = new Date(edge.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
  return (
    <Card
      className={`gap-0 py-0 ${edge.mutual ? 'border-teal-400/30 bg-teal-500/[0.06]' : 'border-white/10 bg-white/3'}`}
    >
      <CardContent className='flex flex-wrap items-center gap-x-3 gap-y-2 p-3'>
        <ConnectionParty profile={edge.from} />
        {edge.mutual ? (
          <ArrowLeftRight className='h-3.5 w-3.5 shrink-0 text-teal-300' />
        ) : (
          <ArrowRight className='h-3.5 w-3.5 shrink-0 text-white/30' />
        )}
        <ConnectionParty profile={edge.to} />
        <div className='ml-auto flex shrink-0 items-center gap-2'>
          {edge.mutual ? (
            <span className='font-pt-mono rounded bg-teal-500/15 px-2 py-0.5 text-[9px] font-bold tracking-widest text-teal-200 uppercase'>
              Mutua
            </span>
          ) : null}
          <span
            className={`font-pt-mono rounded px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase ${
              isInterest ? 'bg-pink-500/10 text-pink-300' : 'bg-blue-500/10 text-blue-300'
            }`}
          >
            {isInterest ? 'Interés' : 'Mensaje'}
          </span>
          <span className='font-pt-mono text-[10px] text-white/30'>{date}</span>
        </div>
        {edge.detail ? (
          <p className='font-pt-mono line-clamp-2 w-full text-[11px] break-words text-white/40'>{edge.detail}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}

function ConnectionParty({ profile }: { profile: ConnectionProfile }) {
  return (
    <div className='flex min-w-0 items-center gap-2'>
      <ProfileAvatar
        photo={profile.photo}
        name={profile.name}
      />
      <Link
        href={profile.slug ? `/perfil/${profile.slug}` : '#'}
        className='font-pt-mono truncate text-xs font-bold text-white hover:text-red-300'
      >
        {profile.name}
      </Link>
    </div>
  )
}

function ProfileAvatar({ photo, name }: { photo: string | null; name: string }) {
  if (photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photo}
        alt={name}
        className='h-9 w-9 shrink-0 rounded-full object-cover'
      />
    )
  }
  return (
    <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-xs font-bold text-white/50'>
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

function PagerButton({
  children,
  disabled,
  onClick
}: {
  children: React.ReactNode
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type='button'
      disabled={disabled}
      onClick={onClick}
      className='flex h-7 w-7 cursor-pointer items-center justify-center rounded border border-white/10 bg-white/3 text-white/60 transition-colors hover:bg-white/8 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white/3'
    >
      {children}
    </button>
  )
}
