interface ProfilePhotoProps {
  photoUrl: string | null
  displayName: string
}

export default function ProfilePhoto({ photoUrl, displayName }: ProfilePhotoProps) {
  if (!photoUrl) {
    return (
      <div className='flex h-28 w-28 items-center justify-center bg-red-600/80 sm:h-32 sm:w-32'>
        <span className='font-baby-doll text-4xl text-white'>{displayName.charAt(0).toUpperCase()}</span>
      </div>
    )
  }

  return (
    <div className='relative h-50 w-50 overflow-hidden'>
    {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photoUrl}
        alt={displayName}
        className='h-full w-full object-cover'
      />
      {/* Red tint overlay */}
      <div className='absolute inset-0 bg-red-600/40 mix-blend-multiply' />
    </div>
  )
}
