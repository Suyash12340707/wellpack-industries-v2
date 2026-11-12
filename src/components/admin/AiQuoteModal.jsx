import { useState, useMemo } from 'react'
import { generateB2BQuote } from '../../services/aiAgentService'

export default function AiQuoteModal({ order, onClose }) {
  const [copied, setCopied] = useState(false)

  const quoteData = useMemo(() => {
    if (!order) return null
    return generateB2BQuote(order)
  }, [order])

  if (!order || !quoteData) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(quoteData.quoteText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      overflowY: 'auto',
    }}>
      <div style={{
        background: 'var(--navy-2)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(249, 115, 22, 0.4)',
        maxWidth: '680px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px rgba(0,0,0,0.7)',
        padding: '2rem',
        position: 'relative',
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '1.25rem', right: '1.25rem',
            background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
            width: '32px', height: '32px', fontSize: '1.1rem',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--slate)',
          }}
        >
          ✕
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '1.8rem' }}>🤖</span>
          <div>
            <h3 className="display-sm" style={{ letterSpacing: '0.05em' }}>
              AI B2B QUOTATION GENERATOR
            </h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
              Targeting: {order.companyName} ({order.clientName}) • Ref: {order.id}
            </p>
          </div>
        </div>

        {/* Pricing Breakdown Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ background: 'var(--navy)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--muted)' }}>TAXABLE VALUE</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', color: 'var(--white)', fontWeight: 'bold' }}>
              ₹{quoteData.subtotal.toLocaleString('en-IN')}
            </div>
          </div>

          <div style={{ background: 'var(--navy)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--muted)' }}>GST (18%)</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', color: 'var(--cyan)', fontWeight: 'bold' }}>
              ₹{quoteData.gst.toLocaleString('en-IN')}
            </div>
          </div>

          <div style={{ background: 'var(--navy)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(249, 115, 22, 0.3)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--orange)' }}>TOTAL QUOTE (INC. GST)</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', color: 'var(--orange)', fontWeight: 'bold' }}>
              ₹{quoteData.totalWithGst.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Message Preview */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--slate)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Auto-Drafted Message / WhatsApp Body
          </label>
          <pre style={{
            background: 'var(--navy)',
            color: '#E2E8F0',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255,255,255,0.1)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            maxHeight: '280px',
            overflowY: 'auto',
          }}>
            {quoteData.quoteText}
          </pre>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button
            onClick={handleCopy}
            style={{
              padding: '0.7rem 1.25rem', borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(255,255,255,0.2)', background: 'transparent',
              color: 'var(--white)', cursor: 'pointer', fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
            }}
          >
            {copied ? '✓ COPIED TO CLIPBOARD' : '📋 COPY QUOTE TEXT'}
          </button>

          <a
            href={quoteData.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              padding: '0.7rem 1.5rem', borderRadius: 'var(--radius-full)',
              background: '#25D366', color: '#000', fontWeight: 'bold',
              fontFamily: 'var(--font-mono)', fontSize: '0.78rem', textTransform: 'uppercase',
              letterSpacing: '0.05em', textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            }}
          >
            💬 Send Quote on WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
