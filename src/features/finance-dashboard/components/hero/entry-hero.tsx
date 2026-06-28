import { HeroCopy } from "./hero-copy"
import { HeroScanLine } from "./hero-scan-line"
import { UploadCard } from "./upload-card"

const ENTRY_STEPS = [
  ["01", "拖入 iCost 导出的 Excel"],
  ["02", "本地解析交易与标签维度"],
  ["03", "进入仪表盘联动分析"],
] as const

type EntryHeroProps = {
  fileName: string
  error: string
  onUpload: (file: File) => void
}

export function EntryHero({ fileName, error, onUpload }: EntryHeroProps) {
  return (
    <section className="relative flex min-h-svh items-center overflow-hidden">
      <HeroScanLine />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[8%] bottom-[10%] hidden h-72 w-72 border border-border/70 bg-card/25 shadow-[24px_24px_0_color-mix(in_oklch,var(--foreground),transparent_94%)] lg:block"
      />
      <div className="ledger-rise relative mx-auto grid w-full max-w-7xl gap-8 px-5 py-10 md:px-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end lg:px-10">
        <div className="flex flex-col gap-8">
          <HeroCopy />
          <EntrySteps />
        </div>
        <UploadCard fileName={fileName} error={error} onUpload={onUpload} />
      </div>
    </section>
  )
}

function EntrySteps() {
  return (
    <div className="grid max-w-3xl gap-3 sm:grid-cols-3">
      {ENTRY_STEPS.map(([step, label]) => (
        <div
          key={step}
          className="border border-border/70 bg-card/70 p-4 shadow-sm backdrop-blur"
        >
          <div className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
            Step {step}
          </div>
          <div className="mt-3 text-sm leading-6 font-medium">{label}</div>
        </div>
      ))}
    </div>
  )
}
