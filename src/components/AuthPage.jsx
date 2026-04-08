import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext.jsx'

function Field({ label, type = 'text', value, onChange, required = false }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </label>
  )
}

function RoleButton({ value, label, selectedRole, onClick }) {
  return (
    <button
      type="button"
      className={selectedRole === value ? 'active' : ''}
      onClick={() => onClick(value)}
    >
      {label}
    </button>
  )
}

export default function AuthPage() {
  const { login, signup, isAuthLoading } = useAppContext()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [selectedRole, setSelectedRole] = useState('student')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in all required fields.')
      return
    }

    if (mode === 'signup') {
      if (selectedRole !== 'student') {
        setError('Admin accounts must be created in the backend. Please log in with an admin account.')
        return
      }
      if (!name) {
        setError('Please enter your name.')
        return
      }
      if (password.length < 6) {
        setError('Password should be at least 6 characters.')
        return
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.')
        return
      }
    }

    try {
      let authenticatedUser

      if (mode === 'signup') {
        authenticatedUser = await signup({ name: name || 'Student', email, password })
      } else {
        authenticatedUser = await login({ email, password, role: selectedRole })
      }

      navigate(authenticatedUser.role === 'admin' ? '/admin' : '/dashboard')
    } catch (submitError) {
      setError(submitError.message)
    }
  }

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="auth-card-inner">
          <div className="auth-illustration">
            <img
              src="https://images.pexels.com/photos/5212320/pexels-photo-5212320.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Students planning their careers"
            />
          </div>

          <div className="auth-content">
            <div className="auth-header">
              <h1>Career Compass</h1>
              <p>Login as a student or admin to access the right workspace.</p>
            </div>

            <div className="auth-toggle">
              <button
                type="button"
                className={mode === 'login' ? 'active' : ''}
                onClick={() => setMode('login')}
              >
                Login
              </button>
              <button
                type="button"
                className={mode === 'signup' ? 'active' : ''}
                onClick={() => {
                  setMode('signup')
                  setSelectedRole('student')
                }}
              >
                Sign up
              </button>
            </div>

            <div className="auth-toggle">
              <RoleButton
                value="student"
                label="Student"
                selectedRole={selectedRole}
                onClick={setSelectedRole}
              />
              <RoleButton
                value="admin"
                label="Admin"
                selectedRole={selectedRole}
                onClick={setSelectedRole}
              />
            </div>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              {mode === 'signup' && (
                <Field label="Full name" value={name} onChange={setName} required />
              )}
              <Field label="Email" type="email" value={email} onChange={setEmail} required />
              <Field
                label="Password"
                type="password"
                value={password}
                onChange={setPassword}
                required
              />
              {mode === 'signup' && (
                <Field
                  label="Confirm password"
                  type="password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  required
                />
              )}

              {error && <p className="error-text">{error}</p>}

              <button type="submit" className="primary-btn" disabled={isAuthLoading}>
                {isAuthLoading
                  ? 'Please wait...'
                  : mode === 'login'
                    ? `Login as ${selectedRole}`
                    : 'Create student account'}
              </button>

              <p className="helper-text">
                Students can sign up here. Admin accounts must already exist in the backend before
                logging in.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
