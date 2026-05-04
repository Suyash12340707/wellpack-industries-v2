import { Link } from 'react-router-dom'

const footerLinks = {
  Company: [
    { label: 'Home',     to: '/' },
    { label: 'About Us', to: '/about' },
    { label: 'Products', to: '/products' },
    { label: 'Contact',  to: '/contact' },
  ],
  Products: [
    { label: 'Standard PP Strap',  to: '/products' },
    { label: 'Embossed PP Strap',  to: '/products' },
    { label: 'Eco PP Strap',       to: '/products' },
    { label: 'Woven PP Strap',     to: '/products' },
    { label: 'Printed PP Strap',   to: '/products' },
  ],
}

export default function Footer() {
  return (
    <footer style={{
      background: '#080F1C',
      borderTop: '1px solid rgba(255,255,255,0.07)',
    }}>
      {/* Main footer */}
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        padding: '4rem 5vw 3rem',
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr',
        gap: '3rem',
      }}>
        {/* Brand col */}
        <div>
          <Link to="/" style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem', letterSpacing: '0.05em',
            color: 'var(--white)', textDecoration: 'none',
            display: 'block', marginBottom: '1rem',
          }}>
            WELL<span style={{ color: 'var(--orange)' }}>PACK</span>
          </Link>
          <p style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.7, maxWidth: '300px', marginBottom: '1.5rem' }}>
            Premium PP strap manufacturers in Pune, India. Trusted by 500+ clients across logistics, warehousing, and packaging industries.
          </p>
          {/* Social links placeholder */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {['LI', 'FB', 'WA'].map(s => (
              <a key={s} href="#" style={{
                width: '36px', height: '36px',
                borderRadius: '4px',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6rem',
                color: 'var(--muted)',
                transition: 'border-color 0.2s, color 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--orange)'; e.currentTarget.style.color = 'var(--orange)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--muted)' }}
              >{s}</a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(footerLinks).map(([heading, items]) => (
          <div key={heading}>
            <h4 style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.68rem', letterSpacing: '0.2em',
              textTransform: 'uppercase', color: 'var(--orange)',
              marginBottom: '1.2rem',
            }}>{heading}</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', listStyle: 'none' }}>
              {items.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} style={{
                    fontSize: '0.88rem', color: 'var(--muted)',
                    textDecoration: 'none', transition: 'color 0.2s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--white)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
                  >{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '1.2rem 5vw',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem',
        maxWidth: '1200px', margin: '0 auto',
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--muted)', letterSpacing: '0.05em' }}>
          © {new Date().getFullYear()} Wellpack Industries. All rights reserved.
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--muted)', letterSpacing: '0.05em' }}>
          MIDC Industrial Area, Pune — Maharashtra, India
        </span>
      </div>

      <style>{`
        @media (max-width: 768px) {
          footer > div:first-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  )
}
