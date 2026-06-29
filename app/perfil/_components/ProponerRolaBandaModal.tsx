'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/app/components/ui/dialog'
import { Input } from '@/app/components/ui/input'
import { Checkbox } from '@/app/components/ui/checkbox'
import { Label } from '@/app/components/ui/label'
import { uploadAudioToSignedUrl } from '@/lib/audio-upload'
import { sileo } from 'sileo'
import { prepareProposalAudioUpload } from '@/app/proponer-rola/actions'
import { audioErrorMessage } from '../audio-errors'
import {
  prepareProposalAudioUpload as prepareExistingProposalAudio,
  saveProposalAudio,
  submitSongProposal,
  updateSongProposal
} from '../actions'

interface ProponerRolaBandaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bandName: string
  showVibes?: boolean
  /** When set, the modal edits this existing proposal instead of creating one. */
  proposalId?: string
  initialTitle?: string
  initialArtist?: string
  initialListenLink?: string
  initialDownloadLink?: string
  initialVibes?: string[]
  /** Edit mode: whether the proposal already has an uploaded MP3 (hides the picker). */
  initialHasAudio?: boolean
}

const VIBES = [
  'Joyita escondida',
  'Clásico',
  'Raza',
  'Psicodélica',
  'Nostálgica',
  'Oscura',
  'Hipnótica',
  'Para manejar de noche',
  'Madrugada',
  'Última del bar',
  'Nuevo descubrimiento'
]

const inputCls =
  'h-auto max-w-full rounded-none border-2 border-red-600 bg-transparent px-3 py-1.5 font-pt-mono text-sm text-black shadow-none placeholder:text-black/30 focus-visible:border-red-800 focus-visible:ring-0'

export default function ProponerRolaBandaModal({
  open,
  onOpenChange,
  bandName,
  showVibes = true,
  proposalId,
  initialTitle,
  initialArtist,
  initialListenLink,
  initialDownloadLink,
  initialVibes,
  initialHasAudio
}: ProponerRolaBandaModalProps) {
  const isEditing = Boolean(proposalId)
  const [artistName, setArtistName] = useState(initialArtist ?? '')
  const [songName, setSongName] = useState(initialTitle ?? '')
  const [listenLink, setListenLink] = useState(initialListenLink ?? '')
  const [downloadLink, setDownloadLink] = useState(initialDownloadLink ?? '')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [selectedVibes, setSelectedVibes] = useState<string[]>(initialVibes ?? [])
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const isBandPrefilled = bandName.trim().length > 0
  const artist = isBandPrefilled ? bandName : artistName
  const canSubmit = songName.trim().length > 0 && artist.trim().length > 0 && listenLink.trim().length > 0
  // Own material only. In edit mode, hide it once the rola has an MP3 — the
  // backend doesn't allow replacing an existing one.
  const showAudioField = !isBandPrefilled && (!isEditing || !initialHasAudio)

  const toggleVibe = (vibe: string) => {
    setSelectedVibes(prev => (prev.includes(vibe) ? prev.filter(v => v !== vibe) : [...prev, vibe]))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!canSubmit) return
    setSending(true)

    // When an MP3 is attached, upload it via a signed URL. Create and edit use
    // different actions: create passes the public URL into submitSongProposal;
    // edit persists it via saveProposalAudio (keyed by the existing proposal).
    let audioUrl: string | undefined
    if (audioFile) {
      const prep = isEditing
        ? await prepareExistingProposalAudio({
            proposalId: proposalId!,
            fileName: audioFile.name,
            fileType: audioFile.type,
            fileSize: audioFile.size
          })
        : await prepareProposalAudioUpload({
            fileName: audioFile.name,
            fileType: audioFile.type,
            fileSize: audioFile.size,
            artist,
            title: songName
          })
      if (!prep.ok) {
        setSending(false)
        sileo.error({
          title: 'Error',
          description: audioErrorMessage(prep.error),
          position: 'top-center',
          duration: 4000
        })
        return
      }

      const upload = await uploadAudioToSignedUrl(prep.key, prep.token, audioFile)
      if (!upload.ok) {
        setSending(false)
        sileo.error({
          title: 'Error',
          description: 'No se pudo subir el MP3. Intenta de nuevo.',
          position: 'top-center',
          duration: 4000
        })
        return
      }

      if (isEditing) {
        const saved = await saveProposalAudio({ proposalId: proposalId!, audioUrl: prep.publicUrl })
        if (saved.error) {
          setSending(false)
          sileo.error({ title: 'Error', description: saved.error, position: 'top-center', duration: 4000 })
          return
        }
      } else {
        audioUrl = prep.publicUrl
      }
    }

    const result = isEditing
      ? await updateSongProposal({
          id: proposalId!,
          title: songName,
          artist,
          externalLink: listenLink || undefined,
          downloadLink: downloadLink || undefined,
          vibes: showVibes ? selectedVibes : undefined
        })
      : await submitSongProposal({
          title: songName,
          artist,
          externalLink: listenLink || undefined,
          downloadLink: downloadLink || undefined,
          audioUrl,
          vibes: showVibes && selectedVibes.length > 0 ? selectedVibes : undefined
        })
    setSending(false)
    if (result.error) {
      sileo.error({ title: 'Error', description: result.error, position: 'top-center', duration: 4000 })
    } else {
      setSent(true)
      setSongName('')
      setListenLink('')
      setDownloadLink('')
      setArtistName('')
      setAudioFile(null)
      setSelectedVibes([])
      setTimeout(() => {
        setSent(false)
        onOpenChange(false)
      }, 2500)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        className='max-h-[90vh] overflow-y-auto border-none bg-transparent p-0 shadow-none sm:max-w-2xl'
        showCloseButton={false}
      >
        <DialogTitle className='sr-only'>Proponer rola de esta banda</DialogTitle>

        <div className='relative'>
          {sent ? (
            <div className='flex items-center justify-center p-6'>
              <Image
                src='/assets/success-propon-rola.png'
                alt='Rola propuesta'
                width={500}
                height={400}
                className='h-auto w-full max-w-md'
              />
            </div>
          ) : (
            <div className='relative min-h-full'>
              <Image
                src='/assets/membrete-background.png'
                alt=''
                width={600}
                height={500}
                className='absolute inset-0 h-full w-full object-fill'
              />

              {/* Content */}
              <div className='relative z-10 flex flex-col items-center pt-4 pr-6 pb-6 pl-15 sm:pr-10 sm:pl-28'>
                {/* Title image */}
                <Image
                  src='/assets/proponer-rola-sm.png'
                  alt='Propón una rola'
                  width={315}
                  height={57}
                  className='h-auto w-full max-w-64 sm:max-w-72'
                />

                {/* Subtitle */}
                <p className='font-pt-mono text-md mt-3 text-center leading-tight tracking-wider text-red-600'>
                  {isEditing ? (
                    <>
                      Actualiza los datos de tu rola
                      <br />
                      mientras sigue en la fila de curaduría
                    </>
                  ) : (
                    <>
                      Esta rola se va a la fila de curaduría
                      <br />
                      del casete quincenal
                    </>
                  )}
                </p>

                {/* Form */}
                <form
                  onSubmit={handleSubmit}
                  className='mt-5 w-full space-y-4'
                >
                  {/* Banda/Proyecto */}
                  <div className='space-y-1'>
                    <Label className='font-pt-mono text-sm font-bold tracking-wider text-black uppercase'>
                      {isBandPrefilled ? (
                        `Banda/Proyecto: ${bandName}`
                      ) : (
                        <>
                          Banda/Proyecto<span className='text-red-600'>*</span>
                        </>
                      )}
                    </Label>
                    {!isBandPrefilled && (
                      <Input
                        value={artistName}
                        onChange={e => setArtistName(e.target.value)}
                        placeholder='Nombre de la banda o proyecto'
                        required
                        className={inputCls}
                      />
                    )}
                  </div>

                  {/* Nombre de la rola */}
                  <div className='space-y-1'>
                    <Label className='font-pt-mono text-sm font-bold tracking-wider text-black uppercase'>
                      Nombre de la rola<span className='text-red-600'>*</span>
                    </Label>
                    <Input
                      value={songName}
                      onChange={e => setSongName(e.target.value)}
                      placeholder=''
                      required
                      className={inputCls}
                    />
                  </div>

                  {/* Link de escucha */}
                  <div className='space-y-1'>
                    <Label className='font-pt-mono text-sm font-bold tracking-wider text-black uppercase'>
                      Link de escucha<span className='text-red-600'>*</span>
                    </Label>
                    <Input
                      value={listenLink}
                      onChange={e => setListenLink(e.target.value)}
                      type='url'
                      placeholder='Spotify, YouTube, Bandcamp, SoundCloud o link directo'
                      required
                      className={inputCls}
                    />
                  </div>

                  {/* Link de descarga (opcional) */}
                  <div className='space-y-1'>
                    <Label className='font-pt-mono text-sm font-bold tracking-wider text-black uppercase'>
                      Link de descarga
                    </Label>
                    <Input
                      value={downloadLink}
                      onChange={e => setDownloadLink(e.target.value)}
                      type='url'
                      placeholder='WeTransfer, Google Drive, Dropbox o link directo (opcional)'
                      className={inputCls}
                    />
                  </div>

                  {/* MP3 — solo cuando es material propio; al recomendar otra
                      banda no tienes su archivo, así que se oculta. Siempre opcional.
                      En edición se oculta si la rola ya tiene MP3 (no se reemplaza). */}
                  {showAudioField && (
                    <div className='space-y-1'>
                      <Label className='font-pt-mono text-sm font-bold tracking-wider text-black uppercase'>
                        Archivo MP3 (opcional)
                      </Label>
                      <div className='flex flex-wrap items-center gap-3'>
                        <label className='font-pt-mono cursor-pointer border-2 border-red-600 bg-transparent px-3 py-1.5 text-xs font-bold tracking-wider text-red-600 uppercase transition-colors hover:bg-red-600 hover:text-white'>
                          Elegir archivo
                          <input
                            type='file'
                            accept='.mp3,audio/mpeg,audio/mp3'
                            onChange={e => setAudioFile(e.target.files?.[0] ?? null)}
                            className='hidden'
                          />
                        </label>
                        <span className='font-pt-mono min-w-0 flex-1 truncate text-[11px] tracking-wider text-black/60'>
                          {audioFile
                            ? `${audioFile.name} · ${(audioFile.size / (1024 * 1024)).toFixed(1)} MB`
                            : 'Sin archivo seleccionado'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Vibes section — only shown when showVibes is true */}
                  {showVibes && (
                    <div className='space-y-2'>
                      <p className='font-pt-mono text-sm font-bold tracking-wider text-black uppercase'>
                        ¿Qué te vibra?
                      </p>
                      <div className='flex flex-col gap-1.5'>
                        {VIBES.map(vibe => (
                          <div
                            key={vibe}
                            className='flex items-center gap-2'
                          >
                            <Checkbox
                              id={`vibe-${vibe}`}
                              checked={selectedVibes.includes(vibe)}
                              onCheckedChange={() => toggleVibe(vibe)}
                              className='h-4 w-4 rounded-none border-1 border-red-600 data-[state=checked]:border-red-600 data-[state=checked]:bg-red-600'
                            />
                            <Label
                              htmlFor={`vibe-${vibe}`}
                              className='font-pt-mono cursor-pointer text-xs tracking-wider text-black'
                            >
                              {vibe}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className='mt-5 flex items-center gap-3'>
                    <button
                      type='submit'
                      disabled={!canSubmit || sending}
                      className='font-pt-mono cursor-pointer rounded-sm bg-black px-6 py-2 text-xs font-bold tracking-wider text-white uppercase transition-colors hover:bg-black/80 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50'
                    >
                      {sending ? (isEditing ? 'Guardando...' : 'Enviando...') : isEditing ? 'Guardar' : 'Enviar'}
                    </button>
                    <button
                      type='button'
                      onClick={() => onOpenChange(false)}
                      className='font-pt-mono cursor-pointer rounded-sm bg-red-600 px-6 py-2 text-xs font-bold tracking-wider text-white uppercase transition-colors hover:bg-red-700 active:scale-95'
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
