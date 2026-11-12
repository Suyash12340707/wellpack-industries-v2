import { useState } from 'react'
import { ordersStore } from '../../data/ordersStore'

export default function AdminLoginModal({ onLoginSuccess }) {
  const [pin, setPin] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!pin.trim()) return

    setLoading(true)
    try {
      const result = await ordersStore.loginAdmin(pin)
      if (result.success) {
        setErrorMsg('')
        if (onLoginSuccess) onLoginSuccess()
      } else {
        setErrorMsg(result.message || 'Incorrect PIN. (Default PIN: 1234)')
      }
    } catch {
      setErrorMsg('An error occurred during verification.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 5vw',
    }}>
      <div style={{
        background: 'var(--navy-2)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(249, 115, 22, 0.3)',
        padding: '3rem 2.5rem',
        maxWidth: '420px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
      }}>
        <div style={{
          width: '54px', height: '54px', borderRadius: '50%',
          background: 'rgba(249, 115, 22, 0.15)',
          border: '1px solid var(--orange)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', margin: '0 auto 1.25rem',
        }}>
          🔒
        </div>

        <h2 className="display-sm" style={{ letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
          OWNER PORTAL LOGIN
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>
          Enter your authorized Master PIN to access the Wellpack Industries Operations & AI Dashboard.
        </p>

        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #EF4444',
            color: '#FCA5A5',
            padding: '0.6rem 0.8rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            fontSize: '0.82rem',
            fontFamily: 'var(--font-mono)',
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1.5rem' }}>
            <input
              type="password"
              placeholder="Enter PIN (Default: 1234)"
              autoFocus
              value={pin}
              onChange={e => { setPin(e.target.value); setErrorMsg(''); }}
              style={{
                width: '100%',
                padding: '0.85rem',
                textAlign: 'center',
                letterSpacing: '0.3em',
                fontSize: '1.3rem',
                fontWeight: 'bold',
                borderRadius: 'var(--radius-md)',
                background: 'var(--navy)',
                color: 'var(--white)',
                border: '1px solid rgba(255,255,255,0.2)',
                outline: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.85rem',
              borderRadius: 'var(--radius-full)',
              background: 'var(--orange)',
              color: '#000',
              fontWeight: 'bold',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              boxShadow: '0 4px 14px rgba(249, 115, 22, 0.3)',
            }}
          >
            {loading ? 'VERIFYING SECURITY TOKEN...' : 'UNLOCK DASHBOARD →'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--muted)' }}>
          Tip: Demo PIN is <span style={{ color: 'var(--orange)' }}>1234</span>
        </div>
      </div>
    </div>
  )
}
