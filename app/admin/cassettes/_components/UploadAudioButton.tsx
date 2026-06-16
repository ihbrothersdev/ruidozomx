'use client'

import { finalizeSongAudio, prepareSongAudioUpload } from '@/app/admin/actions'
import { Button } from '@/app/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/components/ui/tooltip'
import { uploadAudioToSignedUrl } from '@/lib/audio-upload'
import { Loader2, UploadCloud } from 'lucide-react'
import { useRef, useState } from 'react'
import { sileo } from 'sileo'

const ERROR_LABELS: Record<string, string> = {
  faltan_datos: 'Faltan datos.',
  archivo_vacio: 'El archivo está vacío.',
  archivo_muy_grande: 'El archivo supera el límite de 30 MB.',
  tipo_no_soportado: 'Formato no soportado. Usa MP3, WAV o M4A.',
  cancion_no_encontrada: 'La canción ya no existe.',
  cassette_mismatch: 'La canción pertenece a otro cassette.',
  no_se_pudo_preparar: 'No se pudo preparar la subida. Intenta de nuevo.'
}

export function UploadAudioButton({
  songId,
  cassetteId,
  playable
}: {
  songId: string
  cassetteId: string
  playable: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState(false)

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setPending(true)

    const fail = (error: string) => {
      setPending(false)
      sileo.error({
        title: 'Error al subir',
        description: ERROR_LABELS[error] ?? error,
        position: 'top-center',
        duration: 5000
      })
    }

    const prep = await prepareSongAudioUpload({
      songId,
      cassetteId,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size
    })
    if (!prep.ok) return fail(prep.error)

    const uploaded = await uploadAudioToSignedUrl(prep.key, prep.token, file)
    if (!uploaded.ok) return fail(uploaded.error)

    const res = await finalizeSongAudio({ songId, cassetteId, key: prep.key })
    setPending(false)

    if (res.ok) {
      sileo.success({
        title: 'MP3 subido',
        description: 'La canción ya es reproducible.',
        position: 'top-center',
        duration: 3000
      })
    } else {
      sileo.error({
        title: 'Error al subir',
        description: ERROR_LABELS[res.error] ?? res.error,
        position: 'top-center',
        duration: 5000
      })
    }
  }

  const tone = playable
    ? 'text-emerald-400/60 hover:bg-emerald-500/10 hover:text-emerald-300'
    : 'text-amber-300 hover:bg-amber-500/10 hover:text-amber-200'
  const tip = playable ? 'Reemplazar el MP3' : 'Subir el MP3 (este slot solo tiene un link externo)'

  return (
    <>
      <input
        ref={inputRef}
        type='file'
        accept='audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/m4a,audio/mp4'
        className='hidden'
        onChange={onFile}
      />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type='button'
              variant='ghost'
              size='icon-sm'
              disabled={pending}
              onClick={() => inputRef.current?.click()}
              className={`transition-colors ${tone} ${pending ? 'animate-pulse' : ''}`}
            >
              {pending ? <Loader2 className='h-3.5 w-3.5 animate-spin' /> : <UploadCloud className='h-3.5 w-3.5' />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{tip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  )
}
