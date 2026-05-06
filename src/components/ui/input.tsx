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
          'rounded-2xl border border-[#d6def6] bg-white/88 px-4 py-3 text-sm shadow-[0_10px_24px_rgba(6,35,91,0.04)] outline-none transition-all',
          'focus:border-[#002868] focus:ring-4 focus:ring-[#002868]/10',
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
