'use client'

import { useEffect } from 'react'

/**
 * iOS rubber-band: the document can be dragged past its bottom bound, revealing
 * empty space below the fixed player bar. CSS `overscroll-behavior: none` would
 * fix it but also kills the *top* pull-to-refresh, which we want to keep. So
 * block only the bottom overscroll in JS, leaving the top bounce (refresh)
 * untouched. Inner scrollers (modals, carousels) are exempted so their own
 * scrolling keeps working.
 */
export function PreventBottomOverscroll() {
  useEffect(() => {
    let startY = 0

    const hasScrollableAncestor = (node: EventTarget | null): boolean => {
      let el = node instanceof HTMLElement ? node : null
      while (el && el !== document.body) {
        const overflowY = getComputedStyle(el).overflowY
        if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
          return true
        }
        el = el.parentElement
      }
      return false
    }

    const onTouchStart = (e: TouchEvent) => {
      startY = e.touches[0]?.clientY ?? 0
    }

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      // Finger moving up drags content up — i.e. scrolling toward/past the bottom.
      const movingUp = e.touches[0].clientY < startY
      if (!movingUp) return
      // Let nested scroll areas (modals, etc.) handle their own overscroll.
      if (hasScrollableAncestor(e.target)) return
      const el = document.scrollingElement || document.documentElement
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= 1
      if (atBottom) e.preventDefault()
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchmove', onTouchMove)
    }
  }, [])

  return null
}
