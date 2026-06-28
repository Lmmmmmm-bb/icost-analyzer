import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type DashboardAlertsProps = {
  invalidDateRange: boolean
  missingRates: string[]
}

export function DashboardAlerts({
  invalidDateRange,
  missingRates,
}: DashboardAlertsProps) {
  return (
    <>
      {invalidDateRange ? (
        <Alert variant="destructive">
          <AlertTitle>日期范围非法</AlertTitle>
          <AlertDescription>
            开始日期晚于结束日期，请修正后继续分析。
          </AlertDescription>
        </Alert>
      ) : null}
      {missingRates.length ? (
        <Alert variant="destructive">
          <AlertTitle>存在未配置汇率的币种</AlertTitle>
          <AlertDescription>
            {missingRates.join("、")} 暂按 0 参与计算，请在汇率设置中补全。
          </AlertDescription>
        </Alert>
      ) : null}
    </>
  )
}
