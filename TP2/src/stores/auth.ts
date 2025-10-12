import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import usersService from '@/api/users.service'
import type { Credentials, RegistrationData, RegisteredUser, GetUser, UpdateUserProfile } from '@/api/users.service'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const user = ref<GetUser | null>(null)
  const verificationToken = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value)

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('auth_token', newToken)
  }

  function clearToken() {
    token.value = null
    localStorage.removeItem('auth_token')
  }

  function setVerificationToken(tokenValue: string | null) {
    verificationToken.value = tokenValue
  }

  async function login(credentials: Credentials): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const response = await usersService.login(credentials)
      setToken(response.token)
      await fetchCurrentUser()
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Error al iniciar sesión'
      clearToken()
      user.value = null
      throw err
    } finally {
      loading.value = false
    }
  }

  async function register(data: RegistrationData): Promise<RegisteredUser> {
    loading.value = true
    error.value = null
    try {
      const response = await usersService.register(data)
      setVerificationToken(response.verificationToken)
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Error al registrarse'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function sendVerification(email: string): Promise<void> {
    loading.value = true
    error.value = null
    try {
      await usersService.sendVerification(email)
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Error al enviar código de verificación'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function verifyAccount(code: string): Promise<void> {
    loading.value = true
    error.value = null
    try {
      await usersService.verifyAccount({ code })
      setVerificationToken(null)
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Error al verificar la cuenta'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function sendPasswordRecovery(email: string): Promise<void> {
    loading.value = true
    error.value = null
    try {
      await usersService.sendPasswordRecovery(email)
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Error al enviar recuperación de contraseña'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function resetPassword(code: string, password: string): Promise<void> {
    loading.value = true
    error.value = null
    try {
      await usersService.resetPassword({ code, password })
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Error al restablecer contraseña'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
    loading.value = true
    error.value = null
    try {
      await usersService.changePassword({ currentPassword, newPassword })
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Error al cambiar contraseña'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateProfile(data: UpdateUserProfile): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const updatedUser = await usersService.updateProfile(data)
      user.value = updatedUser
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Error al actualizar perfil'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchCurrentUser(): Promise<void> {
    if (!token.value) return
    loading.value = true
    error.value = null
    try {
      user.value = await usersService.getProfile()
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Error al obtener perfil'
      clearToken()
      user.value = null
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout(): Promise<void> {
    try {
      await usersService.logout()
    } catch (err) {
      console.warn('Error logging out on backend:', err)
    } finally {
      clearToken()
      user.value = null
    }
  }

  async function initialize(): Promise<void> {
    if (token.value) {
      await fetchCurrentUser()
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    token,
    user,
    verificationToken,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    sendVerification,
    verifyAccount,
    sendPasswordRecovery,
    resetPassword,
    changePassword,
    updateProfile,
    fetchCurrentUser,
    logout,
    initialize,
    setVerificationToken,
    clearError,
  }
})
