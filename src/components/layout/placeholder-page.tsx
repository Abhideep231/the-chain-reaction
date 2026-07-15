interface PlaceholderPageProps {
  title: string
  description?: string
}

export function PlaceholderPage({
  title,
  description = "This section has not been built yet.",
}: PlaceholderPageProps) {
  return (
    <div className="flex flex-1 flex-col items-start gap-2">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
