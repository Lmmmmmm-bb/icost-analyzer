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
import { cn } from "@/lib/utils"

import { useFileDrop } from "./use-file-drop"

type UploadCardProps = {
  fileName: string
  error: string
  onUpload: (file: File) => void
}

export function UploadCard({ fileName, error, onUpload }: UploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const uploadFile = useCallback(
    (file?: File) => {
      if (!file) return
      onUpload(file)
    },
    [onUpload]
  )
  const { isDragging, dropProps } = useFileDrop(uploadFile)

  return (
    <Card className="group/upload relative gap-0 bg-card/90 py-0 shadow-[0_18px_60px_color-mix(in_oklch,var(--foreground),transparent_94%)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_80px_color-mix(in_oklch,var(--foreground),transparent_91%)] lg:w-[420px]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-foreground/35 via-transparent to-transparent" />
      <CardHeader className="border-b border-border/70 p-4">
        <CardTitle className="flex items-center gap-2">
          <span className="size-2 bg-primary" />
          上传 iCost 明细
        </CardTitle>
        <CardDescription>
          支持「日期 / 类型 / 金额 / 一级分类 / 二级分类 / 货币 / 标签 /
          位置」结构。
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 p-4">
        <button
          type="button"
          className={cn(
            "relative flex min-h-36 cursor-pointer flex-col items-start justify-between overflow-hidden border border-dashed border-border/80 bg-background/65 p-4 text-left transition-all duration-300 hover:border-foreground/45 hover:bg-muted/45 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
            isDragging &&
              "-translate-y-0.5 border-foreground bg-muted shadow-[0_18px_48px_color-mix(in_oklch,var(--foreground),transparent_88%)]"
          )}
          aria-label="拖拽或点击上传 iCost Excel 文件"
          onClick={() => inputRef.current?.click()}
          {...dropProps}
        >
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/40 to-transparent"
          />
          <span className="flex w-full items-start justify-between gap-4">
            <span className="flex flex-col gap-2">
              <span className="font-heading text-2xl leading-none font-semibold tracking-[-0.045em]">
                {isDragging ? "松开即刻解析" : "拖拽 Excel 到这里"}
              </span>
              <span className="text-sm leading-6 text-muted-foreground">
                或点击选择 .xlsx / .xls 文件；解析在本地浏览器完成。
              </span>
            </span>
            <span className="grid size-11 shrink-0 place-items-center border bg-primary font-mono text-xs text-primary-foreground shadow-sm">
              XLS
            </span>
          </span>
          <span className="grid w-full grid-cols-3 border border-border/70 bg-card/75 text-center font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
            <span className="border-r border-border/70 py-2">Drop</span>
            <span className="border-r border-border/70 py-2">Parse</span>
            <span className="py-2">Analyze</span>
          </span>
        </button>
        <Input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          className="sr-only"
          tabIndex={-1}
          aria-label="选择 iCost Excel 文件"
          onChange={(event) => {
            uploadFile(event.target.files?.[0])
            event.currentTarget.value = ""
          }}
        />
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary">{fileName || "尚未上传文件"}</Badge>
          <Badge variant="outline">汇率：手动维护，CNY = 1</Badge>
        </div>
        <div className="grid grid-cols-3 border border-border/70 bg-background/45 text-center font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
          <span className="border-r border-border/70 py-2">XLSX</span>
          <span className="border-r border-border/70 py-2">Local</span>
          <span className="py-2">Realtime</span>
        </div>
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
