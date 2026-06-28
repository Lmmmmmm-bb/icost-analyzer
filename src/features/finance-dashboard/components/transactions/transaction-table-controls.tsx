import { selectClassName } from "../shared/control-class-names"
import type { DetailSort } from "./types"

const PAGE_SIZE_OPTIONS = [25, 50, 100, 200]

type TransactionTableControlsProps = {
  pageSize: number
  detailSort: DetailSort
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  onDetailSortChange: (sort: DetailSort) => void
}

export function TransactionTableControls({
  pageSize,
  detailSort,
  onPageChange,
  onPageSizeChange,
  onDetailSortChange,
}: TransactionTableControlsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <select
        className={selectClassName()}
        value={detailSort}
        onChange={(event) =>
          onDetailSortChange(event.target.value as DetailSort)
        }
      >
        <option value="date">按日期排序</option>
        <option value="amount">按金额排序</option>
      </select>
      <select
        className={selectClassName()}
        value={pageSize}
        onChange={(event) => {
          onPageChange(1)
          onPageSizeChange(Number(event.target.value))
        }}
      >
        {PAGE_SIZE_OPTIONS.map((size) => (
          <option key={size} value={size}>
            {size} / 页
          </option>
        ))}
      </select>
    </div>
  )
}
