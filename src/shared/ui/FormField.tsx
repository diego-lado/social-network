import { forwardRef } from 'react'

interface FormFieldProps {
  label?: string
  error?: string
  required?: boolean
  children: React.ReactNode
}

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, error, required, children }, ref) => {
    return (
      <div ref={ref}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        {children}
        {error && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)

FormField.displayName = 'FormField'





