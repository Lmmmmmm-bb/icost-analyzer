import { useCallback, useMemo, useReducer } from "react"

import {
  createExchangeRateState,
  exchangeRateReducer,
  getRateInputErrors,
  type ExchangeRateActions,
} from "../model/rate-inputs"

export function useExchangeRates() {
  const [state, dispatch] = useReducer(
    exchangeRateReducer,
    [],
    createExchangeRateState
  )
  const initialize = useCallback(
    (currencies: string[]) => dispatch({ type: "initialize", currencies }),
    []
  )
  const actions = useMemo<ExchangeRateActions>(
    () => ({
      updateInput: (currency, raw) =>
        dispatch({ type: "input", currency, raw }),
      resetRates: () => dispatch({ type: "reset" }),
    }),
    []
  )
  const errors = useMemo(() => getRateInputErrors(state.inputs), [state.inputs])
  return {
    rates: state.rates,
    inputs: state.inputs,
    errors,
    actions,
    initialize,
  }
}
