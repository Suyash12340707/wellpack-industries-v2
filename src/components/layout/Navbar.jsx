import { useState, useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'
import Button from '../ui/Button'

const links = [
  { to: '/',         label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/about',    label: 'About Us' },
  { to: '/contact',  label: 'Contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '1.1rem 5vw',
    background: scrolled ? 'rgba(15,23,42,0.96)' : 'rgba(15,23,42,0.7)',
    backdropFilter: 'blur(14px)',
    borderBottom: scrolled ? '1px solid rgba(249,115,22,0.2)' : '1px solid transparent',
    transition: 'all 0.3s ease',
  }

  const logoStyle = {
    fontFamily: 'var(--font-display)',
    fontSize: '1.7rem',
    letterSpacing: '0.05em',
    color: 'var(--white)',
    textDecoration: 'none',
  }

  return (
    <nav style={navStyle}>
      {/* Logo */}
      <Link to="/" style={logoStyle}>
        {/* ============================================================
            PUT LOGO IMAGE HERE (optional)
            Replace the text below with:
            <img src="/assets/logo.png" alt="Wellpack Industries" style={{ height: '40px' }} />
        ============================================================ */}
        WELL<span style={{ color: 'var(--orange)' }}>PACK</span>
      </Link>

      {/* Desktop links */}
      <ul style={{ display: 'flex', gap: '2rem', listStyle: 'none' }} className="desktop-nav">
        {links.map(({ to, label }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === '/'}
              style={({ isActive }) => ({
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: isActive ? 'var(--orange)' : 'var(--muted)',
                textDecoration: 'none',
                transition: 'color 0.2s',
              })}
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="desktop-nav">
        <Button to="/contact" variant="primary">Get a Quote</Button>
      </div>

      {/* Hamburger (mobile) */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="mobile-menu-btn"
        style={{
          display: 'none',
          flexDirection: 'column', gap: '5px',
          background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
        }}
        aria-label="Toggle menu"
      >
        {[0,1,2].map(i => (
          <span key={i} style={{
            display: 'block', width: '22px', height: '2px',
            background: 'var(--white)', borderRadius: '2px',
            transition: 'all 0.2s',
            transform: menuOpen
              ? i === 1 ? 'scaleX(0)' : i === 0 ? 'translateY(7px) rotate(45deg)' : 'translateY(-7px) rotate(-45deg)'
              : 'none',
          }} />
        ))}
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: '64px', left: 0, right: 0,
          background: 'rgba(15,23,42,0.98)',
          borderBottom: '1px solid rgba(249,115,22,0.2)',
          padding: '1.5rem 5vw',
          display: 'flex', flexDirection: 'column', gap: '1.2rem',
        }}>
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setMenuOpen(false)}
              style={({ isActive }) => ({
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: isActive ? 'var(--orange)' : 'var(--white)',
                textDecoration: 'none',
              })}
            >
              {label}
            </NavLink>
          ))}
          <Button to="/contact" variant="primary" style={{ alignSelf: 'flex-start' }}
            onClick={() => setMenuOpen(false)}>
            Get a Quote
          </Button>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  )
}
