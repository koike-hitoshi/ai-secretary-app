'use client'

import { useState } from 'react'

import { TaskAlertBanner } from '@/components/tasks/TaskAlertBanner'
import { TaskFilter } from '@/components/tasks/TaskFilter'
import { TaskForm } from '@/components/tasks/TaskForm'
import { TaskList } from '@/components/tasks/TaskList'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { TaskProvider, useTaskContext } from '@/contexts/TaskContext'
import type { Task } from '@/types'

type TasksPageClientProps = {
  initialTasks: Task[]
  initialAlerts: Task[]
}

function TasksPageContent() {
  const { createTask, updateTask, error, clearError } = useTaskContext()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const openCreateModal = () => {
    setEditingTask(null)
    setModalOpen(true)
  }

  const openEditModal = (task: Task) => {
    setEditingTask(task)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingTask(null)
  }

  const handleSubmit = async (input: Parameters<typeof createTask>[0]) => {
    if (editingTask) {
      await updateTask(editingTask.id, input)
    } else {
      await createTask(input)
    }
    closeModal()
  }

  return (
    <div className="flex flex-col gap-lg px-xl py-lg">
      <div className="flex flex-wrap items-center justify-between gap-sm">
        <div>
          <p className="text-sm text-muted-foreground">
            優先度・期限でタスクを管理し、期限2日前にアラートを表示します。
          </p>
        </div>
        <Button onClick={openCreateModal}>タスクを追加</Button>
      </div>

      {error && (
        <Alert type="error" dismissible onDismiss={clearError}>
          {error}
        </Alert>
      )}

      <TaskAlertBanner />
      <TaskFilter />
      <TaskList onEdit={openEditModal} />

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingTask ? 'タスクを編集' : 'タスクを追加'}
        description={
          editingTask
            ? 'タスクの内容を更新します'
            : '新しいタスクの詳細を入力してください'
        }
      >
        <TaskForm
          key={editingTask?.id ?? 'new'}
          task={editingTask}
          onSubmit={handleSubmit}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  )
}

export function TasksPageClient({
  initialTasks,
  initialAlerts,
}: TasksPageClientProps) {
  return (
    <TaskProvider initialTasks={initialTasks} initialAlerts={initialAlerts}>
      <TasksPageContent />
    </TaskProvider>
  )
}
