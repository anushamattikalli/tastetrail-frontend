import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MapPin,
  CreditCard,
  QrCode,
  Banknote,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Clock,
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import orderService from '../services/orderService'
import paymentService from '../services/paymentService'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import './Checkout.css'

export default function Checkout() {
  const { cartId, cartItems, subtotal, resetCart } = useCart()
  const { user, isAuthenticated } = useAuth()

  // Form State
  const [streetAddress, setStreetAddress] = useState(user?.address || '')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [pincode, setPincode] = useState('')
  const [deliveryNotes, setDeliveryNotes] = useState('')

  // Payment method: UPI, CARD, or CASH (exact backend enums/values)
  const [paymentMethod, setPaymentMethod] = useState('UPI')
  const [upiId, setUpiId] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')

  // Submission State
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [placedOrder, setPlacedOrder] = useState(null)
  const [paymentResult, setPaymentResult] = useState(null)

  // Pricing calculations
  const deliveryFee = subtotal >= 500 || subtotal === 0 ? 0 : 40
  const tax = Number((subtotal * 0.05).toFixed(2))
  const grandTotal = Number((subtotal + deliveryFee + tax).toFixed(2))

  // Pre-fill user profile address if available
  const handleUseSavedAddress = () => {
    if (user?.address) {
      setStreetAddress(user.address)
    }
  }

  // Handle Order Placement
  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    if (!cartItems || cartItems.length === 0) {
      setErrorMessage('Your cart is empty. Please add items to your cart before proceeding.')
      return
    }

    if (!streetAddress.trim()) {
      setErrorMessage('Please provide a complete delivery street address.')
      return
    }

    if (!city.trim() || !pincode.trim()) {
      setErrorMessage('Please provide both city and pincode for accurate delivery.')
      return
    }

    // Format full address
    const fullAddress = [
      streetAddress.trim(),
      city.trim(),
      state.trim(),
      pincode.trim(),
      deliveryNotes.trim() ? `Notes: ${deliveryNotes.trim()}` : null,
    ]
      .filter(Boolean)
      .join(', ')

    setSubmitting(true)

    try {
      let activeCartId = cartId

      // Ensure user has a valid cart on backend
      if (!activeCartId && user?.userId) {
        try {
          const cartRes = await api.get(`/carts/user/${user.userId}`)
          activeCartId = cartRes.data?.cartId
        } catch {
          const createRes = await api.post(`/carts/user/${user.userId}`)
          activeCartId = createRes.data?.cartId
        }
      }

      if (!activeCartId) {
        throw new Error('Unable to locate an active cart. Please try again.')
      }

      // 1. Place order via backend POST /orders/place?cartId=...&deliveryAddress=...
      const order = await orderService.placeOrder(activeCartId, fullAddress)

      // 2. Create payment record via backend POST /payments?orderId=...&paymentMethod=...
      let payment = null
      let confirmedOrder = { ...order, status: 'CONFIRMED' }
      try {
        payment = await paymentService.createPayment(order.orderId, paymentMethod)
        // Complete payment successfully (payment simulation)
        if (payment && payment.paymentId) {
          try {
            const updatedPayment = await paymentService.updatePaymentStatus(
              payment.paymentId,
              'SUCCESS'
            )
            if (updatedPayment) {
              payment = updatedPayment
            }
            // Fetch updated order from backend confirming transition to CONFIRMED
            const backendOrder = await orderService.getOrderById(order.orderId)
            if (backendOrder) {
              confirmedOrder = backendOrder
            }
          } catch (simErr) {
            console.warn('Payment success simulation notice:', simErr)
          }
        }
      } catch (payErr) {
        console.warn('Payment record creation deferred or warning:', payErr)
      }

      // 3. Clear local cart state
      resetCart()

      // 4. Set state to display confirmation
      setPlacedOrder(confirmedOrder)
      setPaymentResult(payment)
    } catch (err) {
      console.error('Order placement failed:', err)
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to place order. Please verify your items and try again.'
      setErrorMessage(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // If user is not authenticated, prompt to sign in
  if (!isAuthenticated) {
    return (
      <div className="checkout-page">
        <div className="checkout-card" style={{ maxWidth: 520, margin: '3rem auto', textAlign: 'center' }}>
          <ShoppingBag size={48} color="var(--primary)" style={{ margin: '0 auto 1.25rem' }} />
          <h2 className="checkout-card-title" style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>
            Sign In to Checkout
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem', lineHeight: '1.6' }}>
            Please sign in or create an account to enter your delivery address and confirm your TasteTrail order.
          </p>
          <Link
            to="/login?redirect=/checkout"
            className="btn-place-order"
            style={{ textDecoration: 'none' }}
          >
            Sign In Now <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    )
  }

  // If order was placed successfully, display confirmation receipt
  if (placedOrder) {
    const formattedDate = placedOrder.orderDate
      ? new Date(placedOrder.orderDate).toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : new Date().toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })

    return (
      <div className="checkout-page">
        <div className="order-success-card">
          <div className="success-icon-wrapper">
            <CheckCircle2 size={44} />
          </div>
          <h1 className="order-success-title">Order Placed Successfully!</h1>
          <p className="order-success-subtitle">
            Your delicious meal is now being prepared. We&apos;ll notify you when it&apos;s out for delivery!
          </p>

          <div className="receipt-details-box">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#059669',
                padding: '0.6rem 1rem',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '0.92rem',
                marginBottom: '1rem',
              }}
            >
              <Clock size={16} />
              <span>Estimated Delivery: 30 - 40 minutes</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Order Number</span>
              <span className="receipt-val">#ORD-{placedOrder.orderId}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Date & Time</span>
              <span className="receipt-val">{formattedDate}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Delivery Address</span>
              <span className="receipt-val" style={{ maxWidth: 300, textAlign: 'right' }}>
                {placedOrder.deliveryAddress}
              </span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Order Status</span>
              <span className="receipt-badge placed">
                {placedOrder.status || 'PLACED'}
              </span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Payment Method</span>
              <span className="receipt-val">
                {paymentResult?.paymentMethod || paymentMethod}
              </span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Payment Status</span>
              <span className="receipt-val" style={{ color: '#059669' }}>
                {paymentResult?.paymentStatus || 'PENDING'}
              </span>
            </div>
            <div className="receipt-row" style={{ fontSize: '1.1rem', paddingTop: '0.85rem' }}>
              <span className="receipt-label" style={{ fontWeight: 700, color: 'var(--text-dark)' }}>
                Total Paid / Due
              </span>
              <span className="receipt-val" style={{ color: 'var(--primary)', fontSize: '1.25rem' }}>
                ₹{Number(placedOrder.totalAmount || grandTotal).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="order-success-actions">
            <Link to="/orders" className="btn-place-order" style={{ textDecoration: 'none' }}>
              <Clock size={18} /> View Order History & Tracking
            </Link>
            <Link
              to="/menu"
              className="btn-place-order"
              style={{
                textDecoration: 'none',
                backgroundColor: '#f3f4f6',
                color: 'var(--text-dark)',
                boxShadow: 'none',
              }}
            >
              Order More Food
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // If cart has no items and no order placed
  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-card" style={{ maxWidth: 520, margin: '3rem auto', textAlign: 'center' }}>
          <ShoppingBag size={48} color="var(--primary)" style={{ margin: '0 auto 1.25rem' }} />
          <h2 className="checkout-card-title" style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>
            Your Cart is Empty
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
            You need to add dishes to your cart before proceeding to checkout.
          </p>
          <Link to="/menu" className="btn-place-order" style={{ textDecoration: 'none' }}>
            Explore Menu <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <h1 className="checkout-title">Checkout</h1>
        <p className="checkout-subtitle">
          Confirm your delivery address and choose your preferred payment option
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="checkout-layout">
        {/* Left Column: Delivery Address & Payment Choice */}
        <div className="checkout-form-section">
          {/* Error Banner */}
          {errorMessage && (
            <div className="checkout-error-banner" role="alert">
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Delivery Address */}
          <div className="checkout-card">
            <div className="checkout-card-header">
              <span className="card-step-badge">1</span>
              <h2 className="checkout-card-title">
                <MapPin size={18} style={{ display: 'inline', marginRight: '6px' }} />
                Delivery Address
              </h2>
            </div>

            {user?.address && (
              <div className="saved-address-pill">
                <span>
                  Profile Address: <strong>{user.address}</strong>
                </span>
                <button
                  type="button"
                  onClick={handleUseSavedAddress}
                  className="btn-use-saved"
                >
                  Use This
                </button>
              </div>
            )}

            <div className="form-grid">
              <div className="form-group full-width">
                <label className="form-label" htmlFor="streetAddress">
                  Street Address / Flat / Building *
                </label>
                <textarea
                  id="streetAddress"
                  className="form-textarea"
                  placeholder="e.g. Flat 302, Palm Heights, MG Road"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="city">
                  City *
                </label>
                <input
                  id="city"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Bangalore"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="state">
                  State
                </label>
                <input
                  id="state"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Karnataka"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="pincode">
                  PIN Code *
                </label>
                <input
                  id="pincode"
                  type="text"
                  className="form-input"
                  placeholder="e.g. 560001"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="deliveryNotes">
                  Landmark / Instructions
                </label>
                <input
                  id="deliveryNotes"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Leave at door, ring bell"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Payment Method */}
          <div className="checkout-card">
            <div className="checkout-card-header">
              <span className="card-step-badge">2</span>
              <h2 className="checkout-card-title">
                <CreditCard size={18} style={{ display: 'inline', marginRight: '6px' }} />
                Payment Method
              </h2>
            </div>

            <div className="payment-methods-grid">
              {/* UPI Option */}
              <div
                className={`payment-method-card ${
                  paymentMethod === 'UPI' ? 'selected' : ''
                }`}
                onClick={() => setPaymentMethod('UPI')}
              >
                <QrCode size={28} className="payment-method-icon" />
                <span className="payment-method-name">UPI</span>
                <span className="payment-method-desc">GPay, PhonePe, Paytm</span>
              </div>

              {/* CARD Option */}
              <div
                className={`payment-method-card ${
                  paymentMethod === 'CARD' ? 'selected' : ''
                }`}
                onClick={() => setPaymentMethod('CARD')}
              >
                <CreditCard size={28} className="payment-method-icon" />
                <span className="payment-method-name">Cards</span>
                <span className="payment-method-desc">Credit / Debit Card</span>
              </div>

              {/* CASH Option */}
              <div
                className={`payment-method-card ${
                  paymentMethod === 'CASH' ? 'selected' : ''
                }`}
                onClick={() => setPaymentMethod('CASH')}
              >
                <Banknote size={28} className="payment-method-icon" />
                <span className="payment-method-name">Cash on Delivery</span>
                <span className="payment-method-desc">Pay at doorstep</span>
              </div>
            </div>

            {/* Dynamic details for chosen payment method */}
            {paymentMethod === 'UPI' && (
              <div className="payment-details-box">
                <div className="form-group">
                  <label className="form-label" htmlFor="upiId">
                    UPI ID / VPA
                  </label>
                  <input
                    id="upiId"
                    type="text"
                    className="form-input"
                    placeholder="e.g. yourname@okhdfcbank"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                  <p className="payment-details-note">
                    A payment request will be sent to your UPI app, or you can scan a QR code on arrival.
                  </p>
                </div>
              </div>
            )}

            {paymentMethod === 'CARD' && (
              <div className="payment-details-box">
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label className="form-label" htmlFor="cardNumber">
                      Card Number
                    </label>
                    <input
                      id="cardNumber"
                      type="text"
                      maxLength={19}
                      className="form-input"
                      placeholder="XXXX XXXX XXXX XXXX"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="cardExpiry">
                      Valid Thru
                    </label>
                    <input
                      id="cardExpiry"
                      type="text"
                      maxLength={5}
                      className="form-input"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="cardCvv">
                      CVV
                    </label>
                    <input
                      id="cardCvv"
                      type="password"
                      maxLength={4}
                      className="form-input"
                      placeholder="•••"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'CASH' && (
              <div className="payment-details-box">
                <p className="payment-details-note">
                  💵 Please keep exact cash of <strong>₹{grandTotal.toFixed(2)}</strong> ready or scan the delivery partner&apos;s UPI QR code upon arrival.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Review Sidebar */}
        <aside className="checkout-summary-card">
          <h2 className="checkout-summary-title">Review Order</h2>

          {/* Items Preview */}
          <div className="checkout-items-preview">
            {cartItems.map((item) => {
              const price = Number(item.menuItem?.price) || 0
              const itemTotal = price * (item.quantity || 1)
              return (
                <div key={item.cartItemId} className="checkout-item-row">
                  <div>
                    <div className="checkout-item-title">
                      {item.menuItem?.name}
                    </div>
                    <div className="checkout-item-sub">
                      Qty: {item.quantity} × ₹{price.toFixed(2)}
                    </div>
                  </div>
                  <span className="checkout-item-price">
                    ₹{itemTotal.toFixed(2)}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Totals Breakdown */}
          <div className="checkout-summary-rows">
            <div className="checkout-summary-row">
              <span>Items Total</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className={`checkout-summary-row ${deliveryFee === 0 ? 'free' : ''}`}>
              <span>Delivery Fee</span>
              <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}</span>
            </div>
            <div className="checkout-summary-row">
              <span>Taxes & GST (5%)</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <div className="checkout-total-row">
              <span>Grand Total</span>
              <span className="checkout-total-val">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-place-order"
            disabled={submitting}
          >
            {submitting ? (
              <LoadingSpinner message="Placing order..." />
            ) : (
              <>
                Place Order • ₹{grandTotal.toFixed(2)} <ArrowRight size={18} />
              </>
            )}
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              marginTop: '1rem',
            }}
          >
            <ShieldCheck size={16} color="#059669" />
            <span>Guaranteed fresh delivery with 100% contactless option</span>
          </div>
        </aside>
      </form>
    </div>
  )
}
