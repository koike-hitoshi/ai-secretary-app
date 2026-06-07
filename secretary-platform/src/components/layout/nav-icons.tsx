import type { ReactNode, SVGProps } from 'react'

type NavIconProps = SVGProps<SVGSVGElement> & { size?: number }

const base = {
  xmlns: 'http://www.w3.org/2000/svg',
  fill: 'none',
  viewBox: '0 0 24 24',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

function NavIcon({
  size = 20,
  className,
  children,
  ...props
}: NavIconProps & { children: ReactNode }) {
  return (
    <svg width={size} height={size} className={className} {...base} {...props}>
      {children}
    </svg>
  )
}

export function IconDashboard(props: NavIconProps) {
  return (
    <NavIcon {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </NavIcon>
  )
}

export function IconTasks(props: NavIconProps) {
  return (
    <NavIcon {...props}>
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </NavIcon>
  )
}

export function IconCalendar(props: NavIconProps) {
  return (
    <NavIcon {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </NavIcon>
  )
}

export function IconFileText(props: NavIconProps) {
  return (
    <NavIcon {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </NavIcon>
  )
}

export function IconMic(props: NavIconProps) {
  return (
    <NavIcon {...props}>
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3" />
    </NavIcon>
  )
}

export function IconSearch(props: NavIconProps) {
  return (
    <NavIcon {...props}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </NavIcon>
  )
}

export function IconBell(props: NavIconProps) {
  return (
    <NavIcon {...props}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </NavIcon>
  )
}

export function IconMenu(props: NavIconProps) {
  return (
    <NavIcon {...props}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </NavIcon>
  )
}
