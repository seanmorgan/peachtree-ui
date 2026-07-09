import { useState, useEffect, useRef } from 'react'

/**
 * Tracks which section is "active" while scrolling by watching which section's
 * top edge is closest to (and above) a trigger line near the top of the viewport.
 *
 * Strategy: on every scroll event, find the last section whose top is ≤ the
 * trigger offset. This is the most reliable approach for long sections.
 */
export function useActiveSection(ids: readonly string[]): string {
  // Stable ref so the scroll handler never becomes stale
  const idsRef = useRef(ids)
  useEffect(() => { idsRef.current = ids }, [ids])

  const [activeId, setActiveId] = useState<string>(ids[0] ?? '')

  useEffect(() => {
    // How far from the viewport top we consider a section "active" (matches scroll-mt-14 = 56px)
    const OFFSET = 64

    function pickActive() {
      const current = idsRef.current

      // If we're at (or very near) the bottom of the page, activate the last section.
      // Guard with scrollY > 0 so this doesn't fire before the page has fully rendered.
      const nearBottom =
        window.scrollY > 0 &&
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8
      if (nearBottom && current.length > 0) {
        setActiveId(current[current.length - 1])
        return
      }

      let chosen = current[0] ?? ''
      for (const id of current) {
        const el = document.getElementById(id)
        if (!el) continue
        const top = el.getBoundingClientRect().top
        if (top <= OFFSET) {
          chosen = id
        }
      }
      setActiveId(chosen)
    }

    // Run once on mount so the initial state is correct
    pickActive()

    window.addEventListener('scroll', pickActive, { passive: true })
    return () => window.removeEventListener('scroll', pickActive)
  }, []) // empty deps — intentional; we read ids via idsRef

  return activeId
}

