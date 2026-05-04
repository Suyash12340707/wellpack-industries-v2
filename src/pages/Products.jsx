import { useScrollFadeUp } from '../hooks/useScrollFadeUp'
import ProductGrid from '../components/products/ProductGrid'
import FactoryCarousel from '../components/products/FactoryCarousel'
import FadeUpWrapper from '../components/ui/FadeUpWrapper'
import SectionTag from '../components/ui/SectionTag'
import Button from '../components/ui/Button'

const industries = [
  { icon: '🚚', label: 'Logistics & Cargo' },
  { icon: '🏭', label: 'Manufacturing' },
  { icon: '📦', label: 'E-commerce' },
  { icon: '🌾', label: 'Agriculture' },
  { icon: '🧵', label: 'Textile & Apparel' },
  { icon: '⚙️', label: 'Steel & Metal' },
  { icon: '🏗️', label: 'Construction' },
  { icon: '🧴', label: 'FMCG & Retail' },
]

export default function Products() {
  useScrollFadeUp()

  return (
    <>
      {/* Page hero */}
      <section style={{
        padding: '10rem 5vw 5rem',
        background: 'var(--navy)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-80px', right: '-100px',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <FadeUpWrapper>
            <SectionTag>Product Catalogue</SectionTag>
            <h1 className="display-xl" style={{ marginBottom: '1rem' }}>
              ALL PP<br />
              <span style={{ color: 'var(--orange)' }}>STRAPPING</span><br />
              SOLUTIONS
            </h1>
            <p className="lead" style={{ maxWidth: '520px' }}>
              Six product variants covering every packaging need — from lightweight box strapping to heavy-duty woven straps for industrial use.
            </p>
          </FadeUpWrapper>
        </div>
      </section>

      {/* Factory carousel — full width */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.07)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <FactoryCarousel />
      </div>

      {/* All products */}
      <section style={{ padding: '6rem 5vw', background: 'var(--navy)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <ProductGrid expanded />
        </div>
      </section>

      {/* Industries served */}
      <section style={{ padding: '6rem 5vw', background: 'var(--navy-2)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <FadeUpWrapper style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <SectionTag center>Industries We Serve</SectionTag>
            <h2 className="display-lg">ACROSS EVERY<br />SECTOR</h2>
          </FadeUpWrapper>
          <FadeUpWrapper delay={1}>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1rem',
            }}>
              {industries.map(({ icon, label }) => (
                <div key={label} style={{
                  background: 'var(--navy)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '6px', padding: '1.5rem',
                  textAlign: 'center', transition: 'border-color 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(249,115,22,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
                >
                  <div style={{ fontSize: '1.8rem', marginBottom: '0.6rem' }}>{icon}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>{label}</div>
                </div>
              ))}
            </div>
          </FadeUpWrapper>
        </div>
        <style>{`
          @media (max-width: 700px) {
            div[style*="repeat(4, 1fr)"] { grid-template-columns: repeat(2, 1fr) !important; }
          }
        `}</style>
      </section>

      {/* CTA */}
      <section style={{ padding: '5rem 5vw', background: 'var(--navy)', textAlign: 'center' }}>
        <FadeUpWrapper>
          <h2 className="display-md" style={{ marginBottom: '1rem' }}>
            NEED A CUSTOM SPEC?
          </h2>
          <p className="lead" style={{ maxWidth: '420px', margin: '0 auto 2rem' }}>
            We manufacture to your exact width, thickness, colour, and spool size. Minimum orders apply.
          </p>
          <Button to="/contact" variant="primary">Request Custom Order</Button>
        </FadeUpWrapper>
      </section>
    </>
  )
}
