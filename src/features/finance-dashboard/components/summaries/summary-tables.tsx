import type { SummaryItem, SummarySort, TagSort } from "../../model/types"
import { selectClassName } from "../../model/utils"
import { ChartShell } from "../shared/chart-shell"
import { CategorySummaryTable } from "./category-summary-table"
import { TagSummaryTable } from "./tag-summary-table"

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
      <ChartShell
        title="分类汇总表"
        description="点击行可筛选一级分类。"
        action={
          <select
            className={selectClassName()}
            value={summarySort}
            onChange={(event) =>
              onSummarySortChange(event.target.value as SummarySort)
            }
          >
            <option value="amount">按总支出</option>
            <option value="count">按笔数</option>
            <option value="avg">按笔均</option>
          </select>
        }
      >
        <CategorySummaryTable
          rows={categoryRows}
          expenseTotal={expenseTotal}
          onCategorySelect={onCategorySelect}
        />
      </ChartShell>
      <ChartShell
        title="标签汇总表"
        description="覆盖天数表示该标签下有支出记录的不同自然日数量。"
        action={
          <select
            className={selectClassName()}
            value={tagSort}
            onChange={(event) => onTagSortChange(event.target.value as TagSort)}
          >
            <option value="amount">按总支出</option>
            <option value="count">按笔数</option>
            <option value="days">按覆盖天数</option>
          </select>
        }
      >
        <TagSummaryTable rows={tagRows} onTagSelect={onTagSelect} />
      </ChartShell>
    </div>
  )
}
