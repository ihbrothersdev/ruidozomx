'use client'

import { logEvent } from '@/app/analytics/actions'
import { AdminButton } from '@/app/admin/_components/kit'
import { Dialog, DialogContent, DialogTitle } from '@/app/components/ui/dialog'
import { PlatformIcon } from '@/app/components/ui/platform-icon'
import { getAnonSessionId } from '@/lib/analytics/session'
import { Copy, Share2 } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

interface CompartirModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Optional context — where the share originated (e.g. 'ticket', 'home', 'perfil'). */
  source?: string
  /** Optional song/cassette context if the share happens while listening. */
  songId?: string | null
  cassetteId?: string | null
}

export default function CompartirModal({ open, onOpenChange, source, songId, cassetteId }: CompartirModalProps) {
  const [copied, setCopied] = useState(false)
  const shareUrl = 'ruidozo.mx'
  const fullUrl = `https://${shareUrl}`
  const shareText = 'Únete al movimiento. Haz ruido.'

  function trackShare(channel: string) {
    void logEvent({
      type: 'share_click',
      songId: songId ?? null,
      cassetteId: cassetteId ?? null,
      sessionId: getAnonSessionId() || null,
      metadata: { channel, source }
    }).catch(() => {})
  }

  const handleCopy = async () => {
    trackShare('copy_link')
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
        trackShare('native_share')
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
        className='admin-hard max-h-[90vh] overflow-y-auto border-2 border-admin-ink bg-admin-surface p-0 text-admin-ink sm:max-w-4xl'
        showCloseButton={false}
      >
        <DialogTitle className='sr-only'>Compartir</DialogTitle>

        {/* Content */}
        <div className='flex flex-col items-center px-8 py-8'>
          <h2 className='font-baby-doll text-4xl text-admin-ink'>Compartir</h2>

          {/* Share icons row + URL */}
          <div className='mt-4 flex flex-col items-center gap-2 text-center'>
            <div className='flex items-center gap-3'>
              <button
                onClick={handleShare}
                aria-label='Compartir'
                title='Compartir'
                className='flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-admin-red text-admin-red transition-colors hover:bg-admin-red hover:text-admin-surface'
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
                  onClick={() => trackShare(p.key)}
                  className='flex h-9 w-9 items-center justify-center rounded-full border-2 border-admin-ink text-admin-ink transition-colors hover:bg-admin-ink hover:text-admin-paper'
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
                className='flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-admin-ink text-admin-ink transition-colors hover:bg-admin-ink hover:text-admin-paper'
              >
                <Copy className='h-4 w-4' />
              </button>
            </div>
            <p className='font-pt-mono text-xs tracking-wider text-admin-ink-soft'>
              {copied ? '¡Link copiado!' : shareUrl}
            </p>
          </div>

          {/* Images section */}
          <div className='mt-6 flex items-end justify-center gap-4 sm:gap-6'>
            {/* Post */}
            <div className='flex flex-col items-center gap-2'>
              <Image
                src='/assets/compartir/post.png'
                alt='Post para compartir'
                width={1080}
                height={1350}
                className='h-auto w-28 border-2 border-admin-ink sm:w-40 lg:w-52'
              />
              <a
                href='/assets/compartir/post.png'
                download='ruidozo-post.png'
                className='font-pt-mono cursor-pointer text-[10px] font-bold tracking-wider text-admin-ink uppercase underline-offset-2 transition-opacity hover:underline'
              >
                Descargar Post
              </a>
            </div>

            {/* Reel / Stories */}
            <div className='flex flex-col items-center gap-2'>
              <Image
                src='/assets/compartir/reel.png'
                alt='Reel para compartir'
                width={1080}
                height={1920}
                className='h-auto w-28 border-2 border-admin-ink sm:w-40 lg:w-52'
              />
              <a
                href='/assets/compartir/reel.png'
                download='ruidozo-reel.png'
                className='font-pt-mono cursor-pointer text-[10px] font-bold tracking-wider text-admin-ink uppercase underline-offset-2 transition-opacity hover:underline'
              >
                Descargar Reel/Stories
              </a>
            </div>
          </div>

          {/* Cancel button */}
          <AdminButton
            variant='primary'
            onClick={() => onOpenChange(false)}
            className='mt-6'
          >
            Cancelar
          </AdminButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}
