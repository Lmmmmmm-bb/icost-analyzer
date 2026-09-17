import { describe, expect, it, vi } from "vitest"

import { EMPTY_FILTERS } from "../model/constants"
import { createWebMcpTools, registerWebMcpTools } from "./webmcp"
import type { AgentAccessState } from "./webmcp"

const CONTEXT_ID = "11111111-1111-4111-8111-111111111111"

function state(): AgentAccessState {
  return {
    enabled: false,
    parsing: false,
    snapshot: {
      contextId: CONTEXT_ID,
      transactions: [
        {
          id: "fictional",
          date: new Date(2026, 7, 1),
          dateText: "2026-08-01 00:00",
          dayKey: "2026-08-01",
          monthKey: "2026-08",
          type: "支出",
          amount: -10,
          currency: "CNY",
          category: "虚构分类",
          subcategory: "一般",
          account1: "",
          account2: "",
          book: "",
          note: "不能返回的备注",
          tags: [],
          location: "",
        },
      ],
      currentViewRows: [],
      filters: EMPTY_FILTERS,
      rates: { CNY: 1 },
      asOf: "2026-09-17T00:00:00+08:00",
      timeZone: "Asia/Shanghai",
      uploadEpoch: 0,
    },
  }
}

describe("WebMCP adapter", () => {
  it("registers only the four read-only tools", async () => {
    const registered: string[] = []
    const controller = new AbortController()
    await registerWebMcpTools(
      {
        registerTool: async (tool, options) => {
          registered.push(tool.name)
          expect(tool.annotations.readOnlyHint).toBe(true)
          expect(tool.inputSchema.type).toBe("object")
          expect(options?.signal).toBe(controller.signal)
        },
      },
      () => state(),
      controller.signal
    )
    expect(registered).toEqual([
      "get_ledger_context",
      "summarize_ledger",
      "group_ledger",
      "compare_periods",
    ])
  })

  it("checks access at each invocation, including after synchronous revocation", async () => {
    const access = state()
    access.snapshot = {
      ...access.snapshot!,
      currentViewRows: access.snapshot!.transactions,
    }
    const tools = createWebMcpTools(() => access)
    const contextTool = tools.find(
      (tool) => tool.name === "get_ledger_context"
    )!
    const summaryTool = tools.find((tool) => tool.name === "summarize_ledger")!

    expect(await contextTool.execute({})).toMatchObject({
      ok: false,
      error: { code: "DISABLED" },
    })
    access.enabled = true
    const context = await contextTool.execute({})
    expect(context).toMatchObject({ ok: true })
    expect(JSON.stringify(context)).not.toContain("不能返回的备注")
    const summary = await summaryTool.execute({ expectedContextId: CONTEXT_ID })
    expect(summary).toMatchObject({ ok: true, data: { totalExpense: 10 } })

    access.enabled = false
    expect(
      await summaryTool.execute({ expectedContextId: CONTEXT_ID })
    ).toMatchObject({
      ok: false,
      error: { code: "DISABLED" },
    })
    access.parsing = true
    expect(await contextTool.execute({})).toMatchObject({
      ok: false,
      error: { code: "PARSING" },
    })
  })

  it("rejects unknown fields and respects cancellation", async () => {
    const access = state()
    access.enabled = true
    const tool = createWebMcpTools(() => access).find(
      (item) => item.name === "get_ledger_context"
    )!
    expect(await tool.execute({ extra: true })).toMatchObject({
      ok: false,
      error: { code: "INVALID_FILTER" },
    })
    const controller = new AbortController()
    controller.abort()
    expect(await tool.execute({}, { signal: controller.signal })).toMatchObject(
      {
        ok: false,
        error: { code: "STALE_CONTEXT" },
      }
    )
  })

  it("does not register after a cancelled mount", async () => {
    const registerTool = vi.fn(async () => {})
    const controller = new AbortController()
    controller.abort()
    await registerWebMcpTools(
      { registerTool },
      () => state(),
      controller.signal
    )
    expect(registerTool).not.toHaveBeenCalled()
  })
})
