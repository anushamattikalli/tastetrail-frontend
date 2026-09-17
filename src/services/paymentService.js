import api from './api'

/**
 * Payment Service
 * Integrates directly with TasteTrail Spring Boot PaymentController
 */
export const paymentService = {
  /**
   * Create a payment record for an order
   * POST /payments?orderId={orderId}&paymentMethod={paymentMethod}
   * Supported methods: UPI, CARD, CASH
   */
  async createPayment(orderId, paymentMethod) {
    const formattedMethod = (paymentMethod || 'UPI').toUpperCase()
    const response = await api.post('/payments', null, {
      params: {
        orderId,
        paymentMethod: formattedMethod,
      },
    })
    return response.data
  },

  /**
   * Get payment details by payment ID
   * GET /payments/{id}
   */
  async getPaymentById(paymentId) {
    const response = await api.get(`/payments/${paymentId}`)
    return response.data
  },

  /**
   * Get payment details for a specific order
   * GET /payments/order/{orderId}
   */
  async getPaymentByOrderId(orderId) {
    const response = await api.get(`/payments/order/${orderId}`)
    return response.data
  },

  /**
   * Update payment status (e.g. mark SUCCESS)
   * PUT /payments/{id}/status?status={status}
   */
  async updatePaymentStatus(paymentId, status) {
    const response = await api.put(`/payments/${paymentId}/status`, null, {
      params: { status },
    })
    return response.data
  },
}

export default paymentService

