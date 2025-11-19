import { createContext } from 'react'

export interface ToastContextType {
  success: (description: string, title?: string) => void
  error: (description: string, title?: string) => void
  info: (description: string, title?: string) => void
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined)




