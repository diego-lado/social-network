import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = '', ...props }, ref) => {
    const errorClasses = error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
    
    return (
      <input
        ref={ref}
        className={`input ${errorClasses} ${className}`}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'





