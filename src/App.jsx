import { BrowserRouter, Link, Route, Routes, Navigate, useLocation } from 'react-router-dom'
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

  return (
    <header className="app-header">
      <div className="app-header-left">
        <span className="logo-mark">CC</span>
        <span className="app-title">Career Compass</span>
      </div>
      <nav className="app-nav">
        <Link className={location.pathname === '/dashboard' ? 'active' : ''} to="/dashboard">
          Dashboard
        </Link>
        <Link className={location.pathname === '/assessment' ? 'active' : ''} to="/assessment">
          Assessment
        </Link>
        <Link className={location.pathname === '/results' ? 'active' : ''} to="/results">
          Results
        </Link>
        <Link className={location.pathname === '/admin' ? 'active' : ''} to="/admin">
          Admin
        </Link>
      </nav>
      <div className="app-header-right">
        {user ? (
          <>
            <span className="user-label">{user.name}</span>
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

function AppShell() {
  return (
    <div className="shell">
      <Navigation />
      <main className="app-main">
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/assessment" element={<AssessmentPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
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

