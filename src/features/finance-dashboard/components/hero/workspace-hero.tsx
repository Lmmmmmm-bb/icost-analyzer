import { useCallback, useRef } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import type { MetricStats, PeriodComparison } from "../../model/analytics-types"
import type { WorkbookUploadState } from "../../upload/use-workbook-upload"
import { HeroMetrics } from "./hero-metrics"
import {
  LedgerCornerGrid,
  LedgerEdgeNotch,
  LedgerTitleTicks,
} from "../shared/ledger-accents"

type WorkspaceHeroProps = {
  fileName: string
  rangeText: string
  stats: MetricStats
  periodComparison: PeriodComparison
  yearComparison: PeriodComparison
  uploadState: WorkbookUploadState
  onUpload: (file: File) => void
}

export function WorkspaceHero({
  fileName,
  rangeText,
  stats,
  periodComparison,
  yearComparison,
  uploadState,
  onUpload,
}: WorkspaceHeroProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const uploadFile = useCallback(
    (file?: File) => {
      if (!file || uploadState.isParsing) return
      onUpload(file)
    },
    [onUpload, uploadState.isParsing]
  )

  return (
    <section className="flex flex-col gap-5">
      <div className="relative overflow-hidden border border-border/80 bg-card/88 shadow-ledger-panel backdrop-blur-xl">
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-foreground/40 via-foreground/10 to-transparent" />
        <div className="absolute top-0 bottom-0 left-0 w-1 bg-foreground/85" />
        <LedgerEdgeNotch className="right-0 bottom-0 opacity-45" />
        <LedgerCornerGrid className="right-4 bottom-4 opacity-20" />
        <div className="relative flex flex-col gap-5 p-4 pl-5 md:p-5 md:pl-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex max-w-3xl flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2.5 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
              <span className="h-px w-7 bg-foreground/30" />
              Analysis dashboard
            </div>
            <div className="grid gap-3 md:grid-cols-[auto_minmax(0,1fr)] md:items-end">
              <div className="flex items-end gap-3">
                <span
                  aria-hidden="true"
                  className="font-mono text-4xl leading-none font-semibold tracking-[-0.08em] text-foreground/12 md:text-5xl"
                >
                  ∑
                </span>
                <h1 className="font-heading text-3xl leading-none font-semibold tracking-[-0.055em] md:text-4xl">
                  财务分析
                </h1>
                <LedgerTitleTicks className="mb-1" />
              </div>
              <p className="max-w-2xl border-l border-border/70 pl-3 text-xs leading-5 text-muted-foreground md:mb-0.5">
                当前文件已在本地解析完成，数据仅保留在当前页面会话中。可按时间、账本、账户、分类、标签与币种查看交易；调整筛选或汇率后，图表与明细会同步刷新。
              </p>
            </div>
          </div>
          <div className="flex flex-col items-start gap-3 text-xs text-muted-foreground lg:max-w-md lg:items-end">
            <span className="max-w-full truncate border bg-background/65 px-3 py-2 font-mono shadow-ledger-tag backdrop-blur">
              覆盖时间 {rangeText}
            </span>
            <div className="flex w-full min-w-0 items-center gap-3 lg:justify-end">
              <span className="min-w-0 flex-1 truncate border bg-background/65 px-3 py-2 font-mono shadow-ledger-tag backdrop-blur lg:max-w-[22rem]">
                {fileName}
              </span>
              <Button
                type="button"
                className="shrink-0 font-mono hover:-translate-y-0.5"
                disabled={uploadState.isParsing}
                onClick={() => inputRef.current?.click()}
              >
                {uploadState.isParsing ? "解析中" : "更换文件"}
              </Button>
              <Input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls"
                className="sr-only"
                tabIndex={-1}
                aria-label="选择新的 iCost Excel 文件"
                disabled={uploadState.isParsing}
                onChange={(event) => {
                  uploadFile(event.target.files?.[0])
                  event.currentTarget.value = ""
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <HeroMetrics
        stats={stats}
        periodComparison={periodComparison}
        yearComparison={yearComparison}
      />
    </section>
  )
}
