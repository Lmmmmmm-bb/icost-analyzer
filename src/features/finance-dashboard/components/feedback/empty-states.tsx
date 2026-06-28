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
        <EmptyTitle>当前筛选条件下没有数据</EmptyTitle>
        <EmptyDescription>
          请放宽时间、分类、标签或关键词条件。
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
