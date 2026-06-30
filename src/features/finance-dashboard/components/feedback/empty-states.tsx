import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export function NoResultEmptyState() {
  return (
    <Empty className="min-h-72 border">
      <EmptyHeader>
        <EmptyMedia variant="icon">∅</EmptyMedia>
        <EmptyTitle>暂无匹配的交易记录</EmptyTitle>
        <EmptyDescription>
          可放宽时间、分类、标签或关键词后再试。
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
