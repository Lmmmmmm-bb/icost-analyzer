import type { WorkbookParseResult } from "@/features/finance-dashboard/upload/workbook-parser"

export type WorkbookParseRequest = { id: number; buffer: ArrayBuffer }
export type WorkbookParseResponse =
  | { type: "ready" }
  | { type: "result"; id: number; result: WorkbookParseResult }
  | { type: "error"; id: number }

export const WORKBOOK_PARSE_ERROR = "Excel 解析失败，请确认文件完整且格式正确。"

export function isParseRequest(value: unknown): value is WorkbookParseRequest {
  if (typeof value !== "object" || value === null) return false
  const request = value as Partial<WorkbookParseRequest>
  return (
    Number.isSafeInteger(request.id) && request.buffer instanceof ArrayBuffer
  )
}
