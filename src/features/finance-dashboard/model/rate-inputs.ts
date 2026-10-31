import { BASE_CURRENCY, DEFAULT_RATES } from "./constants"
import type { RateMap } from "./types"

export function makeRateInputs(rates: RateMap) {
  return Object.fromEntries(
    Object.entries(rates).map(([currency, rate]) => [currency, String(rate)])
  )
}

export function createRatesForCurrencies(currencies: string[]) {
  const rates = { ...DEFAULT_RATES }

  for (const currency of currencies) {
    if (!rates[currency]) rates[currency] = 0
  }

  return rates
}

export type ExchangeRateState = {
  currencies: string[]
  rates: RateMap
  inputs: Record<string, string>
}

export type ExchangeRateActions = {
  updateInput: (currency: string, raw: string) => void
  resetRates: () => void
}

export type ExchangeRateAction =
  | { type: "input"; currency: string; raw: string }
  | { type: "reset" }
  | { type: "initialize"; currencies: string[] }

export function createExchangeRateState(
  currencies: string[]
): ExchangeRateState {
  const rates = createRatesForCurrencies(currencies)
  return { currencies: [...currencies], rates, inputs: makeRateInputs(rates) }
}

function parseRateInput(raw: string) {
  const value = Number(raw)
  return raw.trim() && Number.isFinite(value) && value > 0 ? value : null
}

export function getRateInputErrors(inputs: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(inputs)
      .filter(
        ([currency, raw]) =>
          currency !== BASE_CURRENCY && parseRateInput(raw) === null
      )
      .map(([currency]) => [currency, "请输入大于 0 的有效汇率"])
  )
}

export function exchangeRateReducer(
  state: ExchangeRateState,
  action: ExchangeRateAction
): ExchangeRateState {
  if (action.type === "input") {
    const { currency, raw } = action
    if (currency === BASE_CURRENCY || state.inputs[currency] === raw)
      return state
    const value = parseRateInput(raw)
    return {
      ...state,
      inputs: { ...state.inputs, [currency]: raw },
      rates:
        value === null || value === state.rates[currency]
          ? state.rates
          : { ...state.rates, [currency]: value },
    }
  }
  const next = createExchangeRateState(
    action.type === "initialize" ? action.currencies : state.currencies
  )
  const unchanged =
    Object.keys(next.rates).length === Object.keys(state.rates).length &&
    Object.entries(next.rates).every(
      ([currency, rate]) => state.rates[currency] === rate
    )
  return { ...next, rates: unchanged ? state.rates : next.rates }
}
