import { Badge } from "@/components/ui/badge"

export function HeroCopy() {
  return (
    <div className="flex max-w-3xl flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant="outline"
          className="w-fit bg-background/70 font-mono tracking-[0.18em] uppercase shadow-ledger-tag backdrop-blur"
        >
          本地解析 · 多币种折算 · 图表联动
        </Badge>
        <span className="hidden h-px w-12 bg-border sm:block" />
        <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
          Excel first
        </span>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
          <span className="h-px w-10 bg-foreground/40" />
          Personal finance dashboard
        </div>
        <h1 className="max-w-[13ch] font-heading text-4xl leading-[0.94] font-semibold tracking-[-0.06em] text-balance md:text-6xl lg:text-7xl">
          看清你的每一笔消费
        </h1>
        <p className="max-w-2xl border-l border-border/80 bg-background/30 py-1 pl-4 text-sm leading-7 text-muted-foreground backdrop-blur-sm md:text-base">
          上传 iCost 导出的
          Excel，系统会在本地整理收入、支出、标签、币种和每日消费强度。筛选条件或汇率变更后，指标、图表和交易明细会同步更新。
        </p>
      </div>
      <div className="grid max-w-xl grid-cols-3 border border-border/70 bg-card/45 text-center font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase backdrop-blur">
        <span className="border-r border-border/70 py-2.5">本地处理</span>
        <span className="border-r border-border/70 py-2.5">快速解析</span>
        <span className="py-2.5">联动分析</span>
      </div>
    </div>
  )
}
