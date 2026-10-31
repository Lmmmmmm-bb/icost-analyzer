import { describe, expect, it } from "vitest"

import { DEFAULT_RATES } from "./constants"
import {
  createExchangeRateState,
  exchangeRateReducer,
  getRateInputErrors,
} from "./rate-inputs"

describe("exchange rate editing", () => {
  it.each(["", " ", "invalid", "0", "-1", "Infinity"])(
    "keeps the active rate when the draft is %j",
    (raw) => {
      const state = createExchangeRateState(["USD"])
      const next = exchangeRateReducer(state, {
        type: "input",
        currency: "USD",
        raw,
      })
      expect(next.inputs.USD).toBe(raw)
      expect(next.rates).toBe(state.rates)
      expect(getRateInputErrors(next.inputs).USD).toBeTruthy()
    }
  )

  it("updates the calculation rate only when a positive input changes its value", () => {
    const state = createExchangeRateState(["USD"])
    const next = exchangeRateReducer(state, {
      type: "input",
      currency: "USD",
      raw: "7.50",
    })
    expect(next.inputs.USD).toBe("7.50")
    expect(next.rates.USD).toBe(7.5)
    expect(getRateInputErrors(next.inputs).USD).toBeUndefined()
    expect(
      exchangeRateReducer(next, { type: "input", currency: "USD", raw: "7.5" })
        .rates
    ).toBe(next.rates)
    expect(
      exchangeRateReducer(next, { type: "input", currency: "CNY", raw: "9" })
    ).toBe(next)
  })

  it("resets valid values and drafts together, and discards currencies from a replaced workbook", () => {
    let state = createExchangeRateState(["XYZ"])
    state = exchangeRateReducer(state, {
      type: "input",
      currency: "XYZ",
      raw: "2",
    })
    state = exchangeRateReducer(state, {
      type: "input",
      currency: "USD",
      raw: "9",
    })
    const reset = exchangeRateReducer(state, { type: "reset" })
    expect(reset.rates).toEqual({ ...DEFAULT_RATES, XYZ: 0 })
    expect(reset.inputs.XYZ).toBe("0")
    expect(reset.inputs.USD).toBe(String(DEFAULT_RATES.USD))
    const replaced = exchangeRateReducer(state, {
      type: "initialize",
      currencies: ["ABC"],
    })
    expect(replaced.rates).toEqual({ ...DEFAULT_RATES, ABC: 0 })
    expect(replaced.inputs.XYZ).toBeUndefined()
    expect(state.rates.XYZ).toBe(2)
  })
})
