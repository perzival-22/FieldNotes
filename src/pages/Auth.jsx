import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export default function Auth() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSend(e) {
    e.preventDefault()
    if (!email.trim()) { setError('Please enter your email.'); return }
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.signInWithOtp({ email: email.trim() })
    setLoading(false)
    if (err) {
      setError(err.message || 'Something went wrong.')
    } else {
      setSent(true)
    }
  }

  function skip() { navigate('/') }

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '40px 24px',
      minHeight: '100dvh',
      backgroundColor: 'var(--color-primary)',
    }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{
          display: 'inline-block',
          background: 'var(--color-accent)',
          borderRadius: 8,
          padding: '4px 10px',
          marginBottom: 16,
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#111827', letterSpacing: 1 }}>FIELDNOTES</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px', color: 'var(--color-text)' }}>Sign in</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 14, margin: 0 }}>We'll send a magic link to your email.</p>
      </div>

      {!isSupabaseConfigured ? (
        <div style={{
          padding: 16,
          backgroundColor: 'rgba(245,158,11,0.1)',
          border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: 10,
          marginBottom: 20,
        }}>
          <p style={{ color: 'var(--color-accent)', fontWeight: 600, fontSize: 14, margin: '0 0 4px' }}>Supabase not connected</p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 13, margin: 0 }}>
            The app will run in offline mode using local storage.
          </p>
        </div>
      ) : sent ? (
        <div style={{
          padding: 20,
          backgroundColor: 'rgba(16,185,129,0.1)',
          border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: 10,
          textAlign: 'center',
          marginBottom: 20,
        }}>
          <p style={{ fontSize: 28, margin: '0 0 8px' }}>📬</p>
          <p style={{ fontWeight: 700, color: 'var(--color-success)', margin: '0 0 4px' }}>Check your email</p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 13, margin: 0 }}>
            Magic link sent to {email}. Tap it to sign in.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            style={{
              padding: '14px 16px',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 10,
              fontSize: 16,
              color: 'var(--color-text)',
            }}
          />
          {error && <p style={{ color: 'var(--color-danger)', fontSize: 13, margin: 0 }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '14px',
              backgroundColor: 'var(--color-accent)',
              color: '#111827',
              border: 'none',
              borderRadius: 10,
              fontSize: 16,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Sending…' : 'Send Magic Link'}
          </button>
        </form>
      )}

      <button
        onClick={skip}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--color-text-muted)',
          fontSize: 14,
          cursor: 'pointer',
          padding: '8px 0',
          textAlign: 'center',
        }}
      >
        Continue without signing in → use app offline only
      </button>
    </div>
  )
}
