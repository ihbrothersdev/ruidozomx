'use client'

import { createCassette } from '@/app/admin/actions'
import { Button } from '@/app/components/ui/button'
import { Checkbox } from '@/app/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/app/components/ui/dialog'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Plus } from 'lucide-react'
import { useState } from 'react'

export function CreateCassetteModal() {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Date defaults are computed once when the component mounts. Wrapping them
  // in lazy `useState` keeps the render function pure and avoids ESLint's
  // `react-hooks/purity` warning. We don't need to update them — `<Input
  // defaultValue>` only reads on mount.
  const [today] = useState(() => new Date().toISOString().slice(0, 10))
  const [inAMonth] = useState(() => new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10))

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <Button
          size='lg'
          className='font-pt-mono bg-red-600 text-xs tracking-wide text-white uppercase hover:bg-red-500'
        >
          <Plus className='h-4 w-4' />
          Nuevo cassette
        </Button>
      </DialogTrigger>

      <DialogContent className='border-white/10 bg-neutral-900 text-white sm:max-w-lg'>
        <DialogHeader className='text-left'>
          <p className='font-pt-mono text-[10px] font-bold tracking-[0.25em] text-red-400 uppercase'>Nuevo cassette</p>
          <DialogTitle className='font-baby-doll text-2xl tracking-wider text-white uppercase'>
            Crear borrador
          </DialogTitle>
          <DialogDescription className='font-pt-mono text-xs text-white/40'>
            Define los datos básicos. Podrás llenar las canciones después.
          </DialogDescription>
        </DialogHeader>

        <form
          action={createCassette}
          onSubmit={() => setSubmitting(true)}
          className='space-y-4'
        >
          <Field
            label='Nombre'
            name='name'
            placeholder='Cassette 2.0'
            required
          />

          <div className='grid gap-4 sm:grid-cols-2'>
            <Field
              label='Inicio'
              name='start_date'
              type='date'
              defaultValue={today}
              required
            />
            <Field
              label='Fin'
              name='end_date'
              type='date'
              defaultValue={inAMonth}
              required
            />
          </div>

          <div className='grid gap-4 sm:grid-cols-2'>
            <Field
              label='Duración (min)'
              name='duration_minutes'
              type='number'
              defaultValue='90'
            />
            <Field
              label='Curador (opcional)'
              name='curator_name'
              placeholder='Tu nombre'
            />
          </div>

          <Label
            htmlFor='mark-as-next'
            className='flex cursor-pointer items-start gap-3 rounded-lg border border-white/10 bg-white/3 p-3 transition-colors hover:bg-white/6'
          >
            <Checkbox
              id='mark-as-next'
              name='mark_as_next'
              defaultChecked
              className='mt-0.5 border-white/30 data-[state=checked]:border-red-500 data-[state=checked]:bg-red-500'
            />
            <div className='space-y-0.5'>
              <p className='font-pt-mono text-xs font-bold text-white uppercase'>Marcar como siguiente</p>
              <p className='font-pt-mono text-[11px] font-normal text-white/40'>
                Las propuestas aceptadas caerán en este cassette en vez del activo.
              </p>
            </div>
          </Label>

          <DialogFooter className='gap-2 border-t border-white/5 pt-4'>
            <Button
              type='button'
              variant='ghost'
              onClick={() => setOpen(false)}
              className='font-pt-mono text-xs tracking-wider text-white/60 uppercase hover:bg-white/5 hover:text-white'
            >
              Cancelar
            </Button>
            <Button
              type='submit'
              disabled={submitting}
              className='font-pt-mono bg-red-600 text-xs tracking-wider text-white uppercase hover:bg-red-500'
            >
              {submitting ? 'Creando…' : 'Crear cassette'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Field({
  label,
  name,
  type = 'text',
  placeholder,
  defaultValue,
  required
}: {
  label: string
  name: string
  type?: string
  placeholder?: string
  defaultValue?: string
  required?: boolean
}) {
  return (
    <div className='space-y-1.5'>
      <Label
        htmlFor={`field-${name}`}
        className='font-pt-mono text-[10px] font-bold tracking-widest text-white/50 uppercase'
      >
        {label}
        {required && <span className='ml-1 text-red-400'>*</span>}
      </Label>
      <Input
        id={`field-${name}`}
        type={type}
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={required}
        className='font-pt-mono border-white/10 bg-white/3 text-sm text-white placeholder:text-white/30 focus-visible:border-red-500/50 focus-visible:ring-red-500/20'
      />
    </div>
  )
}
