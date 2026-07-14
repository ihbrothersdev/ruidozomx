'use client'

import { createCassette } from '@/app/admin/actions'
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
import { AdminButton, LabelTag } from '../../_components/kit'

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
        <AdminButton
          variant='primary'
          size='lg'
        >
          <Plus className='h-4 w-4' />
          Nuevo cassette
        </AdminButton>
      </DialogTrigger>

      <DialogContent className='border-admin-ink bg-admin-surface text-admin-ink admin-hard border-2 sm:max-w-lg'>
        <DialogHeader className='text-left'>
          <LabelTag tone='red'>Nuevo cassette</LabelTag>
          <DialogTitle className='font-baby-doll text-admin-ink mt-2 text-2xl tracking-wider uppercase'>
            Crear borrador
          </DialogTitle>
          <DialogDescription className='font-pt-mono text-admin-ink-soft text-xs'>
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
            className='border-admin-ink bg-admin-paper hover:bg-admin-paper-deep flex cursor-pointer items-start gap-3 border-2 p-3 transition-colors'
          >
            <Checkbox
              id='mark-as-next'
              name='mark_as_next'
              defaultChecked
              className='border-admin-ink data-[state=checked]:border-admin-red data-[state=checked]:bg-admin-red data-[state=checked]:text-admin-surface mt-0.5'
            />
            <div className='space-y-0.5'>
              <p className='font-pt-mono text-admin-ink text-xs font-bold uppercase'>Marcar como siguiente</p>
              <p className='font-pt-mono text-admin-ink-soft text-[11px] font-normal'>
                Las propuestas aceptadas caerán en este cassette en vez del activo.
              </p>
            </div>
          </Label>

          <DialogFooter className='border-admin-ink/15 gap-2 border-t pt-4'>
            <AdminButton
              type='button'
              variant='ghost'
              onClick={() => setOpen(false)}
            >
              Cancelar
            </AdminButton>
            <AdminButton
              type='submit'
              variant='primary'
              disabled={submitting}
            >
              {submitting ? 'Creando…' : 'Crear cassette'}
            </AdminButton>
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
        className='font-pt-mono text-admin-ink-soft text-[10px] font-bold tracking-widest uppercase'
      >
        {label}
        {required && <span className='text-admin-red ml-1'>*</span>}
      </Label>
      <Input
        id={`field-${name}`}
        type={type}
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={required}
        className='font-pt-mono border-admin-ink bg-admin-paper text-admin-ink placeholder:text-admin-ink-faint focus-visible:border-admin-red focus-visible:ring-admin-red/20 border-2 text-sm'
      />
    </div>
  )
}
