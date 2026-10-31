import { describe, expect, it } from "vitest"

import { makeTransaction } from "../testing/transactions"
import { DEFAULT_RATES } from "./constants"
import { getEffectiveRate, getMissingRates, toRmb } from "./money"
import { createRatesForCurrencies, makeRateInputs } from "./rate-inputs"

describe("exchange rate calculations", () => {
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
