import { DashboardPanel } from "../shared/dashboard-panel"
import { EChart } from "./e-chart"
import type { HeatmapChartOption } from "./types"

type HeatmapPanelProps = {
  heatmapOptions: HeatmapChartOption[]
}

export function HeatmapPanel({ heatmapOptions }: HeatmapPanelProps) {
  return (
    <DashboardPanel
      title="每日支出热力图"
      description="每个自然日一个格子，颜色越深代表支出越集中。"
    >
      <div className="grid gap-4">
        {heatmapOptions.map((heatmap) => (
          <div key={heatmap.year} className="grid gap-2">
            <div className="flex items-center gap-2 text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
              <span className="h-px flex-1 bg-border" />
              {heatmap.year}
              <span className="h-px flex-1 bg-border" />
            </div>
            <EChart option={heatmap.option} className="h-40" />
          </div>
        ))}
      </div>
    </DashboardPanel>
  )
}
