import * as React from "react"
import { RiCalendarLine, RiCloseLine } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type DatePickerFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
}

export function DatePickerField({
  label,
  value,
  onChange,
}: DatePickerFieldProps) {
  const [open, setOpen] = React.useState(false)
  const selectedDate = parseDateValue(value)

  return (
    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className="font-mono text-[10px] tracking-[0.14em] uppercase">
        {label}
      </span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-[9.5rem] justify-start font-mono text-[11px] font-normal"
            />
          }
        >
          <RiCalendarLine data-icon="inline-start" />
          {value || "选择日期"}
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (!date) return
              onChange(formatDateValue(date))
              setOpen(false)
            }}
          />
          {value ? (
            <div className="border-t border-border p-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  onChange("")
                  setOpen(false)
                }}
              >
                <RiCloseLine data-icon="inline-start" />
                清除日期
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

function formatDateValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}
