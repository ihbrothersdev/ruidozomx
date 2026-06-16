'use client'

import { finalizeAddSong, prepareAddSong, searchBandasByName } from '@/app/admin/actions'
import { Button } from '@/app/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/app/components/ui/dialog'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'
import { uploadAudioToSignedUrl } from '@/lib/audio-upload'
import { CheckCircle2, Loader2, Music2, Plus, Search, UploadCloud } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { sileo } from 'sileo'

const ERROR_LABELS: Record<string, string> = {
  faltan_datos: 'Completa los campos requeridos.',
  lado_invalido: 'Lado inválido.',
  posicion_invalida: 'La posición debe estar entre 1 y 14.',
  archivo_vacio: 'El archivo está vacío.',
  archivo_muy_grande: 'El archivo supera el límite de 30 MB.',
  tipo_no_soportado: 'Formato no soportado. Usa MP3, WAV o M4A.',
  cassette_no_encontrado: 'Cassette no encontrado.',
  banda_no_encontrada: 'La banda vinculada ya no existe.',
  slot_ocupado: 'Ese slot ya tiene una canción. Elige otra posición.',
  no_se_pudo_preparar: 'No se pudo preparar la subida. Intenta de nuevo.'
}

type BandaResult = { id: string; displayName: string; slug: string; photoUrl: string | null }

type Side = 'A' | 'B'
type Slot = { side: Side; position: number }

function detectDuration(file: File): Promise<number | null> {
  return new Promise(resolve => {
    const audio = document.createElement('audio')
    audio.preload = 'metadata'
    const url = URL.createObjectURL(file)
    audio.src = url
    const cleanup = () => URL.revokeObjectURL(url)
    audio.addEventListener('loadedmetadata', () => {
      const d = Math.round(audio.duration)
      cleanup()
      resolve(Number.isFinite(d) && d > 0 ? d : null)
    })
    audio.addEventListener('error', () => {
      cleanup()
      resolve(null)
    })
  })
}

function parseDurationInput(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  if (/^\d+$/.test(trimmed)) return Number(trimmed)
  const m = trimmed.match(/^(\d+):([0-5]?\d)$/)
  if (!m) return null
  return Number(m[1]) * 60 + Number(m[2])
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function AddSongModal({ cassetteId, occupied }: { cassetteId: string; occupied: Slot[] }) {
  const [open, setOpen] = useState(false)
  const [side, setSide] = useState<Side>('A')
  const [position, setPosition] = useState<string>('')
  const [file, setFile] = useState<File | null>(null)
  const [durationInput, setDurationInput] = useState('')
  const [detectingDuration, setDetectingDuration] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [artist, setArtist] = useState('')
  const [bandaProfile, setBandaProfile] = useState<BandaResult | null>(null)

  // Auto-detect the track length when a file is picked and pre-fill the field;
  // the admin can still overwrite it. Detection reads the local file, so it's
  // independent of the upload.
  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.files?.[0] ?? null
    setFile(next)
    setDurationInput('')
    if (!next) return
    setDetectingDuration(true)
    const seconds = await detectDuration(next)
    setDetectingDuration(false)
    if (seconds) setDurationInput(formatDuration(seconds))
  }

  const availablePositions = useMemo(() => {
    const taken = new Set(occupied.filter(s => s.side === side).map(s => s.position))
    return Array.from({ length: 14 }, (_, i) => i + 1).filter(p => !taken.has(p))
  }, [occupied, side])

  // Default the position to the first free slot whenever the side changes or
  // the modal opens — admins almost always want the next empty position.
  function resetForSide(nextSide: Side) {
    setSide(nextSide)
    const taken = new Set(occupied.filter(s => s.side === nextSide).map(s => s.position))
    const firstFree = Array.from({ length: 14 }, (_, i) => i + 1).find(p => !taken.has(p))
    setPosition(firstFree ? String(firstFree) : '')
  }

  function onOpenChange(next: boolean) {
    setOpen(next)
    if (next) {
      setFile(null)
      setDurationInput('')
      setArtist('')
      setBandaProfile(null)
      resetForSide('A')
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (submitting) return

    const formEl = e.currentTarget
    const fd = new FormData(formEl)
    const title = ((fd.get('title') as string) ?? '').trim()
    const genre = ((fd.get('genre') as string) ?? '').trim() || null

    if (!file) {
      sileo.error({
        title: 'Falta el MP3',
        description: 'Sube un archivo MP3, WAV o M4A.',
        position: 'top-center',
        duration: 4000
      })
      return
    }

    const positionNum = Number(position)
    const trimmedArtist = artist.trim()
    const sharedSong = {
      cassetteId,
      title,
      artist: trimmedArtist,
      artistProfileId: bandaProfile?.id ?? null,
      side,
      position: positionNum
    }

    // The field is pre-filled from auto-detection on file select; fall back to
    // a fresh sniff only if it's still empty (e.g. detection hadn't finished).
    const durationSeconds = parseDurationInput(durationInput) ?? (await detectDuration(file))

    setSubmitting(true)

    const fail = (error: string) => {
      setSubmitting(false)
      sileo.error({
        title: 'No se pudo agregar',
        description: ERROR_LABELS[error] ?? error,
        position: 'top-center',
        duration: 5000
      })
    }

    const prep = await prepareAddSong({
      ...sharedSong,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size
    })
    if (!prep.ok) return fail(prep.error)

    const uploaded = await uploadAudioToSignedUrl(prep.key, prep.token, file)
    if (!uploaded.ok) return fail(uploaded.error)

    const res = await finalizeAddSong({ ...sharedSong, genre, durationSeconds, key: prep.key })
    setSubmitting(false)

    if (res.ok) {
      sileo.success({
        title: 'Canción agregada',
        description: `Lado ${side} · #${position}`,
        position: 'top-center',
        duration: 3000
      })
      setOpen(false)
      formEl.reset()
      setFile(null)
      setDurationInput('')
      setArtist('')
      setBandaProfile(null)
    } else {
      sileo.error({
        title: 'No se pudo agregar',
        description: ERROR_LABELS[res.error] ?? res.error,
        position: 'top-center',
        duration: 5000
      })
    }
  }

  const noFreeSlots = availablePositions.length === 0
  const sideAFree = occupied.filter(s => s.side === 'A').length < 14
  const sideBFree = occupied.filter(s => s.side === 'B').length < 14
  const cassetteFull = !sideAFree && !sideBFree

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogTrigger asChild>
        <Button
          size='lg'
          disabled={cassetteFull}
          className='font-pt-mono bg-red-600 text-xs tracking-wide text-white uppercase hover:bg-red-500 disabled:opacity-40'
        >
          <Plus className='h-4 w-4' />
          {cassetteFull ? 'Cassette lleno' : 'Agregar canción'}
        </Button>
      </DialogTrigger>

      <DialogContent className='border-white/10 bg-neutral-900 text-white sm:max-w-lg'>
        <DialogHeader className='text-left'>
          <p className='font-pt-mono text-[10px] font-bold tracking-[0.25em] text-red-400 uppercase'>Nueva canción</p>
          <DialogTitle className='font-baby-doll text-2xl tracking-wider text-white uppercase'>
            Agregar al cassette
          </DialogTitle>
          <DialogDescription className='font-pt-mono text-xs text-white/40'>
            La canción se sube directo al bucket de audio y queda lista para reproducir.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={onSubmit}
          className='space-y-4'
        >
          <BandaAutocomplete
            value={artist}
            selected={bandaProfile}
            onChange={next => {
              setArtist(next)
              if (bandaProfile && next !== bandaProfile.displayName) {
                setBandaProfile(null)
              }
            }}
            onSelect={banda => {
              setBandaProfile(banda)
              setArtist(banda.displayName)
            }}
          />

          <Field
            label='Título de la rola'
            name='title'
            placeholder='Vampiro'
            required
          />

          <Field
            label='Género (opcional)'
            name='genre'
            placeholder='Punk, garage…'
          />

          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-1.5'>
              <Label className='font-pt-mono text-[10px] font-bold tracking-widest text-white/50 uppercase'>
                Lado <span className='ml-1 text-red-400'>*</span>
              </Label>
              <Select
                value={side}
                onValueChange={v => resetForSide(v as Side)}
              >
                <SelectTrigger className='font-pt-mono border-white/10 bg-white/3 text-sm text-white'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className='border-white/10 bg-neutral-900 text-white'>
                  <SelectItem
                    value='A'
                    disabled={!sideAFree}
                  >
                    Lado A {!sideAFree && '(lleno)'}
                  </SelectItem>
                  <SelectItem
                    value='B'
                    disabled={!sideBFree}
                  >
                    Lado B {!sideBFree && '(lleno)'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-1.5'>
              <Label className='font-pt-mono text-[10px] font-bold tracking-widest text-white/50 uppercase'>
                Posición <span className='ml-1 text-red-400'>*</span>
              </Label>
              <Select
                value={position}
                onValueChange={setPosition}
                disabled={noFreeSlots}
              >
                <SelectTrigger className='font-pt-mono border-white/10 bg-white/3 text-sm text-white'>
                  <SelectValue placeholder={noFreeSlots ? 'Lado lleno' : 'Elige #'} />
                </SelectTrigger>
                <SelectContent className='border-white/10 bg-neutral-900 text-white'>
                  {availablePositions.map(p => (
                    <SelectItem
                      key={p}
                      value={String(p)}
                    >
                      #{p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='space-y-1.5'>
            <Label className='font-pt-mono text-[10px] font-bold tracking-widest text-white/50 uppercase'>
              Archivo de audio <span className='ml-1 text-red-400'>*</span>
            </Label>
            <label className='font-pt-mono flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-white/15 bg-white/3 px-3 py-3 text-xs text-white/60 transition-colors hover:border-white/30 hover:text-white'>
              <input
                type='file'
                accept='audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/m4a,audio/mp4'
                className='hidden'
                onChange={onFileChange}
              />
              {file ? <Music2 className='h-4 w-4 text-emerald-400' /> : <UploadCloud className='h-4 w-4' />}
              <span className='truncate'>{file ? file.name : 'MP3, WAV o M4A (máx. 30 MB)'}</span>
            </label>
          </div>

          <Field
            label={detectingDuration ? 'Duración (detectando…)' : 'Duración (opcional · auto-detectada)'}
            name='duration_input'
            placeholder='3:42'
            value={durationInput}
            onChange={setDurationInput}
          />

          <DialogFooter className='gap-2 border-t border-white/5 pt-4'>
            <Button
              type='button'
              variant='ghost'
              onClick={() => setOpen(false)}
              className='font-pt-mono text-xs tracking-wider text-white/60 uppercase hover:bg-white/5 hover:text-white'
            >
              Cancelar
            </Button>
            <Button
              type='submit'
              disabled={submitting || !position || !file || !artist.trim()}
              className='font-pt-mono bg-red-600 text-xs tracking-wider text-white uppercase hover:bg-red-500 disabled:opacity-40'
            >
              {submitting && <Loader2 className='mr-1 h-3.5 w-3.5 animate-spin' />}
              {submitting ? 'Subiendo…' : 'Agregar canción'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function BandaAutocomplete({
  value,
  selected,
  onChange,
  onSelect
}: {
  value: string
  selected: BandaResult | null
  onChange: (next: string) => void
  onSelect: (banda: BandaResult) => void
}) {
  const [results, setResults] = useState<BandaResult[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selected) {
      setResults([])
      return
    }
    const query = value.trim()
    if (query.length < 2) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    const t = setTimeout(async () => {
      const res = await searchBandasByName(query)
      setLoading(false)
      if (res.ok) setResults(res.results)
    }, 250)
    return () => clearTimeout(t)
  }, [value, selected])

  const showDropdown = open && !selected && value.trim().length >= 2

  return (
    <div className='space-y-1.5'>
      <Label
        htmlFor='add-song-artist'
        className='font-pt-mono text-[10px] font-bold tracking-widest text-white/50 uppercase'
      >
        Banda / artista <span className='ml-1 text-red-400'>*</span>
      </Label>
      <div className='relative'>
        <Input
          id='add-song-artist'
          name='artist'
          placeholder='Toxico Saico'
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            // Delay so a click on a dropdown item registers before close.
            window.setTimeout(() => setOpen(false), 150)
          }}
          autoComplete='off'
          required
          className='font-pt-mono border-white/10 bg-white/3 pr-9 text-sm text-white placeholder:text-white/30 focus-visible:border-red-500/50 focus-visible:ring-red-500/20'
        />
        <span className='pointer-events-none absolute top-1/2 right-3 -translate-y-1/2'>
          {selected ? (
            <CheckCircle2 className='h-4 w-4 text-emerald-400' />
          ) : loading ? (
            <Loader2 className='h-4 w-4 animate-spin text-white/30' />
          ) : (
            <Search className='h-4 w-4 text-white/30' />
          )}
        </span>

        {showDropdown && (
          <div className='absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-white/10 bg-neutral-900 shadow-xl'>
            {results.length === 0 && !loading && (
              <p className='font-pt-mono px-3 py-2 text-[11px] text-white/40'>
                Sin coincidencias. Se guardará como texto libre.
              </p>
            )}
            {results.map(banda => (
              <button
                key={banda.id}
                type='button'
                onMouseDown={e => e.preventDefault()}
                onClick={() => {
                  onSelect(banda)
                  setOpen(false)
                }}
                className='flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-white/5'
              >
                {banda.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={banda.photoUrl}
                    alt=''
                    className='h-7 w-7 shrink-0 rounded-full object-cover'
                  />
                ) : (
                  <span className='font-pt-mono flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-white/60'>
                    {banda.displayName.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className='font-pt-mono truncate text-xs text-white'>{banda.displayName}</span>
                <span className='font-pt-mono ml-auto shrink-0 text-[10px] text-white/30'>@{banda.slug}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {selected ? (
        <p className='font-pt-mono text-[10px] text-emerald-400/80'>
          Vinculado a perfil de <strong className='text-emerald-300'>{selected.displayName}</strong>.
        </p>
      ) : (
        <p className='font-pt-mono text-[10px] text-white/30'>
          Si la banda tiene perfil en Ruidozo, selecciónala. Si no, se guarda como texto libre.
        </p>
      )}
    </div>
  )
}

function Field({
  label,
  name,
  type = 'text',
  placeholder,
  required,
  value,
  onChange
}: {
  label: string
  name: string
  type?: string
  placeholder?: string
  required?: boolean
  value?: string
  onChange?: (next: string) => void
}) {
  return (
    <div className='space-y-1.5'>
      <Label
        htmlFor={`add-song-${name}`}
        className='font-pt-mono text-[10px] font-bold tracking-widest text-white/50 uppercase'
      >
        {label}
        {required && <span className='ml-1 text-red-400'>*</span>}
      </Label>
      <Input
        id={`add-song-${name}`}
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange ? e => onChange(e.target.value) : undefined}
        className='font-pt-mono border-white/10 bg-white/3 text-sm text-white placeholder:text-white/30 focus-visible:border-red-500/50 focus-visible:ring-red-500/20'
      />
    </div>
  )
}
