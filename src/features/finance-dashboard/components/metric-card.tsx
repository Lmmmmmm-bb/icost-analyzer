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
    <Card className="gap-0 py-0">
      <CardHeader className="border-b border-border/70 p-4">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="font-heading text-2xl tracking-tight">
          {value}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 text-muted-foreground">{caption}</CardContent>
    </Card>
  )
}
