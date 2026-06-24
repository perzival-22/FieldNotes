import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { getJobById, getMaterials, createQuote, updateQuote } from '../lib/dataService'
import { getSettings, getAllQuotes, getCurrencySymbol } from '../lib/localStorage'
import { generateQuotePDF } from '../lib/pdfGenerator'
import { ArrowLeftIcon, PlusIcon, TrashIcon } from '../components/Icons'

const QUOTE_STATUSES = ['draft', 'sent', 'accepted', 'declined']

export default function QuoteBuilder() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const jobId = searchParams.get('jobId')
  const isNew = id === 'new'

  const [job, setJob] = useState(null)
  const [materials, setMaterials] = useState([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showAddLabour, setShowAddLabour] = useState(false)
  const settings = getSettings()

  const sym = getCurrencySymbol(settings.currency || 'USD')
  const taxLabel = settings.taxLabel || 'Sales Tax'
  const configuredTaxRate = settings.taxRate || 0
  const defaultRate = settings.defaultHourlyRate || 75

  const [applyTax, setApplyTax] = useState(false)

  const [quote, setQuote] = useState({
    labour_items: [],
    vat_rate: 0,
    valid_until: '',
    status: 'draft',
    notes: '',
    subtotal: 0,
    vat_amount: 0,
    total: 0,
    reference: '',
  })

  const [labourForm, setLabourForm] = useState({ description: '', hours: '', rate: String(defaultRate) })

  useEffect(() => {
    loadData()
  }, [id, jobId])

  useEffect(() => {
    recalc()
  }, [quote.labour_items, quote.vat_rate, materials])

  async function loadData() {
    if (isNew && jobId) {
      const [j, m] = await Promise.all([getJobById(jobId), getMaterials(jobId)])
      setJob(j)
      setMaterials(m || [])
      const all = getAllQuotes()
      const ref = `FN-${String(all.length + 1).padStart(3, '0')}`
      setQuote(q => ({ ...q, job_id: jobId, reference: ref }))
    } else if (!isNew) {
      const allQ = getAllQuotes()
      const existing = allQ.find(q => q.id === id)
      if (existing) {
        const [j, m] = await Promise.all([getJobById(existing.job_id), getMaterials(existing.job_id)])
        setJob(j)
        setMaterials(m || [])
        setQuote({ ...existing })
        setApplyTax((existing.vat_rate || 0) > 0)
      }
    }
    setLoading(false)
  }

  function recalc() {
    const labourTotal = (quote.labour_items || []).reduce((s, i) => s + (i.hours * i.rate), 0)
    const matsTotal = materials.reduce((s, m) => s + (m.cost * m.quantity), 0)
    const subtotal = labourTotal + matsTotal
    const effectiveRate = quote.vat_rate || 0
    const vat_amount = subtotal * (effectiveRate / 100)
    const total = subtotal + vat_amount
    setQuote(q => ({ ...q, subtotal, vat_amount, total }))
  }

  function toggleTax(on) {
    setApplyTax(on)
    setQuote(q => ({ ...q, vat_rate: on ? configuredTaxRate : 0 }))
  }

  function addLabourItem(e) {
    e.preventDefault()
    const item = {
      description: labourForm.description || 'Labour',
      hours: parseFloat(labourForm.hours) || 0,
      rate: parseFloat(labourForm.rate) || defaultRate,
    }
    setQuote(q => ({ ...q, labour_items: [...(q.labour_items || []), item] }))
    setLabourForm({ description: '', hours: '', rate: String(defaultRate) })
    setShowAddLabour(false)
  }

  function removeLabourItem(idx) {
    setQuote(q => ({ ...q, labour_items: q.labour_items.filter((_, i) => i !== idx) }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      if (isNew) {
        await createQuote({ ...quote, job_id: jobId })
      } else {
        await updateQuote(id, quote)
      }
      navigate(job ? `/job/${job.id}` : '/')
    } finally {
      setSaving(false)
    }
  }

  async function handleGeneratePDF() {
    const doc = generateQuotePDF(quote, job || {}, settings, materials)
    const filename = `quote-${quote.reference || 'draft'}.pdf`
    if (navigator.share) {
      const blob = doc.output('blob')
      const file = new File([blob], filename, { type: 'application/pdf' })
      try {
        await navigator.share({ files: [file], title: `Quote ${quote.reference}` })
        return
      } catch {}
    }
    doc.save(filename)
  }

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, borderRadius: 16, border: '3px solid var(--color-accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 100 }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 30,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px',
        backgroundColor: 'var(--color-primary)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <ArrowLeftIcon className="w-5 h-5" />
          <span style={{ fontSize: 14 }}>{job?.client_name || 'Back'}</span>
        </button>
        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-accent)' }}>
          {quote.reference || 'New Quote'}
        </span>
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* Labour */}
        <QSection title="Labour">
          {(quote.labour_items || []).map((item, idx) => (
            <div key={idx} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 0', borderBottom: '1px solid var(--color-border)',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text)' }}>{item.description}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                  {item.hours} hrs × {sym}{item.rate}/hr = {sym}{(item.hours * item.rate).toFixed(2)}
                </div>
              </div>
              <button onClick={() => removeLabourItem(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', padding: 4 }}>
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}

          {showAddLabour ? (
            <form onSubmit={addLabourItem} style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 12 }}>
              <SInput placeholder="Description (e.g. Electrical inspection)" value={labourForm.description} onChange={v => setLabourForm(f => ({ ...f, description: v }))} />
              <div style={{ display: 'flex', gap: 8 }}>
                <SInput placeholder="Hours" value={labourForm.hours} onChange={v => setLabourForm(f => ({ ...f, hours: v }))} type="number" />
                <SInput placeholder={`Rate ${sym}/hr`} value={labourForm.rate} onChange={v => setLabourForm(f => ({ ...f, rate: v }))} type="number" />
              </div>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                = {sym}{((parseFloat(labourForm.hours) || 0) * (parseFloat(labourForm.rate) || 0)).toFixed(2)}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: 'var(--color-accent)', color: '#111827', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Add Item</button>
                <button type="button" onClick={() => setShowAddLabour(false)} style={{ flex: 1, padding: '10px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text-muted)', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowAddLabour(true)}
              style={{
                marginTop: 10, width: '100%', padding: '10px',
                backgroundColor: 'transparent', border: '1px dashed var(--color-border)',
                borderRadius: 10, cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: 13,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              <PlusIcon className="w-4 h-4" /> Add Labour Item
            </button>
          )}
        </QSection>

        {/* Materials from job */}
        {materials.length > 0 && (
          <QSection title="Materials (from job)">
            {materials.map(m => (
              <div key={m.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 14, color: 'var(--color-text)' }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{m.quantity} × {sym}{Number(m.cost).toFixed(2)}</div>
                </div>
                <div style={{ fontSize: 14, color: 'var(--color-accent)', fontWeight: 600 }}>{sym}{(m.quantity * m.cost).toFixed(2)}</div>
              </div>
            ))}
          </QSection>
        )}

        {/* Totals */}
        <div style={{ padding: '16px 0', borderBottom: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <TotalRow label="Subtotal" value={quote.subtotal} sym={sym} />
          {applyTax && <TotalRow label={`${taxLabel} (${configuredTaxRate}%)`} value={quote.vat_amount} sym={sym} />}
          <TotalRow label="TOTAL" value={quote.total} bold accent sym={sym} />
        </div>

        {/* Quote Settings */}
        <QSection title="Quote Settings">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={labelStyle}>Valid Until</label>
              <input
                type="date"
                value={quote.valid_until || ''}
                onChange={e => setQuote(q => ({ ...q, valid_until: e.target.value }))}
                style={{ ...inputStyle, colorScheme: 'dark' }}
              />
            </div>

            {/* Tax toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: 14, color: 'var(--color-text)' }}>Apply {taxLabel}</span>
                {configuredTaxRate > 0 && (
                  <span style={{ fontSize: 12, color: 'var(--color-text-muted)', marginLeft: 6 }}>({configuredTaxRate}%)</span>
                )}
                {configuredTaxRate === 0 && (
                  <span style={{ fontSize: 12, color: 'var(--color-text-muted)', marginLeft: 6 }}>— set rate in Settings</span>
                )}
              </div>
              <button
                onClick={() => toggleTax(!applyTax)}
                style={{
                  width: 48, height: 28, borderRadius: 14,
                  backgroundColor: applyTax ? 'var(--color-accent)' : 'var(--color-border)',
                  border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
                }}
              >
                <div style={{
                  position: 'absolute', top: 3, left: applyTax ? 23 : 3,
                  width: 22, height: 22, borderRadius: 11,
                  backgroundColor: '#fff', transition: 'left 0.2s',
                }} />
              </button>
            </div>

            <div>
              <label style={labelStyle}>Status</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {QUOTE_STATUSES.map(s => (
                  <button
                    key={s}
                    onClick={() => setQuote(q => ({ ...q, status: s }))}
                    style={{
                      padding: '6px 14px', borderRadius: 20, border: '1px solid',
                      borderColor: quote.status === s ? 'var(--color-accent)' : 'var(--color-border)',
                      backgroundColor: quote.status === s ? 'rgba(245,158,11,0.15)' : 'transparent',
                      color: quote.status === s ? 'var(--color-accent)' : 'var(--color-text-muted)',
                      fontSize: 13, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Notes</label>
              <textarea
                value={quote.notes || ''}
                onChange={e => setQuote(q => ({ ...q, notes: e.target.value }))}
                placeholder="Any notes for the client…"
                rows={3}
                style={inputStyle}
              />
            </div>
          </div>
        </QSection>

        {/* Actions */}
        <div style={{ padding: '20px 0', display: 'flex', gap: 12 }}>
          <button
            onClick={handleGeneratePDF}
            style={{
              flex: 1, padding: '14px',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 12, color: 'var(--color-text)', fontWeight: 700, fontSize: 15, cursor: 'pointer',
            }}
          >
            Generate PDF
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              flex: 1, padding: '14px',
              backgroundColor: 'var(--color-accent)',
              border: 'none', borderRadius: 12,
              color: '#111827', fontWeight: 700, fontSize: 15, cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'Saving…' : 'Save Quote'}
          </button>
        </div>
      </div>
    </div>
  )
}

const labelStyle = { fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 6, display: 'block', fontWeight: 600 }
const inputStyle = {
  width: '100%', padding: '10px 12px',
  backgroundColor: 'var(--color-primary)',
  border: '1px solid var(--color-border)',
  borderRadius: 10, fontSize: 14, color: 'var(--color-text)',
}

function QSection({ title, children }) {
  return (
    <div style={{ padding: '16px 0', borderBottom: '1px solid var(--color-border)' }}>
      <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 12px' }}>{title}</h3>
      {children}
    </div>
  )
}

function TotalRow({ label, value, bold, accent, sym }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, alignItems: 'center' }}>
      <span style={{ fontSize: 14, color: 'var(--color-text-muted)', fontWeight: bold ? 700 : 400 }}>{label}:</span>
      <span style={{ fontSize: bold ? 18 : 14, fontWeight: bold ? 800 : 500, color: accent ? 'var(--color-accent)' : 'var(--color-text)', minWidth: 80, textAlign: 'right' }}>
        {sym}{Number(value || 0).toFixed(2)}
      </span>
    </div>
  )
}

function SInput({ placeholder, value, onChange, type = 'text' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ flex: 1, padding: '10px 12px', backgroundColor: 'var(--color-primary)', border: '1px solid var(--color-border)', borderRadius: 10, fontSize: 14, color: 'var(--color-text)' }}
    />
  )
}
