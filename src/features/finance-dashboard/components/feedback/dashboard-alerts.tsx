import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type DashboardAlertsProps = {
  uploadError: string
  invalidDateRange: boolean
  missingRates: string[]
  skippedRows: number
}

export function DashboardAlerts({
  uploadError,
  invalidDateRange,
  missingRates,
  skippedRows,
}: DashboardAlertsProps) {
  return (
    <>
      {uploadError ? (
        <Alert variant="destructive">
          <AlertTitle>解析失败</AlertTitle>
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      ) : null}
      {invalidDateRange ? (
        <Alert variant="destructive">
          <AlertTitle>日期范围无效</AlertTitle>
          <AlertDescription>
            开始日期晚于结束日期，请修正后继续分析。
          </AlertDescription>
        </Alert>
      ) : null}
      {skippedRows > 0 ? (
        <Alert>
          <AlertTitle>部分行未导入</AlertTitle>
          <AlertDescription>
            有 {skippedRows} 行缺少有效日期或金额，已跳过。
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
