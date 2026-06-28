import type { Dimensions } from "../../model/types"
import { MetricCard } from "../shared/metric-card"

type HeroMetricsProps = {
  rangeText: string
  totalCount: number
  filteredCount: number
  dimensions: Dimensions
}

export function HeroMetrics({
  rangeText,
  totalCount,
  filteredCount,
  dimensions,
}: HeroMetricsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <MetricCard
        label="覆盖时间"
        value={rangeText}
        caption="基于上传数据的最早与最晚交易"
      />
      <MetricCard
        label="记录总数"
        value={`${totalCount}`}
        caption={`当前筛选 ${filteredCount} 条`}
      />
      <MetricCard
        label="涉及币种"
        value={`${dimensions.currencies.length}`}
        caption={dimensions.currencies.join(" / ") || "等待数据"}
      />
      <MetricCard
        label="涉及标签"
        value={`${dimensions.tags.length}`}
        caption="空标签不参与标签统计"
      />
      <MetricCard label="汇率说明" value="手动" caption="修改后全局实时重算" />
    </div>
  )
}
