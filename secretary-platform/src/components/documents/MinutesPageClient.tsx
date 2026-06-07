'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { AudioUploader } from '@/components/documents/AudioUploader'
import { MinutesList } from '@/components/documents/MinutesList'
import { TranscriptionProgress } from '@/components/documents/TranscriptionProgress'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useAudioUpload } from '@/hooks/documents/useAudioUpload'
import { useMinutes } from '@/hooks/documents/useMinutes'
import { useTranscription } from '@/hooks/documents/useTranscription'
import type { MinutesListItem } from '@/types/minutes'

type MinutesPageClientProps = {
  initialItems: MinutesListItem[]
}

export function MinutesPageClient({ initialItems }: MinutesPageClientProps) {
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [meetingTitle, setMeetingTitle] = useState('')
  const [search, setSearch] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [generatingMinutes, setGeneratingMinutes] = useState(false)
  const [resumingId, setResumingId] = useState<string | null>(null)

  const {
    upload,
    uploading,
    progress: uploadProgress,
    error: uploadError,
    reset: resetUpload,
    setError: setUploadError,
  } = useAudioUpload()

  const {
    startTranscription,
    generateMinutes,
    loading: transcribeLoading,
    error: transcribeError,
    minutesId,
    status,
    progress: transcribeProgress,
    transcript,
    reset: resetTranscription,
    resumePolling,
    setError: setTranscribeError,
  } = useTranscription()

  const {
    items,
    loading: listLoading,
    error: listError,
    fetchList,
    remove,
    prependItem,
    setError: setListError,
  } = useMinutes(initialItems)

  const filteredItems = search.trim()
    ? items.filter((item) =>
        item.title.toLowerCase().includes(search.trim().toLowerCase()),
      )
    : items

  const isProcessing =
    uploading ||
    transcribeLoading ||
    generatingMinutes ||
    (minutesId !== null && status !== 'completed' && status !== 'failed')

  const handleStart = async () => {
    if (!selectedFile) {
      setUploadError('音声ファイルを選択してください')
      return
    }

    try {
      resetTranscription()
      const uploadResult = await upload(selectedFile)
      const transcribeResult = await startTranscription(
        uploadResult.uploadId,
        meetingTitle || selectedFile.name.replace(/\.[^.]+$/, ''),
      )

      prependItem({
        id: transcribeResult.minutesId,
        title: meetingTitle || '無題の議事録',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        hasTranscript: false,
        hasSummary: false,
      })
    } catch {
      // errors handled in hooks
    }
  }

  const handleGenerateMinutes = async () => {
    if (!minutesId) return

    setGeneratingMinutes(true)
    try {
      await generateMinutes(minutesId, transcript ?? undefined)
      router.push(`/dashboard/documents/minutes/${minutesId}`)
    } catch {
      // error handled in hook
    } finally {
      setGeneratingMinutes(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('この議事録を削除しますか？')) return
    setDeletingId(id)
    try {
      await remove(id)
    } catch {
      // error handled in hook
    } finally {
      setDeletingId(null)
    }
  }

  const clearFlow = () => {
    setSelectedFile(null)
    setMeetingTitle('')
    resetUpload()
    resetTranscription()
    setGeneratingMinutes(false)
  }

  const transcriptionDone = status === 'completed' && Boolean(transcript)

  const combinedProgress = uploading
    ? Math.round(uploadProgress * 0.25)
    : generatingMinutes
      ? 95
      : transcriptionDone
        ? 100
        : Math.min(transcribeProgress, 74)

  const error = uploadError ?? transcribeError ?? listError

  return (
    <div className="flex flex-col gap-lg px-xl py-lg">
      {error && (
        <Alert
          type="error"
          dismissible
          onDismiss={() => {
            setUploadError(null)
            setTranscribeError(null)
            setListError(null)
          }}
        >
          {error}
        </Alert>
      )}

      <div className="grid gap-lg lg:grid-cols-2">
        <Card>
          <CardBody className="flex flex-col gap-md">
            <h2 className="text-lg font-semibold">新規議事録作成</h2>
            <Input
              label="会議タイトル（任意）"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              placeholder="例: 週次定例ミーティング"
              disabled={isProcessing}
            />
            <AudioUploader
              selectedFile={selectedFile}
              onFileSelect={setSelectedFile}
              onClear={() => setSelectedFile(null)}
              disabled={isProcessing}
            />
            <div className="flex flex-wrap gap-sm">
              <Button
                onClick={handleStart}
                loading={isProcessing}
                disabled={!selectedFile || isProcessing}
              >
                文字起こしを開始
              </Button>
              {(minutesId || selectedFile) && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isProcessing}
                  onClick={clearFlow}
                >
                  リセット
                </Button>
              )}
            </div>
          </CardBody>
        </Card>

        {(isProcessing || minutesId) && (
          <div className="flex flex-col gap-md">
            <TranscriptionProgress
              status={status}
              progress={combinedProgress}
              generatingMinutes={generatingMinutes}
              readyToGenerate={transcriptionDone}
              error={transcribeError}
            />
            {status === 'completed' && transcript && (
              <Card>
                <CardBody className="flex flex-col gap-md">
                  <p className="text-sm text-muted-foreground">
                    文字起こしが完了しました。議事録を自動生成できます。
                  </p>
                  <Button
                    onClick={handleGenerateMinutes}
                    loading={generatingMinutes}
                  >
                    議事録を生成
                  </Button>
                </CardBody>
              </Card>
            )}
            {minutesId &&
              status !== 'completed' &&
              status !== 'failed' &&
              !transcribeLoading &&
              !uploading && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  loading={resumingId === minutesId}
                  onClick={async () => {
                    setResumingId(minutesId)
                    try {
                      await resumePolling(minutesId)
                    } finally {
                      setResumingId(null)
                    }
                  }}
                >
                  進捗を再確認
                </Button>
              )}
            {status === 'completed' && transcript && !generatingMinutes && (
              <p className="text-xs text-muted-foreground">
                文字起こしは完了しています。上の「議事録を生成」から続けてください。
              </p>
            )}
          </div>
        )}
      </div>

      <MinutesList
        items={filteredItems}
        search={search}
        onSearchChange={setSearch}
        loading={listLoading}
        onDelete={handleDelete}
        onResumeProgress={async (id) => {
          setResumingId(id)
          try {
            await resumePolling(id)
          } finally {
            setResumingId(null)
          }
        }}
        resumingId={resumingId}
        deletingId={deletingId}
      />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => fetchList(1, search)}
      >
        一覧を更新
      </Button>
    </div>
  )
}
