import { dateKey, monthKey } from "../model/date"
import type { Transaction } from "../model/types"

/** Fictional records for deterministic tests. */
export function makeTransaction(
  id: string,
  overrides: Partial<Transaction> = {}
): Transaction {
  const date = overrides.date ?? new Date(2026, 0, 5, 12)
  return {
    id,
    date,
    dateText: `${dateKey(date)} 12:00`,
    dayKey: dateKey(date),
    monthKey: monthKey(date),
    type: "支出",
    amount: -10,
    currency: "CNY",
    category: "演示餐饮",
    subcategory: "演示子分类",
    account1: "虚构账户 A",
    account2: "",
    book: "虚构账本",
    note: "仅用于测试的虚构备注",
    tags: [],
    location: "虚构地点",
    ...overrides,
  }
}
