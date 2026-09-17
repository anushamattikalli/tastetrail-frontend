import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Clock, ShieldCheck, Truck, Utensils, Star, Award } from 'lucide-react'
import FoodCard from '../components/FoodCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { CATEGORY_METADATA } from '../utils/foodImages'
import menuService from '../services/menuService'
import heroImg from '../assets/hero.png'
import './Home.css'

export default function Home() {
  const [featuredDishes, setFeaturedDishes] = useState([])
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadHomeData() {
      try {
        // Fetch available dishes from backend
        const dishes = await menuService.getAvailableMenuItems()
        if (isMounted && Array.isArray(dishes)) {
          // Take top 6 available dishes
          setFeaturedDishes(dishes.slice(0, 6))
        }
      } catch (err) {
        console.warn('Backend dishes not loaded (unauthenticated or offline). Using preview items.', err)
        // Fallback curated preview dishes so the landing page always looks stunning
        if (isMounted) {
          setFeaturedDishes([
            {
              menuItemId: 101,
              name: 'Gourmet Truffle Burger',
              description: 'Juicy artisan patty with aged cheddar, caramelized onions and black truffle aioli.',
              price: 349.0,
              category: 'BURGER',
              available: true,
            },
            {
              menuItemId: 102,
              name: 'Artisan Margherita Pizza',
              description: 'Stone-baked Neapolitan crust with san marzano sauce, fresh buffalo mozzarella and basil.',
              price: 499.0,
              category: 'PIZZA',
              available: true,
            },
            {
              menuItemId: 103,
              name: 'Royal Shahi Paneer',
              description: 'Cottage cheese simmered in silky cashew and fragrant tomato cream sauce.',
              price: 380.0,
              category: 'CURRY',
              available: true,
            },
            {
              menuItemId: 104,
              name: 'Hyderabadi Dum Biryani',
              description: 'Aromatic basmati rice slow-cooked with tender cuts, saffron, fried onions and spices.',
              price: 420.0,
              category: 'RICE',
              available: true,
            },
            {
              menuItemId: 105,
              name: 'Garlic Butter Naan',
              description: 'Piping hot tandoori flatbread brushed with rich garlic infused clarified butter.',
              price: 39.0,
              category: 'ROTI',
              available: true,
            },
            {
              menuItemId: 106,
              name: 'Molten Chocolate Cake',
              description: 'Warm dark chocolate cake with a rich liquid cocoa center and powdered sugar.',
              price: 69.0,
              category: 'DESSERT',
              available: true,
            },
          ])
        }
      }

      try {
        // Fetch active restaurants from backend
        const activeRestaurants = await menuService.getActiveRestaurants()
        if (isMounted && Array.isArray(activeRestaurants) && activeRestaurants.length > 0) {
          setRestaurants(activeRestaurants.slice(0, 4))
        } else if (isMounted) {
          // Preview partner restaurants if backend returned empty
          setRestaurants([
            {
              restaurantId: 1,
              name: 'TasteTrail Royal Kitchen',
              description: 'Authentic Mughlai curries, biryanis & tandoori platters',
              address: 'Koramangala, Bangalore',
              rating: '4.8',
              time: '25-35 min',
            },
            {
              restaurantId: 2,
              name: 'Napoli Wood-Fired Pizzeria',
              description: 'Artisan sourdough pizzas & Italian pastas',
              address: 'Indiranagar, Bangalore',
              rating: '4.9',
              time: '20-30 min',
            },
            {
              restaurantId: 3,
              name: 'The Burger Craft & Grill',
              description: 'Handcrafted gourmet smash burgers & loaded fries',
              address: 'HSR Layout, Bangalore',
              rating: '4.7',
              time: '30-40 min',
            },
          ])
        }
      } catch {
        // Fallback preview
        if (isMounted) {
          setRestaurants([
            {
              restaurantId: 1,
              name: 'TasteTrail Royal Kitchen',
              description: 'Authentic Mughlai curries, biryanis & tandoori platters',
              address: 'Koramangala, Bangalore',
              rating: '4.8',
              time: '25-35 min',
            },
            {
              restaurantId: 2,
              name: 'Napoli Wood-Fired Pizzeria',
              description: 'Artisan sourdough pizzas & Italian pastas',
              address: 'Indiranagar, Bangalore',
              rating: '4.9',
              time: '20-30 min',
            },
            {
              restaurantId: 3,
              name: 'The Burger Craft & Grill',
              description: 'Handcrafted gourmet smash burgers & loaded fries',
              address: 'HSR Layout, Bangalore',
              rating: '4.7',
              time: '30-40 min',
            },
          ])
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadHomeData()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="home-container">
      {/* 1. HERO SECTION */}
      <section className="hero-section">
        <div className="hero-inner">
          <div className="hero-content-col">
            <div className="hero-pill-tag">
              <Sparkles size={16} className="sparkle-icon" />
              <span>Taste the Finest Food in Town</span>
            </div>

            <h1 className="hero-title">
              Delicious Food, <br />
              <span className="hero-title-highlight">Delivered to You</span>
            </h1>

            <p className="hero-subtitle">
              Discover authentic flavors from top kitchens. Add your favourites to the
              cart and enjoy speedy doorstep delivery in under 30 minutes.
            </p>

            <div className="hero-cta-group">
              <Link to="/menu" className="hero-btn-primary">
                <span>Explore Full Menu</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/cart" className="hero-btn-secondary">
                View My Cart
              </Link>
            </div>

            {/* Quick trust metrics */}
            <div className="hero-stats">
              <div className="stat-item">
                <strong>30 Mins</strong>
                <span>Avg Delivery</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <strong>100%</strong>
                <span>Fresh Ingredients</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <strong>4.9 ★</strong>
                <span>Customer Rating</span>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="hero-image-col">
            <div className="hero-image-backdrop"></div>
            <img
              src={heroImg}
              alt="Delicious Food Spread"
              className="hero-main-img"
            />
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES SECTION */}
      <section className="categories-showcase">
        <div className="section-header">
          <span className="section-tag">Explore by Taste</span>
          <h2 className="section-title">Popular Categories</h2>
          <p className="section-subtitle">
            Find the perfect craving from our chef-crafted menu selections.
          </p>
        </div>

        <div className="category-cards-grid">
          {CATEGORY_METADATA.filter((c) => c.id !== 'ALL').map((cat) => (
            <Link
              key={cat.id}
              to={`/menu?category=${cat.id}`}
              className="category-card"
            >
              <div className="cat-img-wrapper">
                <img src={cat.image} alt={cat.name} loading="lazy" />
                <div className="cat-overlay"></div>
              </div>
              <div className="cat-info">
                <span className="cat-emoji">{cat.icon}</span>
                <h3 className="cat-title">{cat.name}</h3>
                <span className="cat-link-text">Browse Items →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED DISHES (REAL BACKEND DATA) */}
      <section className="featured-section">
        <div className="section-header-flex">
          <div>
            <span className="section-tag">Chef Recommendations</span>
            <h2 className="section-title">Featured Menu Items</h2>
          </div>
          <Link to="/menu" className="view-all-link">
            <span>View All Menu</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Fetching featured dishes..." />
        ) : (
          <div className="featured-grid">
            {featuredDishes.map((dish) => (
              <FoodCard key={dish.menuItemId} item={dish} />
            ))}
          </div>
        )}
      </section>

      {/* 4. ACTIVE RESTAURANTS */}
      {restaurants.length > 0 && (
        <section className="restaurants-section">
          <div className="section-header">
            <span className="section-tag">Top Partners</span>
            <h2 className="section-title">Featured Kitchens & Restaurants</h2>
            <p className="section-subtitle">Handpicked partner kitchens delivering peak freshness</p>
          </div>
          <div className="restaurants-grid">
            {restaurants.map((rest) => (
              <div key={rest.restaurantId} className="restaurant-card">
                <div className="restaurant-top-row">
                  <div className="restaurant-icon-box">
                    <Utensils size={22} />
                  </div>
                  <div className="restaurant-rating-chip">
                    <Star size={13} fill="#f59e0b" color="#f59e0b" />
                    <span>{rest.rating || '4.8'}</span>
                  </div>
                </div>
                <div className="restaurant-details">
                  <h3>{rest.name}</h3>
                  <p className="restaurant-desc">{rest.description}</p>
                  <div className="restaurant-meta-row">
                    <span className="restaurant-address">📍 {rest.address}</span>
                    <span className="restaurant-time-chip">
                      <Clock size={12} style={{ display: 'inline', marginRight: '3px' }} />
                      {rest.time || '25-35 min'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. WHY CHOOSE US PERKS */}
      <section className="perks-section">
        <div className="perk-card">
          <div className="perk-icon-wrap">
            <Truck size={28} />
          </div>
          <h3>Express Delivery</h3>
          <p>
            Piping hot meals safely delivered to your doorstep in under 30 minutes.
          </p>
        </div>

        <div className="perk-card">
          <div className="perk-icon-wrap">
            <ShieldCheck size={28} />
          </div>
          <h3>Highest Hygiene Standards</h3>
          <p>
            Certified kitchens adhering strictly to 100% contactless preparation and sanitization.
          </p>
        </div>

        <div className="perk-card">
          <div className="perk-icon-wrap">
            <Award size={28} />
          </div>
          <h3>Curated Quality</h3>
          <p>
            Top-rated recipes crafted exclusively with authentic spices and fresh local produce.
          </p>
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section className="cta-banner">
        <div className="cta-banner-content">
          <h2>Ready for an Unforgettable Meal?</h2>
          <p>
            Order delicious meals from the comfort of your home and indulge your tastebuds today.
          </p>
          <Link to="/menu" className="cta-btn">
            Order Now
          </Link>
        </div>
      </section>
    </div>
  )
}
