import { Button } from "@/components/ui/button"

type ChipGroupProps = {
  title: string
  items: string[]
  value: string[]
  onChange: (next: string[]) => void
  limit?: number
  showTitle?: boolean
  titleInline?: boolean
}

function toggleValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value]
}

export function ChipGroup({
  title,
  items,
  value,
  onChange,
  limit,
  showTitle = true,
  titleInline = false,
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
        {visible.map((item) => (
          <Button
            key={item}
            type="button"
            size="xs"
            variant={value.includes(item) ? "default" : "outline"}
            className="font-mono tracking-[0.04em] shadow-none transition-transform hover:-translate-y-px"
            onClick={() => onChange(toggleValue(value, item))}
          >
            {item}
          </Button>
        ))}
      </div>
    </div>
  )
}
