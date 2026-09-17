import { Link } from 'react-router-dom'
import { UtensilsCrossed, ArrowLeft, Compass } from 'lucide-react'
import './NotFound.css'

export default function NotFound() {
  return (
    <div className="notfound-page-wrapper">
      <div className="notfound-card">
        {/* Visual Badge */}
        <div className="notfound-icon-bubble">
          <div className="notfound-icon-inner">
            <UtensilsCrossed size={40} className="notfound-icon" />
          </div>
          <span className="notfound-status-badge">404</span>
        </div>

        {/* Message */}
        <h1 className="notfound-title">Recipe Not Found</h1>
        <p className="notfound-subtitle">
          Looks like the dish or page you are looking for isn&apos;t on our menu! It may have been moved, devoured, or never existed in our kitchen.
        </p>

        {/* Navigation CTAs */}
        <div className="notfound-actions">
          <Link to="/" className="btn-notfound-primary">
            <ArrowLeft size={18} />
            <span>Back to Home</span>
          </Link>
          <Link to="/menu" className="btn-notfound-secondary">
            <Compass size={18} />
            <span>Explore Menu</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
