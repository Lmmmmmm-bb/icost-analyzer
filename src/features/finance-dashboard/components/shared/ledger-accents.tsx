import { cn } from "@/lib/utils"

const CORNER_CELLS = Array.from({ length: 9 }, (_, index) => index)
const TITLE_TICKS = Array.from({ length: 5 }, (_, index) => index)

type LedgerAccentProps = {
  className?: string
}

export function LedgerCornerGrid({ className }: LedgerAccentProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute grid grid-cols-3 gap-1 transition-[opacity,transform] duration-300",
        className
      )}
    >
      {CORNER_CELLS.map((cell) => (
        <span
          key={cell}
          className={cn(
            "size-1 border border-border/75 bg-background/45",
            cell % 2 === 0 && "bg-muted/55"
          )}
        />
      ))}
    </span>
  )
}

export function LedgerEdgeNotch({ className }: LedgerAccentProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("pointer-events-none absolute size-7", className)}
    >
      <span className="absolute inset-x-0 top-0 h-px bg-border/75" />
      <span className="absolute top-0 bottom-0 left-0 w-px bg-border/75" />
      <span className="absolute right-0 bottom-0 size-1.5 bg-primary/80 shadow-ledger-glow-primary-soft" />
    </span>
  )
}

export function LedgerTitleTicks({ className }: LedgerAccentProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "hidden shrink-0 grid-cols-5 items-center gap-1 sm:grid",
        className
      )}
    >
      {TITLE_TICKS.map((tick) => (
        <span
          key={tick}
          className={cn("h-px bg-border/85", tick % 2 === 0 ? "w-2" : "w-1")}
        />
      ))}
    </span>
  )
}
