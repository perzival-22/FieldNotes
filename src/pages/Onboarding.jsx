import { useNavigate } from 'react-router-dom'
import { BriefcaseIcon, DocumentIcon, FileTextIcon } from '../components/Icons'

const features = [
  { icon: BriefcaseIcon, title: 'Log jobs fast', desc: 'Capture client info, photos, and notes on site — no signal needed.' },
  { icon: DocumentIcon, title: 'Build quotes in seconds', desc: 'Add labour items and materials, set tax, and auto-calculate totals.' },
  { icon: FileTextIcon, title: 'Export professional PDFs', desc: 'Generate branded quote PDFs you can share straight from your phone.' },
]

export default function Onboarding() {
  const navigate = useNavigate()

  function handleStart() {
    localStorage.setItem('fn_onboarded', 'true')
    navigate('/auth')
  }

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      padding: '48px 24px 40px',
      backgroundColor: 'var(--color-primary)',
      minHeight: '100dvh',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{
            display: 'inline-block',
            background: 'var(--color-accent)',
            borderRadius: 10,
            padding: '6px 12px',
            marginBottom: 16,
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#111827', letterSpacing: 1 }}>FIELDNOTES</span>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 8px', lineHeight: 1.2 }}>
            The job book<br />that fits your pocket
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 15, lineHeight: 1.5 }}>
            Built for electricians, plumbers, and builders who work alone.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 16,
              padding: '16px',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 12,
              border: '1px solid var(--color-border)',
            }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                backgroundColor: 'rgba(245,158,11,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: 'var(--color-accent)',
              }}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 15, margin: '0 0 4px', color: 'var(--color-text)' }}>{title}</p>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 13, margin: 0, lineHeight: 1.5 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ paddingTop: 32 }}>
        <button
          onClick={handleStart}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: 'var(--color-accent)',
            color: '#111827',
            border: 'none',
            borderRadius: 12,
            fontSize: 17,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Get Started →
        </button>
      </div>
    </div>
  )
}
