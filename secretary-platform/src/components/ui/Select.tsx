'use client'

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { cn } from '@/lib/utils'
import { IconCheck, IconChevronDown, IconSearch, IconX } from '@/components/ui/icons'

export type SelectOption = {
  value: string
  label: string
  disabled?: boolean
}

export type SelectProps = {
  options: SelectOption[]
  value?: string | string[]
  defaultValue?: string | string[]
  onChange?: (value: string | string[]) => void
  label?: string
  placeholder?: string
  error?: string
  hint?: string
  disabled?: boolean
  required?: boolean
  searchable?: boolean
  multiple?: boolean
  id?: string
  className?: string
}

export function Select({
  options,
  value: controlledValue,
  defaultValue,
  onChange,
  label,
  placeholder = '選択してください',
  error,
  hint,
  disabled = false,
  required = false,
  searchable = false,
  multiple = false,
  id: idProp,
  className,
}: SelectProps) {
  const generatedId = useId()
  const id = idProp ?? generatedId
  const listboxId = `${id}-listbox`
  const errorId = error ? `${id}-error` : undefined
  const hintId = hint && !error ? `${id}-hint` : undefined

  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [highlightIndex, setHighlightIndex] = useState(0)
  const [internalValue, setInternalValue] = useState<string | string[]>(() => {
    if (defaultValue != null) return defaultValue
    return multiple ? [] : ''
  })

  const containerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const value = controlledValue ?? internalValue

  const selectedValues = useMemo(
    () => (Array.isArray(value) ? value : value ? [value] : []),
    [value],
  )

  const filteredOptions = useMemo(() => {
    if (!searchable || !search.trim()) return options
    const q = search.toLowerCase()
    return options.filter((o) => o.label.toLowerCase().includes(q))
  }, [options, search, searchable])

  const enabledOptions = filteredOptions.filter((o) => !o.disabled)

  const displayLabel = useMemo(() => {
    if (selectedValues.length === 0) return placeholder
    const labels = options
      .filter((o) => selectedValues.includes(o.value))
      .map((o) => o.label)
    return labels.join(', ')
  }, [selectedValues, options, placeholder])

  const setValue = useCallback(
    (next: string | string[]) => {
      if (controlledValue === undefined) setInternalValue(next)
      onChange?.(next)
    },
    [controlledValue, onChange],
  )

  const closeMenu = useCallback(() => {
    setOpen(false)
    setSearch('')
    setHighlightIndex(0)
  }, [])

  const toggleOption = (optionValue: string) => {
    if (multiple) {
      const next = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue]
      setValue(next)
    } else {
      setValue(optionValue)
      closeMenu()
    }
  }

  const removeValue = (optionValue: string) => {
    if (!multiple) return
    setValue(selectedValues.filter((v) => v !== optionValue))
  }

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        closeMenu()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, closeMenu])

  useEffect(() => {
    if (open && searchable) searchRef.current?.focus()
  }, [open, searchable])

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        if (!open) setOpen(true)
        else
          setHighlightIndex((i) =>
            Math.min(i + 1, enabledOptions.length - 1),
          )
        break
      case 'ArrowUp':
        e.preventDefault()
        if (open) setHighlightIndex((i) => Math.max(i - 1, 0))
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (!open) {
          setOpen(true)
        } else if (enabledOptions[highlightIndex]) {
          toggleOption(enabledOptions[highlightIndex].value)
        }
        break
      case 'Escape':
        closeMenu()
        break
      case 'Tab':
        closeMenu()
        break
    }
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative flex w-full flex-col gap-xs', className)}
      aria-invalid={error ? true : undefined}
      aria-describedby={
        [errorId, hintId].filter(Boolean).join(' ') || undefined
      }
    >
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

      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex min-h-[44px] w-full items-center justify-between gap-sm rounded-lg border bg-surface px-md py-sm text-left text-base transition-colors duration-fast',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error
            ? 'border-destructive'
            : 'border-border hover:border-muted',
          selectedValues.length === 0 && 'text-muted-foreground',
        )}
      >
        <span className="flex min-w-0 flex-1 flex-wrap items-center gap-xs truncate">
          {multiple && selectedValues.length > 0 ? (
            options
              .filter((o) => selectedValues.includes(o.value))
              .map((o) => (
                <span
                  key={o.value}
                  className="inline-flex items-center gap-xs rounded-md bg-secondary px-sm py-xs text-xs text-secondary-foreground"
                >
                  {o.label}
                  <button
                    type="button"
                    aria-label={`${o.label} を削除`}
                    onClick={(e) => {
                      e.stopPropagation()
                      removeValue(o.value)
                    }}
                    className="rounded-sm hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <IconX size={12} />
                  </button>
                </span>
              ))
          ) : (
            displayLabel
          )}
        </span>
        <IconChevronDown
          size={16}
          className={cn(
            'shrink-0 text-muted-foreground transition-transform duration-fast',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div
          className={cn(
            'absolute left-0 right-0 top-full z-40 mt-xs overflow-hidden rounded-xl border border-border bg-surface-elevated shadow-lg animate-scale-in',
          )}
        >
          {searchable && (
            <div className="flex items-center gap-sm border-b border-border px-md py-sm">
              <IconSearch size={16} className="shrink-0 text-muted-foreground" />
              <input
                ref={searchRef}
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setHighlightIndex(0)
                }}
                placeholder="検索..."
                aria-label="オプションを検索"
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          )}
          <ul
            id={listboxId}
            role="listbox"
            aria-multiselectable={multiple || undefined}
            className="max-h-60 overflow-y-auto p-xs"
          >
            {filteredOptions.length === 0 ? (
              <li className="px-md py-sm text-sm text-muted-foreground">
                該当する項目がありません
              </li>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = selectedValues.includes(option.value)
                const isHighlighted =
                  enabledOptions.indexOf(option) === highlightIndex

                return (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={option.disabled || undefined}
                    onMouseEnter={() =>
                      setHighlightIndex(enabledOptions.indexOf(option))
                    }
                    onClick={() =>
                      !option.disabled && toggleOption(option.value)
                    }
                    className={cn(
                      'flex cursor-pointer items-center justify-between gap-sm rounded-lg px-md py-sm text-sm transition-colors duration-fast',
                      option.disabled && 'cursor-not-allowed opacity-50',
                      isHighlighted && 'bg-secondary',
                      isSelected && 'text-primary',
                    )}
                  >
                    <span>{option.label}</span>
                    {isSelected && (
                      <IconCheck size={16} className="shrink-0 text-primary" />
                    )}
                  </li>
                )
              })
            )}
          </ul>
        </div>
      )}

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
}
