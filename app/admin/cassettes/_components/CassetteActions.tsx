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
import { Button } from '@/app/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/components/ui/tooltip'
import { Disc3, FolderTree, Loader2, Sparkles, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { sileo } from 'sileo'

export function MarkAsNextButton({ cassetteId }: { cassetteId: string }) {
  return (
    <form action={setNextCassette}>
      <input
        type='hidden'
        name='cassette_id'
        value={cassetteId}
      />
      <Button
        type='submit'
        variant='outline'
        className='font-pt-mono border-amber-400/40 bg-amber-500/10 text-xs tracking-wide text-amber-200 uppercase hover:bg-amber-500/20 hover:text-amber-100'
      >
        <Sparkles className='h-3.5 w-3.5' />
        Marcar como siguiente
      </Button>
    </form>
  )
}

export function PublishButton({
  cassetteId,
  songCount,
  missingAudio = 0
}: {
  cassetteId: string
  songCount: number
  missingAudio?: number
}) {
  const formRef = useRef<HTMLFormElement>(null)
  const lowCount = songCount < 10
  const blocked = missingAudio > 0

  if (blocked) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0}>
              <Button
                disabled
                className='font-pt-mono cursor-not-allowed bg-red-600/30 text-xs tracking-wide text-white/60 uppercase'
              >
                <Disc3 className='h-3.5 w-3.5' />
                Publicar
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            Sube el MP3 de {missingAudio} canción{missingAudio === 1 ? '' : 'es'} antes de publicar
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className='font-pt-mono bg-red-600 text-xs tracking-wide text-white uppercase hover:bg-red-500'>
          <Disc3 className='h-3.5 w-3.5' />
          Publicar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className='border-white/10 bg-neutral-900 text-white'>
        <AlertDialogHeader>
          <AlertDialogTitle className='font-baby-doll text-xl tracking-wider uppercase'>
            Publicar cassette
          </AlertDialogTitle>
          <AlertDialogDescription className='font-pt-mono text-white/60'>
            {lowCount
              ? `Este cassette solo tiene ${songCount} canciones. ¿Publicarlo igual? Archivará el activo actual y empezará a sonar en la home.`
              : `Esto archivará el cassette activo actual y empezará a sonar éste en la home. ¿Continuar?`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className='font-pt-mono border-white/10 bg-transparent text-white/70 hover:bg-white/5 hover:text-white'>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => formRef.current?.requestSubmit()}
            className='font-pt-mono bg-red-600 text-white uppercase hover:bg-red-500'
          >
            Sí, publicar
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
        <Button
          variant='outline'
          className='font-pt-mono border-white/10 bg-transparent text-xs tracking-wide text-white/50 uppercase hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300'
        >
          <Trash2 className='h-3.5 w-3.5' />
          Eliminar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className='border-white/10 bg-neutral-900 text-white'>
        <AlertDialogHeader>
          <AlertDialogTitle className='font-baby-doll text-xl tracking-wider uppercase'>
            Eliminar cassette
          </AlertDialogTitle>
          <AlertDialogDescription className='font-pt-mono text-white/60'>
            {hasSongs
              ? 'Se borrarán sus canciones y las propuestas regresarán a pendientes. Esta acción no se puede deshacer.'
              : 'El cassette está vacío. Se eliminará permanentemente.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className='font-pt-mono border-white/10 bg-transparent text-white/70 hover:bg-white/5 hover:text-white'>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => formRef.current?.requestSubmit()}
            className='font-pt-mono bg-red-600 text-white uppercase hover:bg-red-500'
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
              <Button
                type='button'
                variant='ghost'
                size='icon-sm'
                className='text-white/40 transition-colors hover:bg-red-500/20 hover:text-red-300'
              >
                <Trash2 className='h-3.5 w-3.5' />
              </Button>
            </AlertDialogTrigger>
          </TooltipTrigger>
          <TooltipContent>Quitar del cassette y regresar a pendientes</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <AlertDialogContent className='border-white/10 bg-neutral-900 text-white'>
        <AlertDialogHeader>
          <AlertDialogTitle className='font-baby-doll text-xl tracking-wider uppercase'>
            Quitar canción
          </AlertDialogTitle>
          <AlertDialogDescription className='font-pt-mono text-white/60'>
            Su propuesta regresará a pendientes y podrás volver a colocarla en otro slot.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className='font-pt-mono border-white/10 bg-transparent text-white/70 hover:bg-white/5 hover:text-white'>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => formRef.current?.requestSubmit()}
            className='font-pt-mono bg-red-600 text-white uppercase hover:bg-red-500'
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
      sileo.error({
        title: 'Reorganización parcial',
        description: parts.join(' · '),
        position: 'top-center',
        duration: 5000
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
    <Button
      type='button'
      onClick={onClick}
      disabled={pending}
      variant='outline'
      size='sm'
      className='font-pt-mono border-white/20 bg-white/5 text-xs tracking-wide text-white uppercase hover:bg-white/10'
    >
      {pending ? <Loader2 className='h-3.5 w-3.5 animate-spin' /> : <FolderTree className='h-3.5 w-3.5' />}
      Reorganizar {count} archivo{count === 1 ? '' : 's'}
    </Button>
  )
}
