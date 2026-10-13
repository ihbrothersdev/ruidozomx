/**
 * Page numbers to render (1-based): first, last and `delta` pages either side of
 * `current`, with `'gap'` markers where pages are collapsed into an ellipsis.
 */
export function pageWindow(current: number, total: number, delta: number): Array<number | 'gap'> {
  const left = Math.max(2, current - delta)
  const right = Math.min(total - 1, current + delta)
  const out: Array<number | 'gap'> = [1]
  if (left > 2) out.push('gap')
  for (let p = left; p <= right; p++) out.push(p)
  if (right < total - 1) out.push('gap')
  if (total > 1) out.push(total)
  return out
}
