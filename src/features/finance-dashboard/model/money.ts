import { BASE_CURRENCY } from "./constants"
import type { RateMap, Transaction } from "./types"

export function formatMoney(value: number, compact = false) {
  const abs = Math.abs(value)
  if (compact && abs >= 10000) return `¥${(value / 10000).toFixed(1)} 万`
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: BASE_CURRENCY,
    maximumFractionDigits: abs >= 1000 ? 0 : 2,
  }).format(value)
}

export function formatOriginalAmount(
  value: number,
  currency: string,
  maximumFractionDigits = 3
) {
  return `${value.toLocaleString("zh-CN", {
    maximumFractionDigits,
  })} ${currency}`
}

export function formatSignedMoney(value: number, compact = false) {
  if (value > 0) return `+${formatMoney(value, compact)}`
  if (value < 0) return `-${formatMoney(Math.abs(value), compact)}`
  return formatMoney(0, compact)
}

export function toRmb(tx: Transaction, rates: RateMap) {
  return tx.amount * (rates[tx.currency] ?? 0)
}

export function expenseRmb(tx: Transaction, rates: RateMap) {
  return Math.abs(toRmb(tx, rates))
}
