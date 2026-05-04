import { useState, useEffect, useCallback, useRef } from 'react'

const images = [
  { src: '/assets/p1.png', alt: 'Yellow PP Strap Roll' },
  { src: '/assets/p2.png', alt: 'Black PP Strap Roll' },
  { src: '/assets/p3.png', alt: 'White PP Strap Roll' },
  { src: '/assets/p4.png', alt: 'Wide White PP Strap Roll' },
]

const INTERVAL = 3500

export default function ImageCarousel() {
  const [current, setCurrent] = useState(0)
  const [prev, setPrev]       = useState(null)
  const [dir, setDir]         = useState(1) // 1 = forward, -1 = backward
  const timerRef = useRef(null)

  const goTo = useCallback((index, direction = 1) => {
    setPrev(current)
    setDir(direction)
    setCurrent(index)
  }, [current])

  const next = useCallback(() => {
    goTo((current + 1) % images.length, 1)
  }, [current, goTo])

  const goBack = useCallback(() => {
    goTo((current - 1 + images.length) % images.length, -1)
  }, [current, goTo])

  // Reset timer on every slide change
  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(next, INTERVAL)
  }, [next])

  useEffect(() => {
    timerRef.current = setInterval(next, INTERVAL)
    return () => clearInterval(timerRef.current)
  }, [next])

  const handlePrev = () => { resetTimer(); goBack() }
  const handleNext = () => { resetTimer(); next() }
  const handleDot  = (i) => { resetTimer(); goTo(i, i > current ? 1 : -1) }

  // Clear prev after animation
  useEffect(() => {
    if (prev === null) return
    const t = setTimeout(() => setPrev(null), 500)
    return () => clearTimeout(t)
  }, [prev])

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '480px' }}>
      <style>{`
        @keyframes slideInRight  { from { transform: translateX(60px);  opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideInLeft   { from { transform: translateX(-60px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideOutLeft  { from { transform: translateX(0); opacity: 1; } to { transform: translateX(-60px); opacity: 0; } }
        @keyframes slideOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(60px);  opacity: 0; } }
        .carousel-enter-fwd  { animation: slideInRight  0.5s cubic-bezier(0.4,0,0.2,1) forwards; }
        .carousel-enter-back { animation: slideInLeft   0.5s cubic-bezier(0.4,0,0.2,1) forwards; }
        .carousel-exit-fwd   { animation: slideOutLeft  0.5s cubic-bezier(0.4,0,0.2,1) forwards; }
        .carousel-exit-back  { animation: slideOutRight 0.5s cubic-bezier(0.4,0,0.2,1) forwards; }
        .progress-bar { animation: progress linear forwards; }
        @keyframes progress { from { width: 0%; } to { width: 100%; } }
      `}</style>

      {/* Main image box */}
      <div style={{
        width: '100%', aspectRatio: '1 / 1',
        borderRadius: '12px', overflow: 'hidden',
        border: '1.5px solid rgba(249,115,22,0.3)',
        background: '#1a1a2e', position: 'relative',
        boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
      }}>

        {/* Exiting image */}
        {prev !== null && (
          <img key={`exit-${prev}`}
            src={images[prev].src} alt=""
            className={dir === 1 ? 'carousel-exit-fwd' : 'carousel-exit-back'}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}

        {/* Entering image */}
        <img key={`enter-${current}`}
          src={images[current].src} alt={images[current].alt}
          className={dir === 1 ? 'carousel-enter-fwd' : 'carousel-enter-back'}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px',
          background: 'linear-gradient(to top, rgba(15,23,42,0.75), transparent)',
          pointerEvents: 'none', zIndex: 1,
        }} />

        {/* Image label */}
        <div style={{
          position: 'absolute', bottom: '1rem', left: '1rem', zIndex: 2,
          fontFamily: 'var(--font-mono)', fontSize: '0.62rem',
          letterSpacing: '0.12em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.75)',
        }}>{images[current].alt}</div>

        {/* Progress bar */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px',
          background: 'rgba(255,255,255,0.1)', zIndex: 2,
        }}>
          <div key={current} className="progress-bar"
            style={{ height: '100%', background: 'var(--orange)', animationDuration: `${INTERVAL}ms` }}
          />
        </div>

        {/* Arrows */}
        {[
          { onClick: handlePrev, side: 'left',  arrow: '‹' },
          { onClick: handleNext, side: 'right', arrow: '›' },
        ].map(({ onClick, side, arrow }) => (
          <button key={side} onClick={onClick} style={{
            position: 'absolute', top: '50%', [side]: '0.75rem',
            transform: 'translateY(-50%)', zIndex: 2,
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(249,115,22,0.35)',
            color: 'var(--white)', fontSize: '1.3rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s', lineHeight: 1,
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(249,115,22,0.45)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(15,23,42,0.7)'}
          >{arrow}</button>
        ))}
      </div>

      {/* Dot indicators */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
        {images.map((_, i) => (
          <button key={i} onClick={() => handleDot(i)} style={{
            width: current === i ? '24px' : '8px', height: '8px',
            borderRadius: '4px', border: 'none', cursor: 'pointer', padding: 0,
            background: current === i ? 'var(--orange)' : 'rgba(255,255,255,0.2)',
            transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
          }} />
        ))}
      </div>

      {/* Thumbnail strip */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', justifyContent: 'center' }}>
        {images.map((img, i) => (
          <button key={i} onClick={() => handleDot(i)} style={{
            width: '52px', height: '52px', borderRadius: '6px',
            overflow: 'hidden', padding: 0, cursor: 'pointer',
            border: `2px solid ${current === i ? 'var(--orange)' : 'rgba(255,255,255,0.1)'}`,
            transition: 'border-color 0.3s', flexShrink: 0,
          }}>
            <img src={img.src} alt={img.alt} style={{
              width: '100%', height: '100%', objectFit: 'cover', display: 'block',
              opacity: current === i ? 1 : 0.45,
              transition: 'opacity 0.3s',
            }} />
          </button>
        ))}
      </div>

      {/* Floating stat pills */}
      {[
        { text: '15+ Years Experience', pos: { top: '-14px', left: '-20px' }, color: 'orange' },
        { text: 'ISO Certified',        pos: { bottom: '100px', left: '-30px' }, color: 'cyan' },
        { text: '500+ Happy Clients',   pos: { bottom: '100px', right: '-20px' }, color: 'orange' },
      ].map(({ text, pos, color }) => (
        <div key={text} style={{
          position: 'absolute', ...pos,
          background: 'var(--navy-2)',
          border: `1px solid rgba(${color === 'cyan' ? '6,182,212' : '249,115,22'},0.35)`,
          padding: '0.45rem 0.9rem', borderRadius: 'var(--radius-full)',
          fontFamily: 'var(--font-mono)', fontSize: '0.66rem',
          color: `var(--${color})`, whiteSpace: 'nowrap',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)', zIndex: 2,
        }}>{text}</div>
      ))}
    </div>
  )
}
