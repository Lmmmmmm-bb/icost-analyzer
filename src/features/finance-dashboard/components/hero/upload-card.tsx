import { useCallback, useRef } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type UploadCardProps = {
  error: string
  onUpload: (file: File) => void
}

export function UploadCard({ error, onUpload }: UploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const uploadFile = useCallback(
    (file?: File) => {
      if (!file) return
      onUpload(file)
    },
    [onUpload]
  )

  return (
    <Card className="group/upload shadow-ledger-card hover:shadow-ledger-card-hover relative gap-0 overflow-hidden bg-card/90 py-0 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 lg:w-[440px]">
      <div
        aria-hidden="true"
        className="absolute -top-10 -right-10 size-28 rotate-12 border border-border/60 bg-background/35 transition-transform duration-500 group-hover/upload:rotate-6"
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-foreground/35 via-transparent to-transparent" />
      <CardHeader className="relative border-b border-border/70 p-5">
        <CardTitle className="flex items-center gap-2">
          <span className="shadow-ledger-glow-primary size-2 bg-primary" />
          整页拖拽上传
        </CardTitle>
        <CardDescription>
          右侧面板仅作提示与手动选择；把文件拖到首页任意位置都可以上传。
        </CardDescription>
      </CardHeader>
      <CardContent className="relative flex flex-col gap-3 p-5">
        <button
          type="button"
          className="relative flex min-h-44 cursor-pointer flex-col items-start justify-between overflow-hidden border border-dashed border-border/80 bg-background/65 p-5 text-left transition-all duration-300 hover:border-foreground/45 hover:bg-muted/45 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
          aria-label="拖拽到页面任意位置，或点击选择 iCost Excel 文件"
          onClick={() => inputRef.current?.click()}
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
              <span className="font-heading text-3xl leading-none font-semibold tracking-[-0.055em]">
                拖入页面任意位置
              </span>
              <span className="text-sm leading-6 text-muted-foreground">
                将 iCost Excel 拖进当前页面即可上传；也可以点击这里选择文件。
              </span>
            </span>
            <span className="shadow-ledger-tag grid size-12 shrink-0 place-items-center border bg-primary font-mono text-xs text-primary-foreground transition-transform duration-300 group-hover/upload:-rotate-3">
              XLS
            </span>
          </span>
          <span className="grid w-full grid-cols-3 border border-border/70 bg-card/75 text-center font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
            <span className="border-r border-border/70 py-2">Page</span>
            <span className="border-r border-border/70 py-2">Drop</span>
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
