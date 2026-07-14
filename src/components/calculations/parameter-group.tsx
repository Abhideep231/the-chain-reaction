export function ParameterGroup({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-3 rounded-lg border bg-card p-3">
      <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {title}
      </h3>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  )
}
