import { useState, useEffect, useCallback, useRef } from 'react'

const images = [
  { src: '/assets/s1.png', alt: 'PP Strap Extrusion Line' },
  { src: '/assets/s2.png', alt: 'Stretching & Rolling Machine' },
  { src: '/assets/s3.png', alt: 'PP Strap Production Unit' },
  { src: '/assets/s4.png', alt: 'Winding & Cutting Machine' },
]

const INTERVAL = 4000

export default function FactoryCarousel() {
  const [current, setCurrent] = useState(0)
  const [prevIdx, setPrevIdx] = useState(null)
  const [dir, setDir]         = useState(1)
  const timerRef = useRef(null)

  const goTo = useCallback((index, direction = 1) => {
    setPrevIdx(current)
    setDir(direction)
    setCurrent(index)
  }, [current])

  const next = useCallback(() => goTo((current + 1) % images.length, 1), [current, goTo])
  const goBack = useCallback(() => goTo((current - 1 + images.length) % images.length, -1), [current, goTo])

  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(next, INTERVAL)
  }, [next])

  useEffect(() => {
    timerRef.current = setInterval(next, INTERVAL)
    return () => clearInterval(timerRef.current)
  }, [next])

  useEffect(() => {
    if (prevIdx === null) return
    const t = setTimeout(() => setPrevIdx(null), 500)
    return () => clearTimeout(t)
  }, [prevIdx])

  const handlePrev = () => { resetTimer(); goBack() }
  const handleNext = () => { resetTimer(); next() }
  const handleThumb = (i) => { resetTimer(); goTo(i, i > current ? 1 : -1) }

  return (
    <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
      <style>{`
        @keyframes fSlideInR  { from { transform: translateX(80px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fSlideInL  { from { transform: translateX(-80px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fSlideOutL { from { transform: translateX(0); opacity: 1; } to { transform: translateX(-80px); opacity: 0; } }
        @keyframes fSlideOutR { from { transform: translateX(0); opacity: 1; } to { transform: translateX(80px); opacity: 0; } }
        .fEnterFwd  { animation: fSlideInR  0.55s cubic-bezier(0.4,0,0.2,1) forwards; }
        .fEnterBack { animation: fSlideInL  0.55s cubic-bezier(0.4,0,0.2,1) forwards; }
        .fExitFwd   { animation: fSlideOutL 0.55s cubic-bezier(0.4,0,0.2,1) forwards; }
        .fExitBack  { animation: fSlideOutR 0.55s cubic-bezier(0.4,0,0.2,1) forwards; }
        .fProgress  { animation: fProg linear forwards; }
        @keyframes fProg { from { width: 0%; } to { width: 100%; } }
      `}</style>

      {/* Main image */}
      <div style={{ position: 'relative', width: '100%', height: '380px', background: 'var(--navy-2)', overflow: 'hidden' }}>

        {/* Exiting image */}
        {prevIdx !== null && (
          <img key={`exit-${prevIdx}`} src={images[prevIdx].src} alt=""
            className={dir === 1 ? 'fExitFwd' : 'fExitBack'}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}

        {/* Entering image */}
        <img key={`enter-${current}`} src={images[current].src} alt={images[current].alt}
          className={dir === 1 ? 'fEnterFwd' : 'fEnterBack'}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* Overlays */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, rgba(15,23,42,0.72) 0%, rgba(15,23,42,0.15) 55%, rgba(15,23,42,0.45) 100%)',
          pointerEvents: 'none', zIndex: 1,
        }} />

        {/* Label */}
        <div style={{ position: 'absolute', left: '2rem', top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--orange)', marginBottom: '0.5rem' }}>Our Factory</p>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 3vw, 2.2rem)', lineHeight: 1.1, maxWidth: '300px' }}>{images[current].alt}</h3>
        </div>

        {/* Arrows */}
        {[
          { onClick: handlePrev, side: 'left',  arrow: '‹' },
          { onClick: handleNext, side: 'right', arrow: '›' },
        ].map(({ onClick, side, arrow }) => (
          <button key={side} onClick={onClick} style={{
            position: 'absolute', top: '50%', [side]: '1rem',
            transform: 'translateY(-50%)', zIndex: 2,
            width: '40px', height: '40px', borderRadius: '50%',
            background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(249,115,22,0.4)',
            color: 'var(--white)', fontSize: '1.4rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s', lineHeight: 1,
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(249,115,22,0.5)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(15,23,42,0.7)'}
          >{arrow}</button>
        ))}

        {/* Counter */}
        <div style={{
          position: 'absolute', bottom: '1rem', right: '1rem', zIndex: 2,
          background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(249,115,22,0.3)',
          borderRadius: '100px', padding: '0.3rem 0.8rem',
          fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--orange)',
        }}>{current + 1} / {images.length}</div>

        {/* Progress bar */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: 'rgba(255,255,255,0.08)', zIndex: 2 }}>
          <div key={current} className="fProgress"
            style={{ height: '100%', background: 'var(--orange)', animationDuration: `${INTERVAL}ms` }}
          />
        </div>
      </div>

      {/* Dot indicators */}
      <div style={{
        position: 'absolute', bottom: '80px', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: '0.4rem', zIndex: 3,
      }}>
        {images.map((_, i) => (
          <button key={i} onClick={() => handleThumb(i)} style={{
            width: current === i ? '20px' : '6px', height: '6px',
            borderRadius: '3px', border: 'none', cursor: 'pointer', padding: 0,
            background: current === i ? 'var(--orange)' : 'rgba(255,255,255,0.35)',
            transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
          }} />
        ))}
      </div>

      {/* Thumbnail strip */}
      <div style={{ display: 'flex', gap: 0, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {images.map((img, i) => (
          <button key={i} onClick={() => handleThumb(i)} style={{
            flex: 1, height: '72px', padding: 0, border: 'none', cursor: 'pointer',
            position: 'relative', overflow: 'hidden',
            borderRight: i < images.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
          }}>
            <img src={img.src} alt={img.alt} style={{
              width: '100%', height: '100%', objectFit: 'cover', display: 'block',
              opacity: current === i ? 1 : 0.35,
              transition: 'opacity 0.35s ease',
              transform: current === i ? 'scale(1.05)' : 'scale(1)',
              transitionProperty: 'opacity, transform',
            }} />
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px',
              background: current === i ? 'var(--orange)' : 'transparent',
              transition: 'background 0.3s',
            }} />
          </button>
        ))}
      </div>
    </div>
  )
}
