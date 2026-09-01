import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:   'bg-gray-900 text-white hover:bg-gray-800 shadow-sm',
        primary:   'bg-brand-600 text-white hover:bg-brand-500 shadow-sm shadow-brand-900/20',
        outline:   'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300',
        ghost:     'hover:bg-gray-100 text-gray-600 hover:text-gray-900',
        danger:    'bg-rose-600 text-white hover:bg-rose-500',
        secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
        link:      'text-brand-600 underline-offset-4 hover:underline p-0 h-auto',
        dark:      'bg-surface-800 text-slate-200 hover:bg-surface-700 border border-white/10',
      },
      size: {
        sm:   'h-8 px-3 text-xs rounded-lg',
        md:   'h-9 px-4',
        lg:   'h-11 px-6 text-base',
        icon: 'h-9 w-9 rounded-lg',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      )}
      {children}
    </button>
  )
)
Button.displayName = 'Button'

export { Button, buttonVariants }
