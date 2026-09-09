import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'

type ButtonVariant = 'primary' | 'secondary' | 'outline'

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-600 text-white hover:bg-primary-700 border border-transparent',
  secondary:
    'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-transparent',
  outline:
    'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300',
}

const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50'

type ButtonBaseProps = {
  variant?: ButtonVariant
  children: ReactNode
  className?: string
}

type ButtonAsButton = ButtonBaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    to?: undefined
  }

type ButtonAsLink = ButtonBaseProps &
  Omit<LinkProps, 'className' | 'children'> & {
    to: LinkProps['to']
  }

type ButtonProps = ButtonAsButton | ButtonAsLink

function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(' ')
}

export function Button({
  variant = 'primary',
  children,
  className,
  ...props
}: ButtonProps) {
  const classes = cn(baseClasses, variantClasses[variant], className)

  if ('to' in props && props.to !== undefined) {
    const { to, ...linkProps } = props
    return (
      <Link to={to} className={classes} {...linkProps}>
        {children}
      </Link>
    )
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  )
}
