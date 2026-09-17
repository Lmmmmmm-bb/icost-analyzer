import { BASE_CURRENCY } from "../model/constants"
import { dateKey, monthKey } from "../model/date"
import type { Transaction } from "../model/types"

function getCell(row: Record<string, unknown>, names: string[]) {
  for (const name of names) {
    const value = row[name]
    if (value !== undefined && value !== null && String(value).trim())
      return value
  }
  return ""
}

function getTextCell(row: Record<string, unknown>, names: string[]) {
  return String(getCell(row, names)).trim()
}

function makeLocalDate(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0
) {
  if (year < 1900 || year > 2100) return null
  const date = new Date(year, month - 1, day, hour, minute, second)
  return date.getFullYear() === year &&
    date.getMonth() + 1 === month &&
    date.getDate() === day &&
    date.getHours() === hour &&
    date.getMinutes() === minute &&
    date.getSeconds() === second
    ? date
    : null
}

function parseTextDate(value: string) {
  const normalized = value
    .trim()
    .replaceAll("年", "-")
    .replaceAll("月", "-")
    .replaceAll("日", "")
  const match =
    /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/.exec(
      normalized
    )
  if (!match) return null
  return makeLocalDate(
    Number(match[1]),
    Number(match[2]),
    Number(match[3]),
    Number(match[4] ?? 0),
    Number(match[5] ?? 0),
    Number(match[6] ?? 0)
  )
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

export async function parseWorkbookWithDiagnostics(buffer: ArrayBuffer) {
  const XLSX = await import("xlsx")
  const workbook = XLSX.read(buffer, { type: "array", cellDates: false })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  if (!sheet) throw new Error("Excel 中没有可读取的工作表。")
  const date1904 = Boolean(workbook.Workbook?.WBProps?.date1904)
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  })
  let skippedRows = 0
  const transactions = rows.flatMap((row, index): Transaction[] => {
    const rawDate = getCell(row, ["日期", "日期时间", "时间"])
    const date =
      rawDate instanceof Date
        ? makeLocalDate(
            rawDate.getFullYear(),
            rawDate.getMonth() + 1,
            rawDate.getDate(),
            rawDate.getHours(),
            rawDate.getMinutes(),
            rawDate.getSeconds()
          )
        : typeof rawDate === "number"
          ? (() => {
              const parts = XLSX.SSF.parse_date_code(rawDate, { date1904 })
              return parts
                ? makeLocalDate(
                    parts.y,
                    parts.m,
                    parts.d,
                    parts.H,
                    parts.M,
                    parts.S
                  )
                : null
            })()
          : parseTextDate(String(rawDate))
    const rawAmount = getCell(row, ["金额", "原始金额"])
    const amountText = String(rawAmount).trim().replaceAll(",", "")
    const amount = amountText ? Number(amountText) : Number.NaN
    if (!date || !Number.isFinite(amount)) {
      skippedRows += 1
      return []
    }
    const tags = splitTags(getTextCell(row, ["标签", "Tags"]))
    return [
      {
        id: `${date.getTime()}-${index}`,
        date,
        dateText: formatDateTime(date),
        dayKey: dateKey(date),
        monthKey: monthKey(date),
        type:
          getTextCell(row, ["类型", "交易类型"]) ||
          (amount < 0 ? "支出" : "收入"),
        amount,
        currency: (
          getTextCell(row, ["货币", "币种", "Currency"]) || BASE_CURRENCY
        ).toUpperCase(),
        category: getTextCell(row, ["一级分类", "分类"]) || "未分类",
        subcategory: getTextCell(row, ["二级分类", "子分类"]) || "未分类",
        account1: getTextCell(row, ["账户1", "账户", "支付账户"]),
        account2: getTextCell(row, ["账户2", "收款账户"]),
        book: getTextCell(row, ["账本", "账簿", "Book"]),
        note: getTextCell(row, ["备注", "说明"]),
        tags,
        location: getTextCell(row, ["位置", "地点"]),
      },
    ]
  })
  return { transactions, skippedRows }
}

export async function parseWorkbook(buffer: ArrayBuffer) {
  const { transactions } = await parseWorkbookWithDiagnostics(buffer)
  return transactions
}
