import type { Transaction } from "./types"

export type TransactionDirection = "expense" | "income" | "other"

export type DirectionBadgeVariant = "destructive" | "positive" | "secondary"

export const INCOME_TRANSACTION_TYPES = [
  "收入",
  "退款入账",
  "报销入账",
] as const

export const REIMBURSE_TRANSACTION_TYPES = [
  "退款入账",
  "报销入账",
  "已报销",
  "待报销",
] as const

export function isExpenseTransaction(tx: Pick<Transaction, "type" | "amount">) {
  return tx.type === "支出" || tx.amount < 0
}

export function isIncomeTransaction(tx: Pick<Transaction, "type">) {
  return INCOME_TRANSACTION_TYPES.includes(
    tx.type as (typeof INCOME_TRANSACTION_TYPES)[number]
  )
}

export function isReimburseTransaction(tx: Pick<Transaction, "type">) {
  return REIMBURSE_TRANSACTION_TYPES.includes(
    tx.type as (typeof REIMBURSE_TRANSACTION_TYPES)[number]
  )
}

export function getTransactionDirection(
  tx: Pick<Transaction, "type" | "amount">
): TransactionDirection {
  if (isIncomeTransaction(tx)) return "income"
  if (isExpenseTransaction(tx)) return "expense"
  return "other"
}

export function getDirectionBadgeVariant(
  direction: TransactionDirection
): DirectionBadgeVariant {
  if (direction === "expense") return "destructive"
  if (direction === "income") return "positive"
  return "secondary"
}
