import { describe, expect, it } from "vitest"

import {
  getTransactionDirection,
  isExpenseTransaction,
  isIncomeTransaction,
  isReimburseTransaction,
} from "./transaction-rules"

describe("transaction accounting rules", () => {
  it.each([
    ["支出", 10, true, false, false, "expense"],
    ["收入", 10, false, true, false, "income"],
    ["收入", -10, true, true, false, "income"],
    ["退款入账", 10, false, true, true, "income"],
    ["报销入账", 10, false, true, true, "income"],
    ["已报销", -10, true, false, true, "expense"],
    ["待报销", 10, false, false, true, "other"],
    ["转账", 10, false, false, false, "other"],
    ["转账", -10, true, false, false, "expense"],
    ["未知类型", -10, true, false, false, "expense"],
    ["未知类型", 10, false, false, false, "other"],
  ] as const)(
    "classifies %s / %s",
    (type, amount, expense, income, reimburse, direction) => {
      const row = { type, amount }
      expect(isExpenseTransaction(row)).toBe(expense)
      expect(isIncomeTransaction(row)).toBe(income)
      expect(isReimburseTransaction(row)).toBe(reimburse)
      expect(getTransactionDirection(row)).toBe(direction)
    }
  )
})
