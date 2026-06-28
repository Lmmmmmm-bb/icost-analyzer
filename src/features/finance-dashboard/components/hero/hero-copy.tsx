import { Badge } from "@/components/ui/badge"

export function HeroCopy() {
  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <Badge variant="outline" className="w-fit">
        iCost Excel · 多币种折算 · 交易联动分析
      </Badge>
      <div className="flex flex-col gap-3">
        <h1 className="font-heading text-5xl leading-none tracking-[-0.06em] text-balance md:text-7xl">
          Ledger Observatory
        </h1>
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
          上传 iCost 固定结构 Excel
          后，即时透视收入、支出、旅行标签、外币消费和每日消费强度。所有卡片、图表与明细表都会跟随筛选和汇率变化同步重算。
        </p>
      </div>
    </div>
  )
}
