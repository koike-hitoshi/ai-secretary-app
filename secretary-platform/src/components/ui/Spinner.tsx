import { cn } from '@/lib/utils'

export type SpinnerSize = 'sm' | 'md' | 'lg'
export type SpinnerColor = 'primary' | 'foreground' | 'muted'

export type SpinnerProps = {
  size?: SpinnerSize
  color?: SpinnerColor
  className?: string
  label?: string
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-5 w-5 border-2',
  lg: 'h-8 w-8 border-[3px]',
}

const colorClasses: Record<SpinnerColor, string> = {
  primary: 'border-primary border-t-transparent',
  foreground: 'border-foreground border-t-transparent',
  muted: 'border-muted border-t-transparent',
}

export function Spinner({
  size = 'md',
  color = 'primary',
  className,
  label = '読み込み中',
}: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn('inline-flex items-center justify-center', className)}
    >
      <span
        className={cn(
          'spinner-ring animate-spin rounded-full',
          sizeClasses[size],
          colorClasses[color],
        )}
      />
      <span className="sr-only">{label}</span>
    </span>
  )
}
