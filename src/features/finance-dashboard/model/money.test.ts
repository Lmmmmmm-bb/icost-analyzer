import { describe, expect, it } from "vitest"

import { makeTransaction } from "../testing/transactions"
import { DEFAULT_RATES } from "./constants"
import {
  formatMoney,
  formatOriginalAmount,
  formatSignedMoney,
  getEffectiveRate,
  getMissingRates,
  toRmb,
} from "./money"
import { createRatesForCurrencies, makeRateInputs } from "./rate-inputs"

describe("exchange rate calculations", () => {
  it("preserves fractional, whole, signed and compact display boundaries", () => {
    expect(formatMoney(0)).toBe("¥0.00")
    expect(formatMoney(-2.345)).toBe("-¥2.35")
    expect(formatMoney(999.99)).toBe("¥999.99")
    expect(formatMoney(1000.49)).toBe("¥1,000")
    expect(formatMoney(-1000.5)).toBe("-¥1,001")
    expect(formatMoney(9999, true)).toBe("¥9,999")
    expect(formatMoney(-12345, true)).toBe("¥-1.2 万")
    expect(formatSignedMoney(-10)).toBe("-¥10.00")
    expect(formatSignedMoney(10)).toBe("+¥10.00")
  })

  it("preserves original currency precision for common and custom digits", () => {
    expect(formatOriginalAmount(-1234.5678, "USD")).toBe("-1,234.568 USD")
    expect(formatOriginalAmount(12.345, "CNY", 2)).toBe("12.35 CNY")
    expect(formatOriginalAmount(1.23456, "XYZ", 4)).toBe("1.2346 XYZ")
    expect(formatOriginalAmount(12, "JPY", 0)).toBe("12 JPY")
  })

  it("fixes CNY at one and excludes missing or invalid foreign rates", () => {
    expect(getEffectiveRate("CNY", { CNY: 99 })).toBe(1)
    for (const rate of [0, -1, NaN, Infinity])
      expect(getEffectiveRate("USD", { USD: rate })).toBe(0)
    const rows = [
      makeTransaction("a", { currency: "XYZ" }),
      makeTransaction("b", { currency: "XYZ" }),
    ]
    expect(getMissingRates(rows, {})).toEqual(["XYZ"])
    expect(toRmb(rows[0], {})).toBeCloseTo(0)
    expect(toRmb(makeTransaction("c", { currency: "USD" }), { USD: 2 })).toBe(
      -20
    )
  })

  it("creates independent defaults and matching editable inputs", () => {
    const rates = createRatesForCurrencies(["CNY", "XYZ"])
    expect(rates).toEqual({ ...DEFAULT_RATES, XYZ: 0 })
    expect(makeRateInputs(rates)).toMatchObject({ CNY: "1", XYZ: "0" })
    rates.USD = 999
    expect(DEFAULT_RATES.USD).not.toBe(999)
  })
})
