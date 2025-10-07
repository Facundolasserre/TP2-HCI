import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: number
  message: string
  type: ToastType
  duration: number
}

const toasts = ref<Toast[]>([])
let toastIdCounter = 0

/**
 * Composable for showing toast notifications
 */
export function useToast() {
  const show = (message: string, type: ToastType = 'info', duration = 3000) => {
    const id = ++toastIdCounter
    const toast: Toast = { id, message, type, duration }
    
    toasts.value.push(toast)

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        remove(id)
      }, duration)
    }

    return id
  }

  const success = (message: string, duration = 3000) => {
    return show(message, 'success', duration)
  }

  const error = (message: string, duration = 5000) => {
    return show(message, 'error', duration)
  }

  const warning = (message: string, duration = 4000) => {
    return show(message, 'warning', duration)
  }

  const info = (message: string, duration = 3000) => {
    return show(message, 'info', duration)
  }

  const remove = (id: number) => {
    const index = toasts.value.findIndex((t) => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  const clear = () => {
    toasts.value = []
  }

  return {
    toasts,
    show,
    success,
    error,
    warning,
    info,
    remove,
    clear,
  }
}
