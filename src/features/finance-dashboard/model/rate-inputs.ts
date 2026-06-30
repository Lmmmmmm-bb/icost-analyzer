import { DEFAULT_RATES } from "./constants"
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
