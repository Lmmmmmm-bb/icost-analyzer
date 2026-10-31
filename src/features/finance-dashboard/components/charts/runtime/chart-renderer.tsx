import { useEffect, useRef } from "react"
import type { ECElementEvent } from "echarts"
import { BarChart, HeatmapChart, LineChart, PieChart } from "echarts/charts"
import {
  CalendarComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  VisualMapComponent,
} from "echarts/components"
import { init, use as registerComponents } from "echarts/core"
import type { EChartsType } from "echarts/core"
import { SVGRenderer } from "echarts/renderers"

import type { ChartOptionFactory } from "@/features/finance-dashboard/components/charts/types"

registerComponents([
  BarChart,
  HeatmapChart,
  LineChart,
  PieChart,
  CalendarComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  VisualMapComponent,
  SVGRenderer,
])

type ChartRendererProps = {
  active: boolean
  createOption: ChartOptionFactory
  onClick?: (params: ECElementEvent) => void
}

type ChartResource = {
  chart: EChartsType
  factory: ChartOptionFactory | null
  dispose: () => void
}

export default function ChartRenderer({
  active,
  createOption,
  onClick,
}: ChartRendererProps) {
  const ref = useRef<HTMLDivElement>(null)
  const resource = useRef<ChartResource | null>(null)
  const onClickRef = useRef(onClick)

  useEffect(() => {
    onClickRef.current = onClick
  }, [onClick])

  useEffect(() => {
    const element = ref.current
    if (!element) return
    element.style.visibility = "hidden"
    if (!active) {
      resource.current?.chart.dispatchAction({ type: "hideTip" })
      return
    }

    const render = () => {
      if (!element.clientWidth || !element.clientHeight) return
      if (!resource.current) {
        const chart = init(element, undefined, { renderer: "svg" })
        const click = (params: ECElementEvent) => onClickRef.current?.(params)
        const hideTooltip = () => chart.dispatchAction({ type: "hideTip" })
        chart.on("click", click)
        chart.getZr().on("globalout", hideTooltip)
        element.addEventListener("pointerleave", hideTooltip)
        resource.current = {
          chart,
          factory: null,
          dispose: () => {
            element.removeEventListener("pointerleave", hideTooltip)
            chart.off("click", click)
            chart.getZr().off("globalout", hideTooltip)
            chart.dispose()
          },
        }
      }

      const current = resource.current
      if (
        current.chart.getWidth() !== element.clientWidth ||
        current.chart.getHeight() !== element.clientHeight
      )
        current.chart.resize()
      if (current.factory !== createOption) {
        // Preserve full replacement semantics when categories/series are removed.
        current.chart.setOption(
          { ...createOption(), animationDurationUpdate: 0 },
          true
        )
        current.factory = createOption
      }
      element.style.visibility = "visible"
    }
    render()

    let frame = 0
    const resize = new ResizeObserver(() => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(render)
    })
    resize.observe(element)
    return () => {
      resize.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [active, createOption])

  useEffect(
    () => () => {
      resource.current?.dispose()
      resource.current = null
    },
    []
  )

  return <div ref={ref} className="h-full w-full" />
}
