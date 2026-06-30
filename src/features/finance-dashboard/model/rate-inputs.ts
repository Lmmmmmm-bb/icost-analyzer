import type { RateMap } from "./types"

export function makeRateInputs(rates: RateMap) {
  return Object.fromEntries(
    Object.entries(rates).map(([currency, rate]) => [currency, String(rate)])
  )
}
