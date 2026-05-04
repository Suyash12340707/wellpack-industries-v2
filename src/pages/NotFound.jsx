import Button from '../components/ui/Button'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: '2rem 5vw',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Glow */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(6rem, 20vw, 12rem)',
        lineHeight: 1, color: 'var(--orange)',
        opacity: 0.25, marginBottom: '-1rem',
        position: 'relative', zIndex: 1,
      }}>404</div>

      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(2rem, 5vw, 3.5rem)',
        marginBottom: '1rem',
        position: 'relative', zIndex: 1,
      }}>PAGE NOT FOUND</h1>

      <p style={{
        fontSize: '1rem', color: 'var(--muted)',
        lineHeight: 1.7, maxWidth: '380px', marginBottom: '2.5rem',
        position: 'relative', zIndex: 1,
      }}>
        Looks like this page got lost in the warehouse. Let's get you back to the right place.
      </p>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
        <Button to="/" variant="primary">Back to Home</Button>
        <Button to="/contact" variant="secondary">Contact Us</Button>
      </div>
    </div>
  )
}
