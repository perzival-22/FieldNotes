import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAuth from './hooks/useAuth'
import { isSupabaseConfigured } from './lib/supabase'
import BottomNav from './components/BottomNav'
import Onboarding from './pages/Onboarding'
import Auth from './pages/Auth'
import JobList from './pages/JobList'
import JobDetail from './pages/JobDetail'
import QuoteBuilder from './pages/QuoteBuilder'
import Settings from './pages/Settings'
import QuotesListPage from './pages/QuotesListPage'

function AppRoutes() {
  const { session, loading } = useAuth()
  const onboarded = localStorage.getItem('fn_onboarded') === 'true'

  if (loading) {
    return (
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'var(--color-primary)',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 18,
          border: '3px solid var(--color-accent)',
          borderTopColor: 'transparent',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!onboarded) {
    return (
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    )
  }

  if (isSupabaseConfigured && !session) {
    return (
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    )
  }

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <Routes>
          <Route path="/" element={<JobList />} />
          <Route path="/job/:id" element={<JobDetail />} />
          <Route path="/quote/:id" element={<QuoteBuilder />} />
          <Route path="/quotes" element={<QuotesListPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/auth" element={<Navigate to="/" replace />} />
          <Route path="/onboarding" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <BottomNav />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
