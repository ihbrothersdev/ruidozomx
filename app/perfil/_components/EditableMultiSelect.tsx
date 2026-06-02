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
                'font-pt-mono cursor-pointer rounded-sm px-3 py-1.5 text-[11px] font-bold tracking-wider uppercase transition-colors ' +
                (isOn
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-black/10 text-black/40 hover:bg-black/20 hover:text-black/60')
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
