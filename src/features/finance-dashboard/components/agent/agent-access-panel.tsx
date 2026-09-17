import { Button } from "@/components/ui/button"

import type { DashboardController } from "../../hooks/use-dashboard-controller"
import { DashboardPanel } from "../shared/dashboard-panel"

type AgentAccessPanelProps = {
  access: DashboardController["agentAccess"]
  isParsing: boolean
  matchedRows: number
  totalRows: number
  missingRates: string[]
}

export function AgentAccessPanel({
  access,
  isParsing,
  matchedRows,
  totalRows,
  missingRates,
}: AgentAccessPanelProps) {
  const isAvailable = access.supportStatus === "ready"
  const status =
    access.supportStatus === "unsupported"
      ? "当前浏览器暂不支持页面工具"
      : access.supportStatus === "error"
        ? "页面工具暂不可用"
        : access.supportStatus === "checking"
          ? "正在检查浏览器支持情况"
          : access.enabled
            ? "已允许 Agent 读取汇总统计"
            : "尚未允许 Agent 分析"

  return (
    <DashboardPanel
      title="Agent 分析"
      description="让支持 WebMCP 的 Agent 查询当前页面的汇总统计"
      interactive={false}
      action={
        <Button
          type="button"
          variant={access.enabled ? "outline" : "default"}
          disabled={!isAvailable || isParsing}
          aria-pressed={access.enabled}
          onClick={access.enabled ? access.disable : access.enable}
        >
          {access.enabled ? "停止 Agent 分析" : "允许 Agent 分析"}
        </Button>
      }
    >
      <div className="flex flex-col gap-2 text-xs leading-5">
        <p role="status" className="font-medium">
          {status}
        </p>
        <p className="text-muted-foreground">
          账单文件只在当前浏览器页面解析。开启后，汇总结果、当前筛选条件（包括关键词）及分类、账户等分组名称会进入你正在使用的
          Agent 会话；不会提供逐笔交易或允许 Agent 修改筛选和汇率。
        </p>
        <p className="text-muted-foreground">
          默认分析当前筛选的 {matchedRows} / {totalRows}{" "}
          笔交易；需要全账本时，Agent
          必须明确指定。更换文件或刷新页面后，需要重新手动开启。
        </p>
        {missingRates.length ? (
          <p className="text-muted-foreground">
            {missingRates.join("、")}{" "}
            缺少汇率，人民币结果沿用页面数值并标记为部分合计。
          </p>
        ) : null}
        {access.supportError ? (
          <p className="text-destructive">{access.supportError}</p>
        ) : null}
        {access.lastToolCall && access.enabled ? (
          <p className="text-muted-foreground">
            最近一次页面工具调用：{access.lastToolCall}
          </p>
        ) : null}
      </div>
    </DashboardPanel>
  )
}
