import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useScrollFadeUp } from '../hooks/useScrollFadeUp'
import Hero from '../components/home/Hero'
import StatsBar from '../components/home/StatsBar'
import WhyUs from '../components/home/WhyUs'
import Testimonials from '../components/home/Testimonials'
import ProductGrid from '../components/products/ProductGrid'
import FadeUpWrapper from '../components/ui/FadeUpWrapper'
import SectionTag from '../components/ui/SectionTag'
import Button from '../components/ui/Button'

export default function Home() {
  useScrollFadeUp()

  return (
    <>
      {/* Hero */}
      <Hero />

      {/* Stats */}
      <StatsBar />

      {/* Products preview */}
      <section style={{ padding: '6rem 5vw' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <FadeUpWrapper style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <SectionTag>Our Products</SectionTag>
              <h2 className="display-lg">PRECISION-MADE<br />PP STRAPS</h2>
            </div>
            <Button to="/products" variant="secondary">View All Products →</Button>
          </FadeUpWrapper>
          <ProductGrid limit={3} />
        </div>
      </section>

      {/* Why Us + Process */}
      <WhyUs />

      {/* Certifications strip */}
      <div style={{
        padding: '2.5rem 5vw',
        background: 'var(--navy)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: '3rem', flexWrap: 'wrap',
      }}>
        {['ISO 9001:2015 Certified', 'BIS Compliant', 'PAN India Delivery', 'GST Registered', '15+ Years Experience'].map(cert => (
          <div key={cert} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--orange)', fontSize: '0.8rem' }}>✔</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>{cert}</span>
          </div>
        ))}
      </div>

      {/* Testimonials */}
      <Testimonials />

      {/* CTA Banner */}
      <section style={{
        padding: '6rem 5vw',
        background: 'var(--navy)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <FadeUpWrapper style={{ position: 'relative', zIndex: 1 }}>
          <SectionTag center>Ready to Pack Smarter?</SectionTag>
          <h2 className="display-lg" style={{ marginBottom: '1rem' }}>
            GET A CUSTOM<br />QUOTE TODAY
          </h2>
          <p className="lead" style={{ maxWidth: '480px', margin: '0 auto 2.5rem' }}>
            Tell us your requirements — width, thickness, quantity, colour. We'll get back within 24 hours with the best price.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button to="/order" variant="primary">⚡ Configure & Order Online</Button>
            <Button to="/contact" variant="secondary">Direct Enquiry</Button>
          </div>
        </FadeUpWrapper>
      </section>
    </>
  )
}
