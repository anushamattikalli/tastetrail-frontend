import { useState } from 'react'
import { Plus, Minus, Check, Star } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { getFoodImage } from '../utils/foodImages'
import './FoodCard.css'

export default function FoodCard({ item }) {
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  if (!item) return null

  // Find if item is already in cart
  const cartItem = cartItems.find(
    (ci) => ci.menuItem?.menuItemId === item.menuItemId || ci.menuItemId === item.menuItemId
  )
  const quantityInCart = cartItem ? cartItem.quantity : 0

  const imageUrl = getFoodImage(item)
  const isAvailable = item.available !== false

  // Handle adding first time
  const handleAddToCart = async () => {
    if (!isAvailable || isAdding) return

    setIsAdding(true)
    try {
      await addToCart(item, 1)
      setJustAdded(true)
      setTimeout(() => setJustAdded(false), 1200)
    } finally {
      setIsAdding(false)
    }
  }

  // Handle incrementing
  const handleIncrement = async () => {
    if (cartItem) {
      await updateQuantity(cartItem.cartItemId, cartItem.quantity + 1)
    } else {
      await addToCart(item, 1)
    }
  }

  // Handle decrementing
  const handleDecrement = async () => {
    if (cartItem) {
      if (cartItem.quantity <= 1) {
        await removeFromCart(cartItem.cartItemId)
      } else {
        await updateQuantity(cartItem.cartItemId, cartItem.quantity - 1)
      }
    }
  }

  // Format price
  const formattedPrice = Number(item.price || 0).toFixed(2)

  // Veg/Non-Veg heuristic (if not explicitly marked on entity)
  const nameLower = (item.name || '').toLowerCase()
  const descLower = (item.description || '').toLowerCase()
  const isNonVeg =
    item.isVeg === false ||
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

  // Category fallback
  const categoryLabel = item.category || 'CHEF SPECIAL'

  return (
    <div className={`food-card ${!isAvailable ? 'food-card-unavailable' : ''}`}>
      {/* 4:3 Aspect Ratio Image Container */}
      <div className="food-card-img-container">
        <img
          src={imageUrl}
          alt={item.name}
          className="food-card-image"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&h=600&q=85'
          }}
        />

        {/* Soft gradient top overlay for badge contrast */}
        <div className="food-card-img-gradient" />

        {/* Badges: Category & Authentic Dietary Mark */}
        <div className="food-card-badges-top">
          <span className="category-tag">{categoryLabel}</span>
          <div
            className={`dietary-badge ${isNonVeg ? 'non-veg' : 'veg'}`}
            title={isNonVeg ? 'Non-Vegetarian' : 'Vegetarian'}
            aria-label={isNonVeg ? 'Non-Vegetarian' : 'Vegetarian'}
          >
            <span className="dietary-dot" />
          </div>
        </div>

        {/* Out of Stock Overlay */}
        {!isAvailable && (
          <div className="out-of-stock-overlay">
            <span>Currently Unavailable</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="food-card-body">
        <div className="food-card-header">
          <h3 className="food-card-title">{item.name}</h3>
          <div className="food-card-rating">
            <Star size={13} className="star-icon" />
            <span>4.8</span>
          </div>
        </div>

        <p className="food-card-description">
          {item.description ||
            'Freshly prepared with authentic herbs, spices, and premium ingredients.'}
        </p>

        {/* Footer: Price & Add to Cart button */}
        <div className="food-card-footer">
          <div className="food-card-price-wrap">
            <span className="price-currency">₹</span>
            <span className="price-amount">{formattedPrice}</span>
          </div>

          <div className="food-card-action">
            {!isAvailable ? (
              <button disabled className="btn-unavailable">
                Sold Out
              </button>
            ) : quantityInCart > 0 ? (
              <div className="quantity-stepper">
                <button
                  type="button"
                  onClick={handleDecrement}
                  className="stepper-btn minus"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="stepper-count">{quantityInCart}</span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="stepper-btn plus"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdding}
                className={`btn-add-cart ${justAdded ? 'added' : ''}`}
                aria-label={`Add ${item.name} to cart`}
              >
                {justAdded ? (
                  <>
                    <Check size={16} />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    <span>Add</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
