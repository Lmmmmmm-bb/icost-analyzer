import type { ECElementEvent } from "echarts"

import { Button } from "@/components/ui/button"

import { DashboardPanel } from "../shared/dashboard-panel"
import { EChart } from "./e-chart"
import { RANK_LEVELS, type ChartOptions, type RankLevel } from "./types"

type AnalysisChartsProps = {
  options: ChartOptions
  drillCategory: string
  rankLevel: RankLevel
  onApplyMonth: (month: string) => void
  onDrillCategoryChange: (category: string) => void
  onRankLevelChange: (level: RankLevel) => void
  onTagSelect: (tag: string) => void
}

export function AnalysisCharts({
  options,
  drillCategory,
  rankLevel,
  onApplyMonth,
  onDrillCategoryChange,
  onRankLevelChange,
  onTagSelect,
}: AnalysisChartsProps) {
  function getName(params: ECElementEvent) {
    return String(params.name)
  }

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-2">
        <DashboardPanel
          title="月度收支趋势"
          description="柱状展示支出与收入，折线展示净结余；点击月份筛选到该月。"
        >
          <EChart
            option={options.monthlyOption}
            onClick={(params) => onApplyMonth(getName(params))}
          />
        </DashboardPanel>
        <DashboardPanel
          title="支出分类占比"
          description={
            drillCategory
              ? `正在查看「${drillCategory}」下的二级分类`
              : "默认一级分类，点击扇区可下钻二级分类。"
          }
          action={
            drillCategory ? (
              <Button
                variant="outline"
                size="xs"
                onClick={() => onDrillCategoryChange("")}
              >
                返回一级分类
              </Button>
            ) : null
          }
        >
          <EChart
            option={options.pieOption}
            onClick={(params) => {
              if (!drillCategory) onDrillCategoryChange(getName(params))
            }}
          />
        </DashboardPanel>
        <DashboardPanel
          title="支出明细排行 Top 15"
          description="按折算人民币金额从高到低排序。"
          action={
            <div className="flex gap-1">
              {RANK_LEVELS.map((level) => (
                <Button
                  key={level}
                  size="xs"
                  variant={rankLevel === level ? "default" : "outline"}
                  onClick={() => onRankLevelChange(level)}
                >
                  {level}
                </Button>
              ))}
            </div>
          }
        >
          <EChart option={options.rankingOption} />
        </DashboardPanel>
        <DashboardPanel
          title="币种分布"
          description="以支出原币种分组，金额统一折算人民币。"
        >
          <EChart option={options.currencyOption} />
        </DashboardPanel>
        <DashboardPanel
          title="星期支出分布"
          description="观察消费集中发生在一周中的哪些日期。"
        >
          <EChart option={options.weekOption} />
        </DashboardPanel>
        <DashboardPanel
          title="标签支出排行"
          description="多标签交易会分别计入每个标签；点击柱子筛选标签。"
        >
          <EChart
            option={options.tagOption}
            onClick={(params) => onTagSelect(getName(params))}
          />
        </DashboardPanel>
      </div>

      <DashboardPanel
        title="每日支出热力图"
        description="每个自然日一个格子，颜色越深代表支出越集中。"
      >
        <EChart option={options.heatmapOption} className="h-40" />
      </DashboardPanel>
    </>
  )
}
