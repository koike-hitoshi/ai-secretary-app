import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

const defaultProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  fill: 'none',
  viewBox: '0 0 24 24',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

export function IconX({ size = 16, className, ...props }: IconProps) {
  return (
    <svg
      {...defaultProps}
      width={size}
      height={size}
      className={className}
      {...props}
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

export function IconChevronDown({ size = 16, className, ...props }: IconProps) {
  return (
    <svg
      {...defaultProps}
      width={size}
      height={size}
      className={className}
      {...props}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export function IconCheck({ size = 16, className, ...props }: IconProps) {
  return (
    <svg
      {...defaultProps}
      width={size}
      height={size}
      className={className}
      {...props}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

export function IconInfo({ size = 16, className, ...props }: IconProps) {
  return (
    <svg
      {...defaultProps}
      width={size}
      height={size}
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  )
}

export function IconAlertTriangle({
  size = 16,
  className,
  ...props
}: IconProps) {
  return (
    <svg
      {...defaultProps}
      width={size}
      height={size}
      className={className}
      {...props}
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  )
}

export function IconSearch({ size = 16, className, ...props }: IconProps) {
  return (
    <svg
      {...defaultProps}
      width={size}
      height={size}
      className={className}
      {...props}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}
