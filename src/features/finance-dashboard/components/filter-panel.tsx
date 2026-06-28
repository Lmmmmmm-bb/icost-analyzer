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

import { EMPTY_FILTERS, QUICK_RANGES, TRANSACTION_TYPES } from "../constants"
import type { Dimensions, Filters } from "../types"
import { ChipGroup } from "./chip-group"

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
  const rowClassName =
    "grid border-b border-border/70 bg-background/35 last:border-b-0 md:grid-cols-[112px_1fr]"
  const labelClassName =
    "border-b border-border/70 px-4 py-3 font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase md:border-r md:border-b-0 md:border-border/70"
  const contentClassName = "px-4 py-3"
  const dateInputClassName = "h-7 w-[9rem] px-2 font-mono text-[11px]"

  return (
    <Card className="gap-0 bg-card/95 py-0 backdrop-blur-sm">
      <CardHeader className="border-b border-border/70 p-4">
        <CardTitle>筛选器</CardTitle>
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
        <section className={rowClassName}>
          <div className={labelClassName}>时间</div>
          <div className={`${contentClassName} flex flex-col gap-3`}>
            <ChipGroup
              title="快捷时间"
              items={QUICK_RANGES}
              value={[filters.quickRange]}
              showTitle={false}
              onChange={(next) =>
                onFiltersChange((current) => ({
                  ...current,
                  quickRange: next.at(-1) ?? "全部",
                  year: "",
                  startDate: "",
                  endDate: "",
                }))
              }
            />
            <ChipGroup
              title="年份"
              items={["全部年份", ...dimensions.years]}
              value={[filters.year || "全部年份"]}
              onChange={(next) => {
                const selected = next.at(-1)
                onFiltersChange((current) => ({
                  ...current,
                  year:
                    selected && selected !== "全部年份" ? selected : "",
                  quickRange: "全部",
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
                      quickRange: "全部",
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
                      quickRange: "全部",
                      year: "",
                    }))
                  }
                />
              </label>
            </div>
          </div>
        </section>

        <section className={rowClassName}>
          <div className={labelClassName}>关键词</div>
          <div className={contentClassName}>
            <Input
              placeholder="搜索备注、分类、标签、地点、币种……"
              value={filters.keyword}
              onChange={(event) =>
                onFiltersChange((current) => ({
                  ...current,
                  keyword: event.target.value,
                }))
              }
            />
          </div>
        </section>

        <section className={rowClassName}>
          <div className={labelClassName}>类型</div>
          <div className={contentClassName}>
            <ChipGroup
              title="类型"
              items={TRANSACTION_TYPES}
              value={filters.types}
              showTitle={false}
              onChange={(types) =>
                onFiltersChange((current) => ({ ...current, types }))
              }
            />
          </div>
        </section>

        <section className={rowClassName}>
          <div className={labelClassName}>币种</div>
          <div className={contentClassName}>
            <ChipGroup
              title="币种"
              items={dimensions.currencies}
              value={filters.currencies}
              showTitle={false}
              onChange={(currencies) =>
                onFiltersChange((current) => ({ ...current, currencies }))
              }
            />
          </div>
        </section>

        <section className={rowClassName}>
          <div className={labelClassName}>分类</div>
          <div className={contentClassName}>
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
          </div>
        </section>

        <section className={rowClassName}>
          <div className={labelClassName}>标签</div>
          <div className={contentClassName}>
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
          </div>
        </section>
      </CardContent>
    </Card>
  )
}
