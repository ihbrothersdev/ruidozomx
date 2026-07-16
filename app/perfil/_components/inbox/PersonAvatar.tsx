/** Avatar (photo or initial) for an inbox counterpart. */
export function PersonAvatar({ photoUrl, name }: { photoUrl: string | null; name: string }) {
  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={name}
        className='h-9 w-9 shrink-0 rounded-full border-2 border-admin-ink object-cover'
      />
    )
  }
  return (
    <span className='font-pt-mono text-admin-ink flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-admin-ink bg-admin-surface-2 text-xs font-bold'>
      {name.trim().charAt(0).toUpperCase() || '?'}
    </span>
  )
}
