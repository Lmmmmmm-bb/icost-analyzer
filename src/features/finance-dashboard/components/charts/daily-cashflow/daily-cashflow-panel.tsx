import { useEffect, useMemo, useState } from "react"

import { zhCN } from "react-day-picker/locale"

import { Calendar } from "@/components/ui/calendar"

import type { DailyCashflowItem } from "../../../model/analytics-types"
import { dateKey } from "../../../model/date"
import { DashboardPanel } from "../../shared/dashboard-panel"
import { DailyCashflowDayButton } from "./daily-cashflow-day-button"
import { DailyCashflowDetail } from "./daily-cashflow-detail"

type DailyCashflowPanelProps = {
  dailyCashflow: DailyCashflowItem[]
}

export function DailyCashflowPanel({ dailyCashflow }: DailyCashflowPanelProps) {
  const dailyCashflowByDay = useMemo(
    () => new Map(dailyCashflow.map((item) => [item.day, item])),
    [dailyCashflow]
  )
  const latestCashflow = dailyCashflow.at(-1)
  const [selectedCashflowDay, setSelectedCashflowDay] = useState("")
  const [visibleMonth, setVisibleMonth] = useState<Date | undefined>()
  const safeSelectedCashflowDay = dailyCashflowByDay.has(selectedCashflowDay)
    ? selectedCashflowDay
    : latestCashflow?.day
  const selectedCashflowDate = safeSelectedCashflowDay
    ? dailyCashflowByDay.get(safeSelectedCashflowDay)?.date
    : undefined
  const selectedCashflow = safeSelectedCashflowDay
    ? dailyCashflowByDay.get(safeSelectedCashflowDay)
    : undefined

  useEffect(() => {
    if (!latestCashflow) {
      setSelectedCashflowDay("")
      setVisibleMonth(undefined)
      return
    }

    if (dailyCashflowByDay.has(selectedCashflowDay)) return

    setSelectedCashflowDay(latestCashflow.day)
    setVisibleMonth(latestCashflow.date)
  }, [dailyCashflowByDay, latestCashflow, selectedCashflowDay])

  return (
    <DashboardPanel
      title="每日收支日历"
      description="在日历中标注每日收入与支出，点击日期查看当天交易。"
      contentClassName="p-0 min-h-unset"
    >
      <div className="grid xl:relative xl:block">
        <div className="m-0 overflow-x-auto border-b border-border/80 bg-transparent p-0 xl:w-[30rem] xl:border-r xl:border-b-0">
          <Calendar
            mode="single"
            selected={selectedCashflowDate}
            onSelect={(date) =>
              setSelectedCashflowDay(date ? dateKey(date) : "")
            }
            locale={zhCN}
            month={visibleMonth ?? selectedCashflowDate}
            onMonthChange={setVisibleMonth}
            numberOfMonths={1}
            showOutsideDays={false}
            disabled={(date) => !dailyCashflowByDay.has(dateKey(date))}
            className="m-0 w-full max-w-none overflow-visible bg-transparent p-0 [--cell-size:3.25rem]"
            classNames={{
              root: "relative m-0 w-full max-w-none overflow-visible p-0",
              months: "relative m-0 w-full max-w-none overflow-visible p-0",
              month: "m-0 w-full max-w-none gap-2 p-0",
              month_grid: "m-0 w-full max-w-none p-0",
              nav: "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1 px-0",
              weekdays: "m-0 flex p-0",
              weekday: "m-0 flex-1 p-0",
              week: "m-0 flex w-full p-0",
            }}
            components={{
              DayButton: ({ day, ...props }) => (
                <DailyCashflowDayButton
                  day={day}
                  item={dailyCashflowByDay.get(dateKey(day.date))}
                  {...props}
                />
              ),
            }}
          />
        </div>

        <DailyCashflowDetail selectedCashflow={selectedCashflow} />
      </div>
    </DashboardPanel>
  )
}
