'use client'

import { Select } from '@/components/ui/Select'
import type { DocumentType } from '@/types/document'

const OPTIONS = [
  { value: 'general', label: '一般文書' },
  { value: 'email', label: 'メール' },
  { value: 'report', label: '報告書' },
  { value: 'proposal', label: '提案書' },
]

type DocumentTypeSelectorProps = {
  value: DocumentType
  onChange: (value: DocumentType) => void
  disabled?: boolean
}

export function DocumentTypeSelector({
  value,
  onChange,
  disabled = false,
}: DocumentTypeSelectorProps) {
  return (
    <Select
      label="文書タイプ"
      options={OPTIONS}
      value={value}
      onChange={(next) => onChange(next as DocumentType)}
      disabled={disabled}
      hint="タイプに応じた校正ルールを適用します"
    />
  )
}
