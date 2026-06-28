import { Button } from "@/components/ui/button"

import { toggleValue } from "../../model/utils"

type ChipGroupProps = {
  title: string
  items: string[]
  value: string[]
  onChange: (next: string[]) => void
  limit?: number
  showTitle?: boolean
}

export function ChipGroup({
  title,
  items,
  value,
  onChange,
  limit,
  showTitle = true,
}: ChipGroupProps) {
  const visible = limit ? items.slice(0, limit) : items
  return (
    <div className="flex flex-col gap-2">
      {showTitle ? (
        <div className="text-[11px] tracking-[0.24em] text-muted-foreground uppercase">
          {title}
        </div>
      ) : null}
      <div className="flex flex-wrap gap-1.5">
        {visible.map((item) => (
          <Button
            key={item}
            type="button"
            size="xs"
            variant={value.includes(item) ? "default" : "outline"}
            className="font-mono tracking-[0.04em]"
            onClick={() => onChange(toggleValue(value, item))}
          >
            {item}
          </Button>
        ))}
      </div>
    </div>
  )
}
