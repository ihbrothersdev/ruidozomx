'use client'

import {
  deleteCassette,
  migrateCassetteAudioToFolders,
  publishCassette,
  removeSongFromCassette,
  setNextCassette
} from '@/app/admin/actions'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/app/components/ui/alert-dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/components/ui/tooltip'
import { Disc3, FolderTree, Loader2, Sparkles, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { sileo } from 'sileo'
import { AdminButton } from '@/app/admin/_components/kit'

const DIALOG_CONTENT = 'border-2 border-admin-ink bg-admin-surface text-admin-ink admin-hard'
const DIALOG_TITLE = 'font-baby-doll text-admin-ink text-xl tracking-wider uppercase'
const DIALOG_DESC = 'font-pt-mono text-admin-ink-soft'
const TOOLTIP_CLS = 'border-2 border-admin-ink bg-admin-surface text-admin-ink'

export function MarkAsNextButton({ cassetteId }: { cassetteId: string }) {
  return (
    <form action={setNextCassette}>
      <input
        type='hidden'
        name='cassette_id'
        value={cassetteId}
      />
      <AdminButton
        type='submit'
        size='lg'
        variant='outline'
        className='border-admin-gold text-admin-gold'
      >
        <Sparkles className='h-3.5 w-3.5' />
        Marcar como siguiente
      </AdminButton>
    </form>
  )
}

export function PublishButton({
  cassetteId,
  songCount,
  missingAudio = 0,
  concatReady = true,
  isArchived = false
}: {
  cassetteId: string
  songCount: number
  missingAudio?: number
  concatReady?: boolean
  isArchived?: boolean
}) {
  const formRef = useRef<HTMLFormElement>(null)
  const lowCount = songCount < 10
  const label = isArchived ? 'Reactivar' : 'Publicar'
  const blocked = missingAudio > 0 || !concatReady
  const blockMsg =
    missingAudio > 0
      ? `Sube el MP3 de ${missingAudio} canción${missingAudio === 1 ? '' : 'es'} antes de ${label.toLowerCase()}`
      : `Genera el audio del cassette primero: corre "npm run build-cassette" y recarga`
  const dialogTitle = isArchived ? 'Reactivar cassette' : 'Publicar cassette'
  const dialogConfirm = isArchived ? 'Sí, reactivar' : 'Sí, publicar'
  const dialogBody = isArchived
    ? 'Este cassette está archivado. Al reactivarlo, archivará el cassette activo actual y éste empezará a sonar en la home. ¿Continuar?'
    : lowCount
      ? `Este cassette solo tiene ${songCount} canciones. ¿Publicarlo igual? Archivará el activo actual y empezará a sonar en la home.`
      : `Esto archivará el cassette activo actual y empezará a sonar éste en la home. ¿Continuar?`

  if (blocked) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0}>
              <AdminButton
                disabled
                size='lg'
                variant='primary'
                className='cursor-not-allowed'
              >
                <Disc3 className='h-3.5 w-3.5' />
                {label}
              </AdminButton>
            </span>
          </TooltipTrigger>
          <TooltipContent className={TOOLTIP_CLS}>{blockMsg}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <AdminButton
          size='lg'
          variant='primary'
        >
          <Disc3 className='h-3.5 w-3.5' />
          {label}
        </AdminButton>
      </AlertDialogTrigger>
      <AlertDialogContent className={DIALOG_CONTENT}>
        <AlertDialogHeader>
          <AlertDialogTitle className={DIALOG_TITLE}>{dialogTitle}</AlertDialogTitle>
          <AlertDialogDescription className={DIALOG_DESC}>{dialogBody}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className='font-pt-mono border-2 border-admin-ink bg-admin-surface text-admin-ink hover:bg-admin-paper-deep'>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => formRef.current?.requestSubmit()}
            className='font-pt-mono border-2 border-admin-ink bg-admin-red text-admin-surface uppercase hover:bg-admin-red'
          >
            {dialogConfirm}
          </AlertDialogAction>
        </AlertDialogFooter>
        <form
          ref={formRef}
          action={publishCassette}
          className='hidden'
        >
          <input
            type='hidden'
            name='cassette_id'
            value={cassetteId}
          />
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function DeleteButton({ cassetteId, hasSongs }: { cassetteId: string; hasSongs: boolean }) {
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <AdminButton
          size='lg'
          variant='outline'
          className='text-admin-ink-soft hover:border-admin-red hover:text-admin-red'
        >
          <Trash2 className='h-3.5 w-3.5' />
          Eliminar
        </AdminButton>
      </AlertDialogTrigger>
      <AlertDialogContent className={DIALOG_CONTENT}>
        <AlertDialogHeader>
          <AlertDialogTitle className={DIALOG_TITLE}>Eliminar cassette</AlertDialogTitle>
          <AlertDialogDescription className={DIALOG_DESC}>
            {hasSongs
              ? 'Se borrarán sus canciones y las propuestas regresarán a pendientes. Esta acción no se puede deshacer.'
              : 'El cassette está vacío. Se eliminará permanentemente.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className='font-pt-mono border-2 border-admin-ink bg-admin-surface text-admin-ink hover:bg-admin-paper-deep'>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => formRef.current?.requestSubmit()}
            className='font-pt-mono border-2 border-admin-ink bg-admin-red text-admin-surface uppercase hover:bg-admin-red'
          >
            Sí, eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
        <form
          ref={formRef}
          action={deleteCassette}
          className='hidden'
        >
          <input
            type='hidden'
            name='cassette_id'
            value={cassetteId}
          />
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function RemoveSongButton({ songId, cassetteId }: { songId: string; cassetteId: string }) {
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <AlertDialog>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <AlertDialogTrigger asChild>
              <AdminButton
                type='button'
                variant='ghost'
                size='icon'
                className='text-admin-ink-soft hover:bg-admin-red/15 h-8 w-8 hover:text-admin-red'
              >
                <Trash2 className='h-3.5 w-3.5' />
              </AdminButton>
            </AlertDialogTrigger>
          </TooltipTrigger>
          <TooltipContent className={TOOLTIP_CLS}>Quitar del cassette y regresar a pendientes</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <AlertDialogContent className={DIALOG_CONTENT}>
        <AlertDialogHeader>
          <AlertDialogTitle className={DIALOG_TITLE}>Quitar canción</AlertDialogTitle>
          <AlertDialogDescription className={DIALOG_DESC}>
            Su propuesta regresará a pendientes y podrás volver a colocarla en otro slot.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className='font-pt-mono border-2 border-admin-ink bg-admin-surface text-admin-ink hover:bg-admin-paper-deep'>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => formRef.current?.requestSubmit()}
            className='font-pt-mono border-2 border-admin-ink bg-admin-red text-admin-surface uppercase hover:bg-admin-red'
          >
            Sí, quitar
          </AlertDialogAction>
        </AlertDialogFooter>
        <form
          ref={formRef}
          action={removeSongFromCassette}
          className='hidden'
        >
          <input
            type='hidden'
            name='song_id'
            value={songId}
          />
          <input
            type='hidden'
            name='cassette_id'
            value={cassetteId}
          />
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function MigrateAudioButton({ cassetteId, count }: { cassetteId: string; count: number }) {
  const [pending, setPending] = useState(false)

  async function onClick() {
    setPending(true)
    const fd = new FormData()
    fd.append('cassette_id', cassetteId)
    const res = await migrateCassetteAudioToFolders(fd)
    setPending(false)

    if (!res.ok) {
      sileo.error({ title: 'Error al reorganizar', description: res.error, position: 'top-center', duration: 5000 })
      return
    }

    const parts: string[] = []
    if (res.moved > 0) parts.push(`${res.moved} movida${res.moved === 1 ? '' : 's'}`)
    if (res.skipped > 0) parts.push(`${res.skipped} ya en su lugar`)
    if (res.failed > 0) parts.push(`${res.failed} falló${res.failed === 1 ? '' : 'n'}`)

    if (res.failed > 0) {
      const detail = res.failures
        .slice(0, 3)
        .map(f => `• ${f.track}: ${f.reason}`)
        .join('\n')
      const more = res.failures.length > 3 ? `\n…y ${res.failures.length - 3} más` : ''
      sileo.error({
        title: 'Reorganización parcial',
        description: `${parts.join(' · ')}\n${detail}${more}`,
        position: 'top-center',
        duration: 8000
      })
    } else {
      sileo.success({
        title: 'Archivos reorganizados',
        description: parts.join(' · ') || 'Sin cambios',
        position: 'top-center',
        duration: 4000
      })
    }
  }

  return (
    <AdminButton
      type='button'
      onClick={onClick}
      disabled={pending}
      variant='outline'
      size='sm'
    >
      {pending ? <Loader2 className='h-3.5 w-3.5 animate-spin' /> : <FolderTree className='h-3.5 w-3.5' />}
      Reorganizar {count} archivo{count === 1 ? '' : 's'}
    </AdminButton>
  )
}
