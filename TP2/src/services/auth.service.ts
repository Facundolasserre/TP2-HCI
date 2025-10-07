/**
 * Authentication Service
 * Manages JWT tokens and authentication state
 */

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthUser {
  id?: number
  username: string
  email?: string
}

/**
 * Save authentication token to localStorage
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token)
}

/**
 * Get authentication token from localStorage
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * Remove authentication token from localStorage
 */
export const removeAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

/**
 * Save user data to localStorage
 */
export const setAuthUser = (user: AuthUser): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

/**
 * Get user data from localStorage
 */
export const getAuthUser = (): AuthUser | null => {
  const userData = localStorage.getItem(USER_KEY)
  if (!userData) return null
  
  try {
    return JSON.parse(userData)
  } catch {
    return null
  }
}

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = getAuthToken()
  return !!token
}

/**
 * Logout user - clear all auth data
 */
export const logout = (): void => {
  removeAuthToken()
}

/**
 * Parse JWT token to get payload (without verification)
 * Warning: This is only for reading data, not for security validation
 */
export const parseJwtPayload = (token: string): any => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const payload = parseJwtPayload(token)
  if (!payload || !payload.exp) return true
  
  const expirationTime = payload.exp * 1000 // Convert to milliseconds
  return Date.now() >= expirationTime
}

/**
 * Validate current session
 */
export const validateSession = (): boolean => {
  const token = getAuthToken()
  if (!token) return false
  
  if (isTokenExpired(token)) {
    logout()
    return false
  }
  
  return true
}
