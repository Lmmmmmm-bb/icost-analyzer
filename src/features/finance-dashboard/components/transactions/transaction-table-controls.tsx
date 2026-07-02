import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type { DetailSort } from "../../model/dashboard-controls"

const PAGE_SIZE_OPTIONS = [25, 50, 100, 200]

const DETAIL_SORT_OPTIONS = [
  { value: "date", label: "日期倒序" },
  { value: "dateAsc", label: "日期正序" },
  { value: "amount", label: "按金额排序" },
] satisfies Array<{ value: DetailSort; label: string }>

const PAGE_SIZE_SELECT_OPTIONS = PAGE_SIZE_OPTIONS.map((size) => ({
  value: String(size),
  label: `${size} / 页`,
}))

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
      <Select
        items={DETAIL_SORT_OPTIONS}
        value={detailSort}
        onValueChange={(value) => onDetailSortChange(value as DetailSort)}
      >
        <SelectTrigger size="sm" className="w-[7.5rem]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          <SelectGroup>
            {DETAIL_SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Select
        items={PAGE_SIZE_SELECT_OPTIONS}
        value={String(pageSize)}
        onValueChange={(value) => {
          onPageChange(1)
          onPageSizeChange(Number(value))
        }}
      >
        <SelectTrigger size="sm" className="w-[6.5rem]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          <SelectGroup>
            {PAGE_SIZE_SELECT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
