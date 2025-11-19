import { Link } from 'react-router-dom'
import type { ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger'
type ButtonSize = 'default' | 'small'

interface BaseButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
  className?: string
  children: ReactNode
}

type ButtonProps = BaseButtonProps &
  (
    | (ButtonHTMLAttributes<HTMLButtonElement> & { as?: 'button' })
    | ({ as: 'link'; to: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>)
  )

export function Button({
  variant = 'primary',
  size = 'default',
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  children,
  as,
  ...props
}: ButtonProps) {
  const baseClasses = 'btn'
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
  }
  const sizeClasses = {
    default: '',
    small: 'text-sm py-1.5 px-3',
  }
  const widthClasses = fullWidth ? 'w-full' : ''
  const iconClasses = (leftIcon || rightIcon) && size === 'default' 
    ? 'flex items-center justify-center gap-2' 
    : ''

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    widthClasses,
    iconClasses,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (as === 'link') {
    const { to, ...linkProps } = props as { to: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>
    return (
      <Link to={to} className={classes} {...linkProps}>
        {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </Link>
    )
  }

  return (
    <button type="button" className={classes} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  )
}


