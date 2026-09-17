import api from './api'

/**
 * Order Service
 * Integrates directly with TasteTrail Spring Boot OrderController
 */
export const orderService = {
  /**
   * Place an order from an existing cart
   * POST /orders/place?cartId={cartId}&deliveryAddress={deliveryAddress}
   */
  async placeOrder(cartId, deliveryAddress) {
    const response = await api.post('/orders/place', null, {
      params: {
        cartId,
        deliveryAddress,
      },
    })
    return response.data
  },

  /**
   * Get an order by ID
   * GET /orders/{id}
   */
  async getOrderById(orderId) {
    const response = await api.get(`/orders/${orderId}`)
    return response.data
  },

  /**
   * Get all orders for a specific user
   * GET /orders/user/{userId}
   */
  async getUserOrders(userId) {
    const response = await api.get(`/orders/user/${userId}`)
    return response.data
  },

  /**
   * Get orders for a user filtered by status
   * GET /orders/user/{userId}/status?status={status}
   */
  async getUserOrdersByStatus(userId, status) {
    const response = await api.get(`/orders/user/${userId}/status`, {
      params: { status },
    })
    return response.data
  },

  /**
   * Cancel an order (Allowed for CUSTOMER & ADMIN if not yet DELIVERED or CANCELLED)
   * PUT /orders/{id}/cancel
   */
  async cancelOrder(orderId) {
    const response = await api.put(`/orders/${orderId}/cancel`)
    return response.data
  },

  /**
   * Update delivery address for an order
   * PUT /orders/{id}/address?deliveryAddress={deliveryAddress}
   */
  async updateDeliveryAddress(orderId, deliveryAddress) {
    const response = await api.put(`/orders/${orderId}/address`, null, {
      params: { deliveryAddress },
    })
    return response.data
  },
}

export default orderService
