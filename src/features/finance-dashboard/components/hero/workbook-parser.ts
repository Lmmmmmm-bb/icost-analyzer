import { BASE_CURRENCY } from "../../model/constants"
import { dateKey, monthKey } from "../../model/date"
import type { Transaction } from "../../model/types"

function getCell(row: Record<string, unknown>, names: string[]) {
  for (const name of names) {
    const value = row[name]
    if (value !== undefined && value !== null) return String(value).trim()
  }
  return ""
}

function parseDate(value: string) {
  const normalized = value.replaceAll("/", "-")
  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatDateTime(date: Date) {
  return `${dateKey(date)} ${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`
}

function splitTags(raw: string) {
  const separators = /[，,、;；|]+/
  const tagPattern = /#[^#，,、;；|]+/g
  const tags = raw.includes("#")
    ? raw
        .split(separators)
        .flatMap((part) => part.match(tagPattern) ?? part.split(/\s+/))
    : raw.split(/[，,、;；|\s]+/)

  return tags
    .map((tag) => tag.trim())
    .filter((tag) => tag && !/^(?:19|20)\d{2}年?$/.test(tag))
}

export async function parseWorkbook(buffer: ArrayBuffer) {
  const XLSX = await import("xlsx")
  const workbook = XLSX.read(buffer, { type: "array", cellDates: false })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  })
  return rows.flatMap((row, index): Transaction[] => {
    const rawDate = getCell(row, ["日期", "日期时间", "时间"])
    const date = parseDate(rawDate)
    const amount = Number(
      getCell(row, ["金额", "原始金额"]).replaceAll(",", "")
    )
    if (!date || !Number.isFinite(amount)) return []
    const tags = splitTags(getCell(row, ["标签", "Tags"]))
    return [
      {
        id: `${rawDate}-${index}`,
        date,
        dateText: formatDateTime(date),
        dayKey: dateKey(date),
        monthKey: monthKey(date),
        type:
          getCell(row, ["类型", "交易类型"]) || (amount < 0 ? "支出" : "收入"),
        amount,
        currency: (
          getCell(row, ["货币", "币种", "Currency"]) || BASE_CURRENCY
        ).toUpperCase(),
        category: getCell(row, ["一级分类", "分类"]) || "未分类",
        subcategory: getCell(row, ["二级分类", "子分类"]) || "未分类",
        account1: getCell(row, ["账户1", "账户", "支付账户"]),
        account2: getCell(row, ["账户2", "收款账户"]),
        note: getCell(row, ["备注", "说明"]),
        tags,
        location: getCell(row, ["位置", "地点"]),
      },
    ]
  })
}
