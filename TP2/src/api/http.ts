import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios'
import type { ApiError } from '@/types/categories'

// Base URL from environment with fallback
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

/**
 * Create and configure axios instance
 */
const createHttpClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 15000, // 15 seconds
  })

  // Request interceptor - inject Bearer token
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('auth_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Response interceptor - handle errors
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      const apiError = handleApiError(error)
      return Promise.reject(apiError)
    }
  )

  return client
}

/**
 * Handle API errors and map to user-friendly messages
 */
const handleApiError = (error: AxiosError): ApiError => {
  if (!error.response) {
    // Network error
    return {
      message: 'Error de conexión. Verificá tu conexión a internet.',
      status: 0,
    }
  }

  const status = error.response.status
  const data: any = error.response.data

  switch (status) {
    case 400:
      return {
        message: data?.message || 'Datos inválidos o regla no cumplida',
        code: data?.code || 'BAD_REQUEST',
        status,
      }
    case 401:
      // Session expired - clear token and redirect to login
      localStorage.removeItem('auth_token')
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      return {
        message: 'Sesión expirada. Iniciá sesión de nuevo.',
        code: 'UNAUTHORIZED',
        status,
      }
    case 403:
      return {
        message: data?.message || 'No tenés permisos para realizar esta acción',
        code: 'FORBIDDEN',
        status,
      }
    case 404:
      return {
        message: data?.message || 'Recurso no encontrado',
        code: 'NOT_FOUND',
        status,
      }
    case 409:
      return {
        message: data?.message || 'Conflicto con el recurso existente',
        code: 'CONFLICT',
        status,
      }
    case 422:
      return {
        message: data?.message || 'Error de validación',
        code: 'VALIDATION_ERROR',
        status,
      }
    case 500:
    case 502:
    case 503:
      return {
        message: 'Error interno del servidor. Intentá más tarde.',
        code: 'INTERNAL_SERVER_ERROR',
        status,
      }
    default:
      return {
        message: data?.message || 'Error desconocido',
        code: 'UNKNOWN_ERROR',
        status,
      }
  }
}

// Create singleton instance
const httpClient = createHttpClient()

/**
 * HTTP helper methods
 */

export const get = async <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await httpClient.get<T>(url, config)
  return response.data
}

export const post = async <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await httpClient.post<T>(url, data, config)
  return response.data
}

export const put = async <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await httpClient.put<T>(url, data, config)
  return response.data
}

export const del = async <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await httpClient.delete<T>(url, config)
  return response.data
}

export default httpClient
