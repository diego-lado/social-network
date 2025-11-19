import * as ToastPrimitive from '@radix-ui/react-toast'
import { Cross2Icon } from '@/shared/icons/Icons'
import { clsx } from 'clsx'
import { useState, useEffect } from 'react'

export interface ToastProps {
  id: string
  title?: string
  description: string
  variant?: 'success' | 'error' | 'info'
  duration?: number
}

const Toast = ({ title, description, variant = 'info', duration = 5000 }: ToastProps) => {
  const [open, setOpen] = useState(true)

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => setOpen(false), duration)
      return () => clearTimeout(timer)
    }
  }, [duration])

  const variantStyles = {
    success: 'bg-green-50 border-green-200 text-green-900',
    error: 'bg-red-50 border-red-200 text-red-900',
    info: 'bg-blue-50 border-blue-200 text-blue-900',
  }

  const iconColors = {
    success: 'text-green-600',
    error: 'text-red-600',
    info: 'text-blue-600',
  }

  return (
    <ToastPrimitive.Root
      className={clsx(
        'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg border p-4 pr-8 shadow-lg toast-animation',
        variantStyles[variant],
        'data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]'
      )}
      open={open}
      onOpenChange={setOpen}
      duration={duration}
    >
      <div className="grid gap-1">
        {title && (
          <ToastPrimitive.Title className="text-sm font-semibold">
            {title}
          </ToastPrimitive.Title>
        )}
        <ToastPrimitive.Description className="text-sm opacity-90">
          {description}
        </ToastPrimitive.Description>
      </div>
      <ToastPrimitive.Close className="absolute right-2 top-2 rounded-md p-1 opacity-0 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100">
        <Cross2Icon className={clsx('h-4 w-4', iconColors[variant])} />
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  )
}

export const Toaster = () => {
  return (
    <ToastPrimitive.Provider swipeDirection="right">
      <ToastPrimitive.Viewport className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]" />
    </ToastPrimitive.Provider>
  )
}

export { Toast }

