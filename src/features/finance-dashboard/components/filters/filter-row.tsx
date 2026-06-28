import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type FilterRowProps = {
  label: string
  children: ReactNode
  contentClassName?: string
  inline?: boolean
}

export function FilterRow({
  label,
  children,
  contentClassName,
  inline = false,
}: FilterRowProps) {
  return (
    <section
      className={cn(
        "group/filter-row grid border-b border-border/70 bg-background/35 transition-colors last:border-b-0 hover:bg-muted/35",
        inline
          ? "grid-cols-[72px_1fr] md:grid-cols-[112px_1fr]"
          : "md:grid-cols-[112px_1fr]"
      )}
    >
      <div
        className={cn(
          "flex items-center border-b border-border/70 px-4 py-3 font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase transition-colors group-hover/filter-row:text-foreground md:border-r md:border-b-0 md:border-border/70",
          inline && "border-r border-b-0 border-border/70"
        )}
      >
        <span className="inline-flex items-center gap-2">
          <span className="size-1 bg-current opacity-45" />
          {label}
        </span>
      </div>
      <div className={cn("px-4 py-3", contentClassName)}>{children}</div>
    </section>
  )
}
