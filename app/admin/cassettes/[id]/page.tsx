import { Progress } from '@/app/components/ui/progress'
import { extractStorageKey, isPlayableAudio } from '@/lib/audio'
import { isCassetteConcatReady, type SongOffset } from '@/lib/cassette'
import { createClient } from '@/lib/supabase/server'
import { formatShortDateMX } from '@/lib/utils'
import { AlertCircle, ArrowLeft, Music2, Sparkles, UploadCloud } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AddSongModal } from '../_components/AddSongModal'
import { CassetteSides, type CassetteSong } from '../_components/CassetteSides'
import { DeleteButton, MarkAsNextButton, MigrateAudioButton, PublishButton } from '../_components/CassetteActions'
import { AdminButton, EmptyState, LabelTag, Notice, Paper, Stamp } from '../../_components/kit'
import type { Tone } from '../../_components/kit'

const SONGS_BUCKET = 'songs'

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
    .select('id, title, artist, side, position, audio_url, proposal_id, duration_seconds')
    .eq('cassette_id', id)
    .order('side', { ascending: true })
    .order('position', { ascending: true })

  // `songs.plays` is a stale column that nobody updates anymore; the source of
  // truth for plays lives in `song_events` (same table the analytics page reads).
  // We aggregate `play_start` events per song so the cassette detail matches
  // what /admin/metricas shows.
  const songIds = (songs ?? []).map(s => s.id)
  const { data: playEvents } = songIds.length
    ? await supabase.from('song_events').select('song_id').eq('type', 'play_start').in('song_id', songIds)
    : { data: [] as { song_id: string | null }[] }
  const playsBySongId = new Map<string, number>()
  for (const ev of playEvents ?? []) {
    if (!ev.song_id) continue
    playsBySongId.set(ev.song_id, (playsBySongId.get(ev.song_id) ?? 0) + 1)
  }

  const total = (songs ?? []).length
  const cassetteSongs: CassetteSong[] = (songs ?? []).map(s => ({
    id: s.id,
    title: s.title,
    artist: s.artist,
    side: s.side as 'A' | 'B',
    position: s.position,
    plays: playsBySongId.get(s.id) ?? 0,
    audioUrl: s.audio_url ?? null,
    durationSeconds: s.duration_seconds ?? null
  }))
  const missingAudio = cassetteSongs.filter(s => !isPlayableAudio(s.audioUrl))
  const missingAudioCount = missingAudio.length

  // The single concatenated audio (`npm run build-cassette`) must exist and match
  // the current track order before the cassette can be published. Gates the
  // Publicar button; goes stale when songs are added, removed, or reordered.
  const concatReady = isCassetteConcatReady(
    cassette.concat_audio_url,
    cassette.song_offsets as SongOffset[] | null,
    cassetteSongs
  )
  // The audio exists but no longer matches the layout — surface the rebuild hint.
  const concatStale = Boolean(cassette.concat_audio_url) && cassetteSongs.length > 0 && !concatReady

  const unorganizedAudioCount = cassetteSongs.filter(s => {
    const key = extractStorageKey(s.audioUrl, SONGS_BUCKET)
    return key !== null && !key.startsWith(`${cassette.id}/`)
  }).length

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
    active: { label: 'ACTIVO', tone: 'red' as Tone },
    next: { label: 'SIGUIENTE', tone: 'gold' as Tone },
    draft: { label: 'BORRADOR', tone: 'ink' as Tone },
    archived: { label: 'ARCHIVADO', tone: 'ink' as Tone }
  }[state]

  return (
    <div className='mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-8 sm:py-12'>
      <AdminButton
        asChild
        variant='ghost'
        size='sm'
        className='w-fit'
      >
        <Link href='/admin/cassettes'>
          <ArrowLeft className='h-3.5 w-3.5' />
          Volver a cassettes
        </Link>
      </AdminButton>

      <header className='flex flex-wrap items-start justify-between gap-4'>
        <div className='min-w-0'>
          <LabelTag tone='red'>Cassette</LabelTag>
          <h1 className='font-baby-doll text-admin-ink mt-3 truncate text-4xl leading-[0.85] font-bold tracking-wide uppercase sm:text-6xl'>
            {cassette.name}
          </h1>
          <div className='bg-admin-red mt-2 h-[3px] w-24' />
          <div className='font-pt-mono text-admin-ink-soft mt-3 flex flex-wrap items-center gap-3 text-xs'>
            <Stamp tone={stateBadge.tone}>{stateBadge.label}</Stamp>
            <span>
              <strong className='text-admin-ink'>{total}</strong>/{Math.max(26, total)} slots
            </span>
            {cassette.curator_name && <span>Curador: {cassette.curator_name}</span>}
            <span>
              {formatShortDateMX(cassette.start_date)} — {formatShortDateMX(cassette.end_date)}
            </span>
          </div>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          {state !== 'archived' && (
            <AddSongModal
              cassetteId={cassette.id}
              occupied={cassetteSongs.map(s => ({ side: s.side, position: s.position }))}
            />
          )}
          {state === 'draft' && <MarkAsNextButton cassetteId={cassette.id} />}
          {(state === 'next' || state === 'draft' || state === 'archived') && total > 0 && (
            <PublishButton
              cassetteId={cassette.id}
              songCount={total}
              missingAudio={missingAudioCount}
              concatReady={concatReady}
              isArchived={state === 'archived'}
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
        <Notice
          tone='gold'
          icon={UploadCloud}
          title={`${missingAudioCount} canción${missingAudioCount === 1 ? '' : 'es'} sin MP3`}
        >
          <p>
            Algunos slots solo tienen un link externo (Spotify/YouTube) y no se pueden reproducir. Sube el MP3 desde el
            ícono <UploadCloud className='inline h-3 w-3 align-middle' /> en cada fila. Sin esto el cassette no se puede
            publicar.
          </p>
        </Notice>
      )}

      {concatStale && state !== 'archived' && (
        <Notice
          tone='gold'
          icon={AlertCircle}
          title='Audio desfasado del orden actual'
        >
          <p>
            Reordenaste o cambiaste canciones, así que el audio del cassette ya no coincide. Regéneralo antes de
            publicar: <code className='bg-admin-paper-deep text-admin-ink px-1'>npm run build-cassette {cassette.id}</code>{' '}
            y recarga.
          </p>
        </Notice>
      )}

      {unorganizedAudioCount > 0 && state !== 'archived' && (
        <Notice
          tone='ink'
          icon={Music2}
          title={`${unorganizedAudioCount} archivo${unorganizedAudioCount === 1 ? '' : 's'} en la raíz del bucket`}
          action={
            <MigrateAudioButton
              cassetteId={cassette.id}
              count={unorganizedAudioCount}
            />
          }
        >
          <p>
            Estos MP3s viven en <code className='bg-admin-paper-deep text-admin-ink px-1'>songs/</code> directamente. Los
            puedes reorganizar a{' '}
            <code className='bg-admin-paper-deep text-admin-ink px-1'>
              songs/{cassette.id.slice(0, 8)}…/artista-titulo.mp3
            </code>{' '}
            con un solo clic. Es seguro: mueve los archivos y actualiza las URLs atómicamente.
          </p>
        </Notice>
      )}

      {state === 'next' && total < 26 && (
        <Notice
          tone='gold'
          icon={Sparkles}
          title='Recibiendo propuestas'
        >
          <p>
            Las propuestas que aceptes en{' '}
            <Link
              href='/admin/propuestas'
              className='text-admin-ink underline'
            >
              Propuestas
            </Link>{' '}
            caerán aquí.
          </p>
        </Notice>
      )}

      {state === 'draft' && (
        <Notice tone='ink'>
          <p>
            Este cassette es un <strong className='text-admin-ink'>borrador</strong>. Márcalo como siguiente para empezar
            a recibir propuestas aceptadas, o publícalo directo si ya tiene canciones.
          </p>
        </Notice>
      )}

      {total > 0 && (
        <Paper
          tone={overLimit ? 'red' : undefined}
          className='space-y-3 p-5'
        >
          <div className='flex flex-wrap items-baseline justify-between gap-2'>
            <div>
              <p className='font-pt-mono text-admin-ink-soft text-[10px] font-bold tracking-[0.3em] uppercase'>
                Duración total
              </p>
              <p
                className={`font-baby-doll mt-1 text-3xl font-bold tracking-wider uppercase ${
                  overLimit ? 'text-admin-red' : 'text-admin-ink'
                }`}
              >
                {formatTime(sumKnown)}
                <span className='text-admin-ink-faint ml-2 text-base'>/ {formatTime(limitSeconds)}</span>
              </p>
            </div>
            <div className='text-right'>
              <p className='font-pt-mono text-admin-ink-soft text-[10px] tracking-widest uppercase'>
                {knownCount}/{total} con duración
              </p>
              {unknownCount > 0 && (
                <p className='font-pt-mono text-admin-gold text-[10px]'>{unknownCount} sin duración (no cuenta)</p>
              )}
            </div>
          </div>

          <Progress
            value={pct}
            className={`bg-admin-ink/12 h-2 *:data-[slot=progress-indicator]:transition-all ${
              overLimit
                ? '*:data-[slot=progress-indicator]:bg-admin-red'
                : pct > 90
                  ? '*:data-[slot=progress-indicator]:bg-admin-gold'
                  : '*:data-[slot=progress-indicator]:bg-admin-olive'
            }`}
          />

          {overLimit && (
            <p className='font-pt-mono text-admin-red text-[11px]'>
              ⚠ El cassette excede el límite de {durationLimitMinutes} min por {formatTime(sumKnown - limitSeconds)}.
            </p>
          )}
        </Paper>
      )}

      {state === 'active' && total > 0 && (
        <Notice
          tone='red'
          icon={AlertCircle}
          title='Editando cassette activo'
        >
          <p>
            Cualquier cambio de duración o canción que quites impactará lo que la gente está escuchando ahora mismo en
            la home.
          </p>
        </Notice>
      )}

      <CassetteSides
        cassetteId={cassette.id}
        songs={cassetteSongs}
        canRemove={state !== 'archived'}
      />

      {total === 0 && (
        <EmptyState icon={Music2}>
          Cassette vacío. Acepta propuestas en{' '}
          <Link
            href='/admin/propuestas'
            className='text-admin-ink underline'
          >
            Propuestas
          </Link>{' '}
          para llenarlo.
        </EmptyState>
      )}
    </div>
  )
}
