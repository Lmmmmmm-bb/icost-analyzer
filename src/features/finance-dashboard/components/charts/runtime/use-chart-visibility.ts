import { useEffect, useRef, useState } from "react"

/** Keep a visited instance, but prepare/update it only near the viewport. */
export function useChartVisibility() {
  const ref = useRef<HTMLDivElement>(null)
  const [visibility, setVisibility] = useState(() => {
    const fallback = typeof IntersectionObserver === "undefined"
    return { active: fallback, hasEntered: fallback }
  })

  useEffect(() => {
    const element = ref.current
    if (!element || typeof IntersectionObserver === "undefined") return
    const observer = new IntersectionObserver(
      ([entry]) => {
        const active = entry.isIntersecting
        setVisibility((current) =>
          current.active === active
            ? current
            : { active, hasEntered: current.hasEntered || active }
        )
      },
      { rootMargin: "400px 0px" }
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return { ref, ...visibility }
}
