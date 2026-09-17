/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import api from '../services/api'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null)
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user')
    try {
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(false)

  // Fetch full user details from /users endpoint matching username
  const fetchUserProfile = useCallback(async (username, currentToken) => {
    if (!username) return null
    try {
      const response = await api.get('/users', {
        headers: currentToken ? { Authorization: `Bearer ${currentToken}` } : undefined,
      })
      if (Array.isArray(response.data)) {
        const matched = response.data.find(
          (u) => u.username?.toLowerCase() === username.toLowerCase()
        )
        if (matched) {
          const profile = {
            userId: matched.userId,
            name: matched.name,
            username: matched.username,
            email: matched.email,
            phone: matched.phone,
            address: matched.address,
            role: matched.role || 'CUSTOMER',
          }
          localStorage.setItem('user', JSON.stringify(profile))
          setUser(profile)
          return profile
        }
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
    }
    return null
  }, [])

  // Login using backend endpoint POST /users/login with query params
  const login = async (username, password) => {
    setLoading(true)
    try {
      const response = await api.post('/users/login', null, {
        params: { username, password },
      })

      const { token: jwtToken, username: loggedInUsername } = response.data

      if (!jwtToken) {
        throw new Error('No authentication token received')
      }

      // Store token
      localStorage.setItem('token', jwtToken)
      setToken(jwtToken)

      // Fetch user profile from /users
      const profile = await fetchUserProfile(loggedInUsername, jwtToken)
      const finalUser = profile || {
        username: loggedInUsername,
        role: 'CUSTOMER',
      }

      if (!profile) {
        localStorage.setItem('user', JSON.stringify(finalUser))
        setUser(finalUser)
      }

      return { success: true, user: finalUser }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Login failed'
      throw new Error(message, { cause: error })
    } finally {
      setLoading(false)
    }
  }

  // Register user via POST /users
  const register = async (userData) => {
    setLoading(true)
    try {
      const response = await api.post('/users', userData)
      return { success: true, user: response.data }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Registration failed'
      throw new Error(message, { cause: error })
    } finally {
      setLoading(false)
    }
  }

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('cartId')
    localStorage.removeItem('cartItems')
    setToken(null)
    setUser(null)
  }, [])

  // Listen for auth:expired event dispatched by api.js
  useEffect(() => {
    const handleAuthExpired = () => {
      logout()
    }
    window.addEventListener('auth:expired', handleAuthExpired)
    return () => {
      window.removeEventListener('auth:expired', handleAuthExpired)
    }
  }, [logout])

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    register,
    logout,
    fetchUserProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to consume AuthContext
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
