import type { PostgrestError } from '@supabase/supabase-js'

export class SupabaseDataError extends Error {
  readonly code: string
  readonly details: string | null
  readonly hint: string | null

  constructor(error: PostgrestError) {
    super(error.message)
    this.name = 'SupabaseDataError'
    this.code = error.code
    this.details = error.details
    this.hint = error.hint
  }
}

export function throwOnError<T>(
  result: { data: T | null; error: PostgrestError | null },
): NonNullable<T> {
  if (result.error) {
    throw new SupabaseDataError(result.error)
  }

  if (result.data === null || result.data === undefined) {
    throw new Error('Expected data but received null')
  }

  return result.data
}

export function throwIfError(result: { error: PostgrestError | null }): void {
  if (result.error) {
    throw new SupabaseDataError(result.error)
  }
}
