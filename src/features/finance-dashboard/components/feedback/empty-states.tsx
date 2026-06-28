import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export function UploadEmptyState() {
  return (
    <Empty className="min-h-96 border">
      <EmptyHeader>
        <EmptyMedia variant="icon">¥</EmptyMedia>
        <EmptyTitle>上传 iCost Excel 后开始分析</EmptyTitle>
        <EmptyDescription>
          页面会自动识别固定表头，并把外币按当前汇率折算为人民币。
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>示例文件名：iCost_20260627223344.xlsx</EmptyContent>
    </Empty>
  )
}

export function NoResultEmptyState() {
  return (
    <Empty className="min-h-72 border">
      <EmptyHeader>
        <EmptyMedia variant="icon">∅</EmptyMedia>
        <EmptyTitle>当前筛选条件下没有数据</EmptyTitle>
        <EmptyDescription>
          请放宽时间、分类、标签或关键词条件。
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
