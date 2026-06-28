import type { Dimensions } from "../../model/types"
import { HeroCopy } from "./hero-copy"
import { HeroMetrics } from "./hero-metrics"
import { UploadCard } from "./upload-card"

type DashboardHeroProps = {
  fileName: string
  error: string
  rangeText: string
  totalCount: number
  filteredCount: number
  dimensions: Dimensions
  onUpload: (file?: File) => void
}

export function DashboardHero({
  fileName,
  error,
  rangeText,
  totalCount,
  filteredCount,
  dimensions,
  onUpload,
}: DashboardHeroProps) {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="ledger-scan absolute inset-x-[-20%] top-0 h-px bg-gradient-to-r from-transparent via-foreground/30 to-transparent"
      />
      <div className="ledger-rise relative mx-auto flex max-w-7xl flex-col gap-8 px-5 py-8 md:px-8 lg:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <HeroCopy />
          <UploadCard fileName={fileName} error={error} onUpload={onUpload} />
        </div>

        <HeroMetrics
          rangeText={rangeText}
          totalCount={totalCount}
          filteredCount={filteredCount}
          dimensions={dimensions}
        />
      </div>
    </section>
  )
}
