import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { formatMoney } from "../../model/money"
import { DashboardPanel } from "../shared/dashboard-panel"
import { EChart } from "./e-chart"
import type { HeatmapChartOption, HeatmapColorScaleMode } from "./types"

type HeatmapPanelProps = {
  heatmapOptions: HeatmapChartOption[]
  scaleMode: HeatmapColorScaleMode
  onScaleModeChange: (mode: HeatmapColorScaleMode) => void
}

const heatmapScaleOptions = [
  {
    value: "robust",
    label: "弱化极端值影响",
  },
  {
    value: "full",
    label: "包含全部数据",
  },
] satisfies { value: HeatmapColorScaleMode; label: string }[]

export function HeatmapPanel({
  heatmapOptions,
  scaleMode,
  onScaleModeChange,
}: HeatmapPanelProps) {
  const cappedDays = heatmapOptions.reduce(
    (total, heatmap) => total + heatmap.cappedDays,
    0
  )
  const colorMaxValue = Math.max(
    ...heatmapOptions.map((heatmap) => heatmap.colorMaxValue),
    1
  )
  const actualMaxValue = Math.max(
    ...heatmapOptions.map((heatmap) => heatmap.actualMaxValue),
    1
  )
  const selectedScaleLabel =
    heatmapScaleOptions.find((option) => option.value === scaleMode)?.label ??
    "颜色范围"

  return (
    <DashboardPanel
      title="每日支出热力图"
      description="每个自然日一个格子，颜色越深代表支出越集中。可切换颜色范围，弱化极端大额支出对整体色阶的影响。"
    >
      <div className="grid gap-4">
        <div className="flex flex-col gap-3 rounded-none border border-border/70 bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid gap-1 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">颜色范围</span>
            <span>
              {scaleMode === "robust"
                ? `按 P95 封顶着色，真实金额不变${
                    cappedDays > 0
                      ? `，当前有 ${cappedDays} 天超过色阶上限 ${formatMoney(
                          colorMaxValue
                        )}`
                      : ""
                  }。`
                : `按最大单日支出 ${formatMoney(actualMaxValue)} 着色。`}
            </span>
          </div>
          <Select
            value={scaleMode}
            onValueChange={(value) =>
              onScaleModeChange(value as HeatmapColorScaleMode)
            }
          >
            <SelectTrigger size="sm" className="w-full sm:w-[10.5rem]">
              <SelectValue>{selectedScaleLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {heatmapScaleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
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
