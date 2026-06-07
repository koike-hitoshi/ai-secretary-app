'use client'

import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'

type MinutesEditorProps = {
  title: string
  discussed: string
  decisions: string
  nextActions: string
  onTitleChange: (value: string) => void
  onDiscussedChange: (value: string) => void
  onDecisionsChange: (value: string) => void
  onNextActionsChange: (value: string) => void
  disabled?: boolean
}

export function MinutesEditor({
  title,
  discussed,
  decisions,
  nextActions,
  onTitleChange,
  onDiscussedChange,
  onDecisionsChange,
  onNextActionsChange,
  disabled = false,
}: MinutesEditorProps) {
  return (
    <div className="flex flex-col gap-md">
      <Input
        label="会議タイトル"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        disabled={disabled}
      />
      <Textarea
        label="議論された内容"
        value={discussed}
        onChange={(e) => onDiscussedChange(e.target.value)}
        rows={6}
        disabled={disabled}
      />
      <Textarea
        label="決定事項"
        value={decisions}
        onChange={(e) => onDecisionsChange(e.target.value)}
        rows={5}
        disabled={disabled}
      />
      <Textarea
        label="ネクストアクション"
        value={nextActions}
        onChange={(e) => onNextActionsChange(e.target.value)}
        rows={5}
        disabled={disabled}
        hint="1行1アクション（担当者・期限を含めて記載）"
      />
    </div>
  )
}
