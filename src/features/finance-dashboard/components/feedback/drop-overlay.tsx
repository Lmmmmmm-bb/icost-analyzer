import { cn } from "@/lib/utils"

type DropOverlayProps = {
  title: string
  description: string
  className?: string
  showInnerBorder?: boolean
}

export function DropOverlay({
  title,
  description,
  className,
  showInnerBorder = false,
}: DropOverlayProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "ledger-drop-overlay pointer-events-none z-40 grid place-items-center bg-background/55 shadow-ledger-overlay backdrop-blur-md",
        className
      )}
    >
      {showInnerBorder ? (
        <div className="absolute inset-4 border-2 border-dashed border-foreground/45" />
      ) : null}
      <div className="ledger-drop-card max-w-sm border border-border/80 bg-card/92 px-6 py-5 text-center shadow-ledger-popover backdrop-blur-xl">
        <div className="font-heading text-2xl leading-none font-semibold tracking-[-0.05em]">
          {title}
        </div>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
        <div className="mt-2 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
          Drop anywhere · .xlsx / .xls
        </div>
      </div>
    </div>
  )
}

export function WorkspaceDropOverlay() {
  return (
    <DropOverlay
      title="松开替换当前分析数据"
      description="新的 iCost Excel 会在当前浏览器本地解析，并替换现有看板数据。"
      className="fixed inset-0"
      showInnerBorder
    />
  )
}
