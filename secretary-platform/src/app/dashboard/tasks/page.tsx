import { redirect } from 'next/navigation'

import { TasksPageClient } from '@/components/tasks/TasksPageClient'
import { PageHeader } from '@/components/ui/PageHeader'
import { listTasks, listUpcomingTasks } from '@/lib/supabase/tasks'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/users'

export default async function TasksPage() {
  const supabase = await createClient()
  const user = await getCurrentUser(supabase)

  if (!user) {
    redirect('/login?redirect=/dashboard/tasks')
  }

  const [tasks, alerts] = await Promise.all([
    listTasks(supabase, user.id),
    listUpcomingTasks(supabase, user.id, 2),
  ])

  return (
    <>
      <PageHeader
        title="タスク管理"
        description="Todoリスト形式でタスクを管理し、期限2日前にアラート通知を表示します。"
      />
      <TasksPageClient initialTasks={tasks} initialAlerts={alerts} />
    </>
  )
}
