import { Link } from 'react-router-dom'
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { getFoodImage } from '../utils/foodImages'
import './Cart.css'

export default function Cart() {
  const {
    cartItems,
    totalCount,
    subtotal,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  } = useCart()

  const { isAuthenticated } = useAuth()

  // Free delivery threshold is ₹500
  const freeDeliveryThreshold = 500
  const deliveryFee = subtotal >= freeDeliveryThreshold || subtotal === 0 ? 0 : 40
  const tax = Number((subtotal * 0.05).toFixed(2))
  const grandTotal = subtotal + deliveryFee + tax

  // Calculate percentage toward free delivery
  const progressPercent = Math.min(
    100,
    Math.round((subtotal / freeDeliveryThreshold) * 100)
  )
  const remainingForFree = Math.max(0, freeDeliveryThreshold - subtotal)

  return (
    <div className="cart-page">
      <div className="cart-header">
        <div className="cart-title-row">
          <h1 className="cart-title">Your Cart</h1>
          {totalCount > 0 && (
            <span className="cart-badge-count">{totalCount} items</span>
          )}
        </div>
        <p className="cart-subtitle">
          Review your delicious selections before checking out
        </p>
      </div>

      {cartItems.length === 0 ? (
        <div className="cart-empty">
          <div className="cart-empty-icon-box">
            <ShoppingBag size={42} />
          </div>
          <h2 className="cart-empty-title">Your Cart is Empty</h2>
          <p className="cart-empty-desc">
            Looks like you haven&apos;t added any mouth-watering dishes yet.
            Explore our curated menu and satisfy your cravings!
          </p>
          <Link to="/menu" className="btn-proceed-checkout" style={{ width: 'auto', padding: '0.85rem 2rem' }}>
            Explore Menu <ArrowRight size={18} />
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          {/* Left Column: Cart Items List */}
          <div className="cart-items-section">
            <div className="cart-actions-bar">
              <span className="cart-items-count-text">
                {totalCount} {totalCount === 1 ? 'dish' : 'dishes'} in order
              </span>
              <button
                type="button"
                onClick={clearCart}
                className="btn-clear-all"
                title="Remove all items from your cart"
              >
                Clear Cart
              </button>
            </div>

            <div className="cart-items-list">
              {cartItems.map((item) => {
                const menuItem = item.menuItem || {}
                const price = Number(menuItem.price) || 0
                const itemSubtotal = price * (item.quantity || 1)
                const imageUrl = getFoodImage(menuItem)

                const nameLower = (menuItem.name || '').toLowerCase()
                const descLower = (menuItem.description || '').toLowerCase()
                const isNonVeg =
                  menuItem.isVeg === false ||
                  nameLower.includes('chicken') ||
                  nameLower.includes('mutton') ||
                  nameLower.includes('fish') ||
                  /\beggs?\b/i.test(nameLower) ||
                  nameLower.includes('meat') ||
                  nameLower.includes('keema') ||
                  nameLower.includes('sausage') ||
                  nameLower.includes('pepperoni') ||
                  nameLower.includes('prawn') ||
                  descLower.includes('chicken') ||
                  descLower.includes('meat') ||
                  descLower.includes('keema') ||
                  descLower.includes('sausage') ||
                  descLower.includes('pepperoni')

                return (
                  <div key={item.cartItemId} className="cart-item-card">
                    {/* Image */}
                    <div className="cart-item-image-wrapper">
                      <img
                        src={imageUrl}
                        alt={menuItem.name || 'Dish'}
                        className="cart-item-image"
                        loading="lazy"
                      />
                    </div>

                    {/* Details */}
                    <div className="cart-item-info">
                      <div className="cart-item-tags">
                        <div
                          className={`dietary-badge ${isNonVeg ? 'non-veg' : 'veg'}`}
                          title={isNonVeg ? 'Non-Vegetarian' : 'Vegetarian'}
                        >
                          <span className="dietary-dot" />
                        </div>
                        {menuItem.category && (
                          <span className="category-tag">
                            {menuItem.category}
                          </span>
                        )}
                      </div>
                      <h3 className="cart-item-name">{menuItem.name}</h3>
                      <span className="cart-item-unit-price">
                        ₹{price.toFixed(2)} each
                      </span>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="cart-stepper">
                      <button
                        type="button"
                        onClick={() => decreaseQuantity(item.cartItemId)}
                        className="cart-stepper-btn"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="cart-stepper-val">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => increaseQuantity(item.cartItemId)}
                        className="cart-stepper-btn"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Subtotal & Delete */}
                    <div className="cart-item-total-col">
                      <span className="cart-item-subtotal">
                        ₹{itemSubtotal.toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.cartItemId)}
                        className="btn-remove-item"
                        title="Remove dish"
                        aria-label={`Remove ${menuItem.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="cart-footer-links">
              <Link to="/menu" className="btn-back-menu">
                <ArrowLeft size={16} /> Add more dishes
              </Link>
            </div>
          </div>

          {/* Right Column: Order Summary Sidebar */}
          <aside className="cart-summary-sidebar">
            <h2 className="summary-title">Order Summary</h2>

            {/* Free Delivery Bar */}
            <div className="free-delivery-notice">
              {remainingForFree > 0 ? (
                <>
                  <p className="free-delivery-text">
                    <Sparkles size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    Add ₹{remainingForFree.toFixed(2)} more for <strong>FREE delivery</strong>
                  </p>
                  <div className="free-delivery-progress">
                    <div
                      className="free-delivery-bar"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </>
              ) : (
                <p className="free-delivery-text" style={{ color: '#059669', margin: 0 }}>
                  🎉 You unlocked <strong>FREE Delivery!</strong>
                </p>
              )}
            </div>

            {/* Bill Details */}
            <div className="summary-rows">
              <div className="summary-row">
                <span>Items Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className={`summary-row ${deliveryFee === 0 ? 'free' : ''}`}>
                <span>Delivery Fee</span>
                <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}</span>
              </div>
              <div className="summary-row">
                <span>Taxes & GST (5%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="summary-divider" />
              <div className="summary-total-row">
                <span>Grand Total</span>
                <span className="summary-total-amount">
                  ₹{grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            {isAuthenticated ? (
              <Link to="/checkout" className="btn-proceed-checkout">
                Proceed to Checkout <ArrowRight size={18} />
              </Link>
            ) : (
              <div>
                <Link
                  to="/login?redirect=/checkout"
                  className="btn-proceed-checkout"
                >
                  Sign In to Checkout <ArrowRight size={18} />
                </Link>
                <p className="guest-notice">
                  Please sign in to save your address and confirm your delivery.
                </p>
              </div>
            )}

            <div className="safety-note">
              <ShieldCheck size={16} color="#059669" />
              <span>Safe and encrypted checkout experience</span>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
