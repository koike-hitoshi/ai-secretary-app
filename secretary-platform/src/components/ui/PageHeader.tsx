type PageHeaderProps = {
  title: string
  description: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="border-b border-border px-xl py-lg">
      <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
      <p className="mt-sm text-base leading-relaxed text-muted-foreground">
        {description}
      </p>
    </header>
  )
}
