import { cn } from "@/lib/utils"

type ParsingFileNameProps = {
  className?: string
  fileName: string
}

export function ParsingSweep({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "ledger-parse-sweep absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-foreground/10 to-transparent",
        className
      )}
    />
  )
}

export function ParsingMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("ledger-parse-mark size-4 border", className)}
    />
  )
}

export function ParsingFileName({ className, fileName }: ParsingFileNameProps) {
  if (!fileName) return null

  return (
    <div
      className={cn(
        "truncate border border-border/60 bg-background/55 font-mono text-[10px] text-muted-foreground uppercase",
        className
      )}
    >
      {fileName}
    </div>
  )
}

export function ParsingStatusOverlay({ fileName }: { fileName: string }) {
  return (
    <div className="ledger-drop-overlay pointer-events-none absolute inset-4 z-40 grid place-items-center border border-foreground/25 bg-background/62 shadow-ledger-overlay backdrop-blur-md">
      <div
        role="status"
        aria-live="polite"
        className="ledger-drop-card relative max-w-md overflow-hidden border border-border/80 bg-card/94 px-6 py-5 text-center shadow-ledger-popover backdrop-blur-xl"
      >
        <ParsingSweep />
        <div className="relative flex flex-col items-center gap-3">
          <div className="grid size-11 place-items-center border border-border/80 bg-background/70">
            <ParsingMark className="border-foreground/70" />
          </div>
          <div className="font-heading text-2xl leading-none font-semibold tracking-[-0.05em]">
            Excel 正在本地解析
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            文件较大或记录较多时需要等待，完成后会自动进入分析看板。
          </p>
          <ParsingFileName
            fileName={fileName}
            className="max-w-full px-3 py-2 tracking-[0.12em]"
          />
        </div>
      </div>
    </div>
  )
}
