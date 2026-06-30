import * as React from "react"
import { RiCalendarLine, RiCloseLine } from "@remixicon/react"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type DateRangePickerFieldProps = {
  startDate: string
  endDate: string
  onChange: (range: { startDate: string; endDate: string }) => void
}

export function DateRangePickerField({
  startDate,
  endDate,
  onChange,
}: DateRangePickerFieldProps) {
  const [open, setOpen] = React.useState(false)
  const [draftRange, setDraftRange] = React.useState<DateRange | undefined>()
  const selectedRange = React.useMemo<DateRange | undefined>(() => {
    const from = parseDateValue(startDate)
    const to = parseDateValue(endDate)

    if (!from && !to) return undefined

    return { from, to }
  }, [startDate, endDate])
  const visibleRange = open ? draftRange : selectedRange
  const displayValue = formatRangeDisplay(startDate, endDate)

  return (
    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className="font-mono text-[10px] tracking-[0.14em] uppercase">
        自定义
      </span>
      <Popover
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen)
          setDraftRange(nextOpen ? selectedRange : undefined)
        }}
      >
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-[17rem] justify-start font-mono text-[11px] font-normal"
            />
          }
        >
          <RiCalendarLine data-icon="inline-start" />
          {displayValue || "选择日期范围"}
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="range"
            selected={visibleRange}
            onSelect={(range) => {
              const nextStartDate = range?.from
                ? formatDateValue(range.from)
                : ""
              const nextEndDate =
                range?.from && range.to && !isSameDate(range.from, range.to)
                  ? formatDateValue(range.to)
                  : ""

              setDraftRange(
                nextStartDate
                  ? {
                      from: range?.from,
                      to: nextEndDate ? range?.to : undefined,
                    }
                  : undefined
              )

              if (nextStartDate && nextEndDate) {
                onChange({
                  startDate: nextStartDate,
                  endDate: nextEndDate,
                })
                setOpen(false)
                setDraftRange(undefined)
              }
            }}
          />
          {startDate || endDate ? (
            <div className="border-t border-border p-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  onChange({ startDate: "", endDate: "" })
                  setOpen(false)
                }}
              >
                <RiCloseLine data-icon="inline-start" />
                清除日期范围
              </Button>
            </div>
          ) : null}
        </PopoverContent>
      </Popover>
    </label>
  )
}

function parseDateValue(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)

  if (!match) return undefined

  const [, year, month, day] = match
  const date = new Date(Number(year), Number(month) - 1, Number(day))

  return formatDateValue(date) === value ? date : undefined
}

function formatRangeDisplay(startDate: string, endDate: string) {
  if (startDate && endDate) return `${startDate} → ${endDate}`
  if (startDate) return `${startDate} → 选择结束`
  if (endDate) return `选择开始 → ${endDate}`

  return ""
}

function isSameDate(a: Date, b: Date) {
  return formatDateValue(a) === formatDateValue(b)
}

function formatDateValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}
