import { Button } from "@/components/ui/button"

type TransactionPaginationProps = {
  rowCount: number
  pageCount: number
  safePage: number
  totalPages: number
  onPageChange: (page: number | ((current: number) => number)) => void
}

export function TransactionPagination({
  rowCount,
  pageCount,
  safePage,
  totalPages,
  onPageChange,
}: TransactionPaginationProps) {
  return (
    <div className="flex flex-col gap-3 p-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <div>
        第 {safePage} / {totalPages} 页 · 当前页 {pageCount} 条 · 总计{" "}
        {rowCount} 条
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="xs"
          disabled={safePage === 1}
          onClick={() => onPageChange(1)}
        >
          首页
        </Button>
        <Button
          variant="outline"
          size="xs"
          disabled={safePage === 1}
          onClick={() =>
            onPageChange((current) =>
              Math.max(1, Math.min(current, totalPages) - 1)
            )
          }
        >
          上一页
        </Button>
        <Button
          variant="outline"
          size="xs"
          disabled={safePage === totalPages}
          onClick={() =>
            onPageChange((current) =>
              Math.min(totalPages, Math.min(current, totalPages) + 1)
            )
          }
        >
          下一页
        </Button>
        <Button
          variant="outline"
          size="xs"
          disabled={safePage === totalPages}
          onClick={() => onPageChange(totalPages)}
        >
          末页
        </Button>
      </div>
    </div>
  )
}
