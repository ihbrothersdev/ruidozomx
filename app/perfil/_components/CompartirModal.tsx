'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/app/components/ui/dialog'

interface CompartirModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CompartirModal({ open, onOpenChange }: CompartirModalProps) {
  const [copied, setCopied] = useState(false)
  const shareUrl = 'ruidozo.com.mx'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`https://${shareUrl}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback silently
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className='overflow-hidden border-none bg-transparent p-0 shadow-none sm:max-w-4xl'
        showCloseButton={false}
      >
        <DialogTitle className='sr-only'>Compartir</DialogTitle>

        <div className='relative'>
          {/* Membrete background */}
          <Image
            src='/assets/membrete-background.png'
            alt=''
            width={600}
            height={500}
            className='h-auto w-full'
            unoptimized
          />

          {/* Content overlay */}
          <div className='absolute inset-0 flex flex-col items-center px-8 pt-4 pb-6'>
            {/* Title image */}
            <Image
              src='/assets/compartir/title.png'
              alt='Compartir'
              width={428}
              height={54}
              className='h-auto w-full max-w-72'
              unoptimized
            />

            {/* Copy link section */}
            <div className='mt-4 text-center'>
              <button
                onClick={handleCopy}
                className='font-pt-mono cursor-pointer text-xs font-bold tracking-wider text-black uppercase transition-opacity hover:opacity-70'
              >
                {copied ? 'Copiado!' : 'Copiar link'}
              </button>
              <p className='font-pt-mono text-xs tracking-wider text-black/70'>{shareUrl}</p>
            </div>

            {/* Images section */}
            <div className='mt-4 flex flex-1 items-center justify-center gap-4 sm:gap-6'>
              {/* Post */}
              <div className='flex flex-col items-center gap-2'>
                <Image
                  src='/assets/compartir/post.png'
                  alt='Post para compartir'
                  width={213}
                  height={273}
                  className='h-auto'
                  unoptimized
                />
                <span className='font-pt-mono text-[10px] font-bold tracking-wider text-black uppercase'>
                  Post
                </span>
              </div>

              {/* Reel / Stories */}
              <div className='flex flex-col items-center gap-2'>
                <Image
                  src='/assets/compartir/reel.png'
                  alt='Reel para compartir'
                  width={252}
                  height={447}
                  className='h-auto'
                  unoptimized
                />
                <span className='font-pt-mono text-[10px] font-bold tracking-wider text-black uppercase'>
                  Reel/Stories
                </span>
              </div>
            </div>

            {/* Cancel button */}
            <button
              onClick={() => onOpenChange(false)}
              className='font-pt-mono mt-3 cursor-pointer rounded-sm bg-red-600 px-6 py-2 text-xs font-bold tracking-wider text-white uppercase transition-colors hover:bg-red-700 active:scale-95'
            >
              Cancelar
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
