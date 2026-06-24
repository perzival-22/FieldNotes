import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getJobById, updateJob, deleteJob, getMaterials, addMaterial, updateMaterial, deleteMaterial, getQuotes } from '../lib/dataService'
import { getSettings, getCurrencySymbol } from '../lib/localStorage'
import { ArrowLeftIcon, PlusIcon, TrashIcon, CloseIcon } from '../components/Icons'

const STATUSES = ['quote', 'active', 'done', 'invoiced', 'paid']
const JOB_TYPES = ['residential', 'commercial', 'emergency']

const STATUS_COLORS = {
  quote: '#f59e0b',
  active: '#3b82f6',
  done: '#10b981',
  invoiced: '#a855f7',
  paid: '#10b981',
}

function useDebounce(fn, delay) {
  const timer = useRef(null)
  return useCallback((...args) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => fn(...args), delay)
  }, [fn, delay])
}

export default function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [materials, setMaterials] = useState([])
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [addMatForm, setAddMatForm] = useState(null)
  const [editMatId, setEditMatId] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    loadAll()
  }, [id])

  async function loadAll() {
    const [j, m, q] = await Promise.all([getJobById(id), getMaterials(id), getQuotes(id)])
    setJob(j)
    setMaterials(m || [])
    setQuotes(q || [])
    setLoading(false)
  }

  const debouncedUpdate = useDebounce(async (field, value) => {
    await updateJob(id, { [field]: value })
  }, 800)

  function handleField(field, value) {
    setJob(j => ({ ...j, [field]: value }))
    debouncedUpdate(field, value)
  }

  async function handleStatus(status) {
    setJob(j => ({ ...j, status }))
    await updateJob(id, { status })
  }

  async function handleDelete() {
    await deleteJob(id)
    navigate('/')
  }

  async function handleAddMaterial(e) {
    e.preventDefault()
    const data = { name: addMatForm.name, cost: parseFloat(addMatForm.cost) || 0, quantity: parseFloat(addMatForm.qty) || 1 }
    const m = await addMaterial(id, data)
    setMaterials(ms => [m, ...ms])
    setAddMatForm(null)
  }

  async function handleDeleteMaterial(mid) {
    await deleteMaterial(mid)
    setMaterials(ms => ms.filter(m => m.id !== mid))
  }

  async function handleUpdateMaterial(mid, updates) {
    await updateMaterial(mid, updates)
    setMaterials(ms => ms.map(m => m.id === mid ? { ...m, ...updates } : m))
    setEditMatId(null)
  }

  const settings = getSettings()
  const sym = getCurrencySymbol(settings.currency || 'USD')
  const matTotal = materials.reduce((s, m) => s + (m.cost * m.quantity), 0)

  const STATUS_BADGE = {
    quote: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
    active: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
    done: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
    invoiced: { bg: 'rgba(168,85,247,0.15)', color: '#a855f7' },
    paid: { bg: 'rgba(16,185,129,0.2)', color: '#10b981' },
  }

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, borderRadius: 16, border: '3px solid var(--color-accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  if (!job) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: 'var(--color-text-muted)' }}>
      <p style={{ fontSize: 40, margin: 0 }}>🔍</p>
      <p>Job not found</p>
      <button onClick={() => navigate('/')} style={{ color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15 }}>Go back</button>
    </div>
  )

  const sc = STATUS_BADGE[job.status] || { bg: 'var(--color-border)', color: 'var(--color-text-muted)' }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 80 }}>
      {/* Sticky header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 30,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px',
        backgroundColor: 'var(--color-primary)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text)', flex: 1, marginLeft: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {job.client_name || 'Job Detail'}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20, backgroundColor: sc.bg, color: sc.color, textTransform: 'uppercase' }}>
          {job.status}
        </span>
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 0 }}>
        {/* Status pipeline */}
        <Section title="Status">
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {STATUSES.map(s => (
              <button
                key={s}
                onClick={() => handleStatus(s)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 20,
                  border: '1px solid',
                  borderColor: job.status === s ? STATUS_COLORS[s] : 'var(--color-border)',
                  backgroundColor: job.status === s ? `${STATUS_COLORS[s]}22` : 'transparent',
                  color: job.status === s ? STATUS_COLORS[s] : 'var(--color-text-muted)',
                  fontSize: 13,
                  fontWeight: job.status === s ? 700 : 400,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  textTransform: 'capitalize',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </Section>

        {/* Client Info */}
        <Section title="Client Info">
          <InlineField label="Name" value={job.client_name} onChange={v => handleField('client_name', v)} placeholder="Client name" />
          <InlineField label="Address" value={job.address} onChange={v => handleField('address', v)} placeholder="Address" />
          <InlineField label="Phone" value={job.phone} onChange={v => handleField('phone', v)} placeholder="Phone" type="tel" />
          <InlineField label="Email" value={job.email} onChange={v => handleField('email', v)} placeholder="Email" type="email" />
        </Section>

        {/* Job Type */}
        <Section title="Job Type">
          <div style={{ display: 'flex', gap: 8 }}>
            {JOB_TYPES.map(t => (
              <button
                key={t}
                onClick={() => handleField('job_type', t)}
                style={{
                  flex: 1,
                  padding: '8px 4px',
                  border: '1px solid',
                  borderColor: job.job_type === t ? 'var(--color-accent)' : 'var(--color-border)',
                  borderRadius: 8,
                  background: job.job_type === t ? 'rgba(245,158,11,0.15)' : 'transparent',
                  color: job.job_type === t ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </Section>

        {/* Description */}
        <Section title="Description">
          <textarea
            value={job.description || ''}
            onChange={e => handleField('description', e.target.value)}
            placeholder="Describe the work to be done…"
            rows={3}
            style={{
              width: '100%', padding: '10px 12px',
              backgroundColor: 'var(--color-primary)',
              border: '1px solid var(--color-border)',
              borderRadius: 10,
              fontSize: 14, color: 'var(--color-text)',
            }}
          />
        </Section>

        {/* Materials */}
        <Section title={`Materials${matTotal > 0 ? ` — Total: ${sym}${matTotal.toFixed(2)}` : ''}`}>
          {materials.map(m => (
            <div key={m.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 0', borderBottom: '1px solid var(--color-border)',
            }}>
              {editMatId === m.id ? (
                <EditMaterialInline mat={m} onSave={(upd) => handleUpdateMaterial(m.id, upd)} onCancel={() => setEditMatId(null)} />
              ) : (
                <>
                  <div onClick={() => setEditMatId(m.id)} style={{ flex: 1, cursor: 'pointer' }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text)' }}>{m.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                      {m.quantity} × {sym}{Number(m.cost).toFixed(2)} = {sym}{(m.quantity * m.cost).toFixed(2)}
                    </div>
                  </div>
                  <button onClick={() => handleDeleteMaterial(m.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', padding: '4px' }}>
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          ))}

          {addMatForm ? (
            <form onSubmit={handleAddMaterial} style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 10 }}>
              <SmallInput placeholder="Material name" value={addMatForm.name} onChange={v => setAddMatForm(f => ({ ...f, name: v }))} />
              <div style={{ display: 'flex', gap: 8 }}>
                <SmallInput placeholder="Qty" value={addMatForm.qty} onChange={v => setAddMatForm(f => ({ ...f, qty: v }))} type="number" />
                <SmallInput placeholder={`Cost ${sym}`} value={addMatForm.cost} onChange={v => setAddMatForm(f => ({ ...f, cost: v }))} type="number" />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" style={{ flex: 1, padding: '8px', backgroundColor: 'var(--color-accent)', color: '#111827', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Add</button>
                <button type="button" onClick={() => setAddMatForm(null)} style={{ flex: 1, padding: '8px', backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setAddMatForm({ name: '', qty: '1', cost: '' })}
              style={{
                marginTop: 10, width: '100%', padding: '10px',
                backgroundColor: 'transparent',
                border: '1px dashed var(--color-border)',
                borderRadius: 10, cursor: 'pointer',
                color: 'var(--color-text-muted)', fontSize: 13,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              <PlusIcon className="w-4 h-4" /> Add Material
            </button>
          )}
        </Section>

        {/* Labour Notes */}
        <Section title="Labour Notes">
          <textarea
            value={job.labour_notes || ''}
            onChange={e => handleField('labour_notes', e.target.value)}
            placeholder="Notes on labour, time spent, etc."
            rows={3}
            style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--color-primary)', border: '1px solid var(--color-border)', borderRadius: 10, fontSize: 14, color: 'var(--color-text)' }}
          />
        </Section>

        {/* Internal Notes */}
        <Section title="Internal Notes">
          <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: '0 0 8px' }}>Private — not shown on quotes</p>
          <textarea
            value={job.internal_notes || ''}
            onChange={e => handleField('internal_notes', e.target.value)}
            placeholder="Private notes…"
            rows={3}
            style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--color-primary)', border: '1px solid var(--color-border)', borderRadius: 10, fontSize: 14, color: 'var(--color-text)' }}
          />
        </Section>

        {/* Quotes */}
        <Section title="Quotes">
          {quotes.length > 0 && quotes.map(q => (
            <button
              key={q.id}
              onClick={() => navigate(`/quote/${q.id}`)}
              style={{
                width: '100%', padding: '12px 14px', marginBottom: 8,
                backgroundColor: 'var(--color-primary)',
                border: '1px solid var(--color-border)', borderRadius: 10,
                cursor: 'pointer', textAlign: 'left',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text)' }}>{q.reference}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>{q.status}</div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-accent)' }}>{sym}{Number(q.total).toFixed(2)}</div>
            </button>
          ))}
          <button
            onClick={() => navigate(`/quote/new?jobId=${id}`)}
            style={{
              width: '100%', padding: '12px',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 10, cursor: 'pointer',
              color: 'var(--color-accent)', fontWeight: 700, fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            <PlusIcon className="w-4 h-4" /> New Quote
          </button>
          <button
            onClick={() => navigate(`/quote/new?jobId=${id}`)}
            style={{
              marginTop: 8, width: '100%', padding: '12px',
              backgroundColor: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: 10, cursor: 'pointer',
              color: 'var(--color-text-muted)', fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            Build Quote →
          </button>
        </Section>

        {/* Danger Zone */}
        <Section title="Danger Zone">
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => handleField('status', 'archived')}
              style={{
                flex: 1, padding: '10px',
                backgroundColor: 'transparent',
                border: '1px solid var(--color-border)',
                borderRadius: 10, cursor: 'pointer',
                color: 'var(--color-text-muted)', fontSize: 13, fontWeight: 600,
              }}
            >
              Archive Job
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              style={{
                flex: 1, padding: '10px',
                backgroundColor: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 10, cursor: 'pointer',
                color: 'var(--color-danger)', fontSize: 13, fontWeight: 600,
              }}
            >
              Delete Job
            </button>
          </div>
          {confirmDelete && (
            <div style={{ marginTop: 12, padding: 14, backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10 }}>
              <p style={{ color: 'var(--color-text)', fontSize: 14, margin: '0 0 12px', fontWeight: 600 }}>Are you sure? This cannot be undone.</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleDelete} style={{ flex: 1, padding: '10px', backgroundColor: 'var(--color-danger)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Yes, Delete</button>
                <button onClick={() => setConfirmDelete(false)} style={{ flex: 1, padding: '10px', backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)', borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          )}
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ padding: '16px 0', borderBottom: '1px solid var(--color-border)' }}>
      <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 12px' }}>{title}</h3>
      {children}
    </div>
  )
}

function InlineField({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
      <span style={{ fontSize: 12, color: 'var(--color-text-muted)', width: 54, flexShrink: 0, fontWeight: 600 }}>{label}</span>
      <input
        type={type}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ flex: 1, fontSize: 14, color: 'var(--color-text)', background: 'transparent', border: 'none', padding: '2px 0' }}
      />
    </div>
  )
}

function SmallInput({ placeholder, value, onChange, type = 'text' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        flex: 1, padding: '8px 10px',
        backgroundColor: 'var(--color-primary)',
        border: '1px solid var(--color-border)',
        borderRadius: 8, fontSize: 13,
        color: 'var(--color-text)',
      }}
    />
  )
}

function EditMaterialInline({ mat, onSave, onCancel }) {
  const [name, setName] = useState(mat.name)
  const [qty, setQty] = useState(String(mat.quantity))
  const [cost, setCost] = useState(String(mat.cost))
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <SmallInput placeholder="Name" value={name} onChange={setName} />
      <div style={{ display: 'flex', gap: 6 }}>
        <SmallInput placeholder="Qty" value={qty} onChange={setQty} type="number" />
        <SmallInput placeholder="Cost $" value={cost} onChange={setCost} type="number" />
        <button onClick={() => onSave({ name, quantity: parseFloat(qty) || 1, cost: parseFloat(cost) || 0 })} style={{ padding: '6px 12px', backgroundColor: 'var(--color-accent)', color: '#111827', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Save</button>
        <button onClick={onCancel} style={{ padding: '6px 10px', backgroundColor: 'transparent', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12, cursor: 'pointer', color: 'var(--color-text-muted)' }}>✕</button>
      </div>
    </div>
  )
}
