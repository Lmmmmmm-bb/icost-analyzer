import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

import { LedgerCornerGrid, LedgerEdgeNotch } from "../shared/ledger-accents"

export function NoResultEmptyState() {
  return (
    <Empty className="relative min-h-72 overflow-hidden border">
      <LedgerCornerGrid className="top-4 right-4 opacity-30" />
      <LedgerEdgeNotch className="right-0 bottom-0 opacity-45" />
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
