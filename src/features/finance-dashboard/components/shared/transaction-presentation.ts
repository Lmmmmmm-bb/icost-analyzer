import type { ComponentProps } from "react"
import type { Badge } from "@/components/ui/badge"

import type { TransactionDirection } from "../../model/transaction-rules"

const DIRECTION_VARIANTS = {
  expense: "destructive",
  income: "positive",
  other: "secondary",
} satisfies Record<
  TransactionDirection,
  ComponentProps<typeof Badge>["variant"]
>

export function getDirectionBadgeVariant(direction: TransactionDirection) {
  return DIRECTION_VARIANTS[direction]
}
