import { lazy, Suspense } from "react"
import type { ECElementEvent } from "echarts"

import { cn } from "@/lib/utils"
import { useChartVisibility } from "@/features/finance-dashboard/components/charts/runtime/use-chart-visibility"
import type { ChartOptionFactory } from "@/features/finance-dashboard/components/charts/types"

const ChartRenderer = lazy(() => import("./runtime/chart-renderer"))

type EChartProps = {
  createOption: ChartOptionFactory
  className?: string
  onClick?: (params: ECElementEvent) => void
}

export function EChart({
  createOption,
  className = "h-72",
  onClick,
}: EChartProps) {
  const { ref, active, hasEntered } = useChartVisibility()
  const placeholder = (
    <div className="grid h-full place-items-center text-xs text-muted-foreground">
      图表将在滚动到附近时显示
    </div>
  )

  return (
    <div
      ref={ref}
      className={cn("relative", className)}
      data-chart-active={active}
    >
      <Suspense fallback={placeholder}>
        {hasEntered ? (
          <ChartRenderer
            active={active}
            createOption={createOption}
            onClick={onClick}
          />
        ) : (
          placeholder
        )}
      </Suspense>
    </div>
  )
}
