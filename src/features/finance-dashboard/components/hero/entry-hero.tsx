import { useCallback } from "react"

import { HeroCopy } from "./hero-copy"
import { ParsingStatusOverlay } from "./parsing-status"
import { UploadCard } from "./upload-card"
import { useFileDrop } from "./use-file-drop"
import type { WorkbookUploadState } from "./use-workbook-upload"
import { DropOverlay } from "./workspace-drop-overlay"

const ENTRY_STEPS = [
  ["01", "拖入 iCost 导出的 Excel"],
  ["02", "本地解析交易与标签维度"],
  ["03", "进入仪表盘联动分析"],
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
          description="已识别到文件拖入页面，松开后仅在当前浏览器解析 iCost Excel。"
          className="absolute inset-4 border border-dashed border-foreground/45"
        />
      ) : null}
      {uploadState.showParsingStatus ? (
        <ParsingStatusOverlay fileName={uploadState.parsingFileName} />
      ) : null}
      <div className="ledger-rise relative z-20 mx-auto grid w-full max-w-7xl gap-8 px-5 py-10 md:px-8 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-end lg:gap-12 lg:px-10">
        <div className="flex flex-col gap-9">
          <HeroCopy />
          <EntrySteps />
        </div>
        <UploadCard uploadState={uploadState} onUpload={onUpload} />
      </div>
    </section>
  )
}

function EntrySteps() {
  return (
    <div className="grid max-w-3xl gap-0 overflow-hidden border border-border/70 bg-card/70 backdrop-blur sm:grid-cols-3">
      {ENTRY_STEPS.map(([step, label], index) => (
        <div
          key={step}
          className="group relative overflow-hidden border-b border-border/70 p-4 transition-all duration-300 last:border-b-0 hover:bg-card/90 hover:shadow-ledger-panel-hover sm:border-r sm:border-b-0 sm:last:border-r-0"
          style={{ animationDelay: `${140 + index * 70}ms` }}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-foreground/35 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
            Step {step}
          </div>
          <div className="mt-3 text-sm leading-6 font-medium">{label}</div>
        </div>
      ))}
    </div>
  )
}
