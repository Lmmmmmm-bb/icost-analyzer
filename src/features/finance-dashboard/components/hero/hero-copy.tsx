import { Badge } from "@/components/ui/badge"
import { RiRefreshLine, RiShieldCheckLine, RiTimeLine } from "@remixicon/react"

const HERO_FACTS = [
  {
    icon: RiShieldCheckLine,
    label: "本地解析",
  },
  {
    icon: RiRefreshLine,
    label: "即时联动",
  },
  {
    icon: RiTimeLine,
    label: "会话暂存",
  },
] as const

export function HeroCopy() {
  return (
    <div className="flex max-w-4xl flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant="outline"
          className="w-fit bg-background/70 font-mono tracking-[0.18em] uppercase shadow-ledger-tag backdrop-blur"
        >
          本地解析 · 多币种折算 · 图表联动
        </Badge>
        <span className="hidden h-px w-12 bg-border sm:block" />
        <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
          iCost 账单工作台
        </span>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
          <span className="h-px w-10 bg-foreground/40" />
          本地财务看板
        </div>
        <h1 className="max-w-[13ch] font-heading text-4xl leading-[0.94] font-semibold tracking-[-0.06em] text-balance md:text-6xl lg:text-7xl">
          看清你的每一笔支出
        </h1>
        <p className="max-w-2xl border-l border-border/80 bg-background/30 py-1 pl-4 text-sm leading-7 text-muted-foreground backdrop-blur-sm md:text-base">
          拖入你的账单文件，在当前页面查看支出、收入、报销、分类、标签、币种与明细。无需账号，不做云端解析；刷新页面后，交易数据会从当前会话中清空。
        </p>
      </div>
      <div className="grid max-w-2xl grid-cols-3 border border-border/70 bg-card/55 text-left backdrop-blur">
        {HERO_FACTS.map((fact) => {
          const Icon = fact.icon

          return (
            <div
              key={fact.label}
              className="group/fact relative flex min-h-14 items-center gap-3 border-r border-border/70 p-3 transition-colors last:border-r-0 hover:bg-muted/35"
            >
              <span className="grid size-8 shrink-0 place-items-center border bg-background/70">
                <Icon aria-hidden="true" className="size-4" />
              </span>
              <span className="text-sm leading-5 font-medium text-muted-foreground transition-colors group-hover/fact:text-foreground">
                {fact.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
