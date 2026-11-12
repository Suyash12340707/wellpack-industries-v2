import Button from '../ui/Button'
import FadeUpWrapper from '../ui/FadeUpWrapper'
import ImageCarousel from './ImageCarousel'

export default function Hero() {
  return (
    <section style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      alignItems: 'center',
      padding: '8rem 5vw 4rem',
      gap: '3rem',
      position: 'relative',
      overflow: 'hidden',
      maxWidth: '1200px',
      margin: '0 auto',
    }}>
      {/* Background glows */}
      <div style={{
        position: 'absolute', top: '-100px', right: '-200px',
        width: '700px', height: '700px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-100px', left: '-100px',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Left content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <FadeUpWrapper>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(249,115,22,0.1)',
            border: '1px solid rgba(249,115,22,0.3)',
            color: 'var(--orange)',
            fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
            letterSpacing: '0.15em', textTransform: 'uppercase',
            padding: '0.45rem 1rem', borderRadius: 'var(--radius-full)',
            marginBottom: '1.5rem',
          }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: 'var(--orange)',
              animation: 'pulse 2s infinite',
            }} />
            Trusted PP Strap Manufacturer · Pune, India
          </div>
        </FadeUpWrapper>

        <FadeUpWrapper delay={1}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(3.5rem, 6.5vw, 6rem)',
            lineHeight: 0.95, letterSpacing: '0.01em',
            marginBottom: '1.5rem',
          }}>
            BUILT TO<br />
            <span style={{ color: 'var(--orange)' }}>BIND.</span><br />
            MADE TO<br />
            <span style={{ color: 'var(--cyan)' }}>LAST.</span>
          </h1>
        </FadeUpWrapper>

        <FadeUpWrapper delay={2}>
          <p style={{
            fontSize: '1.05rem', color: 'var(--muted)',
            lineHeight: 1.75, maxWidth: '460px', marginBottom: '2.5rem',
          }}>
            Wellpack Industries manufactures high-strength Polypropylene (PP)
            strapping solutions trusted by logistics, warehousing, and packaging
            industries across India.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Button to="/order" variant="primary">⚡ Configure & Order</Button>
            <Button to="/products" variant="secondary">Our Products →</Button>
          </div>
        </FadeUpWrapper>
      </div>

      {/* Right — real image carousel */}
      <FadeUpWrapper delay={2} style={{ display: 'flex', justifyContent: 'center' }}>
        <ImageCarousel />
      </FadeUpWrapper>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.75); }
        }
        @media (max-width: 860px) {
          section { grid-template-columns: 1fr !important; text-align: center; }
          section > div:last-child { display: none; }
          section p { margin-left: auto; margin-right: auto; }
          section > div:first-child > div:last-child > div { justify-content: center; }
        }
      `}</style>
    </section>
  )
}
