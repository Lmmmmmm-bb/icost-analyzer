import { PAGE_SIZE_OPTIONS } from "../../model/constants"
import type { DetailSort } from "../../model/types"
import { selectClassName } from "../../model/utils"

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
