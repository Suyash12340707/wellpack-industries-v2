const iconColors = {
  orange: { bg: 'rgba(249,115,22,0.12)', dot: 'var(--orange)' },
  cyan:   { bg: 'rgba(6,182,212,0.12)',  dot: 'var(--cyan)' },
  green:  { bg: 'rgba(34,197,94,0.1)',   dot: 'var(--green)' },
}

export default function ProductCard({ product, expanded = false }) {
  const ic = iconColors[product.iconColor] || iconColors.orange

  return (
    <div style={{
      background: 'var(--navy-2)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '6px',
      padding: expanded ? '2.5rem' : '2rem',
      transition: 'border-color 0.2s, transform 0.2s',
      height: '100%',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(249,115,22,0.3)'
        e.currentTarget.style.transform = 'translateY(-4px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Icon */}
      <div style={{
        width: '50px', height: '50px', borderRadius: '6px',
        background: ic.bg, fontSize: '1.4rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '1.2rem',
      }}>{product.icon}</div>

      <p style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
        letterSpacing: '0.15em', textTransform: 'uppercase',
        color: ic.dot, marginBottom: '0.4rem',
      }}>{product.tagline}</p>

      <h3 style={{
        fontFamily: 'var(--font-display)', fontSize: '1.5rem',
        letterSpacing: '0.03em', marginBottom: '0.8rem',
      }}>{product.name}</h3>

      <p style={{ fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
        {product.description}
      </p>

      {/* Specs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: expanded ? '1.5rem' : 0 }}>
        {product.specs.map(s => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: ic.dot, flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.04em', color: 'var(--muted)' }}>{s}</span>
          </div>
        ))}
      </div>

      {/* Applications (expanded view only) */}
      {expanded && (
        <div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.6rem' }}>
            Applications
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {product.applications.map(a => (
              <span key={a} style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '100px', padding: '0.3rem 0.8rem',
                fontSize: '0.75rem', color: 'var(--slate)',
              }}>{a}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
