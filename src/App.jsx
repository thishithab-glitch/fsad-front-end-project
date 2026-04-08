import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import AuthPage from './components/AuthPage.jsx'
import AssessmentPage from './components/AssessmentPage.jsx'
import ResultsPage from './components/ResultsPage.jsx'
import AdminPage from './components/AdminPage.jsx'
import StudentDashboard from './components/StudentDashboard.jsx'
import { AppProvider, useAppContext } from './context/AppContext.jsx'

function Navigation() {
  const { user, logout } = useAppContext()
  const location = useLocation()
  const isStudent = user?.role === 'student'

  return (
    <header className="app-header">
      <div className="app-header-left">
        <span className="logo-mark">CC</span>
        <span className="app-title">Career Compass</span>
      </div>
      <nav className="app-nav">
        {isStudent ? (
          <>
            <Link className={location.pathname === '/dashboard' ? 'active' : ''} to="/dashboard">
              Dashboard
            </Link>
            <Link className={location.pathname === '/assessment' ? 'active' : ''} to="/assessment">
              Assessment
            </Link>
            <Link className={location.pathname === '/results' ? 'active' : ''} to="/results">
              Results
            </Link>
          </>
        ) : null}
        <Link className={location.pathname === '/admin' ? 'active' : ''} to="/admin">
          Admin Portal
        </Link>
      </nav>
      <div className="app-header-right">
        {user ? (
          <>
            <span className="user-label">{user.name} ({user.role})</span>
            <button type="button" className="secondary-btn small" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="secondary-btn small">
            Login
          </Link>
        )}
      </div>
    </header>
  )
}

function RequireAuth({ children, allowedRoles }) {
  const { user } = useAppContext()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
  }

  return children
}

function DefaultRoute() {
  const { user } = useAppContext()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
}

function AppShell() {
  const { user } = useAppContext()

  return (
    <div className="shell">
      <Navigation />
      <main className="app-main">
        <Routes>
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
              ) : (
                <AuthPage />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              <RequireAuth allowedRoles={['student']}>
                <StudentDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/assessment"
            element={
              <RequireAuth allowedRoles={['student']}>
                <AssessmentPage />
              </RequireAuth>
            }
          />
          <Route
            path="/results"
            element={
              <RequireAuth allowedRoles={['student']}>
                <ResultsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <AdminPage />
              </RequireAuth>
            }
          />
          <Route path="*" element={<DefaultRoute />} />
        </Routes>
      </main>
      <footer className="app-footer">
        <span>FSAD Career Assessment Tool</span>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </BrowserRouter>
  )
}
