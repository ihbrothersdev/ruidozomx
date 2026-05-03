export function NowPlayingBars({ className = '' }: { className?: string }) {
  return (
    <span
      className={`mr-1 inline-flex shrink-0 items-end gap-px ${className}`}
      aria-label='Reproduciendo'
    >
      <span
        className='block w-[3px] rounded-sm bg-current'
        style={{ height: '12px', transformOrigin: 'bottom', animation: 'nowplaying-a 0.9s ease-in-out infinite' }}
      />
      <span
        className='block w-[3px] rounded-sm bg-current'
        style={{ height: '12px', transformOrigin: 'bottom', animation: 'nowplaying-b 0.9s ease-in-out infinite 0.15s' }}
      />
      <span
        className='block w-[3px] rounded-sm bg-current'
        style={{ height: '12px', transformOrigin: 'bottom', animation: 'nowplaying-c 0.9s ease-in-out infinite 0.3s' }}
      />
    </span>
  )
}
