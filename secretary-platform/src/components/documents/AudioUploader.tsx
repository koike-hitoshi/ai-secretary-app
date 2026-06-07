'use client'

import { useCallback, useRef, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const ACCEPT = 'audio/mpeg,audio/wav,audio/x-wav,audio/mp4,audio/x-m4a,.mp3,.wav,.m4a'

type AudioUploaderProps = {
  onFileSelect: (file: File) => void
  disabled?: boolean
  selectedFile?: File | null
  onClear?: () => void
}

export function AudioUploader({
  onFileSelect,
  disabled = false,
  selectedFile = null,
  onClear,
}: AudioUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file || disabled) return
      onFileSelect(file)
    },
    [disabled, onFileSelect],
  )

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="flex flex-col gap-md">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          'flex flex-col items-center justify-center gap-sm rounded-xl border-2 border-dashed p-xl text-center transition-colors',
          dragOver ? 'border-primary bg-primary/5' : 'border-border bg-surface',
          disabled && 'opacity-50',
        )}
      >
        <p className="text-sm font-medium text-foreground">
          音声ファイルをドラッグ&ドロップ
        </p>
        <p className="text-caption">対応形式: mp3 / wav / m4a（最大 200MB）</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          ファイルを選択
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          disabled={disabled}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      {selectedFile && (
        <div className="flex items-center justify-between gap-sm rounded-lg border border-border bg-surface-elevated p-md">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{selectedFile.name}</p>
            <p className="text-caption">{formatSize(selectedFile.size)}</p>
          </div>
          {onClear && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={onClear}
            >
              取消
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
