import { useMemo } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { BASE_CURRENCY, DEFAULT_RATES } from "../../model/constants"
import { unique } from "../../model/collections"
import type { Dimensions, RateMap } from "../../model/types"
import { DashboardPanel } from "../shared/dashboard-panel"
import { makeRateInputs } from "./rate-inputs"

type RateSettingsProps = {
  dimensions: Dimensions
  rateInputs: Record<string, string>
  onRateInputsChange: (
    inputs:
      | Record<string, string>
      | ((current: Record<string, string>) => Record<string, string>)
  ) => void
  onRatesChange: (rates: RateMap | ((current: RateMap) => RateMap)) => void
}

export function RateSettings({
  dimensions,
  rateInputs,
  onRateInputsChange,
  onRatesChange,
}: RateSettingsProps) {
  const currencies = useMemo(
    () => unique([...Object.keys(DEFAULT_RATES), ...dimensions.currencies]),
    [dimensions.currencies]
  )

  function updateRate(currency: string, raw: string) {
    onRateInputsChange((current) => ({ ...current, [currency]: raw }))
    const value = Number(raw)
    if (currency === BASE_CURRENCY) return
    if (raw.trim() === "" || !Number.isFinite(value) || value <= 0) return
    onRatesChange((current) => ({ ...current, [currency]: value }))
  }

  return (
    <DashboardPanel
      title="汇率设置"
      description={`${BASE_CURRENCY} 固定为 1；非法或空汇率不会写入计算。`}
      action={
        <Button
          variant="outline"
          size="xs"
          onClick={() => {
            onRatesChange(DEFAULT_RATES)
            onRateInputsChange(makeRateInputs(DEFAULT_RATES))
          }}
        >
          恢复默认汇率
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-7">
        {currencies.map((currency) => {
          const raw = rateInputs[currency] ?? ""
          const value = Number(raw)
          const isBaseCurrency = currency === BASE_CURRENCY
          const invalid =
            !isBaseCurrency && (!raw || value <= 0 || !Number.isFinite(value))
          return (
            <label
              key={currency}
              className="flex flex-col gap-1.5 text-xs text-muted-foreground"
            >
              {currency}
              <Input
                value={isBaseCurrency ? "1" : raw}
                disabled={isBaseCurrency}
                aria-invalid={invalid}
                onChange={(event) => updateRate(currency, event.target.value)}
              />
            </label>
          )
        })}
      </div>
    </DashboardPanel>
  )
}
