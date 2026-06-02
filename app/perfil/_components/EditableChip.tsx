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
          'font-pt-mono cursor-pointer rounded-sm px-3 py-1.5 text-[11px] font-bold tracking-wider uppercase transition-colors ' +
          (value
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'bg-black/10 text-black/40 hover:bg-black/20 hover:text-black/60')
        }
      >
        {label}
      </button>
    </>
  )
}
