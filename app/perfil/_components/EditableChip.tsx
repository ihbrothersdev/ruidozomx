'use client'

interface EditableChipProps {
  label: string
  /** Form field name — emits a hidden input with value 'true' when on. */
  name?: string
  value: boolean
  onChange: (next: boolean) => void
}

export default function EditableChip({ label, name, value, onChange }: EditableChipProps) {
  return (
    <>
      {name && (
        <input
          type='hidden'
          name={name}
          value={value ? 'true' : ''}
        />
      )}
      <button
        type='button'
        onClick={() => onChange(!value)}
        aria-pressed={value}
        className={
          'font-pt-mono cursor-pointer border-2 border-admin-ink px-3 py-1.5 text-[11px] font-bold tracking-wider uppercase transition-colors ' +
          (value
            ? 'bg-admin-red text-admin-surface'
            : 'bg-admin-surface text-admin-ink-faint hover:text-admin-ink')
        }
      >
        {label}
      </button>
    </>
  )
}
