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
  return (
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
        {rows.map((item) => (
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
  )
}
