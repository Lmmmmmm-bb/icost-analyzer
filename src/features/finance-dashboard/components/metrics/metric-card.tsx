import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type MetricCardProps = {
  label: string
  value: string
  caption: string
}

export function MetricCard({ label, value, caption }: MetricCardProps) {
  return (
    <Card className="group/metric relative gap-0 overflow-hidden bg-card/90 py-0 transition-all duration-300 hover:-translate-y-0.5 hover:bg-card/95 hover:shadow-[0_18px_60px_color-mix(in_oklch,var(--foreground),transparent_94%)]">
      <div
        aria-hidden="true"
        className="absolute -right-4 -bottom-4 size-16 border border-border/60 bg-background/30 transition-transform duration-300 group-hover/metric:translate-x-1 group-hover/metric:-translate-y-1"
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-foreground/35 via-transparent to-transparent" />
      <CardHeader className="relative border-b border-border/70 p-4">
        <CardDescription className="font-mono tracking-[0.16em] uppercase">
          {label}
        </CardDescription>
        <CardTitle className="font-heading text-2xl leading-tight font-semibold tracking-tight tabular-nums">
          {value}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative p-4 text-sm text-muted-foreground">
        <span className="line-clamp-2">{caption}</span>
      </CardContent>
    </Card>
  )
}
