import { useState } from 'react'
import { useScrollFadeUp } from '../hooks/useScrollFadeUp'
import { submitEnquiry, validateEnquiry } from '../utils/formHandler'
import FadeUpWrapper from '../components/ui/FadeUpWrapper'
import SectionTag from '../components/ui/SectionTag'

const contactDetails = [
  { icon: '📍', label: 'Address', lines: ['Ghanegaon MIDC Area Waluj', 'Plot No 01,  Gut No 248', 'Aurangabad, – 431136', 'Maharashtra, India'] },
  { icon: '📞', label: 'Phone', lines: ['+91 9404531172', '+91 7620119677'] },
  { icon: '✉️', label: 'Email', lines: ['wellpack38@gmail.com' ] },
  { icon: '🕐', label: 'Working Hours', lines: ['Mon – Sat: 9:00 AM – 6:30 PM', 'Sunday: Closed'] },
]

const inputStyle = {
  background: 'var(--navy-2)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '2px',
  color: 'var(--white)',
  fontSize: '0.9rem',
  padding: '0.75rem 1rem',
  outline: 'none',
  width: '100%',
  transition: 'border-color 0.2s',
  fontFamily: 'var(--font-body)',
}

export default function Contact() {
  useScrollFadeUp()

  const [form, setForm]     = useState({ name: '', company: '', email: '', phone: '', product: '', message: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [focused, setFocused] = useState('')

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const focusStyle = (field) => focused === field ? { ...inputStyle, borderColor: 'var(--orange)' } : inputStyle

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validateEnquiry(form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setStatus('loading')
    try {
      await submitEnquiry(form)
      setStatus('success')
      setForm({ name: '', company: '', email: '', phone: '', product: '', message: '' })
    } catch {
      setStatus('error')
    }
  }

  return (
    <>
      {/* Hero */}
      <section style={{ padding: '10rem 5vw 4rem', background: 'var(--navy)', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '-80px', right: '-120px',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.09) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <FadeUpWrapper>
            <SectionTag>Get In Touch</SectionTag>
            <h1 className="display-xl" style={{ marginBottom: '1rem' }}>
              LET'S TALK<br />
              <span style={{ color: 'var(--orange)' }}>PACKAGING.</span>
            </h1>
            <p className="lead">Send us your requirements and get a quote within 24 hours.</p>
          </FadeUpWrapper>
        </div>
      </section>

      {/* Main contact section */}
      <section style={{ padding: '5rem 5vw', background: 'var(--navy)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '5rem', alignItems: 'start' }}>

          {/* Contact info */}
          <FadeUpWrapper>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {contactDetails.map(({ icon, label, lines }) => (
                <div key={label} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '4px',
                    background: 'rgba(249,115,22,0.1)',
                    border: '1px solid rgba(249,115,22,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.1rem', flexShrink: 0,
                  }}>{icon}</div>
                  <div>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--orange)', marginBottom: '0.3rem' }}>{label}</p>
                    {lines.map(l => <p key={l} style={{ fontSize: '0.9rem', color: 'var(--slate)', lineHeight: 1.65 }}>{l}</p>)}
                  </div>
                </div>
              ))}
            </div>

            {/* ── GOOGLE MAPS EMBED ──────────────────────────────────
                HOW TO GET YOUR EMBED URL:
                1. Go to maps.google.com
                2. Search your business address
                3. Click Share → Embed a map
                4. Copy the src URL from the <iframe> code
                5. Paste it below replacing YOUR_EMBED_URL
            ─────────────────────────────────────────────────── */}
            <div style={{ marginTop: '2rem', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(249,115,22,0.2)' }}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3752.8096595863217!2d75.19562807499808!3d19.848005081522086!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bdb9b7915ac923d%3A0xf9ec45e152f1dc76!2sWellpack%20industries!5e0!3m2!1sen!2sin!4v1776616315849!5m2!1sen!2sin"
                width="100%"
                height="220"
                style={{ border: 0, display: 'block', filter: 'invert(90%) hue-rotate(180deg)' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Wellpack Industries Location"
              />
            </div>
          </FadeUpWrapper>

          {/* Contact form */}
          <FadeUpWrapper delay={1}>
            <div style={{
              background: 'var(--navy-2)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '8px', padding: '2.5rem',
            }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: '0.3rem' }}>Send an Enquiry</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '2rem' }}>We'll respond within 24 business hours.</p>

              {status === 'success' ? (
                <div style={{
                  background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                  borderRadius: '6px', padding: '2rem', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>✅</div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--green)', marginBottom: '0.5rem' }}>Enquiry Sent!</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Thank you. Our team will contact you within 24 hours.</p>
                  <button onClick={() => setStatus('idle')} style={{
                    marginTop: '1.5rem',
                    background: 'transparent', border: '1px solid rgba(34,197,94,0.4)',
                    color: 'var(--green)', padding: '0.6rem 1.5rem', borderRadius: '2px',
                    fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.1em',
                    textTransform: 'uppercase', cursor: 'pointer',
                  }}>Send Another</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Name + Company */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {[{ k: 'name', ph: 'Rajesh Kumar', label: 'Your Name *' }, { k: 'company', ph: 'ABC Logistics', label: 'Company Name' }].map(({ k, ph, label }) => (
                      <div key={k}>
                        <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.4rem' }}>{label}</label>
                        <input value={form[k]} onChange={set(k)} placeholder={ph}
                          onFocus={() => setFocused(k)} onBlur={() => setFocused('')}
                          style={focusStyle(k)} />
                        {errors[k] && <p style={{ fontSize: '0.75rem', color: '#F87171', marginTop: '0.25rem' }}>{errors[k]}</p>}
                      </div>
                    ))}
                  </div>

                  {/* Email + Phone */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {[{ k: 'email', ph: 'you@company.com', label: 'Email Address *', type: 'email' }, { k: 'phone', ph: '+91 98765 43210', label: 'Phone Number', type: 'tel' }].map(({ k, ph, label, type }) => (
                      <div key={k}>
                        <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.4rem' }}>{label}</label>
                        <input type={type} value={form[k]} onChange={set(k)} placeholder={ph}
                          onFocus={() => setFocused(k)} onBlur={() => setFocused('')}
                          style={focusStyle(k)} />
                        {errors[k] && <p style={{ fontSize: '0.75rem', color: '#F87171', marginTop: '0.25rem' }}>{errors[k]}</p>}
                      </div>
                    ))}
                  </div>

                  {/* Product */}
                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.4rem' }}>Product Interest</label>
                    <select value={form.product} onChange={set('product')}
                      onFocus={() => setFocused('product')} onBlur={() => setFocused('')}
                      style={{ ...focusStyle('product'), appearance: 'none' }}>
                      <option value="">Select a product...</option>
                      {['Standard PP Strap', 'Embossed PP Strap', 'Eco PP Strap', 'Woven PP Strap', 'Printed PP Strap', 'Box Strapping Roll', 'Custom Requirement'].map(o => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.4rem' }}>Requirements *</label>
                    <textarea value={form.message} onChange={set('message')} rows={4}
                      placeholder="Width, thickness, quantity, colour, spool weight..."
                      onFocus={() => setFocused('message')} onBlur={() => setFocused('')}
                      style={{ ...focusStyle('message'), resize: 'vertical' }} />
                    {errors.message && <p style={{ fontSize: '0.75rem', color: '#F87171', marginTop: '0.25rem' }}>{errors.message}</p>}
                  </div>

                  <button type="submit" disabled={status === 'loading'} style={{
                    background: status === 'loading' ? 'var(--orange-dark)' : 'var(--orange)',
                    color: 'var(--white)', border: 'none',
                    fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
                    fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                    padding: '1rem 2rem', borderRadius: '2px',
                    cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s', alignSelf: 'flex-start',
                  }}>
                    {status === 'loading' ? 'Sending...' : 'Send Enquiry →'}
                  </button>

                  {status === 'error' && (
                    <p style={{ fontSize: '0.82rem', color: '#F87171' }}>Something went wrong. Please try again or call us directly.</p>
                  )}
                </form>
              )}
            </div>
          </FadeUpWrapper>
        </div>
        <style>{`
          @media (max-width: 860px) {
            section > div { grid-template-columns: 1fr !important; gap: 3rem !important; }
            div[style*="gridTemplateColumns: '1fr 1fr'"] { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>
    </>
  )
}
