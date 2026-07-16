'use client'

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
    <div className='admin-hard relative h-full w-full overflow-hidden border-2 border-admin-ink bg-admin-surface'>
      {photoUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={photoUrl}
          alt={displayName}
          className='h-full w-full object-cover'
        />
      ) : (
        <div className='flex h-full w-full items-center justify-center bg-admin-surface-2'>
          <span className='font-baby-doll text-5xl font-bold text-admin-ink-faint uppercase'>{initial}</span>
        </div>
      )}
      {editable && (
        <div className='pointer-events-none absolute inset-0 flex items-end justify-center pb-2 opacity-0 transition-opacity group-hover/photo:bg-admin-ink/40 group-hover/photo:opacity-100'>
          <span className='admin-dymo px-2 py-1 text-[10px] leading-none'>Cambiar</span>
        </div>
      )}
    </div>
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
