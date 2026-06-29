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
import { ChipGroup } from "./chip-group"
import { DatePickerField } from "./date-picker-field"
import { QUICK_RANGES, TRANSACTION_TYPES } from "./filter-options"
import { FilterRow } from "./filter-row"

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
  return (
    <Card className="relative gap-0 bg-card/95 py-0 shadow-ledger-panel backdrop-blur-sm">
      <CardHeader className="border-b border-border/70 p-4">
        <CardTitle className="flex items-center gap-2">
          <span className="size-1.5 bg-primary shadow-ledger-glow-primary-soft" />
          筛选器
        </CardTitle>
        <CardDescription>
          时间、类型、币种、分类、标签与关键词会联动刷新全部分析模块。
        </CardDescription>
        <CardAction>
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
        </CardAction>
      </CardHeader>
      <CardContent className="px-0">
        <FilterRow label="时间" contentClassName="flex flex-col gap-3" inline>
          <ChipGroup
            title="时间"
            items={[...QUICK_RANGES, ...dimensions.years]}
            value={[filters.year || filters.quickRange]}
            showTitle={false}
            separatorBefore={dimensions.years[0]}
            describe={(item) => describeTimeRange(item)}
            onChange={(next) => {
              const selected = next.at(-1) ?? ALL_RANGE
              const isYear = dimensions.years.includes(selected)

              onFiltersChange((current) => ({
                ...current,
                quickRange: isYear ? ALL_RANGE : selected,
                year: isYear ? selected : "",
                startDate: "",
                endDate: "",
              }))
            }}
          />
          <div className="flex flex-wrap items-center gap-2">
            <DatePickerField
              label="开始"
              value={filters.startDate}
              onChange={(startDate) =>
                onFiltersChange((current) => ({
                  ...current,
                  startDate,
                  quickRange: ALL_RANGE,
                  year: "",
                }))
              }
            />
            <span className="font-mono text-[10px] text-muted-foreground/50">
              →
            </span>
            <DatePickerField
              label="结束"
              value={filters.endDate}
              onChange={(endDate) =>
                onFiltersChange((current) => ({
                  ...current,
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
            placeholder="搜索备注、分类、标签、地点、币种……"
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
            showTitle={false}
            onChange={(tags) =>
              onFiltersChange((current) => ({ ...current, tags }))
            }
          />
        </FilterRow>
      </CardContent>
    </Card>
  )
}
