import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={cn(
          'rounded-md border border-slate-300 px-3 py-2 text-sm outline-none',
          'focus:border-[#002868] focus:ring-2 focus:ring-[#002868]/20',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-[#BF0A30] focus:border-[#BF0A30] focus:ring-[#BF0A30]/20',
          className,
        )}
        {...props}
      />
      {error && <span className="text-xs text-[#BF0A30]">{error}</span>}
    </div>
  ),
)
Input.displayName = 'Input'
