import { Alert, AlertDescription, AlertTitle } from '@/app/components/ui/alert'
import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent } from '@/app/components/ui/card'
import { Progress } from '@/app/components/ui/progress'
import { isPlayableAudio } from '@/lib/audio'
import { createClient } from '@/lib/supabase/server'
import { formatShortDateMX } from '@/lib/utils'
import { AlertCircle, ArrowLeft, Music2, Sparkles, UploadCloud } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CassetteSides, type CassetteSong } from '../_components/CassetteSides'
import { DeleteButton, MarkAsNextButton, PublishButton } from '../_components/CassetteActions'

function formatTime(seconds: number): string {
  if (!seconds || seconds <= 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default async function CassetteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: cassette } = await supabase.from('cassettes').select('*').eq('id', id).single()
  if (!cassette) notFound()

  const { data: songs } = await supabase
    .from('songs')
    .select('id, title, artist, side, position, audio_url, plays, proposal_id, duration_seconds')
    .eq('cassette_id', id)
    .order('side', { ascending: true })
    .order('position', { ascending: true })

  const total = (songs ?? []).length
  const cassetteSongs: CassetteSong[] = (songs ?? []).map(s => ({
    id: s.id,
    title: s.title,
    artist: s.artist,
    side: s.side as 'A' | 'B',
    position: s.position,
    plays: s.plays,
    audioUrl: s.audio_url ?? null,
    durationSeconds: s.duration_seconds ?? null
  }))
  const missingAudio = cassetteSongs.filter(s => !isPlayableAudio(s.audioUrl))
  const missingAudioCount = missingAudio.length

  const durationLimitMinutes = cassette.duration_minutes ?? 90
  const sumKnown = (songs ?? []).reduce((acc, s) => acc + (s.duration_seconds ?? 0), 0)
  const knownCount = (songs ?? []).filter(s => s.duration_seconds && s.duration_seconds > 0).length
  const unknownCount = total - knownCount
  const limitSeconds = durationLimitMinutes * 60
  const pct = limitSeconds > 0 ? Math.min(100, Math.round((sumKnown / limitSeconds) * 100)) : 0
  const overLimit = sumKnown > limitSeconds

  const state: 'active' | 'next' | 'archived' | 'draft' = cassette.active
    ? 'active'
    : cassette.archived
      ? 'archived'
      : cassette.is_next
        ? 'next'
        : 'draft'

  const stateBadge = {
    active: { label: 'ACTIVO', cls: 'bg-red-500/30 text-red-200' },
    next: { label: 'SIGUIENTE', cls: 'bg-amber-500/30 text-amber-200' },
    draft: { label: 'BORRADOR', cls: 'bg-white/10 text-white/60' },
    archived: { label: 'ARCHIVADO', cls: 'bg-neutral-700 text-neutral-300' }
  }[state]

  return (
    <div className='mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-8 sm:py-12'>
      <Button
        asChild
        variant='ghost'
        size='sm'
        className='font-pt-mono w-fit text-xs text-white/40 hover:bg-transparent hover:text-white'
      >
        <Link href='/admin/cassettes'>
          <ArrowLeft className='h-3.5 w-3.5' />
          Volver a cassettes
        </Link>
      </Button>

      <header className='flex flex-wrap items-start justify-between gap-4'>
        <div className='min-w-0'>
          <p className='font-pt-mono text-xs tracking-[0.3em] text-red-400/70 uppercase'>Cassette</p>
          <h1 className='font-baby-doll mt-1 truncate text-4xl font-bold tracking-wider text-white uppercase sm:text-5xl'>
            {cassette.name}
          </h1>
          <div className='font-pt-mono mt-3 flex flex-wrap items-center gap-3 text-xs text-white/50'>
            <Badge className={`tracking-widest ${stateBadge.cls}`}>{stateBadge.label}</Badge>
            <span>
              <strong className='text-white'>{total}</strong>/26 slots
            </span>
            {cassette.curator_name && <span>Curador: {cassette.curator_name}</span>}
            <span>
              {formatShortDateMX(cassette.start_date)} — {formatShortDateMX(cassette.end_date)}
            </span>
          </div>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          {state === 'draft' && <MarkAsNextButton cassetteId={cassette.id} />}
          {(state === 'next' || state === 'draft') && total > 0 && (
            <PublishButton
              cassetteId={cassette.id}
              songCount={total}
              missingAudio={missingAudioCount}
            />
          )}
          {state !== 'active' && (
            <DeleteButton
              cassetteId={cassette.id}
              hasSongs={total > 0}
            />
          )}
        </div>
      </header>

      {missingAudioCount > 0 && state !== 'archived' && (
        <Alert className='border-amber-400/30 bg-amber-500/10 text-amber-200'>
          <UploadCloud />
          <AlertTitle className='font-pt-mono text-amber-200'>
            {missingAudioCount} canción{missingAudioCount === 1 ? '' : 'es'} sin MP3
          </AlertTitle>
          <AlertDescription className='font-pt-mono text-amber-300/80'>
            <p>
              Algunos slots solo tienen un link externo (Spotify/YouTube) y no se pueden reproducir. Sube el MP3 desde
              el ícono <UploadCloud className='inline h-3 w-3 align-middle' /> en cada fila. Sin esto el cassette no se
              puede publicar.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {state === 'next' && total < 26 && (
        <Alert className='border-amber-400/20 bg-amber-500/5 text-amber-300'>
          <Sparkles />
          <AlertTitle className='font-pt-mono text-amber-200'>Recibiendo propuestas</AlertTitle>
          <AlertDescription className='font-pt-mono text-amber-300/80'>
            <p>
              Las propuestas que aceptes en{' '}
              <Link
                href='/admin/propuestas'
                className='underline hover:text-amber-200'
              >
                Propuestas
              </Link>{' '}
              caerán aquí.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {state === 'draft' && (
        <Alert className='border-white/10 bg-white/3 text-white/70'>
          <AlertDescription className='font-pt-mono text-white/60'>
            <p>
              Este cassette es un <strong className='text-white'>borrador</strong>. Márcalo como siguiente para empezar
              a recibir propuestas aceptadas, o publícalo directo si ya tiene canciones.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {total > 0 && (
        <Card className={`border ${overLimit ? 'border-red-500/40 bg-red-500/10' : 'border-white/10 bg-white/3'}`}>
          <CardContent className='space-y-3'>
            <div className='flex flex-wrap items-baseline justify-between gap-2'>
              <div>
                <p className='font-pt-mono text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase'>
                  Duración total
                </p>
                <p
                  className={`font-baby-doll mt-1 text-3xl font-bold tracking-wider uppercase ${
                    overLimit ? 'text-red-300' : 'text-white'
                  }`}
                >
                  {formatTime(sumKnown)}
                  <span className='ml-2 text-base text-white/30'>/ {formatTime(limitSeconds)}</span>
                </p>
              </div>
              <div className='text-right'>
                <p className='font-pt-mono text-[10px] tracking-widest text-white/40 uppercase'>
                  {knownCount}/{total} con duración
                </p>
                {unknownCount > 0 && (
                  <p className='font-pt-mono text-[10px] text-amber-300/80'>{unknownCount} sin duración (no cuenta)</p>
                )}
              </div>
            </div>

            <Progress
              value={pct}
              className={`h-2 bg-white/5 *:data-[slot=progress-indicator]:transition-all ${
                overLimit
                  ? '*:data-[slot=progress-indicator]:bg-red-500'
                  : pct > 90
                    ? '*:data-[slot=progress-indicator]:bg-amber-500'
                    : '*:data-[slot=progress-indicator]:bg-emerald-500'
              }`}
            />

            {overLimit && (
              <p className='font-pt-mono text-[11px] text-red-300'>
                ⚠ El cassette excede el límite de {durationLimitMinutes} min por {formatTime(sumKnown - limitSeconds)}.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {state === 'active' && total > 0 && (
        <Alert
          variant='destructive'
          className='border-red-500/30 bg-red-500/10 text-red-200'
        >
          <AlertCircle />
          <AlertTitle className='font-pt-mono text-red-200'>Editando cassette activo</AlertTitle>
          <AlertDescription className='font-pt-mono text-red-200/80'>
            <p>
              Cualquier cambio de duración o canción que quites impactará lo que la gente está escuchando ahora mismo en
              la home.
            </p>
          </AlertDescription>
        </Alert>
      )}

      <CassetteSides
        cassetteId={cassette.id}
        songs={cassetteSongs}
        canRemove={state !== 'archived'}
      />

      {total === 0 && (
        <Card className='border-dashed border-white/10 bg-transparent py-12'>
          <CardContent className='text-center'>
            <Music2 className='mx-auto mb-3 h-8 w-8 text-white/20' />
            <p className='font-pt-mono text-sm text-white/40'>
              Cassette vacío. Acepta propuestas en{' '}
              <Link
                href='/admin/propuestas'
                className='underline hover:text-white'
              >
                Propuestas
              </Link>{' '}
              para llenarlo.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
