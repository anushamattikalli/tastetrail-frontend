import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Clock,
  CheckCircle,
  Truck,
  ChefHat,
  XCircle,
  MapPin,
  RotateCcw,
  Edit3,
  ShoppingBag,
  ArrowRight,
  Package,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import orderService from '../services/orderService'
import { getFoodImage } from '../utils/foodImages'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import './Orders.css'

const TIMELINE_STEPS = [
  { key: 'PLACED', label: 'Placed', icon: Clock },
  { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle },
  { key: 'PREPARING', label: 'Preparing', icon: ChefHat },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', icon: Package },
]

export default function Orders() {
  const { user, isAuthenticated } = useAuth()
  const { addToCart } = useCart()
  const navigate = useNavigate()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(() => Boolean(isAuthenticated && user?.userId))
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('ALL')

  // Edit address state
  const [editingOrderId, setEditingOrderId] = useState(null)
  const [newAddress, setNewAddress] = useState('')
  const [updatingAddress, setUpdatingAddress] = useState(false)

  // Fetch orders for logged-in user
  const fetchOrders = useCallback(async () => {
    if (!user?.userId) return
    setError(null)
    setLoading(true)
    try {
      const data = await orderService.getUserOrders(user.userId)
      // Sort newest orders first
      const sorted = Array.isArray(data)
        ? data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
        : []
      setOrders(sorted)
    } catch (err) {
      console.error('Failed to load user orders:', err)
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to retrieve order history. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    let isMounted = true

    if (isAuthenticated && user?.userId) {
      orderService
        .getUserOrders(user.userId)
        .then((data) => {
          if (!isMounted) return
          const sorted = Array.isArray(data)
            ? data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
            : []
          setOrders(sorted)
          setLoading(false)
        })
        .catch((err) => {
          if (!isMounted) return
          console.error('Failed to load user orders:', err)
          setError(
            err.response?.data?.message ||
              err.message ||
              'Failed to retrieve order history.'
          )
          setLoading(false)
        })
    }

    return () => {
      isMounted = false
    }
  }, [isAuthenticated, user])

  // Cancel order handler
  const handleCancelOrder = async (orderId) => {
    const confirmCancel = window.confirm(
      `Are you sure you want to cancel Order #ORD-${orderId}?`
    )
    if (!confirmCancel) return

    try {
      const updatedOrder = await orderService.cancelOrder(orderId)
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? updatedOrder : o))
      )
    } catch (err) {
      console.error('Failed to cancel order:', err)
      alert(
        err.response?.data?.message ||
          'Failed to cancel order. It might already be prepared or delivered.'
      )
    }
  }

  // Save updated address handler
  const handleSaveAddress = async (orderId) => {
    if (!newAddress.trim()) return
    setUpdatingAddress(true)
    try {
      const updatedOrder = await orderService.updateDeliveryAddress(
        orderId,
        newAddress.trim()
      )
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? updatedOrder : o))
      )
      setEditingOrderId(null)
      setNewAddress('')
    } catch (err) {
      console.error('Failed to update address:', err)
      alert(err.response?.data?.message || 'Failed to update delivery address.')
    } finally {
      setUpdatingAddress(false)
    }
  }

  // Reorder all items from a past order
  const handleReorder = async (order) => {
    if (!order.orderItems || order.orderItems.length === 0) return
    for (const item of order.orderItems) {
      if (item.menuItem) {
        await addToCart(item.menuItem, item.quantity || 1)
      }
    }
    navigate('/cart')
  }

  // Helper to determine status style and label
  const getStatusBadge = (status) => {
    const s = (status || '').toUpperCase()
    switch (s) {
      case 'PLACED':
        return <span className="status-pill placed">● Placed</span>
      case 'CONFIRMED':
        return <span className="status-pill confirmed">● Confirmed</span>
      case 'PREPARING':
        return <span className="status-pill preparing">● Preparing</span>
      case 'OUT_FOR_DELIVERY':
        return <span className="status-pill out_for_delivery">● On the Way</span>
      case 'DELIVERED':
        return <span className="status-pill delivered">✔ Delivered</span>
      case 'CANCELLED':
        return <span className="status-pill cancelled">✕ Cancelled</span>
      default:
        return <span className="status-pill placed">{s}</span>
    }
  }

  // Filter orders by active tab
  const filteredOrders = orders.filter((order) => {
    const s = (order.status || '').toUpperCase()
    if (activeTab === 'ACTIVE') {
      return ['PLACED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY'].includes(s)
    }
    if (activeTab === 'DELIVERED') {
      return s === 'DELIVERED'
    }
    if (activeTab === 'CANCELLED') {
      return s === 'CANCELLED'
    }
    return true
  })

  // Counts for tabs
  const activeCount = orders.filter((o) =>
    ['PLACED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY'].includes(
      (o.status || '').toUpperCase()
    )
  ).length
  const deliveredCount = orders.filter(
    (o) => (o.status || '').toUpperCase() === 'DELIVERED'
  ).length
  const cancelledCount = orders.filter(
    (o) => (o.status || '').toUpperCase() === 'CANCELLED'
  ).length

  // If user is not logged in
  if (!isAuthenticated) {
    return (
      <div className="orders-page">
        <div className="orders-header">
          <h1 className="orders-title">Order History & Tracking</h1>
          <p className="orders-subtitle">
            Sign in to track live deliveries and review your past meals
          </p>
        </div>
        <div
          className="order-card"
          style={{ maxWidth: 520, margin: '2rem auto', textAlign: 'center', padding: '3rem 2rem' }}
        >
          <ShoppingBag size={48} color="var(--primary)" style={{ margin: '0 auto 1.25rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Sign In to View Orders
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem', lineHeight: '1.6' }}>
            Your order history is securely saved in your TasteTrail account. Sign in to view your orders, live tracking, and receipts.
          </p>
          <Link
            to="/login?redirect=/orders"
            className="btn-reorder"
            style={{ textDecoration: 'none', display: 'inline-flex', padding: '0.85rem 2rem', fontSize: '1rem' }}
          >
            Sign In Now <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h1 className="orders-title">My Orders</h1>
        <p className="orders-subtitle">
          Track active deliveries and browse your past TasteTrail orders
        </p>
      </div>

      {/* Tabs Filter */}
      <div className="orders-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'ALL'}
          className={`orders-tab ${activeTab === 'ALL' ? 'active' : ''}`}
          onClick={() => setActiveTab('ALL')}
        >
          All Orders <span className="tab-badge">{orders.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'ACTIVE'}
          className={`orders-tab ${activeTab === 'ACTIVE' ? 'active' : ''}`}
          onClick={() => setActiveTab('ACTIVE')}
        >
          Active <span className="tab-badge">{activeCount}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'DELIVERED'}
          className={`orders-tab ${activeTab === 'DELIVERED' ? 'active' : ''}`}
          onClick={() => setActiveTab('DELIVERED')}
        >
          Delivered <span className="tab-badge">{deliveredCount}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'CANCELLED'}
          className={`orders-tab ${activeTab === 'CANCELLED' ? 'active' : ''}`}
          onClick={() => setActiveTab('CANCELLED')}
        >
          Cancelled <span className="tab-badge">{cancelledCount}</span>
        </button>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <LoadingSpinner message="Fetching your orders..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchOrders} />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          title={
            activeTab === 'ALL'
              ? 'No Orders Placed Yet'
              : `No ${activeTab.toLowerCase()} orders found`
          }
          message={
            activeTab === 'ALL'
              ? 'Hungry? Browse our menu and place your first delicious order with TasteTrail!'
              : 'Try checking another tab or explore our menu to place an order.'
          }
          actionLabel="Explore Menu"
          onAction={() => navigate('/menu')}
        />
      ) : (
        <div className="orders-list">
          {filteredOrders.map((order) => {
            const status = (order.status || '').toUpperCase()
            const isCancelled = status === 'CANCELLED'
            const isDelivered = status === 'DELIVERED'
            const canCancel = ['PLACED', 'CONFIRMED', 'PREPARING'].includes(status)
            const canUpdateAddress = !isDelivered && !isCancelled

            const currentStepIdx = TIMELINE_STEPS.findIndex(
              (step) => step.key === status
            )

            const formattedDate = order.orderDate
              ? new Date(order.orderDate).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })
              : 'Recent Order'

            return (
              <article key={order.orderId} className="order-card">
                {/* Header */}
                <div className="order-card-header">
                  <div className="order-header-info">
                    <span className="order-id-badge">#ORD-{order.orderId}</span>
                    <span className="order-date-text">{formattedDate}</span>
                  </div>
                  <div>{getStatusBadge(order.status)}</div>
                </div>

                {/* Timeline Tracker (only shown if not cancelled) */}
                {!isCancelled ? (
                  <div className="order-timeline-box">
                    <div className="timeline-track">
                      {TIMELINE_STEPS.map((step, idx) => {
                        const isCompleted = idx <= currentStepIdx
                        const isCurrent = idx === currentStepIdx
                        const Icon = step.icon

                        let stepClass = 'timeline-step'
                        if (isCurrent) stepClass += ' current'
                        else if (isCompleted) stepClass += ' completed'

                        return (
                          <div key={step.key} className={stepClass}>
                            <div className="step-circle">
                              <Icon size={14} />
                            </div>
                            <span className="step-label">{step.label}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: '1rem 1.5rem',
                      backgroundColor: '#fef2f2',
                      borderBottom: '1px solid #fee2e2',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: '#dc2626',
                      fontSize: '0.9rem',
                    }}
                  >
                    <XCircle size={18} />
                    <span>This order has been cancelled.</span>
                  </div>
                )}

                {/* Items List */}
                <div className="order-items-box">
                  <div className="order-items-grid">
                    {order.orderItems?.map((item) => {
                      const menuItem = item.menuItem || {}
                      const img = getFoodImage(menuItem)
                      const itemPrice = Number(item.price || menuItem.price) || 0
                      const itemSubtotal =
                        Number(item.subtotal) || itemPrice * (item.quantity || 1)

                      return (
                        <div key={item.orderItemId || Math.random()} className="order-dish-row">
                          <div className="order-dish-left">
                            <img
                              src={img}
                              alt={menuItem.name || 'Dish'}
                              className="order-dish-thumb"
                            />
                            <div>
                              <div className="order-dish-name">
                                {menuItem.name || 'Delicious Dish'}
                              </div>
                              <div className="order-dish-meta">
                                Qty: {item.quantity} × ₹{itemPrice.toFixed(2)}
                              </div>
                            </div>
                          </div>
                          <span className="order-dish-subtotal">
                            ₹{itemSubtotal.toFixed(2)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Inline Edit Address Form */}
                {editingOrderId === order.orderId && (
                  <div className="edit-address-modal">
                    <label htmlFor={`edit-addr-${order.orderId}`}>
                      Update Delivery Address:
                    </label>
                    <input
                      id={`edit-addr-${order.orderId}`}
                      type="text"
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      placeholder="Enter new street address / landmark"
                    />
                    <div className="edit-address-actions">
                      <button
                        type="button"
                        onClick={() => setEditingOrderId(null)}
                        className="btn-cancel-addr"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveAddress(order.orderId)}
                        className="btn-save-addr"
                        disabled={updatingAddress || !newAddress.trim()}
                      >
                        {updatingAddress ? 'Saving...' : 'Save Address'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Footer with total and actions */}
                <div className="order-card-footer">
                  <div className="order-address-box">
                    <MapPin size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{order.deliveryAddress || 'No address specified'}</span>
                  </div>

                  <div className="order-total-block">
                    <span className="order-total-label">Total Amount:</span>
                    <span className="order-total-amount">
                      ₹{Number(order.totalAmount || 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="order-actions-row">
                    {canUpdateAddress && editingOrderId !== order.orderId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingOrderId(order.orderId)
                          setNewAddress(order.deliveryAddress || '')
                        }}
                        className="btn-update-addr"
                      >
                        <Edit3 size={14} style={{ display: 'inline', marginRight: '4px' }} />
                        Edit Address
                      </button>
                    )}

                    {canCancel && (
                      <button
                        type="button"
                        onClick={() => handleCancelOrder(order.orderId)}
                        className="btn-cancel-order"
                      >
                        Cancel Order
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleReorder(order)}
                      className="btn-reorder"
                    >
                      <RotateCcw size={14} /> Reorder
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
