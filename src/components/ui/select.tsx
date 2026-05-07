'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, id, children, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          ref={ref}
          className={cn(
            'w-full appearance-none rounded-2xl border border-[#d6def6] bg-white/88 px-4 py-3 pr-11 text-sm text-slate-800 shadow-[0_10px_24px_rgba(6,35,91,0.04)] outline-none transition-all',
            'focus:border-[#002868] focus:ring-4 focus:ring-[#002868]/10',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-[#BF0A30] focus:border-[#BF0A30] focus:ring-[#BF0A30]/20',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
          ▾
        </span>
      </div>
      {error && <span className="text-xs text-[#BF0A30]">{error}</span>}
    </div>
  ),
)

Select.displayName = 'Select'
