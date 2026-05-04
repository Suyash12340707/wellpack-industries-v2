import { Link } from 'react-router-dom'

const base = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontFamily: 'var(--font-mono)',
  fontSize: '0.78rem',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  textDecoration: 'none',
  padding: '0.9rem 2rem',
  borderRadius: 'var(--radius-sm)',
  transition: 'all var(--transition)',
  cursor: 'pointer',
  border: 'none',
}

const variants = {
  primary: {
    background: 'var(--orange)',
    color: 'var(--white)',
  },
  secondary: {
    background: 'transparent',
    color: 'var(--white)',
    border: '1px solid rgba(255,255,255,0.18)',
  },
  outline: {
    background: 'transparent',
    color: 'var(--orange)',
    border: '1px solid var(--orange)',
  },
}

/**
 * Button / Link component
 * Props:
 *   variant  — 'primary' | 'secondary' | 'outline'  (default: primary)
 *   to       — internal route (renders as <Link>)
 *   href     — external URL (renders as <a>)
 *   onClick  — handler (renders as <button>)
 *   children — label content
 */
export default function Button({ variant = 'primary', to, href, onClick, children, style = {} }) {
  const styles = { ...base, ...variants[variant], ...style }

  if (to) return <Link to={to} style={styles}>{children}</Link>
  if (href) return <a href={href} target="_blank" rel="noopener noreferrer" style={styles}>{children}</a>
  return <button onClick={onClick} style={styles}>{children}</button>
}
