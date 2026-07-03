import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type FilterRowProps = {
  label: string
  children: ReactNode
  contentClassName?: string
  inline?: boolean
  variant?: "page" | "dialog"
}

export function FilterRow({
  label,
  children,
  contentClassName,
  inline = false,
  variant = "page",
}: FilterRowProps) {
  const isDialog = variant === "dialog"

  return (
    <section
      className={cn(
        "group/filter-row grid transition-colors",
        isDialog
          ? "border-b border-border/70 bg-background/35 hover:bg-muted/35"
          : "border-b border-border/70 bg-background/35 last:border-b-0 hover:bg-muted/35",
        inline
          ? isDialog
            ? "grid-cols-1 lg:grid-cols-[128px_1fr]"
            : "grid-cols-1 sm:grid-cols-[72px_1fr] md:grid-cols-[112px_1fr]"
          : isDialog
            ? "lg:grid-cols-[128px_1fr]"
            : "md:grid-cols-[112px_1fr]"
      )}
    >
      <div
        className={cn(
          "flex font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase transition-colors group-hover/filter-row:text-foreground",
          isDialog
            ? "items-center border-b border-border/70 px-4 py-3 lg:border-r lg:border-b-0 lg:border-border/70"
            : "items-center border-b border-border/70 px-4 py-3 md:border-r md:border-b-0 md:border-border/70",
          inline &&
            (isDialog
              ? "border-b border-border/70 lg:border-r lg:border-b-0 lg:border-border/70"
              : "border-b border-border/70 sm:border-r sm:border-b-0 sm:border-border/70")
        )}
      >
        <span className="inline-flex items-center gap-2">
          <span
            className={cn(
              "size-1 bg-current opacity-45",
              isDialog && "mt-1.5 shadow-ledger-glow-primary-soft"
            )}
          />
          {label}
        </span>
      </div>
      <div className={cn("px-4 py-3", contentClassName)}>{children}</div>
    </section>
  )
}
