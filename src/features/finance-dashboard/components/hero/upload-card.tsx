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

type UploadCardProps = {
  fileName: string
  error: string
  onUpload: (file?: File) => void
}

export function UploadCard({ fileName, error, onUpload }: UploadCardProps) {
  return (
    <Card className="group/upload relative gap-0 bg-card/90 py-0 shadow-[0_18px_60px_color-mix(in_oklch,var(--foreground),transparent_94%)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_80px_color-mix(in_oklch,var(--foreground),transparent_91%)] lg:w-[420px]">
      <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,var(--primary),color-mix(in_oklch,var(--primary),transparent_70%),var(--primary))] opacity-80" />
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
        <Input
          type="file"
          accept=".xlsx,.xls"
          className="h-11 cursor-pointer border-dashed bg-background/65 font-mono text-[11px] transition-colors file:mr-3 file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-primary-foreground hover:bg-muted/50"
          onChange={(event) => onUpload(event.target.files?.[0])}
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
