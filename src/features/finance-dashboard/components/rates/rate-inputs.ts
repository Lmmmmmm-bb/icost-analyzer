import type { RateMap } from "../../model/types"

export function makeRateInputs(rates: RateMap) {
  return Object.fromEntries(
    Object.entries(rates).map(([key, value]) => [key, String(value)])
  )
}
