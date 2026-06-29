import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type { SummaryItem } from "../../model/analytics-types"
import { DashboardPanel } from "../shared/dashboard-panel"
import { CategorySummaryTable } from "./category-summary-table"
import { TagSummaryTable } from "./tag-summary-table"
import type { SummarySort, TagSort } from "./types"

const SUMMARY_SORT_OPTIONS = [
  { value: "amount", label: "按总支出" },
  { value: "count", label: "按笔数" },
  { value: "avg", label: "按笔均" },
] satisfies Array<{ value: SummarySort; label: string }>

const TAG_SORT_OPTIONS = [
  { value: "amount", label: "按总支出" },
  { value: "count", label: "按笔数" },
  { value: "days", label: "按覆盖天数" },
] satisfies Array<{ value: TagSort; label: string }>

type SummaryTablesProps = {
  categoryRows: SummaryItem[]
  tagRows: SummaryItem[]
  expenseTotal: number
  summarySort: SummarySort
  tagSort: TagSort
  onSummarySortChange: (sort: SummarySort) => void
  onTagSortChange: (sort: TagSort) => void
  onCategorySelect: (category: string) => void
  onTagSelect: (tag: string) => void
}

export function SummaryTables({
  categoryRows,
  tagRows,
  expenseTotal,
  summarySort,
  tagSort,
  onSummarySortChange,
  onTagSortChange,
  onCategorySelect,
  onTagSelect,
}: SummaryTablesProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <DashboardPanel
        title="分类汇总表"
        description="点击行可筛选一级分类。"
        contentClassName="p-0"
        action={
          <Select
            items={SUMMARY_SORT_OPTIONS}
            value={summarySort}
            onValueChange={(value) => onSummarySortChange(value as SummarySort)}
          >
            <SelectTrigger size="sm" className="w-[7.5rem]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectGroup>
                {SUMMARY_SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        }
      >
        <CategorySummaryTable
          rows={categoryRows}
          expenseTotal={expenseTotal}
          onCategorySelect={onCategorySelect}
        />
      </DashboardPanel>
      <DashboardPanel
        title="标签汇总表"
        description="覆盖天数表示该标签下有支出记录的不同自然日数量。"
        contentClassName="p-0"
        action={
          <Select
            items={TAG_SORT_OPTIONS}
            value={tagSort}
            onValueChange={(value) => onTagSortChange(value as TagSort)}
          >
            <SelectTrigger size="sm" className="w-[8rem]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectGroup>
                {TAG_SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        }
      >
        <TagSummaryTable rows={tagRows} onTagSelect={onTagSelect} />
      </DashboardPanel>
    </div>
  )
}
