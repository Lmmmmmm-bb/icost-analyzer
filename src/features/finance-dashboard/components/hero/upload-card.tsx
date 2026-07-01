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

import { ParsingFileName, ParsingMark, ParsingSweep } from "./parsing-status"
import { LedgerEdgeNotch, LedgerTitleTicks } from "../shared/ledger-accents"
import type { WorkbookUploadState } from "./use-workbook-upload"

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
          {showParsingStatus ? "正在解析账本" : "整页拖拽导入"}
          <LedgerTitleTicks />
        </CardTitle>
        <CardDescription>
          {showParsingStatus
            ? "Excel 文件越大，本地解析越需要一点时间，请保持当前页面打开。"
            : "右侧面板仅作提示与手动选择；把文件拖到页面任意位置即可本地解析。"}
        </CardDescription>
      </CardHeader>
      <CardContent className="relative flex flex-col gap-3 p-5">
        <button
          type="button"
          className="relative flex min-h-44 cursor-pointer flex-col items-start justify-between overflow-hidden border border-dashed border-border/80 bg-background/65 p-5 text-left transition-all duration-300 hover:border-foreground/45 hover:bg-muted/45 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-wait disabled:hover:border-border/80 disabled:hover:bg-background/65"
          aria-label={
            isParsing
              ? "正在解析 iCost Excel 文件"
              : "拖拽到页面任意位置，或点击选择 iCost Excel 文件进行本地解析"
          }
          aria-busy={isParsing}
          disabled={isParsing}
          onClick={() => {
            if (!isParsing) inputRef.current?.click()
          }}
        >
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/40 to-transparent"
          />
          <span
            aria-hidden="true"
            className="absolute right-4 bottom-12 h-16 w-16 border border-border/60 bg-card/55 transition-transform duration-500 group-hover/upload:-translate-y-1"
          />
          <span className="flex w-full items-start justify-between gap-4">
            <span className="flex flex-col gap-2">
              <span className="font-heading text-xl leading-none font-semibold tracking-[-0.025em]">
                {showParsingStatus ? "正在拆解 Excel" : "拖入页面任意位置"}
              </span>
              <span className="text-sm leading-6 text-muted-foreground">
                {showParsingStatus
                  ? "我们正在读取工作簿、识别交易行，并重建分类、标签与币种维度。"
                  : "将 iCost Excel 拖进当前页面即可本地解析；也可以点击这里选择文件。"}
              </span>
            </span>
            <span className="relative grid size-12 shrink-0 place-items-center overflow-hidden border bg-primary font-mono text-xs text-primary-foreground shadow-ledger-tag transition-transform duration-300 group-hover/upload:-rotate-3">
              {showParsingStatus ? (
                <ParsingMark className="border-primary-foreground/70" />
              ) : (
                "XLS"
              )}
            </span>
          </span>
          {showParsingStatus ? (
            <span className="flex w-full flex-col gap-2">
              <span className="flex items-center justify-between gap-3 font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                <span>Local parser</span>
                <span>Working</span>
              </span>
              <span
                aria-hidden="true"
                className="relative h-2 overflow-hidden border border-border/70 bg-card/75"
              >
                <span className="ledger-parse-bar absolute inset-y-0 left-0 w-1/2 bg-primary" />
              </span>
            </span>
          ) : (
            <span className="grid w-full grid-cols-3 border border-border/70 bg-card/75 text-center font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
              <span className="border-r border-border/70 py-2">Page</span>
              <span className="border-r border-border/70 py-2">Drop</span>
              <span className="py-2">Analyze</span>
            </span>
          )}
        </button>
        <Input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          className="sr-only"
          tabIndex={-1}
          aria-label="选择 iCost Excel 文件"
          disabled={isParsing}
          onChange={(event) => {
            uploadFile(event.target.files?.[0])
            event.currentTarget.value = ""
          }}
        />
        <div className="grid grid-cols-3 border border-border/70 bg-background/45 text-center font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
          <span className="border-r border-border/70 py-2">XLSX</span>
          <span className="border-r border-border/70 py-2">Local</span>
          <span className="py-2">
            {showParsingStatus ? "Parsing" : "Realtime"}
          </span>
        </div>
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
                  Busy
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
