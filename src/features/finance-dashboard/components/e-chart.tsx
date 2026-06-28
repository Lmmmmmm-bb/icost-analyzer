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

  useEffect(() => {
    if (!ref.current) return
    const chart = echarts.init(ref.current, undefined, { renderer: "canvas" })
    chart.setOption(option, true)
    if (onClick) chart.on("click", onClick)
    const resize = () => chart.resize()
    window.addEventListener("resize", resize)
    return () => {
      window.removeEventListener("resize", resize)
      chart.dispose()
    }
  }, [option, onClick])

  return <div ref={ref} className={className} />
}
