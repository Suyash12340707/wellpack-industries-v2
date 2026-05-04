const stats = [
  { num: '15+',  label: 'Years in Industry' },
  { num: '500+', label: 'Clients Served' },
  { num: '20+',  label: 'Product Variants' },
  { num: 'PAN',  label: 'India Delivery' },
]

export default function StatsBar() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      borderTop: '1px solid rgba(255,255,255,0.07)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
    }}>
      {stats.map(({ num, label }, i) => (
        <div key={label} style={{
          padding: '2.5rem 2rem', textAlign: 'center',
          borderRight: i < stats.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
        }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.8rem', color: 'var(--orange)',
            lineHeight: 1, marginBottom: '0.4rem',
          }}>{num}</div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.68rem', letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'var(--muted)',
          }}>{label}</div>
        </div>
      ))}
      <style>{`
        @media (max-width: 600px) {
          div[style*="repeat(4"] { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  )
}
