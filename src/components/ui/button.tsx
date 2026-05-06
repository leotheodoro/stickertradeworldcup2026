'use client'
import { cn } from '@/lib/utils'
import { ComponentProps, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ComponentProps<'button'> {
  variant?: Variant
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  loadingText?: ReactNode
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-[linear-gradient(135deg,#06235b_0%,#0c4aa1_100%)] text-white shadow-[0_12px_28px_rgba(6,35,91,0.28)] hover:brightness-105 active:brightness-95',
  secondary:
    'bg-[linear-gradient(135deg,#d33b67_0%,#bf0a30_100%)] text-white shadow-[0_12px_28px_rgba(191,10,48,0.24)] hover:brightness-105 active:brightness-95',
  ghost:
    'border border-[#d8e2ff] bg-white/80 text-[#06235b] shadow-[0_10px_24px_rgba(6,35,91,0.08)] hover:bg-white',
  danger:
    'bg-[linear-gradient(135deg,#dc2626_0%,#b91c1c_100%)] text-white shadow-[0_12px_28px_rgba(185,28,28,0.24)] hover:brightness-105 active:brightness-95',
}

const sizeStyles = {
  sm: 'px-3.5 py-2 text-sm',
  md: 'px-4.5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  children,
  loading = false,
  loadingText,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all cursor-pointer',
        'disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002868]/30 focus-visible:ring-offset-2',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      <span>{loading && loadingText ? loadingText : children}</span>
    </button>
  )
}
