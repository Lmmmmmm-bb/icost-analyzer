import type { MetricStats } from "../../model/analytics-types"
import { formatMoney } from "../../model/money"
import { MetricCard } from "../shared/metric-card"

type MetricGridProps = {
  stats: MetricStats
}

export function MetricGrid({ stats }: MetricGridProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <MetricCard
        label="总支出"
        value={formatMoney(stats.totalExpense, true)}
        caption={`${stats.expenseCount} 笔支出`}
      />
      <MetricCard
        label="总收入"
        value={formatMoney(stats.totalIncome, true)}
        caption="不包含转账"
      />
      <MetricCard
        label="净结余"
        value={formatMoney(stats.net, true)}
        caption="总收入 - 总支出"
      />
      <MetricCard
        label="日均 / 笔均"
        value={`${formatMoney(stats.dailyExpense, true)} / ${formatMoney(stats.avgExpense, true)}`}
        caption={`${stats.days} 个覆盖自然日`}
      />
      <MetricCard
        label="最大单笔 / 报销"
        value={`${formatMoney(stats.maxExpense, true)} / ${formatMoney(stats.reimburse, true)}`}
        caption="退款、报销、待报销合计"
      />
    </div>
  )
}
