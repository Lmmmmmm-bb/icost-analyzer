import { useMemo } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

import { BASE_CURRENCY, DEFAULT_RATES } from "../../model/constants"
import { unique } from "../../model/collections"
import type { ExchangeRateActions } from "../../model/rate-inputs"
import { DashboardPanel } from "../shared/dashboard-panel"

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

function isLastGridRow(index: number, total: number, columns: number) {
  return index >= Math.floor((total - 1) / columns) * columns
}

function hasRightGridBorder(index: number, columns: number) {
  const position = index + 1

  return position % columns !== 0
}

function getRateCellBorderClass(index: number, total: number) {
  return cn(
    "border-border/70",
    index === total - 1 ? "border-b-0" : "border-b",
    isLastGridRow(index, total, 2) ? "sm:border-b-0" : "sm:border-b",
    isLastGridRow(index, total, 5) ? "lg:border-b-0" : "lg:border-b",
    hasRightGridBorder(index, 2) ? "sm:border-r" : "sm:border-r-0",
    hasRightGridBorder(index, 5) ? "lg:border-r" : "lg:border-r-0"
  )
}

type RateSettingsProps = {
  currencies: string[]
  inputs: Record<string, string>
  errors: Record<string, string>
  actions: ExchangeRateActions
}

export function RateSettings({
  currencies: availableCurrencies,
  inputs,
  errors,
  actions,
}: RateSettingsProps) {
  const currencies = useMemo(
    () => unique(availableCurrencies).sort(compareCurrencies),
    [availableCurrencies]
  )

  return (
    <DashboardPanel
      title="汇率设置"
      description={`${BASE_CURRENCY} 固定为 1；默认汇率为内置参考值，非实时行情。留空或无效输入不会更新计算。`}
      interactive={false}
      action={
        <Button variant="outline" size="xs" onClick={actions.resetRates}>
          恢复内置汇率
        </Button>
      }
      contentClassName="p-0"
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-5">
        {currencies.map((currency, index) => {
          const raw = inputs[currency] ?? ""
          const isBaseCurrency = currency === BASE_CURRENCY
          const invalid = Boolean(errors[currency])
          return (
            <label
              key={currency}
              className={cn(
                "group/rate-cell flex flex-col gap-2 px-3 py-2.5 transition-colors hover:bg-muted/35",
                getRateCellBorderClass(index, currencies.length)
              )}
            >
              <span className="flex items-baseline justify-between gap-3">
                <span className="inline-flex min-w-0 items-baseline gap-2">
                  <span className="font-mono text-[11px] tracking-[0.1em] text-foreground uppercase">
                    {currency}
                  </span>
                  <span className="truncate text-[11px] text-muted-foreground/70">
                    {CURRENCY_LABELS[currency] ?? "外币"}
                  </span>
                </span>
                {isBaseCurrency ? (
                  <span className="shrink-0 font-mono text-[10px] tracking-[0.14em] text-muted-foreground/55 uppercase">
                    固定
                  </span>
                ) : null}
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
                  onChange={(event) =>
                    actions.updateInput(currency, event.target.value)
                  }
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
