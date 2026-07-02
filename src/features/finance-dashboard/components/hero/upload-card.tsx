import { useCallback, useRef } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { RiFileChartLine } from "@remixicon/react"

import type { WorkbookUploadState } from "../../upload/use-workbook-upload"
import { ParsingFileName, ParsingMark, ParsingSweep } from "./parsing-status"
import { LedgerEdgeNotch, LedgerTitleTicks } from "../shared/ledger-accents"

const UPLOAD_FACTS = [
  ["文件类型", ".xlsx / .xls"],
  ["处理位置", "当前浏览器"],
  ["数据保留", "仅当前会话"],
] as const

type UploadCardProps = {
  uploadState: WorkbookUploadState
  onUpload: (file: File) => void
}

export function UploadCard({ uploadState, onUpload }: UploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { error, isParsing, parsingFileName, showParsingStatus } = uploadState

  const uploadFile = useCallback(
    (file?: File) => {
      if (!file || isParsing) return
      onUpload(file)
    },
    [isParsing, onUpload]
  )

  return (
    <Card className="group/upload relative gap-0 overflow-hidden bg-card/90 py-0 shadow-ledger-card backdrop-blur-xl transition-shadow duration-300 hover:shadow-ledger-card-hover lg:w-[440px]">
      <div
        aria-hidden="true"
        className="absolute -top-10 -right-10 size-28 rotate-12 border border-border/60 bg-background/35 transition-transform duration-500 group-hover/upload:rotate-6"
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-foreground/35 via-transparent to-transparent" />
      <LedgerEdgeNotch className="right-0 bottom-0 opacity-45 group-hover/card:opacity-70" />
      <CardHeader className="relative border-b border-border/70 p-5">
        <CardTitle className="flex items-center gap-2">
          <span className="size-2 bg-primary shadow-ledger-glow-primary" />
          {showParsingStatus ? "正在解析账本" : "导入账单文件"}
          <LedgerTitleTicks />
        </CardTitle>
        <CardDescription>
          {showParsingStatus
            ? "文件越大，本地解析越需要一点时间，请保持当前页面打开。"
            : "把文件拖到页面任意位置，或在这里选择文件，解析完成后直接进入分析看板。"}
        </CardDescription>
      </CardHeader>
      <CardContent className="relative flex flex-col gap-3 p-5">
        <button
          type="button"
          className="relative flex min-h-44 cursor-pointer flex-col items-start justify-between gap-4 overflow-hidden border border-dashed border-border/80 bg-background/65 p-5 text-left transition-all duration-300 hover:border-foreground/45 hover:bg-muted/45 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-wait disabled:hover:border-border/80 disabled:hover:bg-background/65"
          aria-label={
            isParsing ? "正在解析账单文件" : "选择或拖入账单文件进行本地解析"
          }
          aria-busy={isParsing}
          disabled={isParsing}
          onClick={() => {
            if (!isParsing) inputRef.current?.click()
          }}
        >
          <span
            aria-hidden="true"
            className="absolute right-4 bottom-12 h-16 w-16 border border-border/60 bg-card/55 transition-transform duration-500 group-hover/upload:-translate-y-1"
          />
          <span className="flex w-full items-start justify-between gap-4">
            <span className="flex flex-col gap-3">
              <span className="font-heading text-xl leading-none font-semibold">
                {showParsingStatus ? "正在拆解文件" : "选择或拖入文件"}
              </span>
              <span className="text-sm leading-6 text-muted-foreground">
                {showParsingStatus
                  ? "我们正在读取工作簿、识别交易行，并重建分类、标签与币种维度。"
                  : "解析会在本页完成，不需要上传到远端；完成后即可查看图表、汇总与明细。"}
              </span>
            </span>
            <span className="relative grid size-12 shrink-0 place-items-center overflow-hidden border bg-primary font-mono text-xs text-primary-foreground shadow-ledger-tag transition-transform duration-300 group-hover/upload:-rotate-3">
              {showParsingStatus ? (
                <ParsingMark className="border-primary-foreground/70" />
              ) : (
                <RiFileChartLine aria-hidden="true" />
              )}
            </span>
          </span>
          {showParsingStatus ? (
            <span className="flex w-full flex-col gap-2">
              <span className="flex items-center justify-between gap-3 font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                <span>本地解析</span>
                <span>进行中</span>
              </span>
              <span
                aria-hidden="true"
                className="relative h-2 overflow-hidden border border-border/70 bg-card/75"
              >
                <span className="ledger-parse-bar absolute inset-y-0 left-0 w-1/2 bg-primary" />
              </span>
            </span>
          ) : null}
          <span className="grid w-full border border-border/70 bg-card/75 text-left sm:grid-cols-3">
            {UPLOAD_FACTS.map(([label, value]) => (
              <span
                key={label}
                className="flex flex-col gap-1 border-b border-border/70 px-3 py-2 last:border-b-0 sm:border-r sm:border-b-0 sm:last:border-r-0"
              >
                <span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                  {label}
                </span>
                <span className="text-xs font-medium">
                  {showParsingStatus && label === "数据保留" ? "解析中" : value}
                </span>
              </span>
            ))}
          </span>
        </button>
        <Input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          className="sr-only"
          tabIndex={-1}
          aria-label="选择账单文件"
          disabled={isParsing}
          onChange={(event) => {
            uploadFile(event.target.files?.[0])
            event.currentTarget.value = ""
          }}
        />
        {showParsingStatus ? (
          <div
            role="status"
            aria-live="polite"
            className="ledger-rise relative overflow-hidden border border-border/70 bg-card/75 p-4"
          >
            <ParsingSweep />
            <div className="relative flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <div className="text-sm font-medium">解析中，请稍候</div>
                  <div className="text-xs leading-5 text-muted-foreground">
                    大文件或多 Sheet 文件会停留更久，完成后会自动进入分析看板。
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="shrink-0 font-mono uppercase"
                >
                  解析中
                </Badge>
              </div>
              <ParsingFileName
                fileName={parsingFileName}
                className="px-2.5 py-2 tracking-[0.08em]"
              />
            </div>
          </div>
        ) : null}
        {error ? (
          <Alert variant="destructive">
            <AlertTitle>解析失败</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  )
}
