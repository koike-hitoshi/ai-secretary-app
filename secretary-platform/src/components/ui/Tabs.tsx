'use client'

import {
  createContext,
  useCallback,
  useContext,
  useId,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/utils'

type TabsContextValue = {
  activeId: string
  setActiveId: (id: string) => void
  baseId: string
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext() {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('Tabs components must be used within <Tabs>')
  return ctx
}

export type TabsProps = {
  defaultValue: string
  value?: string
  onValueChange?: (value: string) => void
  children: ReactNode
  className?: string
}

export function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
  className,
}: TabsProps) {
  const baseId = useId()
  const [internalValue, setInternalValue] = useState(defaultValue)
  const activeId = controlledValue ?? internalValue

  const setActiveId = useCallback(
    (id: string) => {
      if (controlledValue === undefined) setInternalValue(id)
      onValueChange?.(id)
    },
    [controlledValue, onValueChange],
  )

  return (
    <TabsContext.Provider value={{ activeId, setActiveId, baseId }}>
      <div className={cn('flex w-full flex-col', className)}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex w-full gap-xs rounded-xl bg-secondary p-xs',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export type TabsTriggerProps = HTMLAttributes<HTMLButtonElement> & {
  value: string
  icon?: ReactNode
}

export function TabsTrigger({
  value,
  icon,
  className,
  children,
  ...props
}: TabsTriggerProps) {
  const { activeId, setActiveId, baseId } = useTabsContext()
  const isActive = activeId === value
  const tabId = `${baseId}-tab-${value}`
  const panelId = `${baseId}-panel-${value}`

  return (
    <button
      type="button"
      role="tab"
      id={tabId}
      aria-selected={isActive}
      aria-controls={panelId}
      tabIndex={isActive ? 0 : -1}
      onClick={() => setActiveId(value)}
      className={cn(
        'inline-flex min-h-[44px] flex-1 items-center justify-center gap-sm rounded-lg px-md py-sm text-sm font-medium transition-colors duration-fast',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        isActive
          ? 'bg-surface text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground',
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
}

export type TabsContentProps = HTMLAttributes<HTMLDivElement> & {
  value: string
}

export function TabsContent({
  value,
  className,
  children,
  ...props
}: TabsContentProps) {
  const { activeId, baseId } = useTabsContext()
  const isActive = activeId === value
  const tabId = `${baseId}-tab-${value}`
  const panelId = `${baseId}-panel-${value}`

  if (!isActive) return null

  return (
    <div
      role="tabpanel"
      id={panelId}
      aria-labelledby={tabId}
      tabIndex={0}
      className={cn('mt-lg animate-fade-in focus:outline-none', className)}
      {...props}
    >
      {children}
    </div>
  )
}
