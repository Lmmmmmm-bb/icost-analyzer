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
    <Card className="gap-0 py-0 lg:w-[420px]">
      <CardHeader className="border-b border-border/70 p-4">
        <CardTitle>上传 iCost 明细</CardTitle>
        <CardDescription>
          支持「日期 / 类型 / 金额 / 一级分类 / 二级分类 / 货币 / 标签 /
          位置」结构。
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 p-4">
        <Input
          type="file"
          accept=".xlsx,.xls"
          onChange={(event) => onUpload(event.target.files?.[0])}
        />
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary">{fileName || "尚未上传文件"}</Badge>
          <Badge variant="outline">汇率：手动维护，CNY = 1</Badge>
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
