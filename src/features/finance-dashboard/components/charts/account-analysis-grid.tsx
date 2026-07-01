import type { EChartsOption } from "echarts"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import type { SummaryItem } from "../../model/analytics-types"
import type { AccountSort } from "../../model/dashboard-controls"
import { formatMoney } from "../../model/money"
import { DashboardPanel } from "../shared/dashboard-panel"
import { EChart } from "./e-chart"

const ACCOUNT_SORT_OPTIONS = [
  { value: "amount", label: "按支出金额" },
  { value: "count", label: "按交易笔数" },
] satisfies Array<{ value: AccountSort; label: string }>

type AccountAnalysisGridProps = {
  option: EChartsOption
  rows: SummaryItem[]
  sort: AccountSort
  onSortChange: (sort: AccountSort) => void
  onAccountSelect: (account: string) => void
}

export function AccountAnalysisGrid({
  option,
  rows,
  sort,
  onSortChange,
  onAccountSelect,
}: AccountAnalysisGridProps) {
  const expenseTotal = rows.reduce((sum, item) => sum + item.amount, 0) || 1

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <DashboardPanel
        title="账户支出分布"
        description="按账户1汇总有账户记录的支出交易。"
      >
        <EChart
          option={option}
          onClick={(params) => onAccountSelect(String(params.name))}
        />
      </DashboardPanel>

      <DashboardPanel
        title="账户支出排行"
        description="点击行可按账户筛选明细、指标和图表。"
        contentClassName="p-0"
        action={
          <Select
            items={ACCOUNT_SORT_OPTIONS}
            value={sort}
            onValueChange={(value) => onSortChange(value as AccountSort)}
          >
            <SelectTrigger size="sm" className="w-[7.75rem]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectGroup>
                {ACCOUNT_SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        }
      >
        <AccountSummaryTable
          rows={rows}
          expenseTotal={expenseTotal}
          onAccountSelect={onAccountSelect}
        />
      </DashboardPanel>
    </div>
  )
}

type AccountSummaryTableProps = {
  rows: SummaryItem[]
  expenseTotal: number
  onAccountSelect: (account: string) => void
}

function AccountSummaryTable({
  rows,
  expenseTotal,
  onAccountSelect,
}: AccountSummaryTableProps) {
  const maxAmount = Math.max(...rows.map((item) => item.amount), 0)

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>账户</TableHead>
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
              onClick={() => onAccountSelect(item.name)}
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
