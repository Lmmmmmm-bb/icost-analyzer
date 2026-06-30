import { Fragment } from "react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type ChipGroupProps = {
  title: string
  items: string[]
  value: string[]
  onChange: (next: string[]) => void
  excludedValue?: string[]
  onExcludedChange?: (next: string[]) => void
  limit?: number
  showTitle?: boolean
  titleInline?: boolean
  separatorBefore?: string
  describe?: (item: string) => string | null
}

function toggleValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value]
}

function removeValue(values: string[], value: string) {
  return values.filter((item) => item !== value)
}

export function ChipGroup({
  title,
  items,
  value,
  onChange,
  excludedValue = [],
  onExcludedChange,
  limit,
  showTitle = true,
  titleInline = false,
  separatorBefore,
  describe,
}: ChipGroupProps) {
  const visible = limit ? items.slice(0, limit) : items
  return (
    <div
      className={titleInline ? "flex items-start gap-3" : "flex flex-col gap-2"}
    >
      {showTitle ? (
        <div className="shrink-0 pt-1 text-[11px] tracking-[0.24em] text-muted-foreground uppercase">
          {title}
        </div>
      ) : null}
      <div className="flex flex-wrap gap-1.5">
        {visible.map((item) => {
          const hint = describe?.(item) ?? null
          const selected = value.includes(item)
          const excluded = excludedValue.includes(item)
          const nextLabel = selected
            ? `排除 ${item}`
            : excluded
              ? `取消排除 ${item}`
              : `筛选 ${item}`
          const chip = (
            <Button
              type="button"
              size="xs"
              variant={selected ? "default" : "outline"}
              className={cn(
                "font-mono tracking-[0.04em] shadow-none transition-transform hover:-translate-y-px",
                excluded &&
                  "text-muted-foreground line-through decoration-primary/80 decoration-2 underline-offset-4 hover:text-muted-foreground"
              )}
              aria-label={nextLabel}
              aria-pressed={selected || excluded}
              onClick={() => {
                if (!onExcludedChange) {
                  onChange(toggleValue(value, item))
                  return
                }

                if (selected) {
                  onChange(removeValue(value, item))
                  onExcludedChange(toggleValue(excludedValue, item))
                  return
                }

                if (excluded) {
                  onExcludedChange(removeValue(excludedValue, item))
                  return
                }

                onChange(toggleValue(value, item))
              }}
            >
              {item}
            </Button>
          )

          return (
            <Fragment key={item}>
              {separatorBefore === item ? (
                <Separator
                  orientation="vertical"
                  className="mx-1 h-6 self-center"
                />
              ) : null}
              {hint ? (
                <Tooltip>
                  <TooltipTrigger render={chip} />
                  <TooltipContent className="font-mono tracking-[0.04em]">
                    {hint}
                  </TooltipContent>
                </Tooltip>
              ) : (
                chip
              )}
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}
