'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/app/components/ui/dialog'
import { Input } from '@/app/components/ui/input'
import { Checkbox } from '@/app/components/ui/checkbox'
import { Label } from '@/app/components/ui/label'
import { sileo } from 'sileo'
import { submitSongProposal } from '../actions'

interface ProponerRolaBandaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bandName: string
  showVibes?: boolean
}

const VIBES = [
  'Joyita escondida',
  'Clásico',
  'Raza',
  'Psicodélica',
  'Nostálgica',
  'Oscura',
  'Hipnótica',
  'Para manejar de noche',
  'Madrugada',
  'Última del bar',
  'Nuevo descubrimiento'
]

const inputCls =
  'h-auto max-w-full rounded-none border-2 border-red-600 bg-transparent px-3 py-1.5 font-pt-mono text-sm text-black shadow-none placeholder:text-black/30 focus-visible:border-red-800 focus-visible:ring-0'

export default function ProponerRolaBandaModal({ open, onOpenChange, bandName, showVibes = true }: ProponerRolaBandaModalProps) {
  const [artistName, setArtistName] = useState('')
  const [songName, setSongName] = useState('')
  const [listenLink, setListenLink] = useState('')
  const [selectedVibes, setSelectedVibes] = useState<string[]>([])
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const isBandPrefilled = bandName.trim().length > 0
  const artist = isBandPrefilled ? bandName : artistName
  const canSubmit = songName.trim().length > 0 && artist.trim().length > 0

  const toggleVibe = (vibe: string) => {
    setSelectedVibes(prev => (prev.includes(vibe) ? prev.filter(v => v !== vibe) : [...prev, vibe]))
  }

  async function handleSubmit() {
    if (!canSubmit) return
    setSending(true)
    const result = await submitSongProposal({
      title: songName,
      artist,
      externalLink: listenLink || undefined,
      vibes: showVibes && selectedVibes.length > 0 ? selectedVibes : undefined
    })
    setSending(false)
    if (result.error) {
      sileo.error({ title: 'Error', description: result.error, position: 'top-center', duration: 4000 })
    } else {
      setSent(true)
      setSongName('')
      setListenLink('')
      setArtistName('')
      setSelectedVibes([])
      setTimeout(() => {
        setSent(false)
        onOpenChange(false)
      }, 2500)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        className='max-h-[90vh] overflow-y-auto border-none bg-transparent p-0 shadow-none sm:max-w-2xl'
        showCloseButton={false}
      >
        <DialogTitle className='sr-only'>Proponer rola de esta banda</DialogTitle>

        <div className='relative'>
          {sent ? (
            <div className='flex items-center justify-center p-6'>
              <Image
                src='/assets/success-propon-rola.png'
                alt='Rola propuesta'
                width={500}
                height={400}
                className='h-auto w-full max-w-md'
                unoptimized
              />
            </div>
          ) : (
          <div className='relative min-h-full'>
            <Image
              src='/assets/membrete-background.png'
              alt=''
              width={600}
              height={500}
              className='absolute inset-0 h-full w-full object-fill'
              unoptimized
            />

            {/* Content */}
            <div className='relative z-10 flex flex-col items-center pt-4 pr-6 pb-6 pl-15 sm:pr-10 sm:pl-28'>
              {/* Title image */}
              <Image
                src='/assets/proponer-rola-sm.png'
                alt='Propón una rola'
                width={315}
                height={57}
                className='h-auto w-full max-w-64 sm:max-w-72'
                unoptimized
              />

              {/* Subtitle */}
              <p className='font-pt-mono text-md mt-3 text-center leading-tight tracking-wider text-red-600'>
                Esta rola se va a la fila de curaduría
                <br />
                del casete semanal
              </p>

              {/* Form */}
              <div className='mt-5 w-full space-y-4'>
                {/* Banda/Proyecto */}
                <div className='space-y-1'>
                  <Label className='font-pt-mono text-sm font-bold tracking-wider text-black uppercase'>
                    {isBandPrefilled ? `Banda/Proyecto: ${bandName}` : 'Banda/Proyecto'}
                  </Label>
                  {!isBandPrefilled && (
                    <Input
                      value={artistName}
                      onChange={e => setArtistName(e.target.value)}
                      placeholder='Nombre de la banda o proyecto'
                      className={inputCls}
                    />
                  )}
                </div>

                {/* Nombre de la rola */}
                <div className='space-y-1'>
                  <Label className='font-pt-mono text-sm font-bold tracking-wider text-black uppercase'>
                    Nombre de la rola
                  </Label>
                  <Input
                    value={songName}
                    onChange={e => setSongName(e.target.value)}
                    placeholder=''
                    className={inputCls}
                  />
                </div>

                {/* Link de escucha */}
                <div className='space-y-1'>
                  <Label className='font-pt-mono text-sm font-bold tracking-wider text-black uppercase'>
                    Link de escucha
                  </Label>
                  <Input
                    value={listenLink}
                    onChange={e => setListenLink(e.target.value)}
                    type='url'
                    placeholder='Spotify, YouTube, Bandcamp, SoundCloud o link directo'
                    className={inputCls}
                  />
                </div>

                {/* Vibes section — only shown when showVibes is true */}
                {showVibes && (
                  <div className='space-y-2'>
                    <p className='font-pt-mono text-sm font-bold tracking-wider text-black uppercase'>¿Qué te vibra?</p>
                    <div className='flex flex-col gap-1.5'>
                      {VIBES.map(vibe => (
                        <div
                          key={vibe}
                          className='flex items-center gap-2'
                        >
                          <Checkbox
                            id={`vibe-${vibe}`}
                            checked={selectedVibes.includes(vibe)}
                            onCheckedChange={() => toggleVibe(vibe)}
                            className='h-4 w-4 rounded-none border-1 border-red-600 data-[state=checked]:border-red-600 data-[state=checked]:bg-red-600'
                          />
                          <Label
                            htmlFor={`vibe-${vibe}`}
                            className='font-pt-mono cursor-pointer text-xs tracking-wider text-black'
                          >
                            {vibe}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className='mt-5 flex items-center gap-3'>
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit || sending}
                  className='font-pt-mono cursor-pointer rounded-sm bg-black px-6 py-2 text-xs font-bold tracking-wider text-white uppercase transition-colors hover:bg-black/80 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  {sending ? 'Enviando...' : 'Enviar'}
                </button>
                <button
                  onClick={() => onOpenChange(false)}
                  className='font-pt-mono cursor-pointer rounded-sm bg-red-600 px-6 py-2 text-xs font-bold tracking-wider text-white uppercase transition-colors hover:bg-red-700 active:scale-95'
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
