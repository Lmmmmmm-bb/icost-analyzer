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
    <Card className="gap-0 py-0">
      <CardHeader className="border-b border-border/70 p-4">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        {action ? <CardAction>{action}</CardAction> : null}
      </CardHeader>
      <CardContent className="p-4">{children}</CardContent>
    </Card>
  )
}
