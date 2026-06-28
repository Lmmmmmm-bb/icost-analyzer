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
    <Card className="relative gap-0 bg-card/90 py-0 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_60px_color-mix(in_oklch,var(--foreground),transparent_94%)]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-foreground/35 via-transparent to-transparent" />
      <CardHeader className="border-b border-border/70 p-4">
        <CardDescription className="font-mono tracking-[0.16em] uppercase">
          {label}
        </CardDescription>
        <CardTitle className="font-heading text-2xl font-semibold tracking-tight tabular-nums">
          {value}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 text-muted-foreground">
        <span className="line-clamp-2">{caption}</span>
      </CardContent>
    </Card>
  )
}
