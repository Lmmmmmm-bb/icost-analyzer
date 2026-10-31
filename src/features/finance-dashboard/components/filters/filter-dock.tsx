import type { ReactNode } from "react"
import { RiCloseLine, RiFilter3Line, RiRefreshLine } from "@remixicon/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import type { FilterActions } from "../../model/dashboard-state"
import type { Filters } from "../../model/types"
import { LedgerEdgeNotch } from "../shared/ledger-accents"
import {
  getActiveFilterSummaries,
  type ActiveFilterSummary,
} from "./active-filter-summary"

const VISIBLE_FILTER_LIMIT = 3
const numberFormatter = new Intl.NumberFormat("zh-CN")

type FilterDockProps = {
  filters: Filters
  asOf: string
  filteredCount: number
  totalCount: number
  actions: Pick<FilterActions, "clearFilter" | "resetFilters">
  children: ReactNode
}

export function FilterDock({
  filters,
  asOf,
  filteredCount,
  totalCount,
  actions,
  children,
}: FilterDockProps) {
  const activeFilters = getActiveFilterSummaries(filters, new Date(asOf))
  const activeFilterCount = activeFilters.reduce(
    (total, filter) => total + filter.count,
    0
  )
  const visibleFilters = activeFilters.slice(0, VISIBLE_FILTER_LIMIT)
  const hiddenFilters = activeFilters.slice(VISIBLE_FILTER_LIMIT)

  return (
    <div
      data-slot="filter-dock"
      className="sticky top-3 z-40 transform-none! animate-none!"
    >
      <div className="relative overflow-hidden border border-border/80 bg-card/88 shadow-ledger-panel backdrop-blur-xl">
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-foreground/40 via-transparent to-transparent" />
        <div className="grid gap-3 p-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex shrink-0 items-center gap-2">
              <span className="size-1.5 bg-primary shadow-ledger-glow-primary-soft" />
              <span className="font-heading text-sm font-medium">当前筛选</span>
              <Badge variant="secondary" className="font-mono">
                {formatResultCount(filteredCount, totalCount)}
              </Badge>
            </div>

            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              {activeFilterCount ? (
                <>
                  {visibleFilters.map((filter) => (
                    <VisibleFilterChip
                      key={filter.key}
                      filter={filter}
                      onClear={() => actions.clearFilter(filter.key)}
                    />
                  ))}
                  {hiddenFilters.length ? (
                    <HiddenFilterBadge filters={hiddenFilters} />
                  ) : null}
                </>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-background/65 font-mono text-muted-foreground"
                >
                  全部数据
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger
                render={<Button type="button" variant="default" size="sm" />}
              >
                <RiFilter3Line data-icon="inline-start" />
                调整筛选
              </DialogTrigger>
              <DialogContent className="flex max-h-[min(88svh,46rem)] w-[min(44rem,calc(100vw-1.5rem))] max-w-none flex-col gap-0 overflow-hidden border-border/80 bg-background p-0 shadow-ledger-popover sm:max-w-none lg:w-[min(60rem,calc(100vw-4rem))]">
                <DialogHeader className="sr-only">
                  <DialogTitle>调整筛选</DialogTitle>
                  <DialogDescription>
                    修改当前账单分析的筛选条件。
                  </DialogDescription>
                </DialogHeader>
                <div className="min-h-0">{children}</div>
              </DialogContent>
            </Dialog>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!activeFilterCount}
              onClick={actions.resetFilters}
            >
              <RiRefreshLine data-icon="inline-start" />
              清空
            </Button>
          </div>
        </div>
        <LedgerEdgeNotch className="right-0 bottom-0 opacity-45" />
      </div>
    </div>
  )
}

function VisibleFilterChip({
  filter,
  onClear,
}: {
  filter: ActiveFilterSummary
  onClear: () => void
}) {
  const ariaDetail = filter.tooltip
    ? `${filter.detail}，${filter.tooltip}`
    : filter.detail
  const chip = (
    <Button
      type="button"
      variant="outline"
      size="xs"
      className="max-w-full min-w-0 justify-start bg-background/65 font-mono shadow-none sm:max-w-56"
      aria-label={`${filter.label}：${ariaDetail}，清除此筛选`}
      onClick={onClear}
    >
      <span className="min-w-0 truncate">
        {filter.label}：{filter.detail}
      </span>
      <RiCloseLine data-icon="inline-end" />
    </Button>
  )

  if (!filter.tooltip) return chip

  return (
    <Tooltip>
      <TooltipTrigger render={chip} />
      <TooltipContent side="bottom" align="start" className="font-mono">
        {filter.tooltip}
      </TooltipContent>
    </Tooltip>
  )
}

function HiddenFilterBadge({ filters }: { filters: ActiveFilterSummary[] }) {
  const trigger = (
    <Badge
      variant="outline"
      tabIndex={0}
      className="bg-background/65 font-mono text-muted-foreground"
    >
      +{filters.length} 组
    </Badge>
  )

  return (
    <Tooltip>
      <TooltipTrigger render={trigger} />
      <TooltipContent
        side="bottom"
        align="start"
        className="flex max-w-xs flex-col items-start gap-1.5 text-left"
      >
        {filters.map((filter) => (
          <span key={filter.key}>
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

function formatResultCount(filteredCount: number, totalCount: number) {
  const filtered = numberFormatter.format(filteredCount)

  if (filteredCount === totalCount) return `${filtered} 条交易`

  return `${filtered} / ${numberFormatter.format(totalCount)} 条交易`
}
