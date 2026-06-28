import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

import { DEFAULT_RATES } from "../constants"
import type { Dimensions, RateMap } from "../types"
import { makeRateInputs, unique } from "../utils"

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
  function updateRate(currency: string, raw: string) {
    onRateInputsChange((current) => ({ ...current, [currency]: raw }))
    const value = Number(raw)
    if (currency === "CNY") return
    if (raw.trim() === "" || !Number.isFinite(value) || value <= 0) return
    onRatesChange((current) => ({ ...current, [currency]: value }))
  }

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b border-border/70 p-4">
        <CardTitle>汇率设置</CardTitle>
        <CardDescription>
          CNY 固定为 1；非法或空汇率不会写入计算。
        </CardDescription>
        <CardAction>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onRatesChange(DEFAULT_RATES)
              onRateInputsChange(makeRateInputs(DEFAULT_RATES))
            }}
          >
            恢复默认汇率
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-3 p-4 sm:grid-cols-3 lg:grid-cols-7">
        {unique([...Object.keys(DEFAULT_RATES), ...dimensions.currencies]).map(
          (currency) => {
            const invalid =
              currency !== "CNY" &&
              (!rateInputs[currency] ||
                Number(rateInputs[currency]) <= 0 ||
                !Number.isFinite(Number(rateInputs[currency])))
            return (
              <label
                key={currency}
                className="flex flex-col gap-1.5 text-xs text-muted-foreground"
              >
                {currency}
                <Input
                  value={
                    currency === "CNY" ? "1" : (rateInputs[currency] ?? "")
                  }
                  disabled={currency === "CNY"}
                  aria-invalid={invalid}
                  onChange={(event) => updateRate(currency, event.target.value)}
                />
              </label>
            )
          }
        )}
      </CardContent>
    </Card>
  )
}
