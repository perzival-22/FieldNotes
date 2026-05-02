import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSettings, saveSettings } from '../lib/localStorage'
import useAuth from '../hooks/useAuth'

export default function Settings() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [settings, setSettings] = useState(getSettings())
  const [confirmClear, setConfirmClear] = useState(false)

  function handleChange(key, value) {
    const updated = { ...settings, [key]: value }
    setSettings(updated)
    saveSettings(updated)
  }

  function handleClearAll() {
    ['fn_jobs', 'fn_materials', 'fn_quotes', 'fn_settings', 'fn_onboarded'].forEach(k => localStorage.removeItem(k))
    setConfirmClear(false)
    navigate('/onboarding')
  }

  return (
    <div style={{ flex: 1, paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ padding: '24px 16px 16px' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>Settings</h1>
      </div>

      {/* Profile */}
      <SettingsSection title="Your Profile">
        <SettingsField label="Trader Name" value={settings.traderName || ''} onChange={v => handleChange('traderName', v)} placeholder="Your name" />
        <SettingsField label="Company Name" value={settings.companyName || ''} onChange={v => handleChange('companyName', v)} placeholder="Company name" />
        <SettingsField label="Phone" value={settings.phone || ''} onChange={v => handleChange('phone', v)} placeholder="Phone number" type="tel" />
        <SettingsField label="Email" value={settings.email || ''} onChange={v => handleChange('email', v)} placeholder="your@email.com" type="email" />
      </SettingsSection>

      {/* Defaults */}
      <SettingsSection title="Defaults">
        <SettingsField
          label="Default Hourly Rate"
          value={settings.defaultHourlyRate || ''}
          onChange={v => handleChange('defaultHourlyRate', parseFloat(v) || 0)}
          placeholder="e.g. 65"
          type="number"
          prefix="£"
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
          <span style={{ fontSize: 14, color: 'var(--color-text)' }}>VAT Registered</span>
          <button
            onClick={() => handleChange('vatRegistered', !settings.vatRegistered)}
            style={{
              width: 48, height: 28, borderRadius: 14,
              backgroundColor: settings.vatRegistered ? 'var(--color-accent)' : 'var(--color-border)',
              border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
            }}
          >
            <div style={{
              position: 'absolute', top: 3, left: settings.vatRegistered ? 23 : 3,
              width: 22, height: 22, borderRadius: 11,
              backgroundColor: '#fff', transition: 'left 0.2s',
            }} />
          </button>
        </div>
        <div style={{ padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
          <label style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 8, display: 'block', fontWeight: 600 }}>Currency</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {['GBP', 'EUR', 'USD'].map(c => (
              <button
                key={c}
                onClick={() => handleChange('currency', c)}
                style={{
                  flex: 1, padding: '8px',
                  border: '1px solid',
                  borderColor: (settings.currency || 'GBP') === c ? 'var(--color-accent)' : 'var(--color-border)',
                  borderRadius: 8,
                  backgroundColor: (settings.currency || 'GBP') === c ? 'rgba(245,158,11,0.15)' : 'transparent',
                  color: (settings.currency || 'GBP') === c ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </SettingsSection>

      {/* Account */}
      <SettingsSection title="Account">
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
            <div>
              <div style={{ fontSize: 14, color: 'var(--color-text)', fontWeight: 600 }}>Signed in</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{user.email}</div>
            </div>
            <button
              onClick={signOut}
              style={{
                padding: '8px 16px', backgroundColor: 'transparent',
                border: '1px solid var(--color-border)', borderRadius: 8,
                color: 'var(--color-text-muted)', fontSize: 13, cursor: 'pointer',
              }}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div style={{ padding: '12px 0' }}>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14, margin: '0 0 12px' }}>Not signed in — using app offline only.</p>
            <button
              onClick={() => navigate('/auth')}
              style={{
                padding: '10px 20px', backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)', borderRadius: 10,
                color: 'var(--color-accent)', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              }}
            >
              Sign In
            </button>
          </div>
        )}
      </SettingsSection>

      {/* About */}
      <SettingsSection title="About">
        <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>App</span>
            <span style={{ fontSize: 14, color: 'var(--color-text)', fontWeight: 600 }}>FieldNotes</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>Version</span>
            <span style={{ fontSize: 14, color: 'var(--color-text)' }}>1.0.0</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>GitHub</span>
            <a href="https://github.com/perzival-22/FieldNotes" target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent)', fontSize: 14 }}>View source ↗</a>
          </div>
        </div>
      </SettingsSection>

      {/* Danger Zone */}
      <SettingsSection title="Danger Zone">
        <button
          onClick={() => setConfirmClear(true)}
          style={{
            width: '100%', padding: '12px',
            backgroundColor: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 10, cursor: 'pointer',
            color: 'var(--color-danger)', fontSize: 14, fontWeight: 700,
          }}
        >
          Clear All Data
        </button>
        {confirmClear && (
          <div style={{ marginTop: 12, padding: 14, backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10 }}>
            <p style={{ color: 'var(--color-text)', fontSize: 14, margin: '0 0 12px', fontWeight: 600 }}>
              This will delete all jobs, materials, quotes, and settings. Cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleClearAll} style={{ flex: 1, padding: '10px', backgroundColor: 'var(--color-danger)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Yes, Clear Everything</button>
              <button onClick={() => setConfirmClear(false)} style={{ flex: 1, padding: '10px', backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)', borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        )}
      </SettingsSection>
    </div>
  )
}

function SettingsSection({ title, children }) {
  return (
    <div style={{ padding: '0 16px', marginBottom: 8 }}>
      <h3 style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 1.5, margin: '0 0 4px', padding: '12px 0 4px' }}>
        {title}
      </h3>
      <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 14, padding: '0 14px', border: '1px solid var(--color-border)' }}>
        {children}
      </div>
    </div>
  )
}

function SettingsField({ label, value, onChange, placeholder, type = 'text', prefix }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
      <span style={{ fontSize: 14, color: 'var(--color-text)', width: 140, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
        {prefix && <span style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>{prefix}</span>}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ flex: 1, fontSize: 14, color: 'var(--color-text)', background: 'transparent', border: 'none', textAlign: 'right' }}
        />
      </div>
    </div>
  )
}
