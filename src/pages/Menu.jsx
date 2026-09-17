import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, X, Info } from 'lucide-react'
import FoodCard from '../components/FoodCard'
import CategoryFilter from '../components/CategoryFilter'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import menuService from '../services/menuService'
import { useAuth } from '../context/AuthContext'
import './Menu.css'

// Curated preview items for guest/offline fallback
const PREVIEW_MENU_ITEMS = [
  {
    menuItemId: 1,
    name: "Burger",
    description: "Delicious artisan spiced vegetable patty burger layered with crisp lettuce, sliced tomato, and cheese.",
    price: 150.0,
    category: "BURGER",
    isVeg: true,
    available: true,
  },
  {
    menuItemId: 2,
    name: "Pizza",
    description: "Classic hand-tossed Italian crust topped with rich tomato sauce, melted mozzarella cheese, and aromatic oregano.",
    price: 250.0,
    category: "PIZZA",
    isVeg: true,
    available: true,
  },
  {
    menuItemId: 3,
    name: "TasteTrail Kitchen",
    description: "Signature culinary creations featuring handcrafted burgers, stone-baked pizzas, aromatic curries, and royal desserts.",
    price: 199.0,
    category: "SPECIAL",
    isVeg: true,
    available: true,
  },
  {
    menuItemId: 4,
    name: "Classic Veg Burger",
    description: "Crispy golden potato-pea vegetable cutlet layered with sliced tomato, cucumber, lettuce, and tangy mint mayo on a toasted bun.",
    price: 149.0,
    category: "BURGER",
    isVeg: true,
    available: true,
  },
  {
    menuItemId: 5,
    name: "Crispy Veg Supreme Burger",
    description: "Crispy spiced vegetable patty burger loaded with crunchy shredded coleslaw, melted cheddar cheese, and house herb dressing.",
    price: 149.0,
    category: "BURGER",
    isVeg: true,
    available: true,
  },
  {
    menuItemId: 6,
    name: "Margherita Pizza",
    description: "Classic thin-crust artisan pizza baked with tangy San Marzano tomato sauce, bubbly mozzarella cheese, and fresh aromatic basil leaves.",
    price: 299.0,
    category: "PIZZA",
    isVeg: true,
    available: true,
  },
  {
    menuItemId: 7,
    name: "Butter Roti",
    description: "Soft traditional Indian whole-wheat flatbread freshly baked in clay tandoor and brushed generously with golden melted desi butter.",
    price: 18.0,
    category: "ROTI",
    isVeg: true,
    available: true,
  },
  {
    menuItemId: 8,
    name: "Paneer Butter Masala",
    description: "Succulent cottage cheese cubes simmered in a velvety, buttery tomato and cashew gravy delicately spiced with fenugreek leaves.",
    price: 220.0,
    category: "CURRY",
    isVeg: true,
    available: true,
  },
  {
    menuItemId: 9,
    name: "Veg Biryani",
    description: "Fragrant long-grain basmati rice slow-cooked with fresh garden vegetables, whole spices, saffron, and mint leaves.",
    price: 199.0,
    category: "RICE",
    isVeg: true,
    available: true,
  },
  {
    menuItemId: 10,
    name: "Shahi Tukda",
    description: "Crisp golden-fried bread soaked in saffron-infused sugar syrup, smothered in luscious thickened rabri, garnished with pistachios and fragrant rose petals.",
    price: 59.0,
    category: "DESSERT",
    isVeg: true,
    available: true,
  },
  {
    menuItemId: 11,
    name: "Crispy Corn & Spinach Burger",
    description: "Gourmet sweet corn and sautéed spinach patty seasoned with herbs, crowned with cheese and creamy aioli.",
    price: 149.0,
    category: "BURGER",
    isVeg: true,
    available: true,
  },
  {
    menuItemId: 12,
    name: "Four Cheese Gourmet Pizza",
    description: "Stone-baked artisan pizza loaded with mozzarella, cheddar, gouda, and parmesan cheeses garnished with Italian herbs.",
    price: 299.0,
    category: "PIZZA",
    isVeg: true,
    available: true,
  },
  {
    menuItemId: 13,
    name: "Royal Kesar Phirni",
    description: "Slow-cooked creamy ground rice pudding infused with royal saffron, cardamom, and rose water, garnished with roasted pistachios and silver vark.",
    price: 79.0,
    category: "DESSERT",
    isVeg: true,
    available: true,
  },
  {
    menuItemId: 14,
    name: "Shahi Paneer Korma",
    description: "Fresh cottage cheese cubes simmered in a silky, mildly sweet and creamy royal cashew-almond makhani gravy.",
    price: 220.0,
    category: "CURRY",
    isVeg: true,
    available: true,
  },
  {
    menuItemId: 15,
    name: "Hyderabadi Subz Dum Biryani",
    description: "Aromatic layered basmati rice dum-cooked with tender seasonal vegetables, caramelized onions, herbs, and saffron.",
    price: 209.0,
    category: "RICE",
    isVeg: true,
    available: true,
  },
  {
    menuItemId: 16,
    name: "Ras Malai",
    description: "Melt-in-mouth flattened cottage cheese dumplings steeped in sweet, chilled saffron-cardamom flavored milk cream with slivered almonds and pistachios.",
    price: 89.0,
    category: "DESSERT",
    isVeg: true,
    available: true,
  },
  {
    menuItemId: 17,
    name: "Special Burger Updated",
    description: "Double vegetable patty burger stacked with sliced cheddar cheese, crisp pickles, red onions, lettuce, and smoky signature dressing.",
    price: 190.0,
    category: "BURGER",
    isVeg: true,
    available: true,
  },
  {
    menuItemId: 18,
    name: "Plain Tandoori Roti",
    description: "Crisp and whole-wheat Indian flatbread freshly baked in high-temperature clay tandoor oven without butter.",
    price: 15.0,
    category: "ROTI",
    isVeg: true,
    available: true,
  },
  {
    menuItemId: 19,
    name: "Rumali Roti",
    description: "Ultra-thin, soft handkerchief-style Indian flatbread expertly stretched and baked over inverted tawa griddle.",
    price: 20.0,
    category: "ROTI",
    isVeg: true,
    available: true,
  },
  {
    menuItemId: 20,
    name: "Butter Naan",
    description: "Tender leavened refined-flour tandoor bread brushed with melted desi butter featuring golden blisters.",
    price: 29.0,
    category: "ROTI",
    isVeg: true,
    available: true,
  },
  {
    menuItemId: 21,
    name: "Laccha Paratha",
    description: "Multi-layered crispy whole wheat spiraled flatbread shallow-fried in golden ghee with distinct visible flaky rings.",
    price: 35.0,
    category: "ROTI",
    isVeg: true,
    available: true,
  },
  {
    menuItemId: 22,
    name: "Garlic Naan",
    description: "Aromatic tandoori flatbread infused with roasted minced garlic, fresh coriander leaves, and brushed with butter.",
    price: 39.0,
    category: "ROTI",
    isVeg: true,
    available: true,
  },
  {
    menuItemId: 23,
    name: "Amritsari Aloo Kulcha",
    description: "Crisp Punjabi leavened bread stuffed with spiced mashed potato filling, baked crisp in clay oven.",
    price: 45.0,
    category: "ROTI",
    isVeg: true,
    available: true,
  },
  {
    menuItemId: 24,
    name: "Steamed Basmati Rice",
    description: "Fluffy, fragrant long-grain extra-fine basmati rice steamed to perfection with delicate natural aroma.",
    price: 119.0,
    category: "RICE",
    isVeg: true,
    available: true,
  },
  {
    menuItemId: 25,
    name: "South Indian Curd Rice",
    description: "Cooling seasoned yogurt rice tempered with mustard seeds, fresh curry leaves, ginger, green chilies, and ruby pomegranate arils.",
    price: 139.0,
    category: "RICE",
    isVeg: true,
    available: true,
  },
  {
    menuItemId: 26,
    name: "Jeera Rice",
    description: "Long-grain basmati rice tempered in fragrant golden desi ghee with whole cumin seeds, whole spices, and coriander.",
    price: 149.0,
    category: "RICE",
    isVeg: true,
    available: true,
  },
  {
    menuItemId: 27,
    name: "Tawa Paneer Pulao",
    description: "Spicy Mumbai-style griddled basmati pulao tossed on iron tawa with golden seared paneer cubes, green peas, capsicum, and pav bhaji masala.",
    price: 189.0,
    category: "RICE",
    isVeg: true,
    available: true,
  },
  {
    menuItemId: 28,
    name: "Egg Dum Biryani",
    description: "Richly spiced saffron basmati rice slow-cooked on dum layered with two golden-crusted boiled eggs marinated in biryani spices.",
    price: 229.0,
    category: "RICE",
    isVeg: false,
    available: true,
  },
  {
    menuItemId: 29,
    name: "Chicken Dum Biryani (Single)",
    description: "Authentic Hyderabadi dum biryani featuring tender succulent chicken marinated in yogurt and aromatic spices, layered with saffron basmati rice.",
    price: 269.0,
    category: "RICE",
    isVeg: false,
    available: true,
  },
  {
    menuItemId: 30,
    name: "Yellow Dal Tadka",
    description: "Comforting yellow pigeon-pea dal tempered with sizzling golden garlic, cumin seeds, dried red chilies, and fresh cilantro.",
    price: 69.0,
    category: "CURRY",
    isVeg: true,
    available: true,
  },
  {
    menuItemId: 31,
    name: "Aloo Gobi Adraki",
    description: "Homestyle dry preparation of tender potato wedges and cauliflower florets sautéed with ginger juliennes, turmeric, and cumin.",
    price: 79.0,
    category: "CURRY",
    isVeg: true,
    available: true,
  },
  {
    menuItemId: 32,
    name: "Punjabi Chana Masala",
    description: "Hearty chickpeas slow-simmered in an onion-tomato gravy with roasted anardana and Punjabi spices.",
    price: 89.0,
    category: "CURRY",
    isVeg: true,
    available: true,
  },
  {
    menuItemId: 33,
    name: "Dal Makhani (Mini)",
    description: "Slow-cooked black lentils and kidney beans simmered overnight on low flame with butter, cream, and tomato purée.",
    price: 99.0,
    category: "CURRY",
    isVeg: true,
    available: true,
  },
  {
    menuItemId: 34,
    name: "Dhaba Style Egg Curry",
    description: "Rustic highway-dhaba style egg curry with two pan-seared boiled eggs in a robust onion-tomato masala gravy.",
    price: 99.0,
    category: "CURRY",
    isVeg: false,
    available: true,
  },
  {
    menuItemId: 35,
    name: "Kadai Chicken (Single)",
    description: "Tender chicken pieces cooked with diced bell peppers, red onions, and freshly crushed kadai coriander and peppercorn masala.",
    price: 149.0,
    category: "CURRY",
    isVeg: false,
    available: true,
  },
  {
    menuItemId: 36,
    name: "Crispy Aloo Tikki Burger",
    description: "Golden spiced potato cutlet topped with sliced onion, tomato, crunchy iceberg lettuce, and tangy sweet tamarind mayo.",
    price: 39.0,
    category: "BURGER",
    isVeg: true,
    available: true,
  },
  {
    menuItemId: 37,
    name: "Egg & Cheese Delight Burger",
    description: "Fluffy seasoned masala egg patty crowned with melted cheddar cheese slice, fresh tomato, and creamy herb mayonnaise.",
    price: 55.0,
    category: "BURGER",
    isVeg: false,
    available: true,
  },
  {
    menuItemId: 38,
    name: "Double Cheese Veggie Burger",
    description: "Hearty spiced vegetable patty layered between two slices of melted cheddar and mozzarella cheese with crunchy pickles.",
    price: 59.0,
    category: "BURGER",
    isVeg: true,
    available: true,
  },
  {
    menuItemId: 39,
    name: "Paneer Tikka Masala Burger",
    description: "Char-grilled tandoori spiced cottage cheese steak layered with mint chutney, pickled onion rings, and tandoori mayo.",
    price: 89.0,
    category: "BURGER",
    isVeg: true,
    available: true,
  },
  {
    menuItemId: 40,
    name: "Crispy Fried Chicken Burger",
    description: "Crunchy golden buttermilk-fried chicken breast fillet topped with creamy coleslaw, dill pickles, and spicy chipotle sauce.",
    price: 99.0,
    category: "BURGER",
    isVeg: false,
    available: true,
  },
  {
    menuItemId: 41,
    name: "Fiery Peri Peri Chicken Burger",
    description: "Juicy grilled chicken fillet marinated in African bird eye peri-peri chili, topped with fiery sauce, jalapeños, and lettuce.",
    price: 119.0,
    category: "BURGER",
    isVeg: false,
    available: true,
  },
  {
    menuItemId: 42,
    name: "Cheesy Corn & Herb Pizza (Regular)",
    description: "Personal pan pizza with sweet golden American corn kernels, fragrant Italian herbs, and stretchy melted mozzarella cheese.",
    price: 79.0,
    category: "PIZZA",
    isVeg: true,
    available: true,
  },
  {
    menuItemId: 43,
    name: "Capsicum & Red Onion Crunch Pizza",
    description: "Stone-baked crispy pizza topped with crisp green bell peppers, crunchy red onion slivers, and melted mozzarella.",
    price: 89.0,
    category: "PIZZA",
    isVeg: true,
    available: true,
  },
  {
    menuItemId: 44,
    name: "Spicy Jalapeno & Olive Fiesta Pizza",
    description: "Zesty Mediterranean pizza loaded with spicy pickled jalapeño rings, sliced black olives, chili flakes, and mozzarella.",
    price: 109.0,
    category: "PIZZA",
    isVeg: true,
    available: true,
  },
  {
    menuItemId: 45,
    name: "Paneer Tikka Delight Pizza",
    description: "Fusion pizza crowned with tandoor-spiced cottage cheese cubes, charred onions, green capsicum, and makhani drizzle.",
    price: 129.0,
    category: "PIZZA",
    isVeg: true,
    available: true,
  },
  {
    menuItemId: 46,
    name: "Chicken Sausage & Herb Pizza",
    description: "Savory pizza topped with tender sliced seasoned chicken sausage coins, dried oregano, basil, and gooey mozzarella.",
    price: 139.0,
    category: "PIZZA",
    isVeg: false,
    available: true,
  },
  {
    menuItemId: 47,
    name: "Spicy Chicken Keema Pizza",
    description: "Loaded with flavorful minced chicken keema cooked in Indian spices, green chilies, red onions, and mozzarella cheese.",
    price: 149.0,
    category: "PIZZA",
    isVeg: false,
    available: true,
  },
  {
    menuItemId: 48,
    name: "Hot Gulab Jamun (2 Pcs)",
    description: "Two warm, soft khoya dumplings soaked in fragrant green cardamom and saffron rose syrup.",
    price: 25.0,
    category: "DESSERT",
    isVeg: true,
    available: true,
  },
  {
    menuItemId: 49,
    name: "Bengali Spongy Rasgulla (2 Pcs)",
    description: "Two delicate, spongy snow-white fresh chhena dumplings steeped in light, fragrant rose-scented sugar syrup.",
    price: 29.0,
    category: "DESSERT",
    isVeg: true,
    available: true,
  },
  {
    menuItemId: 50,
    name: "Matka Malai Kulfi",
    description: "Traditional slow-churned Indian malai kulfi set in an authentic terracotta clay pot, infused with saffron, cardamom, and roasted pistachios.",
    price: 35.0,
    category: "DESSERT",
    isVeg: true,
    available: true,
  },
  {
    menuItemId: 51,
    name: "Shahi Moong Dal Halwa",
    description: "Rich, warming Rajasthani dessert crafted from slow-roasted yellow lentils, pure desi ghee, saffron milk, and slivered cashews.",
    price: 49.0,
    category: "DESSERT",
    isVeg: true,
    available: true,
  },
  {
    menuItemId: 52,
    name: "Kulfi Falooda Sundae",
    description: "Royal Indian dessert sundae layered with creamy malai kulfi slices, silky falooda vermicelli, sabja basil seeds, and fragrant rose syrup.",
    price: 55.0,
    category: "DESSERT",
    isVeg: true,
    available: true,
  },
  {
    menuItemId: 53,
    name: "Warm Chocolate Walnut Brownie",
    description: "Dense, fudgy dark chocolate cake loaded with crunchy toasted walnuts and drizzled with warm chocolate ganache.",
    price: 69.0,
    category: "DESSERT",
    isVeg: true,
    available: true,
  }
];

export default function Menu() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { isAuthenticated } = useAuth()

  // Read filters from URL
  const selectedCategory = searchParams.get('category') || 'ALL'
  const searchQuery = searchParams.get('search') || ''

  const [searchInput, setSearchInput] = useState(searchQuery)
  const [prevSearchQuery, setPrevSearchQuery] = useState(searchQuery)
  const [vegOnly, setVegOnly] = useState(false)

  // Adjust search input when URL search query changes
  if (searchQuery !== prevSearchQuery) {
    setPrevSearchQuery(searchQuery)
    setSearchInput(searchQuery)
  }

  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isGuestFallback, setIsGuestFallback] = useState(false)

  // Fetch menu items matching category and search from backend
  useEffect(() => {
    let isMounted = true

    async function loadMenuData() {
      try {
        let data = []

        if (searchQuery.trim()) {
          // Backend search endpoint: GET /menu-items/search?name=...
          data = await menuService.searchMenuItems(searchQuery.trim())
        } else if (selectedCategory && selectedCategory !== 'ALL') {
          // Backend category endpoint: GET /menu-items/category/{category}
          data = await menuService.getMenuItemsByCategory(selectedCategory)
        } else {
          // Backend all available endpoint: GET /menu-items/available
          data = await menuService.getAvailableMenuItems()
        }

        if (isMounted) {
          if (Array.isArray(data)) {
            // If category was chosen alongside search query, refine client-side
            if (selectedCategory !== 'ALL' && searchQuery.trim()) {
              data = data.filter(
                (item) => item.category?.toUpperCase() === selectedCategory.toUpperCase()
              )
            }
            setMenuItems(data)
          } else {
            setMenuItems([])
          }
          setIsGuestFallback(false)
          setLoading(false)
        }
      } catch (err) {
        if (!isMounted) return
        console.warn('Backend API request failed. Activating guest preview mode.', err)
        setIsGuestFallback(true)

        let filtered = [...PREVIEW_MENU_ITEMS]

        if (selectedCategory !== 'ALL') {
          filtered = filtered.filter(
            (item) => item.category.toUpperCase() === selectedCategory.toUpperCase()
          )
        }

        if (searchQuery.trim()) {
          const q = searchQuery.trim().toLowerCase()
          filtered = filtered.filter(
            (item) =>
              item.name.toLowerCase().includes(q) ||
              item.description.toLowerCase().includes(q)
          )
        }

        setMenuItems(filtered)
        setLoading(false)
      }
    }

    loadMenuData()

    return () => {
      isMounted = false
    }
  }, [selectedCategory, searchQuery])

  // Category filter click
  const handleCategorySelect = (categoryId) => {
    setLoading(true)
    const nextParams = new URLSearchParams(searchParams)
    if (categoryId === 'ALL') {
      nextParams.delete('category')
    } else {
      nextParams.set('category', categoryId)
    }
    setSearchParams(nextParams)
  }

  // Search form submit
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    const nextParams = new URLSearchParams(searchParams)
    if (searchInput.trim()) {
      nextParams.set('search', searchInput.trim())
    } else {
      nextParams.delete('search')
    }
    setSearchParams(nextParams)
  }

  // Clear search
  const handleClearSearch = () => {
    setLoading(true)
    setSearchInput('')
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('search')
    setSearchParams(nextParams)
  }

  // Reset all filters
  const handleResetFilters = () => {
    setLoading(true)
    setSearchInput('')
    setVegOnly(false)
    setSearchParams({})
  }

  const handleRetry = () => {
    setLoading(true)
    setError(null)
    const currentCategory = searchParams.get('category') || 'ALL'
    handleCategorySelect(currentCategory)
  }

  // Filter for Veg Only if enabled
  const displayedItems = vegOnly
    ? menuItems.filter((item) => {
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
        return !isNonVeg
      })
    : menuItems

  return (
    <div className="menu-page-container">
      {/* Header Banner */}
      <div className="menu-header">
        <h1 className="menu-title">Explore Our Menu</h1>
        <p className="menu-subtitle">
          Savor every bite crafted with authentic spices, fresh produce, and passion.
        </p>

        {/* Local Search Input within Menu Page */}
        <form className="menu-search-form" onSubmit={handleSearchSubmit}>
          <Search size={20} className="menu-search-icon" />
          <input
            type="text"
            placeholder="Search by dish name, ingredient, or craving..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={handleClearSearch}
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}
          <button type="submit" className="menu-search-btn">
            Search
          </button>
        </form>
      </div>

      {/* Guest Mode Notification if unauthenticated and viewing preview */}
      {isGuestFallback && !isAuthenticated && (
        <div className="guest-mode-notice">
          <Info size={18} className="notice-icon" />
          <span>
            Viewing catalog in preview mode. <strong>Sign in</strong> to sync live orders with the backend.
          </span>
        </div>
      )}

      {/* Categories Filter Tabs */}
      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
      />

      {/* Results Header: Count, Veg Toggle & Active Filters */}
      <div className="menu-results-bar">
        <div className="results-count">
          {!loading && (
            <span>
              Showing <strong>{displayedItems.length}</strong>{' '}
              {displayedItems.length === 1 ? 'dish' : 'dishes'}
              {selectedCategory !== 'ALL' ? ` in ${selectedCategory}` : ''}
              {searchQuery ? ` matching "${searchQuery}"` : ''}
              {vegOnly ? ' (Vegetarian Only)' : ''}
            </span>
          )}
        </div>

        <div className="results-actions-right">
          {/* Pure Veg Toggle */}
          <button
            type="button"
            className={`btn-veg-toggle ${vegOnly ? 'active' : ''}`}
            onClick={() => setVegOnly(!vegOnly)}
            aria-pressed={vegOnly}
            title="Filter vegetarian dishes only"
          >
            <span className="veg-toggle-square">
              <span className="veg-toggle-dot" />
            </span>
            <span className="veg-toggle-label">Veg Only</span>
          </button>

          {(selectedCategory !== 'ALL' || searchQuery || vegOnly) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="btn-reset-filters"
            >
              Reset Filters ✕
            </button>
          )}
        </div>
      </div>

      {/* Content States */}
      {loading ? (
        <LoadingSpinner message="Fetching delicious items from the kitchen..." />
      ) : error ? (
        <ErrorState message={error} onRetry={handleRetry} />
      ) : displayedItems.length === 0 ? (
        <EmptyState
          title="No Dishes Found"
          description="We couldn't find any dishes matching your current selection."
          actionText="View All Dishes"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="menu-grid">
          {displayedItems.map((item) => (
            <FoodCard key={item.menuItemId} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
