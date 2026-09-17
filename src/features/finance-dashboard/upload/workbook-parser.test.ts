import { describe, expect, it } from "vitest"
import * as XLSX from "xlsx"

import { parseWorkbookWithDiagnostics } from "./workbook-parser"

function generatedWorkbook(
  rows: unknown[][],
  date1904 = false,
  bookType: "xlsx" | "xls" = "xlsx"
) {
  const workbook = XLSX.utils.book_new()
  const sheet = XLSX.utils.aoa_to_sheet(rows)
  XLSX.utils.book_append_sheet(workbook, sheet, "虚构账本")
  workbook.Workbook = { WBProps: { date1904 } }
  return XLSX.write(workbook, {
    bookType,
    type: "array",
  }) as ArrayBuffer
}

describe("workbook parser", () => {
  it("skips blank amounts and invalid dates, and falls back to nonempty aliases", async () => {
    const buffer = generatedWorkbook([
      ["日期", "日期时间", "金额", "原始金额", "分类", "货币"],
      ["", "2024-01-02 10:30", "", "-12.5", "虚构分类", "USD"],
      ["2024-01-03", "", "", "", "虚构分类", "CNY"],
      ["2024-02-30", "", "-20", "", "虚构分类", "CNY"],
    ])
    const result = await parseWorkbookWithDiagnostics(buffer)
    expect(result.skippedRows).toBe(2)
    expect(result.transactions).toHaveLength(1)
    expect(result.transactions[0]).toMatchObject({
      dayKey: "2024-01-02",
      dateText: "2024-01-02 10:30",
      amount: -12.5,
      currency: "USD",
      type: "支出",
    })
  })

  it("interprets numeric Excel dates using the workbook date system", async () => {
    const standard = await parseWorkbookWithDiagnostics(
      generatedWorkbook([
        ["日期", "金额"],
        [45292, -10],
      ])
    )
    expect(standard.transactions[0].dayKey).toBe("2024-01-01")

    const shifted = await parseWorkbookWithDiagnostics(
      generatedWorkbook(
        [
          ["日期", "金额"],
          [45292, -10],
        ],
        true
      )
    )
    expect(shifted.transactions[0].dayKey).toBe("2028-01-02")
  })

  it("continues to accept legacy .xls workbooks", async () => {
    const result = await parseWorkbookWithDiagnostics(
      generatedWorkbook(
        [
          ["日期", "金额", "类型"],
          ["2025-05-06", -9, "支出"],
        ],
        false,
        "xls"
      )
    )
    expect(result.transactions).toMatchObject([
      { dayKey: "2025-05-06", amount: -9 },
    ])
  })
})
