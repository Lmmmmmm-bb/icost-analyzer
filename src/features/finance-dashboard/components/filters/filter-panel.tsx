import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

import { ALL_RANGE, EMPTY_FILTERS } from "../../model/constants"
import { describeTimeRange } from "../../model/date"
import type { Dimensions, Filters } from "../../model/types"
import { ActiveFilterBadge } from "./active-filter-badge"
import { getActiveFilterSummaries } from "./active-filter-summary"
import { ChipGroup } from "./chip-group"
import { DateRangePickerField } from "./date-picker-field"
import { QUICK_RANGES, TRANSACTION_TYPES } from "./filter-options"
import { FilterRow } from "./filter-row"
import { LedgerEdgeNotch, LedgerTitleTicks } from "../shared/ledger-accents"

type FilterPanelProps = {
  filters: Filters
  dimensions: Dimensions
  onFiltersChange: (filters: Filters | ((current: Filters) => Filters)) => void
  onResetDrill: () => void
}

export function FilterPanel({
  filters,
  dimensions,
  onFiltersChange,
  onResetDrill,
}: FilterPanelProps) {
  const activeFilters = getActiveFilterSummaries(filters)
  const activeFilterCount = activeFilters.reduce(
    (total, filter) => total + filter.count,
    0
  )

  return (
    <Card className="relative gap-0 bg-card/95 py-0 shadow-ledger-panel backdrop-blur-sm">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-foreground/40 via-transparent to-transparent" />
      <CardHeader className="border-b border-border/70 p-4">
        <CardTitle className="flex items-center gap-2">
          <span className="size-1.5 bg-primary shadow-ledger-glow-primary-soft" />
          筛选
          <LedgerTitleTicks />
        </CardTitle>
        <CardDescription>
          调整时间、类型、币种、账本、账户、分类、标签或关键词后，指标、图表和明细会同步刷新。
        </CardDescription>
        <CardAction>
          <div className="flex items-center gap-2">
            {activeFilterCount ? (
              <ActiveFilterBadge
                count={activeFilterCount}
                filters={activeFilters}
              />
            ) : null}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onFiltersChange(EMPTY_FILTERS)
                onResetDrill()
              }}
            >
              重置筛选
            </Button>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="relative px-0">
        <FilterRow label="时间" contentClassName="flex flex-col gap-3" inline>
          <div className="grid gap-2.5">
            <ChipGroup
              title="快捷时间"
              items={QUICK_RANGES}
              value={filters.year ? [] : [filters.quickRange]}
              showTitle={false}
              describe={(item) => describeTimeRange(item)}
              listClassName="grid grid-cols-2 gap-1.5 min-[420px]:flex min-[420px]:flex-wrap"
              chipClassName="w-full justify-center min-[420px]:w-auto"
              onChange={(next) => {
                const selected = next.at(-1) ?? ALL_RANGE

                onFiltersChange((current) => ({
                  ...current,
                  quickRange: selected,
                  year: "",
                  startDate: "",
                  endDate: "",
                }))
              }}
            />
            {dimensions.years.length ? (
              <div className="flex w-full items-center gap-1.5">
                <div className="shrink-0">
                  <span className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
                    年份
                  </span>
                </div>
                <ChipGroup
                  title="年份"
                  items={dimensions.years}
                  value={filters.year ? [filters.year] : []}
                  showTitle={false}
                  className="min-w-0 flex-1"
                  listClassName="grid grid-cols-[repeat(auto-fit,minmax(4.75rem,1fr))] gap-1.5 sm:flex sm:flex-wrap"
                  chipClassName="justify-center sm:w-auto"
                  onChange={(next) => {
                    const selected = next.at(-1) ?? ""

                    onFiltersChange((current) => ({
                      ...current,
                      quickRange: selected ? ALL_RANGE : current.quickRange,
                      year: selected,
                      startDate: "",
                      endDate: "",
                    }))
                  }}
                />
              </div>
            ) : null}
          </div>
          <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
            <DateRangePickerField
              startDate={filters.startDate}
              endDate={filters.endDate}
              onChange={({ startDate, endDate }) =>
                onFiltersChange((current) => ({
                  ...current,
                  startDate,
                  endDate,
                  quickRange: ALL_RANGE,
                  year: "",
                }))
              }
            />
          </div>
        </FilterRow>

        <FilterRow label="关键词">
          <Input
            placeholder="搜索备注、分类、账本、账户、标签、地点、币种……"
            className="bg-background/70"
            value={filters.keyword}
            onChange={(event) =>
              onFiltersChange((current) => ({
                ...current,
                keyword: event.target.value,
              }))
            }
          />
        </FilterRow>

        <FilterRow label="类型">
          <ChipGroup
            title="类型"
            items={TRANSACTION_TYPES}
            value={filters.types}
            showTitle={false}
            onChange={(types) =>
              onFiltersChange((current) => ({ ...current, types }))
            }
          />
        </FilterRow>

        <FilterRow label="币种">
          <ChipGroup
            title="币种"
            items={dimensions.currencies}
            value={filters.currencies}
            showTitle={false}
            onChange={(currencies) =>
              onFiltersChange((current) => ({ ...current, currencies }))
            }
          />
        </FilterRow>

        {dimensions.books.length ? (
          <FilterRow label="账本">
            <ChipGroup
              title="账本"
              items={dimensions.books}
              value={filters.books}
              showTitle={false}
              onChange={(books) =>
                onFiltersChange((current) => ({ ...current, books }))
              }
              limit={18}
            />
          </FilterRow>
        ) : null}

        {dimensions.accounts.length ? (
          <FilterRow label="账户">
            <ChipGroup
              title="账户"
              items={dimensions.accounts}
              value={filters.accounts}
              showTitle={false}
              onChange={(accounts) =>
                onFiltersChange((current) => ({ ...current, accounts }))
              }
              limit={24}
            />
          </FilterRow>
        ) : null}

        <FilterRow label="分类">
          <ChipGroup
            title="一级分类"
            items={dimensions.categories}
            value={filters.categories}
            showTitle={false}
            onChange={(categories) =>
              onFiltersChange((current) => ({ ...current, categories }))
            }
            limit={18}
          />
        </FilterRow>

        <FilterRow label="标签">
          <ChipGroup
            title="标签"
            items={dimensions.tags}
            value={filters.tags}
            excludedValue={filters.excludedTags}
            showTitle={false}
            onChange={(tags) => {
              onFiltersChange((current) => ({
                ...current,
                tags,
                excludedTags: current.excludedTags.filter(
                  (tag) => !tags.includes(tag)
                ),
              }))
            }}
            onExcludedChange={(excludedTags) => {
              onFiltersChange((current) => ({
                ...current,
                tags: current.tags.filter((tag) => !excludedTags.includes(tag)),
                excludedTags,
              }))
            }}
          />
        </FilterRow>
      </CardContent>
      <LedgerEdgeNotch className="right-0 bottom-0 opacity-45 group-hover/card:opacity-75" />
    </Card>
  )
}
