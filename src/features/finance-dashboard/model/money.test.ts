import { describe, expect, it } from "vitest"

import { makeTransaction } from "@/features/finance-dashboard/testing/transactions"
import {
  getEffectiveRate,
  getMissingRates,
  toRmb,
} from "@/features/finance-dashboard/model/money"

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
})
