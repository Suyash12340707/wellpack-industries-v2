import { useState } from 'react'
import { testimonials } from '../../data/testimonials'
import FadeUpWrapper from '../ui/FadeUpWrapper'
import SectionTag from '../ui/SectionTag'

const avatarColors = {
  orange: { bg: 'rgba(249,115,22,0.15)', color: 'var(--orange)' },
  cyan:   { bg: 'rgba(6,182,212,0.12)',  color: 'var(--cyan)' },
  green:  { bg: 'rgba(34,197,94,0.1)',   color: 'var(--green)' },
}

export default function Testimonials() {
  const [active, setActive] = useState(0)
  const visible = testimonials.slice(active, active + 3)

  return (
    <section style={{ padding: '6rem 5vw', background: 'var(--navy-2)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <FadeUpWrapper style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <SectionTag center>Testimonials</SectionTag>
          <h2 className="display-lg">WHAT OUR<br />CLIENTS SAY</h2>
        </FadeUpWrapper>

        <FadeUpWrapper delay={1}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.5rem',
            marginBottom: '2rem',
          }}>
            {visible.map((t) => {
              const av = avatarColors[t.avatarColor] || avatarColors.orange
              return (
                <div key={t.id} style={{
                  background: 'var(--navy)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '6px', padding: '2rem',
                  transition: 'border-color 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(249,115,22,0.25)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
                >
                  {/* Stars */}
                  <div style={{ display: 'flex', gap: '3px', marginBottom: '1rem' }}>
                    {Array(t.rating).fill(0).map((_, i) => (
                      <span key={i} style={{ color: 'var(--orange)', fontSize: '0.85rem' }}>★</span>
                    ))}
                  </div>
                  <p style={{ fontSize: '0.92rem', color: 'var(--slate)', lineHeight: 1.75, fontStyle: 'italic', marginBottom: '1.5rem' }}>
                    "{t.quote}"
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '50%',
                      background: av.bg, color: av.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700,
                      flexShrink: 0,
                    }}>{t.initials}</div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{t.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{t.role}, {t.company}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
            {[0, 3].map(i => (
              <button key={i} onClick={() => setActive(i)} style={{
                width: active === i ? '24px' : '8px',
                height: '8px', borderRadius: '4px',
                background: active === i ? 'var(--orange)' : 'rgba(255,255,255,0.2)',
                border: 'none', cursor: 'pointer',
                transition: 'all 0.3s',
              }} />
            ))}
          </div>
        </FadeUpWrapper>
      </div>
      <style>{`
        @media (max-width: 860px) {
          div[style*="repeat(3"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
