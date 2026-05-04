import { useState, useRef, useEffect } from 'react'
import { useChatbot } from '../../hooks/useChatbot'

// ── Suggested starter questions ────────────────────────────
const suggestions = [
  'What PP strap should I use for 200kg loads?',
  'Do you offer custom widths and colours?',
  'What is your minimum order quantity?',
  'How do I fix strap slippage on cartons?',
  'What are your delivery timelines?',
]

// ── Markdown-lite renderer (bold + bullets) ───────────────
function renderText(text) {
  return text
    .split('\n')
    .map((line, i) => {
      // Bullet lines
      if (line.trim().startsWith('- ') || line.trim().match(/^\d+\./)) {
        return (
          <div key={i} style={{ display: 'flex', gap: '0.4rem', marginBottom: '2px' }}>
            <span style={{ color: 'var(--orange)', flexShrink: 0 }}>•</span>
            <span>{line.replace(/^[-\d.]\s*/, '')}</span>
          </div>
        )
      }
      if (line.trim() === '' || line === '---') return <br key={i} />
      return <div key={i} style={{ marginBottom: '2px' }}>{line}</div>
    })
}

// ── Typing indicator ──────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '4px 0' }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: '7px', height: '7px', borderRadius: '50%',
          background: 'var(--orange)',
          animation: `typingDot 1.2s ease-in-out ${i * 0.2}s infinite`,
          display: 'inline-block',
        }} />
      ))}
      <style>{`
        @keyframes typingDot {
          0%, 80%, 100% { opacity: 0.25; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}

// ── Main ChatWidget ───────────────────────────────────────
export default function ChatWidget() {
  const [open, setOpen]       = useState(false)
  const [input, setInput]     = useState('')
  const [showSugg, setShowSugg] = useState(true)
  const { messages, loading, sendMessage, clearChat } = useChatbot()
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Focus input when chat opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150)
  }, [open])

  async function handleSend(text) {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')
    setShowSugg(false)
    await sendMessage(msg)
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const hasMessages = messages.length > 0

  return (
    <>
      {/* ── Floating bubble ── */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Open chat"
        style={{
          position: 'fixed', bottom: '2rem', right: '2rem',
          width: '58px', height: '58px', borderRadius: '50%',
          background: open ? 'var(--navy-3)' : 'var(--orange)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.4rem',
          boxShadow: '0 8px 24px rgba(249,115,22,0.4)',
          transition: 'background 0.2s, transform 0.2s',
          zIndex: 1000,
          transform: open ? 'rotate(45deg) scale(0.9)' : 'scale(1)',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = open ? 'rotate(45deg) scale(0.95)' : 'scale(1.08)'}
        onMouseLeave={e => e.currentTarget.style.transform = open ? 'rotate(45deg) scale(0.9)' : 'scale(1)'}
      >
        {open ? '✕' : '💬'}
      </button>

      {/* Unread dot when closed */}
      {!open && (
        <div style={{
          position: 'fixed', bottom: 'calc(2rem + 40px)', right: 'calc(2rem - 4px)',
          width: '12px', height: '12px', borderRadius: '50%',
          background: 'var(--cyan)', border: '2px solid var(--navy)',
          zIndex: 1001, animation: 'pulse 2s infinite',
        }} />
      )}

      {/* ── Chat window ── */}
      <div style={{
        position: 'fixed', bottom: 'calc(2rem + 72px)', right: '2rem',
        width: 'min(380px, calc(100vw - 2rem))',
        maxHeight: '580px',
        background: 'var(--navy-2)',
        border: '1px solid rgba(249,115,22,0.25)',
        borderRadius: '12px',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 999,
        boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
        transition: 'opacity 0.2s, transform 0.25s',
        opacity: open ? 1 : 0,
        transform: open ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.97)',
        pointerEvents: open ? 'all' : 'none',
      }}>

        {/* Header */}
        <div style={{
          padding: '1rem 1.2rem',
          background: 'var(--navy)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '50%',
            background: 'rgba(249,115,22,0.15)',
            border: '1.5px solid rgba(249,115,22,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', flexShrink: 0,
          }}>🤖</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>WellBot</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E' }} />
              <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>PP Strap Expert · Online</span>
            </div>
          </div>
          {hasMessages && (
            <button onClick={() => { clearChat(); setShowSugg(true) }} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--muted)', padding: '4px 8px',
              borderRadius: '4px', transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--white)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
            >Clear</button>
          )}
        </div>

        {/* Messages area */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '1rem',
          display: 'flex', flexDirection: 'column', gap: '0.75rem',
          scrollbarWidth: 'thin',
        }}>

          {/* Welcome message */}
          {!hasMessages && (
            <div>
              <div style={{
                background: 'var(--navy)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '12px 12px 12px 2px',
                padding: '0.85rem 1rem',
                fontSize: '0.86rem', lineHeight: 1.65,
                color: 'var(--slate)',
                maxWidth: '90%',
              }}>
                👋 Hi! I'm <strong style={{ color: 'var(--orange)' }}>WellBot</strong>, your PP strap assistant from Wellpack Industries.<br /><br />
                Ask me anything about our strapping products, specifications, pricing, delivery, or troubleshooting!
              </div>

              {/* Suggestions */}
              {showSugg && (
                <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.2rem' }}>
                    Quick questions:
                  </p>
                  {suggestions.map(s => (
                    <button key={s} onClick={() => handleSend(s)} style={{
                      background: 'rgba(249,115,22,0.08)',
                      border: '1px solid rgba(249,115,22,0.2)',
                      borderRadius: '100px',
                      color: 'var(--slate)', fontSize: '0.78rem',
                      padding: '0.4rem 0.85rem', cursor: 'pointer',
                      textAlign: 'left', transition: 'all 0.15s',
                      fontFamily: 'var(--font-body)',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--orange)'; e.currentTarget.style.color = 'var(--white)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(249,115,22,0.2)'; e.currentTarget.style.color = 'var(--slate)' }}
                    >{s}</button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Chat messages */}
          {messages.map((msg, i) => {
            const isUser = msg.role === 'user'
            return (
              <div key={i} style={{
                display: 'flex',
                justifyContent: isUser ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  maxWidth: '85%',
                  background: isUser ? 'var(--orange)' : 'var(--navy)',
                  border: isUser ? 'none' : '1px solid rgba(255,255,255,0.07)',
                  borderRadius: isUser ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  padding: '0.75rem 1rem',
                  fontSize: '0.85rem', lineHeight: 1.65,
                  color: isUser ? 'var(--white)' : 'var(--slate)',
                }}>
                  {isUser ? msg.content : renderText(msg.content)}
                </div>
              </div>
            )
          })}

          {/* Typing indicator */}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{
                background: 'var(--navy)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '12px 12px 12px 2px',
                padding: '0.75rem 1rem',
              }}>
                <TypingDots />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div style={{
          padding: '0.75rem 1rem',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          background: 'var(--navy)',
          display: 'flex', gap: '0.5rem', alignItems: 'flex-end',
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about PP straps..."
            rows={1}
            disabled={loading}
            style={{
              flex: 1,
              background: 'var(--navy-2)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: 'var(--white)',
              fontSize: '0.85rem',
              padding: '0.6rem 0.85rem',
              outline: 'none',
              resize: 'none',
              lineHeight: 1.5,
              maxHeight: '100px',
              transition: 'border-color 0.2s',
              fontFamily: 'var(--font-body)',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--orange)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            style={{
              width: '38px', height: '38px', borderRadius: '8px',
              background: input.trim() && !loading ? 'var(--orange)' : 'rgba(255,255,255,0.08)',
              border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', transition: 'background 0.2s',
              flexShrink: 0,
            }}
          >
            ➤
          </button>
        </div>

        {/* Disclaimer */}
        <div style={{
          padding: '0.4rem 1rem',
          background: 'var(--navy)',
          borderTop: '1px solid rgba(255,255,255,0.04)',
        }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.06em', color: 'rgba(148,163,184,0.5)', textAlign: 'center' }}>
            WellBot answers PP strap queries only · Powered by AI
          </p>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.75); }
        }
      `}</style>
    </>
  )
}
