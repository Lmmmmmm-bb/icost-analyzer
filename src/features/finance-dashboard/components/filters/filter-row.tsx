import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type FilterRowProps = {
  label: string
  children: ReactNode
  contentClassName?: string
}

export function FilterRow({
  label,
  children,
  contentClassName,
}: FilterRowProps) {
  return (
    <section className="grid border-b border-border/70 bg-background/35 last:border-b-0 md:grid-cols-[112px_1fr]">
      <div className="border-b border-border/70 px-4 py-3 font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase md:border-r md:border-b-0 md:border-border/70">
        {label}
      </div>
      <div className={cn("px-4 py-3", contentClassName)}>{children}</div>
    </section>
  )
}
