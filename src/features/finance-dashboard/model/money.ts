import { BASE_CURRENCY } from "./constants"
import type { RateMap, Transaction } from "./types"

const moneyFormatter = new Intl.NumberFormat("zh-CN", {
  style: "currency",
  currency: BASE_CURRENCY,
  maximumFractionDigits: 2,
})
const wholeMoneyFormatter = new Intl.NumberFormat("zh-CN", {
  style: "currency",
  currency: BASE_CURRENCY,
  maximumFractionDigits: 0,
})
const amountFormatters = new Map(
  [2, 3].map((digits) => [
    digits,
    new Intl.NumberFormat("zh-CN", { maximumFractionDigits: digits }),
  ])
)

export function formatMoney(value: number, compact = false) {
  const abs = Math.abs(value)
  if (compact && abs >= 10000) return `¥${(value / 10000).toFixed(1)} 万`
  return (abs >= 1000 ? wholeMoneyFormatter : moneyFormatter).format(value)
}

export function formatOriginalAmount(
  value: number,
  currency: string,
  maximumFractionDigits = 3
) {
  const formatter = amountFormatters.get(maximumFractionDigits)
  const amount = formatter
    ? formatter.format(value)
    : value.toLocaleString("zh-CN", { maximumFractionDigits })
  return `${amount} ${currency}`
}

export function formatSignedMoney(value: number, compact = false) {
  if (value > 0) return `+${formatMoney(value, compact)}`
  if (value < 0) return `-${formatMoney(Math.abs(value), compact)}`
  return formatMoney(0, compact)
}

export function toRmb(tx: Transaction, rates: RateMap) {
  return tx.amount * getEffectiveRate(tx.currency, rates)
}

export function expenseRmb(tx: Transaction, rates: RateMap) {
  return Math.abs(toRmb(tx, rates))
}

export function getEffectiveRate(currency: string, rates: RateMap) {
  if (currency === BASE_CURRENCY) return 1
  const rate = rates[currency]
  return Number.isFinite(rate) && rate > 0 ? rate : 0
}

export function getMissingRates(
  transactions: readonly Transaction[],
  rates: RateMap
) {
  const currencies = new Set<string>()
  for (const tx of transactions) currencies.add(tx.currency)
  return [...currencies].filter(
    (currency) => getEffectiveRate(currency, rates) === 0
  )
}
