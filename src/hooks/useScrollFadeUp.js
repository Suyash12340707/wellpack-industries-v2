import { useEffect, useRef } from 'react'

/**
 * Attaches an IntersectionObserver to all `.fade-up` elements
 * inside the given container ref (or document if no ref given).
 * Call once per page, or pass a specific containerRef.
 */
export function useScrollFadeUp(containerRef = null) {
  useEffect(() => {
    const root = containerRef?.current ?? document
    const elements = root.querySelectorAll('.fade-up')

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 }
    )

    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [containerRef])
}
