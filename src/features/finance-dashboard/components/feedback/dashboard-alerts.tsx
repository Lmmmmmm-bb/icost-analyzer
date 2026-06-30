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
          <AlertTitle>日期范围无效</AlertTitle>
          <AlertDescription>
            开始日期晚于结束日期，请修正后继续分析。
          </AlertDescription>
        </Alert>
      ) : null}
      {missingRates.length ? (
        <Alert variant="destructive">
          <AlertTitle>有币种缺少汇率</AlertTitle>
          <AlertDescription>
            {missingRates.join("、")}
            暂不计入人民币折算，请补全汇率后再查看总额。
          </AlertDescription>
        </Alert>
      ) : null}
    </>
  )
}
