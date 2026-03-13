'use client'

import { Label } from '@/app/components/ui/label'
import Image from 'next/image'
import { useState } from 'react'

const MAX_SIZE = 800

function resizeAndEncode(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img')
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let { width, height } = img
      if (width > MAX_SIZE || height > MAX_SIZE) {
        const ratio = Math.min(MAX_SIZE / width, MAX_SIZE / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/webp', 0.8))
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

export function PhotoUpload() {
  const [preview, setPreview] = useState<string | null>(null)
  const [photoData, setPhotoData] = useState<string>('')

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const dataUrl = await resizeAndEncode(file)
      setPreview(dataUrl)
      setPhotoData(dataUrl)
    } catch {
      setPreview(URL.createObjectURL(file))
    }
  }

  return (
    <div className='relative flex items-end gap-2 self-center lg:self-end'>
      <input
        type='hidden'
        name='photo_data'
        value={photoData}
      />
      <Image
        src='/assets/registro/formulario/shared/flecha-naranja.png'
        alt=''
        width={80}
        height={100}
        className='mb-6 hidden w-20 shrink-0 lg:block'
        style={{ height: 'auto' }}
        unoptimized
      />
      <div className='relative flex flex-col items-center lg:pr-14'>
        <Image
          src='/assets/registro/formulario/shared/broche.png'
          alt=''
          width={1400}
          height={110}
          className='absolute top-[23%] -right-10 z-20 hidden w-36 lg:block'
          style={{ height: 'auto' }}
          unoptimized
        />
        <div className='relative'>
          <Image
            src='/assets/registro/formulario/shared/marco-foto.png'
            alt='Foto de perfil'
            width={200}
            height={250}
            className='w-40 lg:w-44'
            style={{ height: 'auto' }}
            unoptimized
          />
          <div className='absolute inset-x-[4%] top-[12%] bottom-[14%] overflow-hidden bg-[#e8b4a8]'>
            {preview ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={preview}
                alt='Preview'
                className='h-full w-full object-cover'
              />
            ) : (
              <Image
                src='/assets/registro/formulario/shared/zona-foto.png'
                alt='Subir foto'
                fill
                className='object-fill opacity-60'
                unoptimized
              />
            )}
          </div>
        </div>
        <Label className='font-pt-mono mt-1 cursor-pointer text-[10px] font-bold tracking-wider text-black uppercase hover:text-black/70'>
          Foto de perfil
          <input
            type='file'
            accept='image/*'
            className='hidden'
            onChange={handleFileChange}
          />
        </Label>
      </div>
    </div>
  )
}
