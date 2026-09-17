import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  UtensilsCrossed,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

export default function Register() {
  const { register, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/menu'

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage(null)

    const { name, username, email, password, confirmPassword, phone, address } =
      formData

    // Validation
    if (
      !name.trim() ||
      !username.trim() ||
      !email.trim() ||
      !password ||
      !phone.trim() ||
      !address.trim()
    ) {
      setErrorMessage('Please fill in all required fields.')
      return
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.')
      return
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      return
    }

    if (phone.trim().length < 10) {
      setErrorMessage('Please enter a valid phone number (at least 10 digits).')
      return
    }

    setSubmitting(true)

    try {
      // 1. Submit registration via POST /users
      await register({
        name: name.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        address: address.trim(),
      })

      // 2. Automatically log the newly registered user in
      try {
        await login(username.trim(), password)
        navigate(from, { replace: true })
      } catch (loginErr) {
        console.warn('Auto-login after registration deferred:', loginErr)
        navigate('/login', {
          state: {
            successMessage: 'Account created successfully! Please sign in.',
          },
        })
      }
    } catch (err) {
      console.error('Registration error:', err)
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Registration failed. Please check your details and try again.'
      setErrorMessage(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page-wrapper">
      <div className="auth-box wide">
        <div className="auth-header-block">
          <div className="auth-brand-badge">
            <UtensilsCrossed size={26} />
          </div>
          <h1 className="auth-heading">Join TasteTrail</h1>
          <p className="auth-subheading">
            Create your account to order mouthwatering meals and track deliveries
          </p>
        </div>

        {errorMessage && (
          <div className="auth-error-alert" role="alert">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="auth-grid">
            {/* Full Name */}
            <div className="auth-field-group">
              <label className="auth-label" htmlFor="reg-name">
                Full Name *
              </label>
              <div className="auth-input-wrapper">
                <User size={18} className="auth-input-icon" />
                <input
                  id="reg-name"
                  name="name"
                  type="text"
                  className="auth-input"
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Username */}
            <div className="auth-field-group">
              <label className="auth-label" htmlFor="reg-username">
                Username *
              </label>
              <div className="auth-input-wrapper">
                <User size={18} className="auth-input-icon" />
                <input
                  id="reg-username"
                  name="username"
                  type="text"
                  className="auth-input"
                  placeholder="Choose a unique username"
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="auth-field-group">
              <label className="auth-label" htmlFor="reg-email">
                Email Address *
              </label>
              <div className="auth-input-wrapper">
                <Mail size={18} className="auth-input-icon" />
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  className="auth-input"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div className="auth-field-group">
              <label className="auth-label" htmlFor="reg-phone">
                Phone Number *
              </label>
              <div className="auth-input-wrapper">
                <Phone size={18} className="auth-input-icon" />
                <input
                  id="reg-phone"
                  name="phone"
                  type="tel"
                  className="auth-input"
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="auth-field-group">
              <label className="auth-label" htmlFor="reg-password">
                Password *
              </label>
              <div className="auth-input-wrapper">
                <Lock size={18} className="auth-input-icon" />
                <input
                  id="reg-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="Min. 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
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

            {/* Confirm Password */}
            <div className="auth-field-group">
              <label className="auth-label" htmlFor="reg-confirm-password">
                Confirm Password *
              </label>
              <div className="auth-input-wrapper">
                <Lock size={18} className="auth-input-icon" />
                <input
                  id="reg-confirm-password"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            {/* Default Delivery Address */}
            <div className="auth-field-group full-width">
              <label className="auth-label" htmlFor="reg-address">
                Delivery Address *
              </label>
              <div className="auth-input-wrapper">
                <MapPin size={18} className="auth-input-icon" />
                <input
                  id="reg-address"
                  name="address"
                  type="text"
                  className="auth-input"
                  placeholder="Street, area, city, pincode"
                  value={formData.address}
                  onChange={handleChange}
                  autoComplete="street-address"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn-auth-submit"
            disabled={submitting}
          >
            {submitting ? (
              'Creating Account...'
            ) : (
              <>
                Create Account <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer-nav">
          <span>Already have a TasteTrail account?</span>
          <Link to="/login" className="auth-switch-link">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
