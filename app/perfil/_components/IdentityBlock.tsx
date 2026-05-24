'use client'

import { Input } from '@/app/components/ui/input'
import { Textarea } from '@/app/components/ui/textarea'
import { ROLE_LABELS, type Role } from '@/lib/types'
import ProfileChips from './ProfileChips'
import { ROLE_EDITABLE_FIELDS } from './profile-constants'

interface IdentityBlockProps {
  role: Role | null
  displayName: string
  location: string
  roleProfile: Record<string, unknown> | null

  editing?: boolean
  country?: string
  state?: string
  city?: string
  onDisplayNameChange?: (next: string) => void
  onCountryChange?: (next: string) => void
  onStateChange?: (next: string) => void
  onCityChange?: (next: string) => void
  onRoleFieldChange?: (key: string, value: unknown) => void
  onRoleChange?: (next: Role) => void
}

const inputCls =
  'h-auto w-full rounded-none border-2 border-red-600 bg-transparent px-3 py-1 font-pt-mono text-sm font-bold uppercase tracking-wider text-black shadow-none placeholder:text-black/30 focus-visible:border-red-800 focus-visible:ring-0'

const smallInputCls =
  'h-auto w-full rounded-none border-2 border-red-600 bg-transparent px-2 py-1 font-pt-mono text-xs uppercase tracking-wider text-black shadow-none placeholder:text-black/30 focus-visible:border-red-800 focus-visible:ring-0'

const labelCls = 'font-pt-mono text-[11px] font-bold tracking-wider text-black/60 uppercase'

const INDUSTRY_ROLES: Role[] = ['manager', 'promotor', 'agente']

export default function IdentityBlock({
  role,
  displayName,
  location,
  roleProfile,
  editing = false,
  country = '',
  state = '',
  city = '',
  onDisplayNameChange,
  onCountryChange,
  onStateChange,
  onCityChange,
  onRoleFieldChange,
  onRoleChange
}: IdentityBlockProps) {
  const rp = roleProfile ?? {}
  const isIndustry = role !== null && INDUSTRY_ROLES.includes(role)
  const hasEditableFields = role !== null && ROLE_EDITABLE_FIELDS[role].length > 0

  const genre = typeof rp.genre === 'string' ? rp.genre : ''
  const alias = typeof rp.alias === 'string' ? rp.alias : ''
  const artistsRepresented = typeof rp.artists_represented === 'string' ? (rp.artists_represented as string) : ''

  return (
    <div className='flex h-full flex-col justify-center space-y-1'>
      {editing ? (
        <Input
          value={displayName}
          onChange={e => onDisplayNameChange?.(e.target.value)}
          placeholder='Tu nombre'
          className={inputCls + ' text-lg'}
        />
      ) : (
        <h1 className='font-pt-mono text-lg font-bold tracking-wider text-black uppercase'>{displayName}</h1>
      )}

      {editing ? (
        <div className='space-y-1 pt-1'>
          <Input
            value={country}
            onChange={e => onCountryChange?.(e.target.value)}
            placeholder='País'
            className={smallInputCls}
          />
          <Input
            value={state}
            onChange={e => onStateChange?.(e.target.value)}
            placeholder='Estado'
            className={smallInputCls}
          />
          <Input
            value={city}
            onChange={e => onCityChange?.(e.target.value)}
            placeholder='Ciudad'
            className={smallInputCls}
          />
        </div>
      ) : (
        location && <p className='font-pt-mono text-sm font-bold tracking-wider text-black uppercase'>{location}</p>
      )}

      {role && (
        <div className='pt-1'>
          {editing && isIndustry && onRoleChange ? (
            <div className='space-y-1'>
              <p className={labelCls}>Rol</p>
              <div className='flex flex-wrap gap-2'>
                {INDUSTRY_ROLES.map(r => {
                  const isOn = role === r
                  return (
                    <button
                      key={r}
                      type='button'
                      onClick={() => onRoleChange(r)}
                      aria-pressed={isOn}
                      className={
                        'font-pt-mono cursor-pointer rounded-sm px-3 py-1.5 text-[11px] font-bold tracking-wider uppercase transition-colors ' +
                        (isOn
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-black/10 text-black/40 hover:bg-black/20 hover:text-black/60')
                      }
                    >
                      {ROLE_LABELS[r]}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            <p className='font-pt-mono text-sm font-bold tracking-wider text-black uppercase'>
              Rol: {ROLE_LABELS[role] ?? role}
            </p>
          )}
        </div>
      )}

      {role === 'fan' &&
        (editing ? (
          <div className='space-y-1 pt-2'>
            <p className={labelCls}>Alias público</p>
            <Input
              value={alias}
              onChange={e => onRoleFieldChange?.('alias', e.target.value)}
              placeholder='Tu alias'
              className={smallInputCls}
            />
          </div>
        ) : alias ? (
          <p className='font-pt-mono text-sm font-bold tracking-wider text-black uppercase'>Alias público: {alias}</p>
        ) : null)}

      {role === 'banda' &&
        (editing ? (
          <div className='space-y-1 pt-2'>
            <p className={labelCls}>Género principal</p>
            <Input
              value={genre}
              onChange={e => onRoleFieldChange?.('genre', e.target.value)}
              placeholder='Ej: Rock, Punk, Electrónica…'
              className={smallInputCls}
            />
          </div>
        ) : genre ? (
          <p className='font-pt-mono text-sm font-bold tracking-wider text-black uppercase'>
            Género principal: {genre}
          </p>
        ) : null)}

      {(role === 'manager' || role === 'agente') && editing && (
        <div className='space-y-1 pt-2'>
          <p className={labelCls}>Artistas representados</p>
          <Textarea
            value={artistsRepresented}
            onChange={e => onRoleFieldChange?.('artists_represented', e.target.value)}
            placeholder='Banda X, Solista Y…'
            rows={2}
            className={smallInputCls + ' resize-none normal-case'}
          />
        </div>
      )}

      {role === 'banda' && (
        <p className='font-pt-mono mt-2 text-sm font-bold tracking-wider text-black uppercase'>Disponible para:</p>
      )}

      {role && (hasEditableFields || editing) && (
        <div className='pt-1'>
          <ProfileChips
            role={role}
            roleProfile={rp}
            editing={editing}
            onFieldChange={onRoleFieldChange}
          />
        </div>
      )}
    </div>
  )
}
