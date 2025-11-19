import { forwardRef } from 'react'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className = '', ...props }, ref) => {
    const errorClasses = error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
    
    return (
      <textarea
        ref={ref}
        className={`textarea ${errorClasses} ${className}`}
        {...props}
      />
    )
  }
)

Textarea.displayName = 'Textarea'





