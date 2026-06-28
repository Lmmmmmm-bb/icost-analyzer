import { Button } from "@/components/ui/button"

import type { Dimensions } from "../../model/types"
import { HeroScanLine } from "./hero-scan-line"
import { HeroMetrics } from "./hero-metrics"

type WorkspaceHeroProps = {
  fileName: string
  rangeText: string
  totalCount: number
  filteredCount: number
  dimensions: Dimensions
  onReplaceFile: () => void
}

export function WorkspaceHero({
  fileName,
  rangeText,
  totalCount,
  filteredCount,
  dimensions,
  onReplaceFile,
}: WorkspaceHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-border/70 bg-background/55 backdrop-blur-xl">
      <HeroScanLine />
      <div className="ledger-rise relative mx-auto flex max-w-7xl flex-col gap-6 px-5 py-6 md:px-8 lg:px-10">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
              <span className="h-px w-10 bg-foreground/40" />
              Analysis workspace
            </div>
            <h1 className="font-heading text-3xl leading-none font-semibold tracking-[-0.055em] md:text-5xl">
              Ledger Observatory
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="border bg-card/80 px-3 py-2 font-mono">
              {fileName}
            </span>
            <Button
              type="button"
              className="font-mono hover:-translate-y-0.5"
              onClick={onReplaceFile}
            >
              更换文件
            </Button>
          </div>
        </div>
        <HeroMetrics
          rangeText={rangeText}
          totalCount={totalCount}
          filteredCount={filteredCount}
          dimensions={dimensions}
        />
      </div>
    </section>
  )
}
