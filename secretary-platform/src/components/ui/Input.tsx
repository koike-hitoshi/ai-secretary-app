import { forwardRef, type InputHTMLAttributes, useId } from 'react'
import { cn } from '@/lib/utils'

export type InputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size'
> & {
  label?: string
  error?: string
  hint?: string
  inputSize?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'min-h-[36px] px-md py-xs text-sm rounded-md',
  md: 'min-h-[44px] px-md py-sm text-base rounded-lg',
  lg: 'min-h-[52px] px-lg py-md text-lg rounded-lg',
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    className,
    label,
    error,
    hint,
    inputSize = 'md',
    id: idProp,
    disabled,
    required,
    type = 'text',
    ...props
  },
  ref,
) {
  const generatedId = useId()
  const id = idProp ?? generatedId
  const errorId = error ? `${id}-error` : undefined
  const hintId = hint && !error ? `${id}-hint` : undefined

  return (
    <div className={cn('flex w-full flex-col gap-xs', className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
          {required && (
            <span className="ml-xs text-destructive" aria-hidden>
              *
            </span>
          )}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        type={type}
        disabled={disabled}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          [errorId, hintId].filter(Boolean).join(' ') || undefined
        }
        className={cn(
          'w-full border bg-surface text-foreground transition-colors duration-fast',
          'placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error
            ? 'border-destructive focus-visible:ring-destructive'
            : 'border-border hover:border-muted',
          sizeClasses[inputSize],
        )}
        {...props}
      />
      {error && (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={hintId} className="text-caption">
          {hint}
        </p>
      )}
    </div>
  )
})
