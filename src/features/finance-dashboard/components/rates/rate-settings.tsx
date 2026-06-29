import { useMemo } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { BASE_CURRENCY, DEFAULT_RATES } from "../../model/constants"
import { unique } from "../../model/collections"
import type { Dimensions, RateMap } from "../../model/types"
import { DashboardPanel } from "../shared/dashboard-panel"
import { makeRateInputs } from "./rate-inputs"

const CURRENCY_LABELS: Record<string, string> = {
  CNY: "人民币",
  USD: "美元",
  EUR: "欧元",
  HKD: "港元",
  MOP: "澳门元",
  JPY: "日元",
  KRW: "韩元",
  SGD: "新加坡元",
  MYR: "马来西亚林吉特",
  THB: "泰铢",
  TWD: "新台币",
  AUD: "澳元",
  NZD: "新西兰元",
  GBP: "英镑",
  CAD: "加拿大元",
  CHF: "瑞士法郎",
  PHP: "菲律宾比索",
  INR: "印度卢比",
  VND: "越南盾",
  IDR: "印尼盾",
}

const CURRENCY_ORDER = Object.keys(DEFAULT_RATES)

function compareCurrencies(a: string, b: string) {
  const aIndex = CURRENCY_ORDER.indexOf(a)
  const bIndex = CURRENCY_ORDER.indexOf(b)

  if (aIndex >= 0 && bIndex >= 0) return aIndex - bIndex
  if (aIndex >= 0) return -1
  if (bIndex >= 0) return 1

  return a.localeCompare(b)
}

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
    () => unique(dimensions.currencies).sort(compareCurrencies),
    [dimensions.currencies]
  )

  function resetRates() {
    const nextRates = { ...DEFAULT_RATES }
    for (const currency of currencies)
      if (!nextRates[currency]) nextRates[currency] = 0
    onRatesChange(nextRates)
    onRateInputsChange(makeRateInputs(nextRates))
  }

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
      interactive={false}
      action={
        <Button variant="outline" size="xs" onClick={resetRates}>
          恢复默认汇率
        </Button>
      }
      contentClassName="p-0"
    >
      <div className="grid border-t border-l border-border/70 sm:grid-cols-2 lg:grid-cols-5">
        {currencies.map((currency) => {
          const raw = rateInputs[currency] ?? ""
          const value = Number(raw)
          const isBaseCurrency = currency === BASE_CURRENCY
          const invalid =
            !isBaseCurrency && (!raw || value <= 0 || !Number.isFinite(value))
          return (
            <label
              key={currency}
              className="group/rate-cell flex flex-col gap-2 border-r border-b border-border/70 px-3 py-2.5 transition-colors hover:bg-muted/35"
            >
              <span className="inline-flex items-baseline gap-2">
                <span className="font-mono text-[11px] tracking-[0.1em] text-foreground uppercase">
                  {currency}
                </span>
                <span className="text-[11px] text-muted-foreground/70">
                  {CURRENCY_LABELS[currency] ?? "外币"}
                </span>
              </span>
              <span className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono tracking-[0.08em] text-foreground uppercase">
                  1 {currency} =
                </span>
                <Input
                  value={isBaseCurrency ? "1" : raw}
                  disabled={isBaseCurrency}
                  aria-invalid={invalid}
                  className="h-7 text-right font-mono"
                  onChange={(event) => updateRate(currency, event.target.value)}
                />
                <span className="font-mono tracking-[0.08em] text-muted-foreground uppercase">
                  ¥
                </span>
              </span>
            </label>
          )
        })}
      </div>
    </DashboardPanel>
  )
}
