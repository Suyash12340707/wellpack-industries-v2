import { useScrollFadeUp } from '../hooks/useScrollFadeUp'
import FadeUpWrapper from '../components/ui/FadeUpWrapper'
import SectionTag from '../components/ui/SectionTag'
import Button from '../components/ui/Button'

const team = [
  { name: 'Ramesh Patil', role: 'Founder & Managing Director', initials: 'RP', color: 'orange', bio: '25+ years in polymer manufacturing. Founded Wellpack with a vision to deliver world-class PP strapping from Pune.' },
  { name: 'Sanjay Kulkarni', role: 'Head of Production', initials: 'SK', color: 'cyan', bio: 'Oversees the entire extrusion and finishing line. Ensures every roll meets our strict tensile strength standards.' },
  { name: 'Meena Shah', role: 'Sales & Client Relations', initials: 'MS', color: 'green', bio: 'Your first point of contact. Meena has helped 300+ clients find the right strapping solution for their business.' },
]

const milestones = [
  { year: '2009', title: 'Founded', desc: 'Wellpack Industries established in MIDC, Pune with one extrusion line.' },
  { year: '2012', title: 'ISO Certified', desc: 'Received ISO 9001 certification after upgrading QC processes.' },
  { year: '2016', title: 'Expansion', desc: 'Added embossed strap and custom print lines. Doubled plant capacity.' },
  { year: '2019', title: 'Eco Range', desc: 'Launched recycled PP Eco Strap range in response to green packaging demand.' },
  { year: '2022', title: '500 Clients', desc: 'Crossed 500 active client accounts across 18 states in India.' },
  { year: '2024', title: 'Today', desc: 'Exporting to select markets in Southeast Asia and Middle East.' },
]

const avatarColor = {
  orange: { bg: 'rgba(249,115,22,0.15)', color: 'var(--orange)' },
  cyan:   { bg: 'rgba(6,182,212,0.12)', color: 'var(--cyan)' },
  green:  { bg: 'rgba(34,197,94,0.1)', color: 'var(--green)' },
}

export default function About() {
  useScrollFadeUp()

  return (
    <>
      {/* Hero */}
      <section style={{
        padding: '10rem 5vw 5rem', background: 'var(--navy)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-80px', left: '-100px',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
          <FadeUpWrapper>
            <SectionTag>Our Story</SectionTag>
            <h1 className="display-xl" style={{ marginBottom: '1.5rem' }}>
              BUILT ON<br />
              <span style={{ color: 'var(--orange)' }}>QUALITY.</span><br />
              GROWN ON<br />
              <span style={{ color: 'var(--cyan)' }}>TRUST.</span>
            </h1>
            <p className="lead" style={{ marginBottom: '2rem' }}>
              Since 2009, Wellpack Industries has been manufacturing premium PP strapping solutions from our plant in MIDC, Pune. What started as a single extrusion line has grown into one of Maharashtra's most trusted strapping manufacturers.
            </p>
            <Button to="/contact" variant="primary">Work With Us</Button>
          </FadeUpWrapper>

          {/* Real product image */}
          <FadeUpWrapper delay={1}>
            <div style={{
              width: '100%', borderRadius: '12px', overflow: 'hidden',
              border: '1.5px solid rgba(249,115,22,0.25)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
            }}>
              <img
                src="/assets/roll.png"
                alt="Wellpack Industries PP Strap Products"
                style={{ width: '100%', display: 'block', objectFit: 'cover' }}
              />
            </div>
          </FadeUpWrapper>
        </div>
        <style>{`
          @media (max-width: 860px) {
            section > div[style*="grid"] { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>

      {/* Mission & Vision */}
      <section style={{ padding: '6rem 5vw', background: 'var(--navy-2)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {[
            { tag: 'Our Mission', icon: '🎯', title: 'Strap Every Shipment with Confidence', body: 'To manufacture PP strapping products of the highest quality that help Indian businesses ship safely, efficiently, and affordably — every single time.' },
            { tag: 'Our Vision', icon: '🔭', title: "India's Most Trusted Strap Brand", body: 'To become the most trusted name in polypropylene strapping across South Asia, known for innovation, sustainability, and uncompromising quality.' },
          ].map(({ tag, icon, title, body }) => (
            <FadeUpWrapper key={tag}>
              <div style={{
                background: 'var(--navy)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '8px', padding: '2.5rem', height: '100%',
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{icon}</div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--orange)', marginBottom: '0.5rem' }}>{tag}</p>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', marginBottom: '1rem' }}>{title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.75 }}>{body}</p>
              </div>
            </FadeUpWrapper>
          ))}
        </div>
        <style>{`
          @media (max-width: 700px) {
            section > div { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>

      {/* Timeline */}
      <section style={{ padding: '6rem 5vw', background: 'var(--navy)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <FadeUpWrapper style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <SectionTag center>Our Journey</SectionTag>
            <h2 className="display-lg">15 YEARS OF<br />STRAPPING INDIA</h2>
          </FadeUpWrapper>
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute', left: '50%', top: 0, bottom: 0,
              width: '1.5px', background: 'linear-gradient(to bottom, var(--orange), var(--cyan))',
              transform: 'translateX(-50%)',
            }} />
            {milestones.map(({ year, title, desc }, i) => (
              <FadeUpWrapper key={year} delay={i % 3}>
                <div style={{
                  display: 'flex',
                  justifyContent: i % 2 === 0 ? 'flex-end' : 'flex-start',
                  paddingBottom: '2rem',
                  paddingRight: i % 2 === 0 ? 'calc(50% + 1.5rem)' : '0',
                  paddingLeft: i % 2 === 0 ? '0' : 'calc(50% + 1.5rem)',
                  position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute', left: '50%', top: '0.5rem',
                    width: '12px', height: '12px', borderRadius: '50%',
                    background: i % 2 === 0 ? 'var(--orange)' : 'var(--cyan)',
                    transform: 'translateX(-50%)', zIndex: 1,
                    boxShadow: '0 0 0 4px var(--navy)',
                  }} />
                  <div style={{
                    background: 'var(--navy-2)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '6px', padding: '1.2rem 1.5rem',
                    maxWidth: '280px',
                  }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: i % 2 === 0 ? 'var(--orange)' : 'var(--cyan)', marginBottom: '0.2rem' }}>{year}</div>
                    <div style={{ fontWeight: 600, marginBottom: '0.3rem' }}>{title}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.6 }}>{desc}</div>
                  </div>
                </div>
              </FadeUpWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={{ padding: '6rem 5vw', background: 'var(--navy-2)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <FadeUpWrapper style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <SectionTag center>The Team</SectionTag>
            <h2 className="display-lg">PEOPLE BEHIND<br />WELLPACK</h2>
          </FadeUpWrapper>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {team.map(({ name, role, initials, color, bio }, i) => {
              const av = avatarColor[color]
              return (
                <FadeUpWrapper key={name} delay={i}>
                  <div style={{
                    background: 'var(--navy)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '8px', padding: '2rem',
                    textAlign: 'center', transition: 'border-color 0.2s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(249,115,22,0.3)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
                  >
                    <div style={{
                      width: '72px', height: '72px', borderRadius: '50%',
                      background: av.bg, color: av.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-display)', fontSize: '1.5rem',
                      margin: '0 auto 1rem',
                    }}>{initials}</div>
                    <h3 style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.25rem' }}>{name}</h3>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: av.color, marginBottom: '0.75rem' }}>{role}</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.65 }}>{bio}</p>
                  </div>
                </FadeUpWrapper>
              )
            })}
          </div>
        </div>
        <style>{`
          @media (max-width: 760px) {
            div[style*="repeat(3, 1fr)"] { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>
    </>
  )
}
