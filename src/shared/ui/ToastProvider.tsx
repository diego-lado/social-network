import { useState, useCallback, ReactNode } from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { Toast, type ToastProps } from './Toast'
import { ToastContext } from './ToastContext'

let toastCount = 0

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const addToast = useCallback((toast: Omit<ToastProps, 'id'>) => {
    const id = `toast-${++toastCount}`
    const newToast = { ...toast, id }
    setToasts((prev) => [...prev, newToast])
    
    // Remover el toast después de que se cierre
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, (toast.duration || 5000) + 500)
  }, [])

  const success = useCallback((description: string, title?: string) => {
    addToast({ title, description, variant: 'success' })
  }, [addToast])

  const error = useCallback((description: string, title?: string) => {
    addToast({ title, description, variant: 'error' })
  }, [addToast])

  const info = useCallback((description: string, title?: string) => {
    addToast({ title, description, variant: 'info' })
  }, [addToast])

  return (
    <ToastContext.Provider value={{ success, error, info }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        <ToastPrimitive.Viewport className="fixed top-0 right-0 z-[100] flex max-h-screen w-full flex-col p-4 md:max-w-[420px]" />
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  )
}


