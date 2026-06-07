'use client'

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  type ChangeEvent,
  type TextareaHTMLAttributes,
} from 'react'
import { cn } from '@/lib/utils'

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  error?: string
  hint?: string
  showCount?: boolean
  maxLength?: number
  autoResize?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      className,
      label,
      error,
      hint,
      showCount = false,
      maxLength,
      autoResize = false,
      id: idProp,
      disabled,
      required,
      value,
      defaultValue,
      onChange,
      rows = 4,
      ...props
    },
    ref,
  ) {
    const generatedId = useId()
    const id = idProp ?? generatedId
    const internalRef = useRef<HTMLTextAreaElement | null>(null)
    const errorId = error ? `${id}-error` : undefined
    const hintId = hint && !error ? `${id}-hint` : undefined

    const setRefs = useCallback(
      (node: HTMLTextAreaElement | null) => {
        internalRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      },
      [ref],
    )

    const resize = useCallback(() => {
      const el = internalRef.current
      if (!el || !autoResize) return
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }, [autoResize])

    useEffect(() => {
      resize()
    }, [resize, value, defaultValue])

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
      resize()
      onChange?.(e)
    }

    const currentLength =
      typeof value === 'string'
        ? value.length
        : internalRef.current?.value.length ?? 0

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
        <textarea
          ref={setRefs}
          id={id}
          rows={autoResize ? 1 : rows}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            [errorId, hintId].filter(Boolean).join(' ') || undefined
          }
          className={cn(
            'w-full resize-y border bg-surface px-md py-sm text-base text-foreground transition-colors duration-fast',
            'placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            'disabled:cursor-not-allowed disabled:opacity-50',
            autoResize && 'resize-none overflow-hidden',
            error
              ? 'border-destructive focus-visible:ring-destructive'
              : 'border-border hover:border-muted',
            'rounded-lg',
          )}
          {...props}
        />
        <div className="flex items-start justify-between gap-sm">
          {error ? (
            <p id={errorId} role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : hint ? (
            <p id={hintId} className="text-caption">
              {hint}
            </p>
          ) : (
            <span />
          )}
          {showCount && (
            <p
              className="shrink-0 text-caption tabular-nums"
              aria-live="polite"
            >
              {currentLength}
              {maxLength != null ? ` / ${maxLength}` : ''}
            </p>
          )}
        </div>
      </div>
    )
  },
)
