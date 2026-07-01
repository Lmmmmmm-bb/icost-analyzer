import type { ReactNode } from "react"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

import { LedgerEdgeNotch, LedgerTitleTicks } from "./ledger-accents"

type DashboardPanelProps = {
  title: string
  description: string
  action?: ReactNode
  contentClassName?: string
  /**
   * Lift the whole card on hover. Use for read-only display panels
   * (charts, summaries). Set to false for cards that contain editable
   * controls, where lifting the container would fight with input focus.
   */
  interactive?: boolean
  children: ReactNode
}

export function DashboardPanel({
  title,
  description,
  action,
  contentClassName,
  interactive = true,
  children,
}: DashboardPanelProps) {
  return (
    <Card
      className={cn(
        "group/chart relative gap-0 overflow-hidden bg-card/92 py-0 transition-all duration-300",
        interactive &&
          "hover:-translate-y-0.5 hover:bg-card/95 hover:shadow-ledger-chart-hover motion-reduce:hover:translate-y-0"
      )}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-foreground/40 via-transparent to-transparent" />
      <LedgerEdgeNotch className="right-0 bottom-0 opacity-45 group-hover/card:opacity-75" />
      <CardHeader className="relative border-b border-border/70 p-4">
        <CardTitle className="flex items-center gap-2">
          <span className="size-1.5 bg-primary shadow-ledger-glow-primary-soft" />
          {title}
          <LedgerTitleTicks />
        </CardTitle>
        <CardDescription>{description}</CardDescription>
        {action ? <CardAction>{action}</CardAction> : null}
      </CardHeader>
      <CardContent
        className={cn(
          "relative bg-[linear-gradient(180deg,color-mix(in_oklch,var(--muted),transparent_74%),transparent_36%)] p-4",
          contentClassName
        )}
      >
        {children}
      </CardContent>
    </Card>
  )
}
