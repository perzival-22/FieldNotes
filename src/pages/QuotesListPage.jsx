import { useNavigate } from 'react-router-dom'
import { getAllQuotes, getSettings, getCurrencySymbol } from '../lib/localStorage'
import { useState, useEffect } from 'react'

const STATUS_COLORS = {
  draft: { bg: 'rgba(156,163,175,0.15)', color: '#9ca3af' },
  sent: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
  accepted: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
  declined: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
}

export default function QuotesListPage() {
  const navigate = useNavigate()
  const [quotes, setQuotes] = useState([])
  const settings = getSettings()
  const sym = getCurrencySymbol(settings.currency || 'USD')

  useEffect(() => {
    setQuotes(getAllQuotes().sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
  }, [])

  return (
    <div style={{ flex: 1, paddingBottom: 80 }}>
      <div style={{ padding: '24px 16px 16px' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>All Quotes</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 13, margin: '4px 0 0' }}>{quotes.length} quote{quotes.length !== 1 ? 's' : ''}</p>
      </div>

      {quotes.length === 0 ? (
        <div style={{
          margin: '20px 16px',
          padding: '48px 20px',
          border: '2px dashed var(--color-border)',
          borderRadius: 16,
          textAlign: 'center',
          color: 'var(--color-text-muted)',
        }}>
          <p style={{ fontSize: 32, margin: '0 0 8px' }}>📄</p>
          <p style={{ fontWeight: 600, color: 'var(--color-text)', margin: '0 0 4px' }}>No quotes yet</p>
          <p style={{ fontSize: 13, margin: 0 }}>Create quotes from within a job.</p>
        </div>
      ) : (
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {quotes.map(q => {
            const sc = STATUS_COLORS[q.status] || STATUS_COLORS.draft
            return (
              <button
                key={q.id}
                onClick={() => navigate(`/quote/${q.id}`)}
                style={{
                  width: '100%', padding: '14px 16px',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text)' }}>{q.reference}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                    {new Date(q.created_at).toLocaleDateString('en-US')}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-accent)' }}>{sym}{Number(q.total).toFixed(2)}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, backgroundColor: sc.bg, color: sc.color, textTransform: 'capitalize' }}>
                    {q.status}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
