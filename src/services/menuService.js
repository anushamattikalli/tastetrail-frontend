import api from './api'

/**
 * Service to interact with the TasteTrail Spring Boot backend for MenuItems and Restaurants
 */
export const menuService = {
  // Get all available menu items
  getAvailableMenuItems: async () => {
    const response = await api.get('/menu-items/available')
    return response.data
  },

  // Get all menu items
  getAllMenuItems: async () => {
    const response = await api.get('/menu-items')
    return response.data
  },

  // Get menu item by ID
  getMenuItemById: async (id) => {
    const response = await api.get(`/menu-items/${id}`)
    return response.data
  },

  // Get menu items by category (BURGER, PIZZA, ROTI, CURRY, RICE, DESSERT)
  getMenuItemsByCategory: async (category) => {
    const response = await api.get(`/menu-items/category/${category}`)
    return response.data
  },

  // Search menu items by name
  searchMenuItems: async (name) => {
    const response = await api.get('/menu-items/search', {
      params: { name },
    })
    return response.data
  },

  // Get active restaurants
  getActiveRestaurants: async () => {
    const response = await api.get('/restaurants/active')
    return response.data
  },

  // Get restaurant by ID (includes nested menuItems)
  getRestaurantById: async (id) => {
    const response = await api.get(`/restaurants/${id}`)
    return response.data
  },
}

export default menuService
