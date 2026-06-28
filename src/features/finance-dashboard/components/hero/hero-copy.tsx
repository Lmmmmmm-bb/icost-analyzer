import { Badge } from "@/components/ui/badge"

export function HeroCopy() {
  return (
    <div className="flex max-w-3xl flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant="outline"
          className="shadow-ledger-tag w-fit bg-background/70 font-mono tracking-[0.18em] uppercase backdrop-blur"
        >
          iCost Excel · 多币种折算 · 交易联动分析
        </Badge>
        <span className="hidden h-px w-12 bg-border sm:block" />
        <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
          Local first
        </span>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
          <span className="h-px w-10 bg-foreground/40" />
          Personal finance control room
        </div>
        <h1 className="max-w-[11ch] font-heading text-5xl leading-[0.86] font-semibold tracking-[-0.07em] text-balance md:text-7xl lg:text-[5.4rem]">
          Ledger Observatory
        </h1>
        <p className="max-w-2xl border-l border-border/80 bg-background/30 py-1 pl-4 text-sm leading-7 text-muted-foreground backdrop-blur-sm md:text-base">
          上传 iCost 固定结构 Excel
          后，即时透视收入、支出、旅行标签、外币消费和每日消费强度。所有卡片、图表与明细表都会跟随筛选和汇率变化同步重算。
        </p>
      </div>
      <div className="grid max-w-xl grid-cols-3 border border-border/70 bg-card/45 text-center font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase backdrop-blur">
        <span className="border-r border-border/70 py-2.5">Private</span>
        <span className="border-r border-border/70 py-2.5">Fast parse</span>
        <span className="py-2.5">Linked view</span>
      </div>
    </div>
  )
}
