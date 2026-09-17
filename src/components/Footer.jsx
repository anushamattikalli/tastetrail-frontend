import { Link } from 'react-router-dom'
import { UtensilsCrossed, MapPin, Phone, Mail, Clock } from 'lucide-react'
import './Footer.css'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer-container">
      <div className="footer-content">
        {/* Col 1: Brand & Bio */}
        <div className="footer-col brand-col">
          <Link to="/" className="footer-logo">
            <div className="footer-logo-icon">
              <UtensilsCrossed size={20} />
            </div>
            <span className="footer-logo-text">TasteTrail</span>
          </Link>
          <p className="footer-description">
            Bringing your city&apos;s best culinary flavors and gourmet experiences
            straight to your doorstep, fresh and fast.
          </p>
        </div>

        {/* Col 2: Quick Links */}
        <div className="footer-col">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-links">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/menu">Explore Menu</Link>
            </li>
            <li>
              <Link to="/cart">My Cart</Link>
            </li>
            <li>
              <Link to="/orders">Order History</Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Customer Care / Auth */}
        <div className="footer-col">
          <h4 className="footer-heading">Account & Help</h4>
          <ul className="footer-links">
            <li>
              <Link to="/login">Sign In</Link>
            </li>
            <li>
              <Link to="/register">Create Account</Link>
            </li>
            <li>
              <Link to="/checkout">Checkout</Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Contact info */}
        <div className="footer-col contact-col">
          <h4 className="footer-heading">Contact Us</h4>
          <ul className="footer-contact">
            <li>
              <MapPin size={16} className="contact-icon" />
              <span>123 Foodie Blvd, Suite 400</span>
            </li>
            <li>
              <Phone size={16} className="contact-icon" />
              <span>+1 (800) 555-FOOD</span>
            </li>
            <li>
              <Mail size={16} className="contact-icon" />
              <span>support@tastetrail.com</span>
            </li>
            <li>
              <Clock size={16} className="contact-icon" />
              <span>8:00 AM – 11:00 PM Daily</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <p>© {currentYear} TasteTrail Inc. All rights reserved.</p>
        <p className="footer-tagline">Delicious food, delivered fast.</p>
      </div>
    </footer>
  )
}
