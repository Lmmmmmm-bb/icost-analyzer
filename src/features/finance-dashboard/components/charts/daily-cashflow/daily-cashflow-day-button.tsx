import type { ComponentProps } from "react"

import { CalendarDayButton } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

import type { DailyCashflowItem } from "../../../model/analytics-types"
import { formatMoney } from "../../../model/money"

type DailyCashflowDayButtonProps = ComponentProps<typeof CalendarDayButton> & {
  item?: DailyCashflowItem
}

export function DailyCashflowDayButton({
  item,
  day,
  modifiers,
  className,
  ...props
}: DailyCashflowDayButtonProps) {
  return (
    <CalendarDayButton
      day={day}
      modifiers={modifiers}
      className={cn(
        "items-start justify-start overflow-hidden border border-transparent bg-transparent p-1.5 text-left transition-all group-data-[focused=true]/day:border-transparent group-data-[focused=true]/day:ring-0 hover:border-foreground/20 hover:bg-muted/55 data-[selected-single=true]:border-primary/60 data-[selected-single=true]:bg-primary/10 data-[selected-single=true]:text-foreground data-[selected-single=true]:shadow-none data-[selected-single=true]:ring-0 group-data-[focused=true]/day:data-[selected-single=true]:border-primary/60 data-[selected-single=true]:[&>span]:opacity-100",
        item && "text-foreground",
        !item && "opacity-45",
        className
      )}
      {...props}
    >
      <span className="relative z-10 text-[0.7rem] font-medium">
        {day.date.getDate()}
      </span>
      {item ? (
        <span className="relative z-10 mt-auto flex w-full flex-col gap-0.5 text-[0.56rem] tracking-tight">
          {item.income > 0 ? (
            <span className="truncate text-positive">
              +{formatMoney(item.income, true)}
            </span>
          ) : null}
          {item.expense > 0 ? (
            <span className="truncate text-destructive">
              -{formatMoney(item.expense, true)}
            </span>
          ) : null}
        </span>
      ) : null}
    </CalendarDayButton>
  )
}
