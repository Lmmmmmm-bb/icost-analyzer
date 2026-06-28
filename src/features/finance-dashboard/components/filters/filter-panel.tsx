import * as React from "react"
import { RiCalendarLine, RiCloseLine } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { ALL_RANGE, EMPTY_FILTERS } from "../../model/constants"
import type { Dimensions, Filters } from "../../model/types"
import { ChipGroup } from "./chip-group"
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
        <FilterRow label="时间" contentClassName="flex flex-col gap-3" inline>
          <ChipGroup
            title="时间"
            items={[...QUICK_RANGES, ...dimensions.years]}
            value={[filters.year || filters.quickRange]}
            showTitle={false}
            separatorBefore={dimensions.years[0]}
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

type DatePickerFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
}

function DatePickerField({ label, value, onChange }: DatePickerFieldProps) {
  const [open, setOpen] = React.useState(false)
  const selectedDate = parseDateValue(value)

  return (
    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className="font-mono text-[10px] tracking-[0.14em] uppercase">
        {label}
      </span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-[9.5rem] justify-start font-mono text-[11px] font-normal"
            />
          }
        >
          <RiCalendarLine data-icon="inline-start" />
          {value || "选择日期"}
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (!date) return
              onChange(formatDateValue(date))
              setOpen(false)
            }}
          />
          {value ? (
            <div className="border-t border-border p-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  onChange("")
                  setOpen(false)
                }}
              >
                <RiCloseLine data-icon="inline-start" />
                清除日期
              </Button>
            </div>
          ) : null}
        </PopoverContent>
      </Popover>
    </label>
  )
}

function parseDateValue(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)

  if (!match) return undefined

  const [, year, month, day] = match
  const date = new Date(Number(year), Number(month) - 1, Number(day))

  return formatDateValue(date) === value ? date : undefined
}

function formatDateValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}
