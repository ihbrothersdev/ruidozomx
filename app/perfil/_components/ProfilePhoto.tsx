import Image from 'next/image'

interface ProfilePhotoProps {
  photoUrl: string | null
  displayName: string
}

export default function ProfilePhoto({ photoUrl, displayName }: ProfilePhotoProps) {
  return (
    <div className='relative'>
      <Image
        src='/assets/registro/formulario/shared/marco-foto.png'
        alt='Marco de foto'
        width={200}
        height={250}
        className='h-28 w-auto sm:h-32'
        unoptimized
      />
      <div className='absolute inset-x-[4%] top-[12%] bottom-[14%] overflow-hidden'>
        {photoUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoUrl}
              alt={displayName}
              className='h-full w-full object-cover'
            />
            <div className='absolute inset-0 bg-red-600/40 mix-blend-multiply' />
          </>
        ) : (
          <div className='flex h-full w-full items-center justify-center bg-[#e8b4a8]'>
            <span className='font-baby-doll text-4xl font-bold text-black/40 uppercase'>
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
