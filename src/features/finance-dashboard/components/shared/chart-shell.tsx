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
    <Card className="relative gap-0 bg-card/92 py-0 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_70px_color-mix(in_oklch,var(--foreground),transparent_94%)]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-foreground/40 via-transparent to-transparent" />
      <CardHeader className="border-b border-border/70 p-4">
        <CardTitle className="flex items-center gap-2">
          <span className="size-1.5 bg-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
        {action ? <CardAction>{action}</CardAction> : null}
      </CardHeader>
      <CardContent className="bg-[linear-gradient(180deg,color-mix(in_oklch,var(--muted),transparent_74%),transparent_36%)] p-4">
        {children}
      </CardContent>
    </Card>
  )
}
