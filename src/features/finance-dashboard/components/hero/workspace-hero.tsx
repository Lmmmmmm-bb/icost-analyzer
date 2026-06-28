import { Button } from "@/components/ui/button"

import type { MetricStats } from "../../model/analytics-types"
import { HeroMetrics } from "./hero-metrics"

type WorkspaceHeroProps = {
  fileName: string
  rangeText: string
  stats: MetricStats
  onReplaceFile: () => void
}

export function WorkspaceHero({
  fileName,
  rangeText,
  stats,
  onReplaceFile,
}: WorkspaceHeroProps) {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex max-w-2xl flex-col gap-3">
          <div className="flex items-center gap-2.5 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            <span className="h-px w-7 bg-foreground/30" />
            Analysis dashboard
          </div>
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-baseline sm:gap-3">
            <h1 className="font-heading text-2xl leading-none font-semibold tracking-[-0.04em] md:text-3xl">
              账单分析
            </h1>
            <p className="max-w-xl text-xs leading-5 text-muted-foreground sm:border-l sm:border-border/60 sm:pl-3">
              汇总当前文件的收支、币种、标签和消费节奏，筛选条件或汇率调整后会同步更新下方图表与明细。
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground lg:pt-5">
          <span className="max-w-full truncate border bg-card/80 px-3 py-2 font-mono shadow-ledger-tag backdrop-blur sm:max-w-[18rem]">
            覆盖时间 {rangeText}
          </span>
          <span className="max-w-full truncate border bg-card/80 px-3 py-2 font-mono shadow-ledger-tag backdrop-blur sm:max-w-[28rem]">
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
      <HeroMetrics stats={stats} />
    </section>
  )
}
