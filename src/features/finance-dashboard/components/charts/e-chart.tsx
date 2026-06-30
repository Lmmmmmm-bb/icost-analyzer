import { useEffect, useRef } from "react"
import type * as ECharts from "echarts"
import type { EChartsOption } from "echarts"
import { BarChart, HeatmapChart, LineChart, PieChart } from "echarts/charts"
import {
  CalendarComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  VisualMapComponent,
} from "echarts/components"
import { init, use as registerEChartsComponents } from "echarts/core"
import type { EChartsType } from "echarts/core"
import { SVGRenderer } from "echarts/renderers"

registerEChartsComponents([
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

type EChartProps = {
  option: EChartsOption
  className?: string
  onClick?: (params: ECharts.ECElementEvent) => void
}

export function EChart({ option, className = "h-72", onClick }: EChartProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<EChartsType | null>(null)
  const optionRef = useRef(option)
  const onClickRef = useRef(onClick)

  useEffect(() => {
    optionRef.current = option
    chartRef.current?.setOption(option, true)
  }, [option])

  useEffect(() => {
    onClickRef.current = onClick
  }, [onClick])

  useEffect(() => {
    if (!ref.current) return

    const chart = init(ref.current, undefined, { renderer: "svg" })
    chartRef.current = chart
    chart.setOption(optionRef.current, true)
    const handleClick = (params: ECharts.ECElementEvent) => {
      onClickRef.current?.(params)
    }
    chart.on("click", handleClick)
    const resize = () => chart.resize()
    window.addEventListener("resize", resize)

    return () => {
      window.removeEventListener("resize", resize)
      chart.off("click", handleClick)
      chart.dispose()
      chartRef.current = null
    }
  }, [])

  return <div ref={ref} className={className} />
}
