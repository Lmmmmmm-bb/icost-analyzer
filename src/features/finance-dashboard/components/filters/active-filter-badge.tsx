import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import type { ActiveFilterSummary } from "./active-filter-summary"

type ActiveFilterBadgeProps = {
  count: number
  filters: ActiveFilterSummary[]
}

export function ActiveFilterBadge({ count, filters }: ActiveFilterBadgeProps) {
  const trigger = (
    <Badge
      variant="outline"
      tabIndex={0}
      className="cursor-help bg-background/65 font-mono tracking-[0.08em] text-muted-foreground"
    >
      已启用 {count} 项
    </Badge>
  )

  return (
    <Tooltip>
      <TooltipTrigger render={trigger} />
      <TooltipContent
        side="top"
        align="end"
        className="flex max-w-xs flex-col items-start gap-1.5 text-left"
      >
        {filters.map((filter) => (
          <span key={filter.label}>
            <span className="text-background/70">{filter.label}：</span>
            {filter.detail}
            {filter.tooltip ? (
              <span className="block text-background/70">{filter.tooltip}</span>
            ) : null}
          </span>
        ))}
      </TooltipContent>
    </Tooltip>
  )
}
