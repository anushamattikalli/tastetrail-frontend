import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ShoppingCart, Search, Menu as MenuIcon, X, UtensilsCrossed, User, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import './Navbar.css'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const { totalCount } = useCart()
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/menu?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setMobileMenuOpen(false)
    }
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <header className="navbar-container">
      <div className="navbar-main">
        {/* Brand / Logo */}
        <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
          <div className="logo-icon-wrap">
            <UtensilsCrossed className="logo-icon" size={22} />
          </div>
          <span className="logo-text">TasteTrail</span>
        </Link>

        {/* Desktop Search Bar */}
        <form className="navbar-search" onSubmit={handleSearchSubmit}>
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search food, cuisines, dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* Desktop Navigation Links */}
        <nav className="navbar-links">
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Home
          </NavLink>
          <NavLink
            to="/menu"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Menu
          </NavLink>
          {isAuthenticated && (
            <NavLink
              to="/orders"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Orders
            </NavLink>
          )}
        </nav>

        {/* Actions (Cart & Auth) */}
        <div className="navbar-actions">
          {/* Cart Icon with badge */}
          <Link to="/cart" className="cart-button" aria-label="Cart" onClick={closeMobileMenu}>
            <ShoppingCart size={22} />
            {totalCount > 0 && <span className="cart-badge">{totalCount > 99 ? '99+' : totalCount}</span>}
          </Link>

          {/* User Auth Buttons */}
          <div className="auth-buttons-desktop">
            {isAuthenticated ? (
              <div className="user-profile-menu">
                <span className="user-chip">
                  <User size={16} />
                  <span className="user-name">{user?.name || user?.username || 'User'}</span>
                </span>
                <button
                  onClick={() => {
                    logout()
                    closeMobileMenu()
                  }}
                  className="btn-logout"
                  title="Logout"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="auth-links">
                <Link to="/login" className="btn-login">
                  Login
                </Link>
                <Link to="/register" className="btn-register">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="mobile-menu-dropdown">
          {/* Mobile Search */}
          <form className="mobile-search" onSubmit={handleSearchSubmit}>
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          {/* Mobile Links */}
          <div className="mobile-nav-links">
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? 'mobile-nav-link active' : 'mobile-nav-link')}
              onClick={closeMobileMenu}
            >
              Home
            </NavLink>
            <NavLink
              to="/menu"
              className={({ isActive }) => (isActive ? 'mobile-nav-link active' : 'mobile-nav-link')}
              onClick={closeMobileMenu}
            >
              Explore Menu
            </NavLink>
            {isAuthenticated && (
              <NavLink
                to="/orders"
                className={({ isActive }) => (isActive ? 'mobile-nav-link active' : 'mobile-nav-link')}
                onClick={closeMobileMenu}
              >
                My Orders
              </NavLink>
            )}
            <NavLink
              to="/cart"
              className={({ isActive }) => (isActive ? 'mobile-nav-link active' : 'mobile-nav-link')}
              onClick={closeMobileMenu}
            >
              Cart ({totalCount})
            </NavLink>
          </div>

          {/* Mobile Auth */}
          <div className="mobile-auth-section">
            {isAuthenticated ? (
              <div className="mobile-user-actions">
                <div className="mobile-user-info">
                  <User size={18} />
                  <span>{user?.name || user?.username}</span>
                </div>
                <button
                  onClick={() => {
                    logout()
                    closeMobileMenu()
                  }}
                  className="mobile-logout-btn"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="mobile-auth-buttons">
                <Link to="/login" className="btn-login full-width" onClick={closeMobileMenu}>
                  Login
                </Link>
                <Link to="/register" className="btn-register full-width" onClick={closeMobileMenu}>
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
