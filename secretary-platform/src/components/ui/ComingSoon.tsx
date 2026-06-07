type ComingSoonProps = {
  features: string[]
  phaseLabel?: string
}

export function ComingSoon({
  features,
  phaseLabel = '開発予定',
}: ComingSoonProps) {
  return (
    <div className="mx-xl my-xl max-w-2xl rounded-2xl border border-dashed border-border bg-background p-xl">
      <p className="text-caption font-medium">{phaseLabel}</p>
      <ul className="mt-md space-y-sm">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-sm text-body">
            <span className="mt-sm h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  )
}
