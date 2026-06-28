import { Badge } from "@/components/ui/badge"

export function HeroCopy() {
  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <Badge
        variant="outline"
        className="w-fit bg-background/70 font-mono tracking-[0.18em] uppercase shadow-sm backdrop-blur"
      >
        iCost Excel · 多币种折算 · 交易联动分析
      </Badge>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
          <span className="h-px w-10 bg-foreground/40" />
          Personal finance control room
        </div>
        <h1 className="font-heading text-5xl leading-[0.88] font-semibold tracking-[-0.065em] text-balance md:text-7xl">
          Ledger Observatory
        </h1>
        <p className="max-w-2xl border-l border-border/80 pl-4 text-sm leading-7 text-muted-foreground md:text-base">
          上传 iCost 固定结构 Excel
          后，即时透视收入、支出、旅行标签、外币消费和每日消费强度。所有卡片、图表与明细表都会跟随筛选和汇率变化同步重算。
        </p>
      </div>
    </div>
  )
}
