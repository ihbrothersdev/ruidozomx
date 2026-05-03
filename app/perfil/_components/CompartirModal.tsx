'use client'

import { Dialog, DialogContent, DialogTitle } from '@/app/components/ui/dialog'
import { PlatformIcon } from '@/app/components/ui/platform-icon'
import { Copy, Share2 } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

interface CompartirModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CompartirModal({ open, onOpenChange }: CompartirModalProps) {
  const [copied, setCopied] = useState(false)
  const shareUrl = 'ruidozo.mx'
  const fullUrl = `https://${shareUrl}`
  const shareText = 'Únete al movimiento. Haz ruido.'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback silently
    }
  }

  const handleShare = async () => {
    const shareData = { title: 'Ruidozo', text: shareText, url: fullUrl }
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share(shareData)
        return
      } catch {
        // User cancelled or share failed — fall through to copy
      }
    }
    handleCopy()
  }

  const encodedUrl = encodeURIComponent(fullUrl)
  const encodedText = encodeURIComponent(shareText)
  const platforms = [
    { key: 'whatsapp', label: 'WhatsApp', href: `https://wa.me/?text=${encodedText}%20${encodedUrl}` },
    { key: 'facebook', label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    {
      key: 'mail',
      label: 'Email',
      href: `mailto:?subject=${encodeURIComponent('Ruidozo')}&body=${encodedText}%20${encodedUrl}`
    }
  ] as const

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        className='max-h-[90vh] overflow-y-auto border-none bg-transparent p-0 shadow-none sm:max-w-4xl'
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
            className='absolute inset-0 h-full w-full object-fill'
            unoptimized
          />

          {/* Content */}
          <div className='relative z-10 flex flex-col items-center px-8 pt-4 pb-6'>
            {/* Title image */}
            <Image
              src='/assets/compartir/title.png'
              alt='Compartir'
              width={428}
              height={54}
              className='h-auto w-full max-w-72'
              unoptimized
            />

            {/* Share icons row + URL */}
            <div className='mt-4 flex flex-col items-center gap-2 text-center'>
              <div className='flex items-center gap-3'>
                <button
                  onClick={handleShare}
                  aria-label='Compartir'
                  title='Compartir'
                  className='flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-red-600 text-red-600 transition-colors hover:bg-red-600 hover:text-white'
                >
                  <Share2 className='h-4 w-4' />
                </button>
                {platforms.map(p => (
                  <a
                    key={p.key}
                    href={p.href}
                    target='_blank'
                    rel='noopener noreferrer'
                    aria-label={`Compartir en ${p.label}`}
                    title={p.label}
                    className='flex h-9 w-9 items-center justify-center rounded-full border-2 border-black text-black transition-colors hover:bg-black hover:text-white'
                  >
                    <PlatformIcon
                      platform={p.key}
                      className='h-4 w-4'
                    />
                  </a>
                ))}
                <button
                  onClick={handleCopy}
                  aria-label={copied ? 'Copiado' : 'Copiar link'}
                  title={copied ? 'Copiado' : 'Copiar link'}
                  className='flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-black text-black transition-colors hover:bg-black hover:text-white'
                >
                  <Copy className='h-4 w-4' />
                </button>
              </div>
              <p className='font-pt-mono text-xs tracking-wider text-black/70'>
                {copied ? '¡Link copiado!' : shareUrl}
              </p>
            </div>

            {/* Images section */}
            <div className='mt-4 flex items-end justify-center gap-4 sm:gap-6'>
              {/* Post */}
              <div className='flex flex-col items-center gap-2'>
                <Image
                  src='/assets/compartir/post.png'
                  alt='Post para compartir'
                  width={213}
                  height={273}
                  className='h-auto w-28 sm:w-40 lg:w-52'
                  unoptimized
                />
                <a
                  href='/assets/compartir/post.png'
                  download='ruidozo-post.png'
                  className='font-pt-mono cursor-pointer text-[10px] font-bold tracking-wider text-black uppercase underline-offset-2 transition-opacity hover:underline'
                >
                  Descargar Post
                </a>
              </div>

              {/* Reel / Stories */}
              <div className='flex flex-col items-center gap-2'>
                <Image
                  src='/assets/compartir/reel.png'
                  alt='Reel para compartir'
                  width={252}
                  height={447}
                  className='h-auto w-28 sm:w-40 lg:w-52'
                  unoptimized
                />
                <a
                  href='/assets/compartir/reel.png'
                  download='ruidozo-reel.png'
                  className='font-pt-mono cursor-pointer text-[10px] font-bold tracking-wider text-black uppercase underline-offset-2 transition-opacity hover:underline'
                >
                  Descargar Reel/Stories
                </a>
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
