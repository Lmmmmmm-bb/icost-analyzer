import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import type { SummaryItem } from "../../model/types"
import { formatMoney } from "../../model/utils"

type TagSummaryTableProps = {
  rows: SummaryItem[]
  onTagSelect: (tag: string) => void
}

export function TagSummaryTable({ rows, onTagSelect }: TagSummaryTableProps) {
  return (
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
        {rows.map((item) => (
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
  )
}
