'use client'

import { Checkbox } from '@/app/components/ui/checkbox'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { uploadAudioToSignedUrl } from '@/lib/audio-upload'
import type { Role } from '@/lib/types'
import { Cloud, Headphones, Music2, Upload } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { audioErrorMessage } from '../../perfil/audio-errors'
import { prepareProposalAudioUpload, submitProposal } from '../actions'
import { inputCls, labelCls } from '../constants'
import { FormField } from './FormField'
import { SubmitButton } from './SubmitButton'

const helperCls = 'font-pt-mono text-[11px] font-bold tracking-wide text-red-600 uppercase'

export function ProponerRolaContent({
  role,
  slotsMessage = null
}: {
  role: Role | null
  /** Set when the band is out of slots — explains how many rolas have to go. */
  slotsMessage?: string | null
}) {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const success = searchParams.get('success') === 'true'
  const limitReached = slotsMessage !== null
  const [accepted, setAccepted] = useState(false)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(success)

  // MP3 — obligatorio para banda, opcional para el resto
  const isBanda = role === 'banda'
  const submitDisabled = (isBanda && !accepted) || limitReached || (isBanda && !audioFile)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (limitReached) return
    const fd = new FormData(e.currentTarget)

    // The MP3 is mandatory only for bandas (their own material). Others may
    // propose with just a link, as before.
    if (isBanda && !audioFile) {
      setFormError('Sube el MP3 de tu rola para enviar la propuesta.')
      return
    }
    setFormError(null)
    setSubmitting(true)

    // When a file is attached, upload it via a signed URL first and pass the
    // public URL to the action (which redirects on success).
    if (audioFile) {
      const prep = await prepareProposalAudioUpload({
        fileName: audioFile.name,
        fileType: audioFile.type,
        fileSize: audioFile.size,
        artist: String(fd.get('artist') ?? ''),
        title: String(fd.get('title') ?? '')
      })
      if (!prep.ok) {
        setSubmitting(false)
        setFormError(audioErrorMessage(prep.error))
        return
      }

      const upload = await uploadAudioToSignedUrl(prep.key, prep.token, audioFile)
      if (!upload.ok) {
        setSubmitting(false)
        setFormError('No se pudo subir el MP3. Intenta de nuevo.')
        return
      }

      fd.set('audio_url', prep.publicUrl)
    }

    await submitProposal(fd)
  }

  return (
    <div className='relative min-h-screen overflow-hidden'>
      {/* Red background */}
      <Image
        src='/assets/registro/proponer-rola/red-back.png'
        alt=''
        fill
        className='object-cover'
        priority
      />

      <div className='relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-6 sm:px-6'>
        {/* Top nav — right aligned */}
        <div className='mb-4 flex w-full items-start justify-end gap-2'>
          <Link href='/perfil'>
            <Image
              src='/assets/registro/proponer-rola/boton-mi-cuenta.png'
              alt='Mi Cuenta'
              width={140}
              height={40}
              className='w-24 transition-opacity hover:opacity-80 sm:w-28'
              style={{ height: 'auto' }}
            />
          </Link>
          <Link href='/'>
            <Image
              src='/assets/registro/proponer-rola/boton-home.png'
              alt='Casete actual'
              width={140}
              height={40}
              className='w-24 transition-opacity hover:opacity-80 sm:w-28'
              style={{ height: 'auto' }}
            />
          </Link>
        </div>

        {/* Grey folder form */}
        <div className='relative w-full flex-1'>
          <Image
            src='/assets/registro/proponer-rola/folder-gris.png'
            alt=''
            fill
            className='object-fill'
          />

          <div className='relative z-10 p-6 sm:p-8 lg:p-10'>
            {/* Etiqueta ROLA */}
            <Image
              src='/assets/registro/proponer-rola/etiqueta-rola.png'
              alt='Rola'
              width={140}
              height={50}
              className='mb-6 w-24 sm:w-28'
              style={{ height: 'auto' }}
            />

            <p className='font-pt-mono mb-6 text-sm leading-snug font-bold tracking-wide text-black uppercase'>
              Para participar en el cassete necesitamos escuchar tu canción y contar con el archivo MP3
            </p>

            {error && (
              <div className='font-pt-mono mb-4 rounded border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700'>
                {error}
              </div>
            )}

            <form
              className='space-y-5'
              onSubmit={handleSubmit}
            >
              <FormField
                label='Nombre proyecto'
                name='artist'
                required
              />
              <FormField
                label='Nombre de la rola'
                name='title'
                required
              />

              {/* Link para escuchar */}
              <div className='space-y-1'>
                <div className='flex items-start gap-2'>
                  <Headphones
                    className='mt-0.5 h-4 w-4 shrink-0 text-red-600'
                    strokeWidth={2.5}
                  />
                  <div>
                    <p className={labelCls}>Link para escuchar la canción*</p>
                    <p className={helperCls}>Spotify, YouTube, Bandcamp o cualquier plataforma pública</p>
                  </div>
                </div>
                <Input
                  id='external_link'
                  name='external_link'
                  type='url'
                  required
                  className={inputCls}
                />
              </div>

              {/* MP3 — highlighted dropzone panel */}
              <div className='rounded-md border border-red-600/30 bg-red-600/5 p-4 sm:p-5'>
                <div className='mb-4 flex items-start gap-2'>
                  <Music2
                    className='mt-0.5 h-5 w-5 shrink-0 text-red-600'
                    strokeWidth={2.5}
                  />
                  <div>
                    <p className={labelCls}>Archivo MP3 para el casete{isBanda ? '*' : ' (opcional)'}</p>
                    <p className={helperCls}>Sube directamente el archivo MP3 que utilizaremos para el casete</p>
                  </div>
                </div>

                <div className='flex flex-col gap-4 sm:flex-row'>
                  <label className='flex flex-1 cursor-pointer flex-col items-center justify-center gap-1 border-2 border-red-600 bg-white/50 px-4 py-8 text-center transition-colors hover:bg-white/80'>
                    <Upload
                      className='mb-1 h-7 w-7 text-red-600'
                      strokeWidth={2.5}
                    />
                    <span className='font-pt-mono text-sm font-bold tracking-wider text-black uppercase'>
                      Elegir archivo MP3
                    </span>
                    <span className='font-pt-mono max-w-full truncate text-[11px] tracking-wider text-black/60 uppercase'>
                      {audioFile
                        ? `${audioFile.name} · ${(audioFile.size / (1024 * 1024)).toFixed(1)} MB`
                        : 'Formatos permitidos MP3'}
                    </span>
                    <input
                      type='file'
                      accept='.mp3,audio/mpeg,audio/mp3'
                      onChange={e => setAudioFile(e.target.files?.[0] ?? null)}
                      className='hidden'
                    />
                  </label>

                  <div className='sm:w-52 sm:shrink-0'>
                    <p className='font-pt-mono text-center text-sm font-bold tracking-wider text-red-600 uppercase'>
                      Importante
                    </p>
                    <ul className='mt-2 space-y-2'>
                      <li className='flex gap-1.5'>
                        <span
                          className='mt-1 h-1.5 w-1.5 shrink-0 bg-black'
                          aria-hidden
                        />
                        <span className='font-pt-mono text-[11px] font-bold tracking-wide text-black uppercase'>
                          Tu archivo está seguro y sólo lo usaremos en caso de ser seleccionado
                        </span>
                      </li>
                      <li className='flex gap-1.5'>
                        <span
                          className='mt-1 h-1.5 w-1.5 shrink-0 bg-black'
                          aria-hidden
                        />
                        <span className='font-pt-mono text-[11px] font-bold tracking-wide text-black uppercase'>
                          ¿Problemas para subir? Utiliza el enlace de descarga como alternativa
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Link de descarga — same icon + stacked title/subtitle pattern as the MP3 panel above */}
              <div className='space-y-1'>
                <div className='flex items-start gap-2'>
                  <Cloud
                    className='mt-0.5 h-4 w-4 shrink-0 text-red-600'
                    strokeWidth={2.5}
                  />
                  <div>
                    <p className={labelCls}>Link de descarga opcional</p>
                    <p className={helperCls}>
                      Úsalo solo si no puedes subir el MP3 directamente. Asegúrate de que el enlace tenga los permisos
                      abiertos y que no caduque
                    </p>
                  </div>
                </div>
                <Input
                  id='download_link'
                  name='download_link'
                  type='url'
                  placeholder='Google Drive, Dropbox, OneDrive,...'
                  className={inputCls}
                />
              </div>

              <FormField
                label='Correo de contacto'
                name='contact_email'
                required
                type='email'
              />
              <FormField
                label='Comentario opcional'
                name='comment'
                textarea
              />

              {isBanda && (
                <>
                  <div className='flex cursor-pointer items-start gap-2.5 pt-2'>
                    <Checkbox
                      id='accept-rights'
                      checked={accepted}
                      onCheckedChange={checked => setAccepted(checked === true)}
                      className='mt-0.5 h-5 w-5 rounded-none border-2 border-black/40 data-[state=checked]:border-red-600 data-[state=checked]:bg-red-600'
                    />
                    <Label
                      htmlFor='accept-rights'
                      className='font-pt-mono cursor-pointer text-xs leading-relaxed tracking-wide text-black uppercase'
                    >
                      Confirmo que soy titular de los derechos o cuento con autorización para compartir esta música, y
                      autorizo su reproducción dentro del cassette de Ru!dozo.
                    </Label>
                  </div>
                  <input
                    type='hidden'
                    name='rights_accepted'
                    value={accepted ? 'true' : 'false'}
                  />
                </>
              )}

              {slotsMessage && (
                <div className='font-pt-mono rounded border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700'>
                  {slotsMessage}{' '}
                  <Link
                    href='/perfil'
                    className='font-bold underline underline-offset-2'
                  >
                    Ir a mi perfil ↗
                  </Link>
                </div>
              )}

              {formError && (
                <div className='font-pt-mono rounded border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700'>
                  {formError}
                </div>
              )}

              {/* Submit button */}
              <div className='flex justify-end pt-2'>
                <SubmitButton
                  disabled={submitDisabled}
                  limitReached={limitReached}
                  pending={submitting}
                />
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Success modal overlay */}
      {showModal && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'
          onClick={() => setShowModal(false)}
        >
          <div
            className='relative max-w-lg cursor-default'
            onClick={e => e.stopPropagation()}
          >
            <Image
              src='/assets/registro/proponer-rola/modal-revision-propuesta.png'
              alt='Tu propuesta ya está en revisión'
              width={600}
              height={400}
              className='w-full'
              style={{ height: 'auto' }}
            />
            <div className='mt-4 flex justify-center'>
              <Link
                href='/'
                className='font-pt-mono rounded-sm bg-red-600 px-6 py-2.5 text-sm font-bold tracking-wider text-white uppercase shadow-md transition-colors hover:bg-red-500'
              >
                Ir al cassette
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
