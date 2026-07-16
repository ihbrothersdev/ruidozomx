'use client'

import { uploadAudioToSignedUrl } from '@/lib/audio-upload'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { prepareProposalAudioUpload, saveProposalAudio } from '../actions'

const AUDIO_ERROR: Record<string, string> = {
  faltan_datos: 'Falta seleccionar un archivo.',
  archivo_vacio: 'El archivo está vacío.',
  archivo_muy_grande: 'El MP3 supera el límite de 30 MB.',
  tipo_no_soportado: 'Solo se permiten archivos MP3.'
}

/**
 * Owner-only pill shown next to a proposed rola that has no MP3 yet. Reuses the
 * signed-URL upload flow (browser → `songs` bucket) so the 30 MB file never
 * passes through a Server Action body, then persists `audio_url` via saveProposalAudio.
 */
export default function ProposedSongAudioUpload({ proposalId }: { proposalId: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    setError(null)
    setBusy(true)

    const prep = await prepareProposalAudioUpload({
      proposalId,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size
    })
    if (!prep.ok) {
      setBusy(false)
      setError(AUDIO_ERROR[prep.error] ?? prep.error)
      return
    }

    const upload = await uploadAudioToSignedUrl(prep.key, prep.token, file)
    if (!upload.ok) {
      setBusy(false)
      setError('No se pudo subir el MP3. Intenta de nuevo.')
      return
    }

    const saved = await saveProposalAudio({ proposalId, audioUrl: prep.publicUrl })
    if (saved.error) {
      setBusy(false)
      setError(saved.error)
      return
    }

    setBusy(false)
    router.refresh()
  }

  const label = busy ? 'Subiendo…' : error ? 'Reintentar' : '+ MP3'

  return (
    <label
      title={error ?? 'Subir MP3'}
      className={`font-pt-mono shrink-0 border-2 px-2 py-0.5 text-[10px] font-bold tracking-wider whitespace-nowrap uppercase transition-colors ${
        busy
          ? 'cursor-wait border-admin-ink/40 text-admin-ink-faint'
          : error
            ? 'cursor-pointer border-admin-ink bg-admin-red text-admin-surface'
            : 'cursor-pointer border-admin-ink text-admin-red hover:bg-admin-red hover:text-admin-surface'
      }`}
    >
      {label}
      <input
        type='file'
        accept='.mp3,audio/mpeg,audio/mp3'
        disabled={busy}
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          // Reset so re-picking the same file after an error still fires onChange.
          e.target.value = ''
        }}
        className='hidden'
      />
    </label>
  )
}
