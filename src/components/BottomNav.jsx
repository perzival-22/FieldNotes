import { useLocation, useNavigate } from 'react-router-dom'
import { BriefcaseIcon, DocumentIcon, GearIcon } from './Icons'

const tabs = [
  { label: 'Jobs', icon: BriefcaseIcon, path: '/' },
  { label: 'Quotes', icon: DocumentIcon, path: '/quotes' },
  { label: 'Settings', icon: GearIcon, path: '/settings' },
]

const hiddenOn = ['/onboarding', '/auth']

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  if (hiddenOn.includes(location.pathname)) return null

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 430,
        backgroundColor: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        zIndex: 50,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '8px 0' }}>
        {tabs.map(({ label, icon: Icon, path }) => {
          const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                padding: '4px 16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
                fontSize: 11,
                fontWeight: isActive ? 600 : 400,
              }}
            >
              <Icon className="w-6 h-6" />
              {label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
