'use client'

import { EmptyState, Paper, Stamp } from '@/app/admin/_components/kit'
import { ArrowLeftRight, ArrowRight, ChevronLeft, ChevronRight, Unplug } from 'lucide-react'
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
  mutualMessages?: { name: string; text: string; at: string }[]
  mutual: boolean
}

type KindFilter = 'all' | 'interest' | 'proposal'

const PAGE_SIZE = 10

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

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
      <div className='flex flex-wrap items-center gap-2'>
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
        <EmptyState icon={Unplug}>Aún no hay conexiones de este tipo.</EmptyState>
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
            <div className='border-admin-ink/15 flex items-center justify-between border-t pt-2'>
              <span className='font-pt-mono text-admin-ink-faint text-[10px] tracking-widest uppercase'>
                {safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, filtered.length)} de {filtered.length}
              </span>
              <div className='flex items-center gap-1'>
                <PagerButton
                  disabled={safePage === 0}
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                >
                  <ChevronLeft className='h-3.5 w-3.5' />
                </PagerButton>
                <span className='font-pt-mono text-admin-ink-soft px-1 text-[10px] tracking-widest uppercase'>
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
      className={`font-pt-mono border-admin-ink cursor-pointer border-2 px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase transition-colors ${
        active
          ? 'bg-admin-red text-admin-surface admin-hard-sm'
          : 'bg-admin-surface text-admin-ink hover:bg-admin-paper-deep'
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
    <Paper
      tone={edge.mutual ? 'olive' : undefined}
      className='p-3'
    >
      <div className='flex flex-wrap items-center gap-x-3 gap-y-2'>
        <ConnectionParty profile={edge.from} />
        {edge.mutual ? (
          <ArrowLeftRight className='text-admin-olive h-3.5 w-3.5 shrink-0' />
        ) : (
          <ArrowRight className='text-admin-ink-faint h-3.5 w-3.5 shrink-0' />
        )}
        <ConnectionParty profile={edge.to} />
        <div className='ml-auto flex shrink-0 items-center gap-2'>
          {edge.mutual ? (
            <Stamp
              tone='olive'
              rotate={false}
              className='text-[9px]'
            >
              Mutua
            </Stamp>
          ) : null}
          <Stamp
            tone={isInterest ? 'red' : 'blue'}
            rotate={false}
            className='text-[9px]'
          >
            {isInterest ? 'Interés' : 'Mensaje'}
          </Stamp>
          <span className='font-pt-mono text-admin-ink-faint text-[10px]'>{date}</span>
        </div>
        {edge.mutual && edge.mutualMessages?.length ? (
          <div className='w-full space-y-1'>
            {edge.mutualMessages.map((m, i) => (
              <p
                key={i}
                className='font-pt-mono text-admin-ink-soft line-clamp-2 text-[11px] break-words'
              >
                <span className='text-admin-ink font-bold'>{m.name}</span>
                <span className='text-admin-ink-faint'> · {fmtDateTime(m.at)}</span>
                {m.text ? `: ${m.text}` : ''}
              </p>
            ))}
          </div>
        ) : edge.detail ? (
          <p className='font-pt-mono text-admin-ink-soft line-clamp-2 w-full text-[11px] break-words'>{edge.detail}</p>
        ) : null}
      </div>
    </Paper>
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
        className='font-pt-mono text-admin-ink hover:text-admin-red truncate text-xs font-bold'
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
    <div className='border-admin-ink bg-admin-surface text-admin-ink-soft flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold'>
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
      className='border-admin-ink bg-admin-surface text-admin-ink hover:bg-admin-paper-deep disabled:hover:bg-admin-surface flex h-7 w-7 cursor-pointer items-center justify-center border-2 transition-colors disabled:cursor-not-allowed disabled:opacity-30'
    >
      {children}
    </button>
  )
}
