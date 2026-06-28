import { useEffect, useRef } from "react"
import * as echarts from "echarts"
import type { EChartsOption } from "echarts"

type EChartProps = {
  option: EChartsOption
  className?: string
  onClick?: (params: echarts.ECElementEvent) => void
}

export function EChart({ option, className = "h-72", onClick }: EChartProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<echarts.ECharts | null>(null)
  const onClickRef = useRef(onClick)

  useEffect(() => {
    onClickRef.current = onClick
  }, [onClick])

  useEffect(() => {
    if (!ref.current) return
    const chart = echarts.init(ref.current, undefined, { renderer: "canvas" })
    chartRef.current = chart
    const handleClick = (params: echarts.ECElementEvent) => {
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

  useEffect(() => {
    chartRef.current?.setOption(option, true)
  }, [option])

  return <div ref={ref} className={className} />
}
