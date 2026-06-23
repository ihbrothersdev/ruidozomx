'use client'

import Image from 'next/image'

interface ProfilePhotoProps {
  photoUrl: string | null
  displayName: string
  /** Render a "Cambiar foto" overlay and wire up the file input. */
  editable?: boolean
  onPhotoSelected?: (file: File) => void
}

export default function ProfilePhoto({ photoUrl, displayName, editable = false, onPhotoSelected }: ProfilePhotoProps) {
  const initial = displayName.charAt(0).toUpperCase() || '?'

  const frame = (
    <>
      <Image
        src='/assets/registro/formulario/shared/marco-foto.png'
        alt='Marco de foto'
        fill
        className='object-contain'
      />
      <div className='absolute inset-x-[4%] top-[12%] bottom-[14%] overflow-hidden'>
        {photoUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={photoUrl}
            alt={displayName}
            className='h-full w-full object-cover'
          />
        ) : (
          <div className='flex h-full w-full items-center justify-center bg-[#e8b4a8]'>
            <span className='font-baby-doll text-4xl font-bold text-black/40 uppercase'>{initial}</span>
          </div>
        )}
        {editable && (
          <div className='pointer-events-none absolute inset-0 flex items-end justify-center bg-black/0 pb-2 opacity-0 transition-opacity group-hover/photo:bg-black/40 group-hover/photo:opacity-100'>
            <span className='font-pt-mono rounded-sm bg-black/70 px-2 py-1 text-[10px] font-bold tracking-wider text-white uppercase'>
              Cambiar
            </span>
          </div>
        )}
      </div>
    </>
  )

  if (!editable) {
    return (
      <div
        className='relative shrink-0'
        style={{ width: 150, height: 190 }}
      >
        {frame}
      </div>
    )
  }

  return (
    <label
      className='group/photo relative block shrink-0 cursor-pointer'
      style={{ width: 150, height: 190 }}
    >
      <input
        type='file'
        accept='image/*'
        className='hidden'
        onChange={e => {
          const file = e.target.files?.[0]
          if (file && onPhotoSelected) onPhotoSelected(file)
        }}
      />
      {frame}
    </label>
  )
}
