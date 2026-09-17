import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  UtensilsCrossed,
  User,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

export default function Login() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Target destination after successful login
  const from = location.state?.from?.pathname || '/menu'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!username.trim()) {
      setErrorMessage('Please enter your username.')
      return
    }

    if (!password) {
      setErrorMessage('Please enter your password.')
      return
    }

    try {
      await login(username.trim(), password)
      navigate(from, { replace: true })
    } catch (err) {
      console.error('Login error:', err)
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Invalid username or password. Please try again.'
      setErrorMessage(msg)
    }
  }

  return (
    <div className="auth-page-wrapper">
      <div className="auth-box">
        <div className="auth-header-block">
          <div className="auth-brand-badge">
            <UtensilsCrossed size={26} />
          </div>
          <h1 className="auth-heading">Welcome Back</h1>
          <p className="auth-subheading">
            Sign in to access your cart, place orders, and track deliveries
          </p>
        </div>

        {errorMessage && (
          <div className="auth-error-alert" role="alert">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="auth-field-group">
            <label className="auth-label" htmlFor="login-username">
              Username
            </label>
            <div className="auth-input-wrapper">
              <User size={18} className="auth-input-icon" />
              <input
                id="login-username"
                type="text"
                className="auth-input"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="auth-field-group">
            <label className="auth-label" htmlFor="login-password">
              Password
            </label>
            <div className="auth-input-wrapper">
              <Lock size={18} className="auth-input-icon" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="auth-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="auth-toggle-pwd"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-auth-submit"
            disabled={loading}
          >
            {loading ? (
              'Signing In...'
            ) : (
              <>
                Sign In <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer-nav">
          <span>Don&apos;t have an account yet?</span>
          <Link to="/register" className="auth-switch-link">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  )
}
