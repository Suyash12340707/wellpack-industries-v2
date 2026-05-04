import FadeUpWrapper from '../ui/FadeUpWrapper'
import SectionTag from '../ui/SectionTag'

const reasons = [
  {
    num: '01',
    title: 'In-house Manufacturing',
    desc: 'Full control over production from raw PP granules to finished roll — ensuring consistent quality every batch.',
  },
  {
    num: '02',
    title: 'Custom Orders Welcome',
    desc: 'Need a specific width, thickness, colour, or spool size? We accommodate custom specs with short lead times.',
  },
  {
    num: '03',
    title: 'Competitive Bulk Pricing',
    desc: 'Direct manufacturer pricing with no middlemen. Better rates for bulk orders and long-term partnerships.',
  },
]

const processSteps = [
  { num: '1', title: 'Raw Material Sourcing', desc: 'Virgin / recycled PP granules sourced from certified suppliers, tested for purity and melt index.', color: 'var(--orange)' },
  { num: '2', title: 'Extrusion & Stretching', desc: 'Precision extrusion lines stretch PP to optimal molecular alignment for maximum tensile strength.', color: 'var(--cyan)' },
  { num: '3', title: 'Embossing & Colouring', desc: 'Surface embossing and UV-stable pigments applied as per client specification.', color: 'var(--orange)' },
  { num: '4', title: 'Quality Check & Dispatch', desc: 'Every batch tested for tensile strength, elongation, and width tolerance before dispatch.', color: 'var(--cyan)' },
]

export default function WhyUs() {
  return (
    <section style={{ padding: '6rem 5vw', background: 'var(--navy-2)' }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '5rem', alignItems: 'start',
      }}>

        {/* Left — reasons */}
        <FadeUpWrapper>
          <SectionTag>Why Wellpack</SectionTag>
          <h2 className="display-lg" style={{ marginBottom: '1rem' }}>
            THE WELLPACK<br />DIFFERENCE
          </h2>
          <p className="lead" style={{ marginBottom: '2.5rem' }}>
            We don't just make straps — we deliver packaging confidence backed by quality, consistency, and commitment.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reasons.map(({ num, title, desc }) => (
              <div key={num} style={{
                display: 'flex', gap: '1.2rem', alignItems: 'flex-start',
                padding: '1.5rem',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '4px',
                background: 'rgba(15,23,42,0.5)',
                transition: 'border-color 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(249,115,22,0.3)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
              >
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: '2rem',
                  color: 'var(--orange)', lineHeight: 1, flexShrink: 0,
                }}>{num}</div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.3rem' }}>{title}</h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.65 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </FadeUpWrapper>

        {/* Right — process */}
        <FadeUpWrapper delay={1}>
          <SectionTag>Our Process</SectionTag>
          <h3 className="display-md" style={{ marginBottom: '2rem' }}>
            FROM GRANULE<br />TO ROLL
          </h3>
          <div style={{ position: 'relative' }}>
            {/* Vertical line */}
            <div style={{
              position: 'absolute', left: '20px', top: 0, bottom: 0,
              width: '1.5px',
              background: 'linear-gradient(to bottom, var(--orange), var(--cyan))',
            }} />
            {processSteps.map(({ num, title, desc, color }) => (
              <div key={num} style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', padding: '1.5rem 0' }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '50%',
                  background: 'var(--navy)', border: `2px solid ${color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontSize: '1rem', color,
                  flexShrink: 0, position: 'relative', zIndex: 1,
                }}>{num}</div>
                <div style={{ paddingTop: '0.4rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.3rem' }}>{title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.6 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </FadeUpWrapper>
      </div>
      <style>{`
        @media (max-width: 860px) {
          section > div { grid-template-columns: 1fr !important; gap: 3rem !important; }
        }
      `}</style>
    </section>
  )
}
