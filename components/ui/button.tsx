'use client'
import { cn } from '@/lib/utils'
import { ComponentProps } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ComponentProps<'button'> {
  variant?: Variant
  size?: 'sm' | 'md' | 'lg'
}

const variantStyles: Record<Variant, string> = {
  primary: 'bg-[#002868] text-white hover:bg-[#001f55] active:bg-[#001442]',
  secondary: 'bg-[#BF0A30] text-white hover:bg-[#a6091a]',
  ghost: 'bg-transparent text-[#002868] hover:bg-[#002868]/10',
  danger: 'bg-red-600 text-white hover:bg-red-700',
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
}

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-semibold transition-colors cursor-pointer',
        'disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002868]',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    />
  )
}
