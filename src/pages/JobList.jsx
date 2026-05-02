import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getJobs, createJob } from '../lib/dataService'
import { PlusIcon, CloseIcon } from '../components/Icons'

const STATUS_TABS = ['all', 'quote', 'active', 'done', 'invoiced', 'paid']

const STATUS_COLORS = {
  quote: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
  active: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
  done: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
  invoiced: { bg: 'rgba(168,85,247,0.15)', color: '#a855f7' },
  paid: { bg: 'rgba(16,185,129,0.2)', color: '#10b981' },
}

const JOB_TYPES = ['residential', 'commercial', 'emergency']

function relativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function JobList() {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [filter, setFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ client_name: '', address: '', phone: '', job_type: 'residential', description: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadJobs()
  }, [])

  async function loadJobs() {
    const data = await getJobs()
    setJobs(data.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)))
  }

  const filtered = filter === 'all' ? jobs : jobs.filter(j => j.status === filter)

  async function handleCreate(e) {
    e.preventDefault()
    if (!form.client_name.trim()) return
    setSaving(true)
    const job = await createJob(form)
    setSaving(false)
    setShowModal(false)
    setForm({ client_name: '', address: '', phone: '', job_type: 'residential', description: '' })
    navigate(`/job/${job.id}`)
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 72 }}>
      {/* Header */}
      <div style={{ padding: '20px 16px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-accent)', letterSpacing: 1.5 }}>FIELDNOTES</span>
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>Job Notes</h1>
          </div>
          <div style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 20,
            padding: '4px 12px',
            fontSize: 13,
            color: 'var(--color-text-muted)',
          }}>
            {jobs.length} job{jobs.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ overflowX: 'auto', padding: '16px 16px 0' }}>
        <div style={{ display: 'flex', gap: 6, width: 'max-content' }}>
          {STATUS_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: filter === tab ? 700 : 400,
                backgroundColor: filter === tab ? 'var(--color-accent)' : 'var(--color-surface)',
                color: filter === tab ? '#111827' : 'var(--color-text-muted)',
                transition: 'all 0.15s',
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Job list */}
      <div style={{ flex: 1, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 ? (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 20px',
            border: '2px dashed var(--color-border)',
            borderRadius: 16,
            color: 'var(--color-text-muted)',
            textAlign: 'center',
            gap: 8,
          }}>
            <p style={{ fontSize: 32, margin: 0 }}>📋</p>
            <p style={{ fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>No jobs yet</p>
            <p style={{ fontSize: 13, margin: 0 }}>Tap + to add your first job.</p>
          </div>
        ) : (
          filtered.map(job => {
            const sc = STATUS_COLORS[job.status] || { bg: 'var(--color-border)', color: 'var(--color-text-muted)' }
            return (
              <button
                key={job.id}
                onClick={() => navigate(`/job/${job.id}`)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 14,
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-text)' }}>
                    {job.client_name || 'Unnamed Client'}
                  </span>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: 20,
                    backgroundColor: sc.bg,
                    color: sc.color,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}>
                    {job.status}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                  {[job.address, job.job_type].filter(Boolean).join(' · ')}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                  Updated {relativeTime(job.updated_at)}
                </div>
              </button>
            )
          })
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowModal(true)}
        style={{
          position: 'fixed',
          bottom: 84,
          right: 'calc(50% - 215px + 16px)',
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: 'var(--color-accent)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#111827',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          zIndex: 40,
        }}
      >
        <PlusIcon className="w-6 h-6" />
      </button>

      {/* New Job Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 60,
          display: 'flex', alignItems: 'flex-end',
        }}>
          <div style={{
            width: '100%', maxWidth: 430, margin: '0 auto',
            backgroundColor: 'var(--color-surface)',
            borderRadius: '20px 20px 0 0',
            padding: '24px 20px 40px',
            maxHeight: '90dvh',
            overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--color-text)' }}>New Job</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Field label="Client Name *" value={form.client_name} onChange={v => setForm(f => ({ ...f, client_name: v }))} placeholder="e.g. John Smith" />
              <Field label="Address" value={form.address} onChange={v => setForm(f => ({ ...f, address: v }))} placeholder="e.g. 12 Main St, London" />
              <Field label="Phone" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} placeholder="e.g. 07700 900000" type="tel" />
              <div>
                <label style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 6, display: 'block', fontWeight: 600 }}>Job Type</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {JOB_TYPES.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, job_type: t }))}
                      style={{
                        flex: 1,
                        padding: '8px 4px',
                        border: '1px solid',
                        borderColor: form.job_type === t ? 'var(--color-accent)' : 'var(--color-border)',
                        borderRadius: 8,
                        background: form.job_type === t ? 'rgba(245,158,11,0.15)' : 'transparent',
                        color: form.job_type === t ? 'var(--color-accent)' : 'var(--color-text-muted)',
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
              </div>
              <Field label="Description" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} placeholder="Brief description of work…" multiline />
              <button
                type="submit"
                disabled={saving || !form.client_name.trim()}
                style={{
                  marginTop: 8,
                  padding: '14px',
                  backgroundColor: 'var(--color-accent)',
                  color: '#111827',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving || !form.client_name.trim() ? 0.6 : 1,
                }}
              >
                {saving ? 'Creating…' : 'Create Job'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text', multiline }) {
  const style = {
    width: '100%',
    padding: '12px 14px',
    backgroundColor: 'var(--color-primary)',
    border: '1px solid var(--color-border)',
    borderRadius: 10,
    fontSize: 15,
    color: 'var(--color-text)',
  }
  return (
    <div>
      <label style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 6, display: 'block', fontWeight: 600 }}>{label}</label>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} style={style} />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={style} />
      }
    </div>
  )
}
