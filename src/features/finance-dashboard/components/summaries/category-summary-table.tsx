import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import type { SummaryItem } from "../../model/analytics-types"
import { formatMoney } from "../../model/money"

type CategorySummaryTableProps = {
  rows: SummaryItem[]
  expenseTotal: number
  onCategorySelect: (category: string) => void
}

export function CategorySummaryTable({
  rows,
  expenseTotal,
  onCategorySelect,
}: CategorySummaryTableProps) {
  const maxAmount = Math.max(...rows.map((item) => item.amount), 0)

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>分类</TableHead>
          <TableHead className="text-right">笔数</TableHead>
          <TableHead className="text-right">总支出</TableHead>
          <TableHead className="text-right">占比</TableHead>
          <TableHead className="text-right">笔均</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((item) => {
          const fillPercent = maxAmount ? (item.amount / maxAmount) * 100 : 0
          const sharePercent = expenseTotal
            ? (item.amount / expenseTotal) * 100
            : 0

          return (
            <TableRow
              key={item.name}
              className="cursor-pointer"
              onClick={() => onCategorySelect(item.name)}
            >
              <TableCell>{item.name}</TableCell>
              <TableCell className="text-right font-mono text-[11px] tabular-nums">
                {item.count}
              </TableCell>
              <TableCell className="relative min-w-32 text-right font-mono text-[11px] font-medium tabular-nums">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  style={{
                    backgroundImage: `linear-gradient(to right, color-mix(in oklch, var(--primary), transparent 91%) ${fillPercent}%, transparent 0)`,
                  }}
                />
                <span className="relative z-10">
                  {formatMoney(item.amount)}
                </span>
              </TableCell>
              <TableCell className="text-right font-mono text-[11px] tabular-nums">
                {sharePercent.toFixed(1)}%
              </TableCell>
              <TableCell className="text-right font-mono text-[11px] tabular-nums">
                {formatMoney(item.amount / item.count)}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
