/**
 * Wraps children in a div with the .fade-up class.
 * The IntersectionObserver in useScrollFadeUp.js adds .visible to trigger the animation.
 *
 * Props:
 *   delay  — 0 | 1 | 2 | 3  (adds delay-N class)
 *   style  — extra inline styles on the wrapper
 */
export default function FadeUpWrapper({ children, delay = 0, style = {}, className = '' }) {
  const delayClass = delay > 0 ? ` delay-${delay}` : ''
  return (
    <div className={`fade-up${delayClass} ${className}`} style={style}>
      {children}
    </div>
  )
}
