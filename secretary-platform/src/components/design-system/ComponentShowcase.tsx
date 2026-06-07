'use client'

import { useState } from 'react'
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Modal,
  Select,
  Spinner,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from '@/components/ui'

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="card-elevated p-xl">
      <h2 className="text-xl">{title}</h2>
      <div className="mt-lg flex flex-col gap-lg">{children}</div>
    </section>
  )
}

const selectOptions = [
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' },
]

export function ComponentShowcase() {
  const [modalOpen, setModalOpen] = useState(false)
  const [alertVisible, setAlertVisible] = useState(true)
  const [priority, setPriority] = useState('medium')
  const [tags, setTags] = useState<string[]>(['tasks'])

  return (
    <div className="flex flex-col gap-xl bg-background p-xl">
      <Section title="Button">
        <div className="flex flex-wrap gap-md">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button loading>Loading</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button disabled>Disabled</Button>
        </div>
      </Section>

      <Section title="Input / Textarea">
        <div className="grid max-w-xl gap-lg">
          <Input label="メール" type="email" placeholder="name@example.com" />
          <Input
            label="パスワード"
            type="password"
            error="8文字以上で入力してください"
          />
          <Input type="search" placeholder="検索..." hint="キーワードで検索" />
          <Textarea
            label="メモ"
            autoResize
            showCount
            maxLength={200}
            placeholder="内容を入力..."
            hint="自動で高さが伸びます"
          />
        </div>
      </Section>

      <Section title="Select">
        <div className="grid max-w-md gap-lg">
          <Select
            label="優先度"
            options={selectOptions}
            value={priority}
            onChange={(v) => setPriority(v as string)}
            searchable
          />
          <Select
            label="タグ（複数選択）"
            options={[
              { value: 'tasks', label: 'タスク' },
              { value: 'minutes', label: '議事録' },
              { value: 'research', label: 'リサーチ' },
            ]}
            value={tags}
            onChange={(v) => setTags(v as string[])}
            multiple
            searchable
          />
        </div>
      </Section>

      <Section title="Card">
        <Card interactive elevated className="max-w-md">
          <CardHeader>
            <CardTitle>カードタイトル</CardTitle>
            <CardDescription>補足説明テキスト</CardDescription>
          </CardHeader>
          <CardBody>ホバーでシャドウが強調されます。</CardBody>
          <CardFooter>
            <Button size="sm">アクション</Button>
          </CardFooter>
        </Card>
      </Section>

      <Section title="Alert">
        {alertVisible && (
          <Alert
            type="info"
            title="お知らせ"
            dismissible
            onDismiss={() => setAlertVisible(false)}
          >
            デザインシステムに準拠した共通コンポーネントです。
          </Alert>
        )}
        <Alert type="success">保存が完了しました。</Alert>
        <Alert type="warning">期限が近づいています。</Alert>
        <Alert type="error">処理に失敗しました。再度お試しください。</Alert>
      </Section>

      <Section title="Badge / Spinner">
        <div className="flex flex-wrap items-center gap-md">
          <Badge>Default</Badge>
          <Badge variant="primary">Primary</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="destructive">Error</Badge>
          <Badge dismissible onDismiss={() => {}}>
            削除可能
          </Badge>
          <Spinner />
          <Spinner size="lg" color="foreground" />
        </div>
      </Section>

      <Section title="Tabs">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">概要</TabsTrigger>
            <TabsTrigger value="settings">設定</TabsTrigger>
            <TabsTrigger value="history">履歴</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <p className="text-body">概要タブのコンテンツです。</p>
          </TabsContent>
          <TabsContent value="settings">
            <p className="text-body">設定タブのコンテンツです。</p>
          </TabsContent>
          <TabsContent value="history">
            <p className="text-body">履歴タブのコンテンツです。</p>
          </TabsContent>
        </Tabs>
      </Section>

      <Section title="Modal">
        <Button onClick={() => setModalOpen(true)}>モーダルを開く</Button>
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="確認"
          description="この操作を実行しますか？"
          size="md"
        >
          <p className="text-body text-muted-foreground">
            Esc キーまたはオーバーレイクリックで閉じられます。
          </p>
          <div className="mt-lg flex justify-end gap-sm">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={() => setModalOpen(false)}>確定</Button>
          </div>
        </Modal>
      </Section>
    </div>
  )
}
