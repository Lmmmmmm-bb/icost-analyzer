import { Button } from "@/components/ui/button"

import { RANK_LEVELS, type RankLevel } from "../../model/dashboard-controls"
import { DashboardPanel } from "../shared/dashboard-panel"
import { EChart } from "./e-chart"
import type { ChartOptionFactory } from "@/features/finance-dashboard/components/charts/types"

type CategoryAnalysisGridProps = {
  options: {
    pieOption: ChartOptionFactory
    rankingOption: ChartOptionFactory
  }
  drillCategory: string
  rankLevel: RankLevel
  onDrillCategoryChange: (category: string) => void
  onRankLevelChange: (level: RankLevel) => void
}

export function CategoryAnalysisGrid({
  options,
  drillCategory,
  rankLevel,
  onDrillCategoryChange,
  onRankLevelChange,
}: CategoryAnalysisGridProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
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
          createOption={options.pieOption}
          onClick={(params) => {
            if (!drillCategory) onDrillCategoryChange(String(params.name))
          }}
        />
      </DashboardPanel>

      <DashboardPanel
        title="支出分类排行 Top 15"
        description="按人民币折算金额从高到低排序，可切换一级/二级分类。"
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
        <EChart createOption={options.rankingOption} />
      </DashboardPanel>
    </div>
  )
}
