import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import type { SummaryItem, SummarySort, TagSort } from "../types"
import { formatMoney, selectClassName } from "../utils"
import { ChartShell } from "./chart-shell"

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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>分类</TableHead>
              <TableHead>笔数</TableHead>
              <TableHead>总支出</TableHead>
              <TableHead>占比</TableHead>
              <TableHead>笔均</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categoryRows.map((item) => (
              <TableRow
                key={item.name}
                className="cursor-pointer"
                onClick={() => onCategorySelect(item.name)}
              >
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.count}</TableCell>
                <TableCell>{formatMoney(item.amount)}</TableCell>
                <TableCell>
                  {((item.amount / expenseTotal) * 100).toFixed(1)}%
                </TableCell>
                <TableCell>{formatMoney(item.amount / item.count)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>标签</TableHead>
              <TableHead>笔数</TableHead>
              <TableHead>总支出</TableHead>
              <TableHead>覆盖天数</TableHead>
              <TableHead>日均</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tagRows.map((item) => (
              <TableRow
                key={item.name}
                className="cursor-pointer"
                onClick={() => onTagSelect(item.name)}
              >
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.count}</TableCell>
                <TableCell>{formatMoney(item.amount)}</TableCell>
                <TableCell>{item.days.size}</TableCell>
                <TableCell>
                  {formatMoney(item.amount / (item.days.size || 1))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ChartShell>
    </div>
  )
}
