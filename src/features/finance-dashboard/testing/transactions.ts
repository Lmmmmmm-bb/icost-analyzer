import { dateKey, monthKey } from "../model/date"
import type { Transaction } from "../model/types"

/** Fictional records only; usable by deterministic tests and local benchmarks. */
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

export function generateTransactions(count: number): Transaction[] {
  return Array.from({ length: count }, (_, index) =>
    makeTransaction(`generated-${index}`, {
      date: new Date(2022 + (index % 5), index % 12, (index % 28) + 1, 12),
      type: index % 9 === 0 ? "收入" : "支出",
      amount: (index % 9 === 0 ? 1 : -1) * ((index % 900) + 1),
      currency: index % 7 === 0 ? "USD" : "CNY",
      category: `演示分类 ${index % 8}`,
      tags: [`演示标签 ${index % 6}`],
    })
  )
}
