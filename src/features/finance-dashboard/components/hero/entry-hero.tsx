import { useCallback } from "react"
import {
  RiExchangeDollarLine,
  RiLineChartLine,
  RiPieChartLine,
  RiTableLine,
} from "@remixicon/react"

import { cn } from "@/lib/utils"

import { HeroCopy } from "./hero-copy"
import { ParsingStatusOverlay } from "./parsing-status"
import { UploadCard } from "./upload-card"
import { useFileDrop } from "./use-file-drop"
import type { WorkbookUploadState } from "./use-workbook-upload"
import { DropOverlay } from "./workspace-drop-overlay"
import { LedgerCornerGrid } from "../shared/ledger-accents"

const PREVIEW_ROWS = [
  ["日期", "分类", "币种", "金额"],
  ["2026-03-08", "餐饮", "CNY", "-128.50"],
  ["2026-03-12", "交通", "JPY", "-860"],
  ["2026-03-18", "报销", "CNY", "+128.50"],
  ["2026-03-21", "购物", "CNY", "-369.00"],
  ["2026-03-24", "旅行", "USD", "-42.90"],
  ["2026-03-29", "订阅", "CNY", "-68.00"],
] as const

const ENTRY_INSIGHTS = [
  {
    icon: RiLineChartLine,
    label: "趋势",
    title: "月度支出、日均变化与热力图",
  },
  {
    icon: RiPieChartLine,
    label: "去向",
    title: "分类、标签、账户的支出占比",
  },
  {
    icon: RiExchangeDollarLine,
    label: "折算",
    title: "静态汇率下的多币种汇总",
  },
  {
    icon: RiTableLine,
    label: "明细",
    title: "可筛选、排序、分页的交易表",
  },
] as const

type EntryHeroProps = {
  uploadState: WorkbookUploadState
  onUpload: (file: File) => void
}

export function EntryHero({ uploadState, onUpload }: EntryHeroProps) {
  const handleFileDrop = useCallback(
    (file: File) => {
      if (!uploadState.isParsing) onUpload(file)
    },
    [onUpload, uploadState.isParsing]
  )
  const { isDragging, dropProps } = useFileDrop(handleFileDrop, {
    disabled: uploadState.isParsing,
  })

  return (
    <section
      className="relative flex min-h-svh items-center overflow-hidden py-8 md:py-12"
      {...dropProps}
    >
      {isDragging ? (
        <DropOverlay
          title="松开开始本地解析"
          description="已识别到文件拖入页面，松开后会在当前浏览器本地解析。"
          className="absolute inset-4 border border-dashed border-foreground/45"
        />
      ) : null}
      {uploadState.showParsingStatus ? (
        <ParsingStatusOverlay fileName={uploadState.parsingFileName} />
      ) : null}
      <div className="ledger-rise relative z-20 mx-auto grid w-full max-w-7xl gap-7 px-5 py-8 md:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,440px)] lg:grid-rows-[auto_auto] lg:items-start lg:gap-x-10 lg:gap-y-6 lg:px-10">
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          <HeroCopy />
        </div>
        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
          <UploadCard uploadState={uploadState} onUpload={onUpload} />
        </div>
        <div className="min-w-0 lg:col-start-1 lg:row-start-2">
          <EntryInsightPreview />
        </div>
      </div>
    </section>
  )
}

function EntryInsightPreview() {
  return (
    <div className="relative max-w-3xl overflow-hidden border border-border/70 bg-card/65 shadow-ledger-panel backdrop-blur">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-foreground/35 via-transparent to-transparent" />
      <LedgerCornerGrid className="top-3 right-3 opacity-25" />
      <div className="relative grid md:grid-cols-[minmax(0,1.1fr)_minmax(220px,0.9fr)]">
        <div className="flex min-w-0 flex-col">
          <div className="flex items-start justify-between gap-3 border-b border-border/70 p-3.5">
            <div className="flex flex-col gap-1">
              <div className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                账本预览
              </div>
              <div className="text-sm leading-5 font-medium">
                上传你的 iCost 账单
              </div>
            </div>
            <div className="shrink-0 border bg-background/60 px-2 py-1 font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
              本地解析
            </div>
          </div>
          <div className="grid max-h-52 [scrollbar-width:none] grid-cols-[1.15fr_0.8fr_0.62fr_0.8fr] overflow-auto text-xs [&::-webkit-scrollbar]:hidden">
            {PREVIEW_ROWS.flatMap((row, rowIndex) =>
              row.map((cell, cellIndex) => (
                <div
                  key={`${rowIndex}-${cellIndex}-${cell}`}
                  className={cn(
                    "min-w-20 border-r border-b border-border/70 px-3 py-2",
                    rowIndex === 0 && "sticky top-0 bg-card",
                    cellIndex === row.length - 1 && "border-r-0"
                  )}
                >
                  <span
                    className={cn(
                      "font-mono",
                      rowIndex === 0
                        ? "text-[10px] tracking-[0.14em] text-muted-foreground uppercase"
                        : "text-foreground"
                    )}
                  >
                    {cell}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="grid border-t border-border/70 md:border-t-0 md:border-l">
          {ENTRY_INSIGHTS.map((insight) => {
            const Icon = insight.icon

            return (
              <div
                key={insight.label}
                className="group/insight relative flex items-start gap-3 border-b border-border/70 p-3.5 transition-colors last:border-b-0 hover:bg-muted/35"
              >
                <span className="grid size-8 shrink-0 place-items-center border bg-background/70">
                  <Icon aria-hidden="true" className="size-4" />
                </span>
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase transition-colors group-hover/insight:text-foreground">
                    {insight.label}
                  </span>
                  <span className="text-sm leading-5 font-medium">
                    {insight.title}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
