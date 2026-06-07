import { PageHeader } from '@/components/ui/PageHeader'
import { ComponentShowcase } from '@/components/design-system/ComponentShowcase'
import { DesignSystemShowcase } from '@/components/design-system/DesignSystemShowcase'

export default function DesignSystemPage() {
  return (
    <>
      <PageHeader
        title="デザインシステム"
        description="Apple HIG 準拠のダークテーマ — トークン・タイポグラフィ・共通UIコンポーネント"
      />
      <ComponentShowcase />
      <DesignSystemShowcase />
    </>
  )
}
