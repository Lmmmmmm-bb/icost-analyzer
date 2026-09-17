import { ZodError } from "zod"

import { inputSchemas, jsonInputSchemas } from "./query-schema"
import { queryError, type LedgerSnapshot } from "./query-types"

type ToolName = keyof typeof inputSchemas
const MAX_TOOL_RESULT_CHARACTERS = 64_000

type SiteTool = {
  name: ToolName
  description: string
  inputSchema: Record<string, unknown>
  annotations: { readOnlyHint: true; untrustedContentHint: true }
  execute: (
    input: unknown,
    options?: { signal?: AbortSignal }
  ) => Promise<unknown>
}

type SiteToolContext = {
  registerTool: (
    tool: SiteTool,
    options?: { signal?: AbortSignal }
  ) => Promise<void>
}

export type AgentAccessState = {
  enabled: boolean
  parsing: boolean
  snapshot: LedgerSnapshot | null
}

const descriptions: Record<ToolName, string> = {
  get_ledger_context:
    "读取当前页面的账本统计上下文、筛选、币种和汇率，不返回逐笔记录。先调用此工具取得 contextId；用户必须已在页面手动启用 Agent 分析。",
  summarize_ledger:
    "按页面当前筛选汇总支出、收入、净额及均值。先调用 get_ledger_context 并传入 expectedContextId。scope 默认 current_view；all_data 必须显式指定。where 是额外 AND 条件。缺汇率时人民币合计为部分合计。",
  group_ledger:
    "对当前页面账本按月份、分类、子分类、账户、账本、标签或币种分组，只返回汇总。标签可重叠，不能相加当总额。先获取 contextId；默认当前筛选，最多 50 组。",
  compare_periods:
    "比较两个明确的日期期间，返回支出、收入、净额和分类/标签变化。当前视图模式保留页面非日期筛选，但两个明确期间覆盖页面日期筛选。先获取 contextId；缺汇率结果标为部分合计。",
}

export function getSiteToolContext(): SiteToolContext | null {
  if (typeof document === "undefined") return null
  const context = (document as Document & { modelContext?: SiteToolContext })
    .modelContext
  return typeof context?.registerTool === "function" ? context : null
}

function guard(state: AgentAccessState) {
  if (state.parsing)
    return queryError("PARSING", "正在解析新文件，稍后再查询。")
  if (!state.enabled)
    return queryError("DISABLED", "请用户先在页面手动开启 Agent 分析。")
  if (!state.snapshot?.transactions.length)
    return queryError("NO_DATA", "页面尚未导入有效账本。")
  return null
}

export function createWebMcpTools(
  getState: () => AgentAccessState,
  onCalled?: (name: ToolName) => void
): SiteTool[] {
  return (Object.keys(inputSchemas) as ToolName[]).map((name) => ({
    name,
    description: descriptions[name],
    inputSchema: jsonInputSchemas[name],
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    execute: async (rawInput, options) => {
      const startingState = getState()
      const blocked = guard(startingState)
      if (blocked) return blocked
      if (options?.signal?.aborted)
        return queryError("STALE_CONTEXT", "查询已取消。")

      const parsed = inputSchemas[name].safeParse(rawInput)
      if (!parsed.success) {
        const tooLarge = parsed.error.issues.some(
          (issue) => issue.code === "too_big"
        )
        return queryError(
          tooLarge ? "TOO_LARGE" : "INVALID_FILTER",
          "查询参数不符合要求。",
          parsed.error instanceof ZodError
            ? parsed.error.issues
                .slice(0, 3)
                .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
                .join("；")
            : undefined
        )
      }

      const snapshot = startingState.snapshot!
      const { getContext, getSummary, getBreakdown, comparePeriods } =
        await import("./query-core")
      const beforeCalculation = getState()
      if (
        guard(beforeCalculation) ||
        beforeCalculation.snapshot?.contextId !== snapshot.contextId ||
        options?.signal?.aborted
      )
        return queryError("STALE_CONTEXT", "页面状态已变化，请重新取得上下文。")

      let result: unknown
      switch (name) {
        case "get_ledger_context":
          result = getContext(snapshot)
          break
        case "summarize_ledger":
          result = getSummary(
            snapshot,
            inputSchemas.summarize_ledger.parse(rawInput)
          )
          break
        case "group_ledger":
          result = getBreakdown(
            snapshot,
            inputSchemas.group_ledger.parse(rawInput)
          )
          break
        case "compare_periods":
          result = comparePeriods(
            snapshot,
            inputSchemas.compare_periods.parse(rawInput)
          )
          break
      }
      const finishingState = getState()
      if (
        guard(finishingState) ||
        finishingState.snapshot?.contextId !== snapshot.contextId ||
        options?.signal?.aborted
      )
        return queryError("STALE_CONTEXT", "页面状态已变化，请重新取得上下文。")
      try {
        const serialized = JSON.stringify(result, (_key, value) => {
          if (typeof value === "number" && !Number.isFinite(value))
            throw new Error("non-finite result")
          return value
        })
        if (serialized.length > MAX_TOOL_RESULT_CHARACTERS)
          return queryError(
            "TOO_LARGE",
            "查询结果过大，请缩小范围或减少返回组数。"
          )
      } catch {
        return queryError(
          "TOO_LARGE",
          "统计数值超出可返回范围，请检查账单金额。"
        )
      }
      onCalled?.(name)
      return result
    },
  }))
}

export async function registerWebMcpTools(
  context: SiteToolContext,
  getState: () => AgentAccessState,
  signal: AbortSignal,
  onCalled?: (name: ToolName) => void
) {
  const tools = createWebMcpTools(getState, onCalled)
  try {
    for (const tool of tools) {
      if (signal.aborted) return
      await context.registerTool(tool, { signal })
    }
  } catch (error) {
    if (!signal.aborted) throw error
  }
}
