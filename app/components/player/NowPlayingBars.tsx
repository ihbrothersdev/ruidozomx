export function NowPlayingBars({ className = '' }: { className?: string }) {
  return (
    <span
      className={`mr-1 inline-flex shrink-0 items-end gap-px ${className}`}
      aria-label='Reproduciendo'
    >
      <span className='w-[3px] animate-[nowplaying-a_0.9s_ease-in-out_infinite] rounded-sm bg-current' />
      <span className='w-[3px] animate-[nowplaying-b_0.9s_ease-in-out_infinite] rounded-sm bg-current' />
      <span className='w-[3px] animate-[nowplaying-c_0.9s_ease-in-out_infinite] rounded-sm bg-current' />
    </span>
  )
}
