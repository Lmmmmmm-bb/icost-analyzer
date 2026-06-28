import type { ReactNode } from "react"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type ChartShellProps = {
  title: string
  description: string
  action?: ReactNode
  children: ReactNode
}

export function ChartShell({
  title,
  description,
  action,
  children,
}: ChartShellProps) {
  return (
    <Card className="group/chart relative gap-0 overflow-hidden bg-card/92 py-0 transition-all duration-300 hover:-translate-y-0.5 hover:bg-card/95 hover:shadow-ledger-chart-hover">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-foreground/40 via-transparent to-transparent" />
      <CardHeader className="relative border-b border-border/70 p-4">
        <CardTitle className="flex items-center gap-2">
          <span className="shadow-ledger-glow-primary-soft size-1.5 bg-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
        {action ? <CardAction>{action}</CardAction> : null}
      </CardHeader>
      <CardContent className="relative bg-[linear-gradient(180deg,color-mix(in_oklch,var(--muted),transparent_74%),transparent_36%)] p-4">
        {children}
      </CardContent>
    </Card>
  )
}
