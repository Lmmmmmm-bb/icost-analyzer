import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import type { RateMap, Transaction } from "../../model/types"
import { TransactionPagination } from "./transaction-pagination"
import { TransactionRow } from "./transaction-row"
import { TransactionTableControls } from "./transaction-table-controls"
import type { DetailSort } from "./types"

type TransactionTableProps = {
  rows: Transaction[]
  pagedRows: Transaction[]
  safePage: number
  totalPages: number
  pageSize: number
  detailSort: DetailSort
  rates: RateMap
  onPageChange: (page: number | ((current: number) => number)) => void
  onPageSizeChange: (pageSize: number) => void
  onDetailSortChange: (sort: DetailSort) => void
}

export function TransactionTable({
  rows,
  pagedRows,
  pageSize,
  safePage,
  totalPages,
  detailSort,
  rates,
  onPageChange,
  onPageSizeChange,
  onDetailSortChange,
}: TransactionTableProps) {
  return (
    <Card className="gap-0 py-0 transition-all duration-300 hover:-translate-y-0.5 hover:bg-card/95 hover:shadow-ledger-chart-hover motion-reduce:hover:translate-y-0">
      <CardHeader className="border-b border-border/70 p-4">
        <CardTitle className="flex items-center gap-2">
          <span className="size-1.5 bg-primary shadow-ledger-glow-primary-soft" />
          交易明细
        </CardTitle>
        <CardDescription>
          共 {rows.length} 条筛选结果，外币保留原金额并展示人民币折算。
        </CardDescription>
        <CardAction>
          <TransactionTableControls
            pageSize={pageSize}
            detailSort={detailSort}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            onDetailSortChange={onDetailSortChange}
          />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-0 px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>日期</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>备注 / 地点</TableHead>
              <TableHead>标签</TableHead>
              <TableHead>币种</TableHead>
              <TableHead>原始金额</TableHead>
              <TableHead>折算人民币</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedRows.map((tx) => (
              <TransactionRow key={tx.id} transaction={tx} rates={rates} />
            ))}
          </TableBody>
        </Table>
        <Separator />
        <TransactionPagination
          rowCount={rows.length}
          pageCount={pagedRows.length}
          safePage={safePage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </CardContent>
    </Card>
  )
}
