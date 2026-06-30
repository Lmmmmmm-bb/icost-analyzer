import type { EChartsOption, ECElementEvent } from "echarts"

import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"

import type { MonthlyItem } from "../../model/analytics-types"
import { DashboardPanel } from "../shared/dashboard-panel"
import { EChart } from "./e-chart"
import { MonthlyReviewDialog } from "./monthly-review/monthly-review-dialog"

type MonthlyTrendPanelProps = {
  option: EChartsOption
  monthlyReview: MonthlyItem[]
  reviewOpen: boolean
  onReviewOpenChange: (open: boolean) => void
  onApplyMonth: (month: string) => void
}

export function MonthlyTrendPanel({
  option,
  monthlyReview,
  reviewOpen,
  onReviewOpenChange,
  onApplyMonth,
}: MonthlyTrendPanelProps) {
  return (
    <Dialog open={reviewOpen} onOpenChange={onReviewOpenChange}>
      <DashboardPanel
        title="月度收支趋势"
        description="柱状展示支出与收入，折线展示净结余；点击月份筛选到该月。"
        action={
          <DialogTrigger
            render={<Button type="button" variant="outline" size="xs" />}
          >
            打开月度复盘
          </DialogTrigger>
        }
      >
        <EChart
          option={option}
          onClick={(params) => onApplyMonth(getName(params))}
        />
      </DashboardPanel>

      {reviewOpen ? (
        <MonthlyReviewDialog monthlyReview={monthlyReview} />
      ) : null}
    </Dialog>
  )
}

function getName(params: ECElementEvent) {
  return String(params.name)
}
