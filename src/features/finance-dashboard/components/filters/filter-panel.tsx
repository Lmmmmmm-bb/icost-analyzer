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

import {
  ALL_RANGE,
  ALL_YEARS_OPTION,
  EMPTY_FILTERS,
  QUICK_RANGES,
  TRANSACTION_TYPES,
} from "../../model/constants"
import type { Dimensions, Filters } from "../../model/types"
import { ChipGroup } from "../shared/chip-group"
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
  const dateInputClassName = "h-7 w-[9rem] px-2 font-mono text-[11px]"

  return (
    <Card className="shadow-ledger-panel relative gap-0 bg-card/95 py-0 backdrop-blur-sm">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-foreground/35 via-transparent to-transparent" />
      <CardHeader className="border-b border-border/70 p-4">
        <CardTitle className="flex items-center gap-2">
          <span className="size-1.5 bg-primary" />
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
        <FilterRow label="时间" contentClassName="flex flex-col gap-3">
          <ChipGroup
            title="快捷时间"
            items={QUICK_RANGES}
            value={[filters.quickRange]}
            showTitle={false}
            onChange={(next) =>
              onFiltersChange((current) => ({
                ...current,
                quickRange: next.at(-1) ?? ALL_RANGE,
                year: "",
                startDate: "",
                endDate: "",
              }))
            }
          />
          <ChipGroup
            title="年份"
            items={[ALL_YEARS_OPTION, ...dimensions.years]}
            value={[filters.year || ALL_YEARS_OPTION]}
            onChange={(next) => {
              const selected = next.at(-1)
              onFiltersChange((current) => ({
                ...current,
                year: selected && selected !== ALL_YEARS_OPTION ? selected : "",
                quickRange: ALL_RANGE,
                startDate: "",
                endDate: "",
              }))
            }}
          />
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="font-mono text-[10px] tracking-[0.14em] uppercase">
                开始
              </span>
              <Input
                type="date"
                className={dateInputClassName}
                value={filters.startDate}
                onChange={(event) =>
                  onFiltersChange((current) => ({
                    ...current,
                    startDate: event.target.value,
                    quickRange: ALL_RANGE,
                    year: "",
                  }))
                }
              />
            </label>
            <span className="font-mono text-[10px] text-muted-foreground/50">
              →
            </span>
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="font-mono text-[10px] tracking-[0.14em] uppercase">
                结束
              </span>
              <Input
                type="date"
                className={dateInputClassName}
                value={filters.endDate}
                onChange={(event) =>
                  onFiltersChange((current) => ({
                    ...current,
                    endDate: event.target.value,
                    quickRange: ALL_RANGE,
                    year: "",
                  }))
                }
              />
            </label>
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
            limit={18}
          />
        </FilterRow>
      </CardContent>
    </Card>
  )
}
