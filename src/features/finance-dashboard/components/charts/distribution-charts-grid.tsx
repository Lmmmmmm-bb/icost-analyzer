import { DashboardPanel } from "../shared/dashboard-panel"
import { EChart } from "./e-chart"
import type { ChartPanelOptions } from "./types"

type DistributionChartsGridProps = {
  options: Pick<
    ChartPanelOptions,
    "currencyOption" | "weekOption" | "tagOption"
  >
  onTagSelect: (tag: string) => void
}

export function DistributionChartsGrid({
  options,
  onTagSelect,
}: DistributionChartsGridProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <DashboardPanel
        title="支出币种分布"
        description="按支出的原币种分组，并统一折算为人民币。"
      >
        <EChart option={options.currencyOption} />
      </DashboardPanel>
      <DashboardPanel
        title="星期支出分布"
        description="观察支出集中发生在一周中的哪些日期。"
      >
        <EChart option={options.weekOption} />
      </DashboardPanel>
      <DashboardPanel
        title="标签支出排行"
        description="多标签交易会分别计入每个标签；点击柱子筛选标签。"
      >
        <EChart
          option={options.tagOption}
          onClick={(params) => onTagSelect(String(params.name))}
        />
      </DashboardPanel>
    </div>
  )
}
