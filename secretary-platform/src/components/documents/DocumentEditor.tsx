'use client'

import { useCallback, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { DOCUMENT_TEMPLATES, clearDraft, loadDraft, saveDraft } from '@/lib/documents/utils'
import type { DocumentType } from '@/types/document'

type DocumentEditorProps = {
  content: string
  documentType: DocumentType
  onContentChange: (value: string) => void
  onDocumentTypeChange: (type: DocumentType) => void
  disabled?: boolean
}

export function DocumentEditor({
  content,
  documentType,
  onContentChange,
  onDocumentTypeChange,
  disabled = false,
}: DocumentEditorProps) {
  const [draftSaved, setDraftSaved] = useState(false)

  const handleSaveDraft = useCallback(() => {
    saveDraft({
      content,
      documentType,
      applyUserStyle: true,
    })
    setDraftSaved(true)
    window.setTimeout(() => setDraftSaved(false), 2000)
  }, [content, documentType])

  const handleLoadDraft = useCallback(() => {
    const draft = loadDraft()
    if (!draft) return
    onContentChange(draft.content)
    onDocumentTypeChange(draft.documentType as DocumentType)
  }, [onContentChange, onDocumentTypeChange])

  const handleClear = useCallback(() => {
    onContentChange('')
    clearDraft()
  }, [onContentChange])

  const applyTemplate = (type: DocumentType) => {
    const template = DOCUMENT_TEMPLATES[type]
    if (template) {
      onContentChange(template.content)
      onDocumentTypeChange(type)
    }
  }

  return (
    <div className="flex flex-col gap-md">
      <div className="flex flex-wrap gap-sm">
        {(Object.keys(DOCUMENT_TEMPLATES) as DocumentType[]).map((type) => (
          <Button
            key={type}
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => applyTemplate(type)}
          >
            {DOCUMENT_TEMPLATES[type].label}テンプレート
          </Button>
        ))}
      </div>

      <Textarea
        label="校正する文章"
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        rows={14}
        showCount
        maxLength={12000}
        autoResize
        disabled={disabled}
        placeholder="メールや報告書の本文を入力してください"
        hint="最大 12,000 文字まで校正できます"
      />

      <div className="flex flex-wrap gap-sm">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={disabled || !content.trim()}
          onClick={handleSaveDraft}
        >
          {draftSaved ? '下書きを保存しました' : '下書きを保存'}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={handleLoadDraft}
        >
          下書きを読み込む
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled || !content}
          onClick={handleClear}
        >
          クリア
        </Button>
      </div>
    </div>
  )
}
