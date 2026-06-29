export function dateKey(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

const RANGE_ARROW = "→"

export function describeTimeRange(
  label: string,
  now: Date = new Date()
): string | null {
  const months = label.match(/^近\s*(\d+)\s*月$/)
  if (!months) return null

  const start = new Date(now)
  start.setMonth(start.getMonth() - Number(months[1]))

  return `${dateKey(start)} ${RANGE_ARROW} ${dateKey(now)}`
}
