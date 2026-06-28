import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { PAGE_SIZE_OPTIONS } from "../constants"
import type { DetailSort, RateMap, Transaction } from "../types"
import { formatMoney, isExpense, selectClassName, toRmb } from "../utils"

type TransactionTableProps = {
  rows: Transaction[]
  pagedRows: Transaction[]
  page: number
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
    <Card className="gap-0 py-0">
      <CardHeader className="border-b border-border/70 p-4">
        <CardTitle>交易明细</CardTitle>
        <CardDescription>
          共 {rows.length} 条筛选结果，外币保留原金额并展示人民币折算。
        </CardDescription>
        <CardAction>
          <div className="flex flex-wrap gap-2">
            <select
              className={selectClassName()}
              value={detailSort}
              onChange={(event) =>
                onDetailSortChange(event.target.value as DetailSort)
              }
            >
              <option value="date">按日期排序</option>
              <option value="amount">按金额排序</option>
            </select>
            <select
              className={selectClassName()}
              value={pageSize}
              onChange={(event) => {
                onPageChange(1)
                onPageSizeChange(Number(event.target.value))
              }}
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size} / 页
                </option>
              ))}
            </select>
          </div>
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
              <TableRow key={tx.id}>
                <TableCell>{tx.dateText}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      isExpense(tx)
                        ? "destructive"
                        : tx.type === "转账"
                          ? "outline"
                          : "secondary"
                    }
                  >
                    {tx.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  {tx.category} / {tx.subcategory}
                </TableCell>
                <TableCell
                  className="max-w-80 truncate"
                  title={`${tx.note} ${tx.location}`}
                >
                  {tx.note || "无备注"}
                  {tx.location ? ` · ${tx.location}` : ""}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {tx.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{tx.currency}</TableCell>
                <TableCell>
                  {tx.amount.toLocaleString("zh-CN", {
                    maximumFractionDigits: 3,
                  })}{" "}
                  {tx.currency}
                </TableCell>
                <TableCell>{formatMoney(toRmb(tx, rates))}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Separator />
        <div className="flex flex-col gap-3 p-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div>
            第 {safePage} / {totalPages} 页 · 当前页 {pagedRows.length} 条 ·
            总计 {rows.length} 条
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="xs"
              disabled={safePage === 1}
              onClick={() => onPageChange(1)}
            >
              首页
            </Button>
            <Button
              variant="outline"
              size="xs"
              disabled={safePage === 1}
              onClick={() =>
                onPageChange((current) =>
                  Math.max(1, Math.min(current, totalPages) - 1)
                )
              }
            >
              上一页
            </Button>
            <Button
              variant="outline"
              size="xs"
              disabled={safePage === totalPages}
              onClick={() =>
                onPageChange((current) =>
                  Math.min(totalPages, Math.min(current, totalPages) + 1)
                )
              }
            >
              下一页
            </Button>
            <Button
              variant="outline"
              size="xs"
              disabled={safePage === totalPages}
              onClick={() => onPageChange(totalPages)}
            >
              末页
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
