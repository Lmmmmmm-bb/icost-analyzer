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

type TagSummaryTableProps = {
  rows: SummaryItem[]
  onTagSelect: (tag: string) => void
}

export function TagSummaryTable({ rows, onTagSelect }: TagSummaryTableProps) {
  const maxAmount = Math.max(...rows.map((item) => item.amount), 0)

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>标签</TableHead>
          <TableHead className="text-right">笔数</TableHead>
          <TableHead className="text-right">总支出</TableHead>
          <TableHead className="text-right">覆盖天数</TableHead>
          <TableHead className="text-right">日均</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((item) => {
          const fillPercent = maxAmount ? (item.amount / maxAmount) * 100 : 0

          return (
            <TableRow
              key={item.name}
              className="cursor-pointer"
              onClick={() => onTagSelect(item.name)}
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
                {item.days.size}
              </TableCell>
              <TableCell className="text-right font-mono text-[11px] tabular-nums">
                {formatMoney(item.amount / (item.days.size || 1))}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
