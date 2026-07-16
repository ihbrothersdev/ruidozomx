'use client'

interface EditableMultiSelectProps {
  /** Form field name — emits one hidden input per selected option. */
  name: string
  options: readonly string[]
  value: string[]
  onChange: (next: string[]) => void
}

export default function EditableMultiSelect({ name, options, value, onChange }: EditableMultiSelectProps) {
  function toggle(option: string) {
    const isOn = value.includes(option)
    onChange(isOn ? value.filter(v => v !== option) : [...value, option])
  }

  return (
    <>
      {value.map(v => (
        <input
          key={v}
          type='hidden'
          name={name}
          value={v}
        />
      ))}
      <div className='flex flex-wrap gap-2'>
        {options.map(option => {
          const isOn = value.includes(option)
          return (
            <button
              key={option}
              type='button'
              onClick={() => toggle(option)}
              aria-pressed={isOn}
              className={
                'font-pt-mono cursor-pointer border-2 border-admin-ink px-3 py-1.5 text-[11px] font-bold tracking-wider uppercase transition-colors ' +
                (isOn
                  ? 'bg-admin-red text-admin-surface'
                  : 'bg-admin-surface text-admin-ink-faint hover:text-admin-ink')
              }
            >
              {option}
            </button>
          )
        })}
      </div>
    </>
  )
}
