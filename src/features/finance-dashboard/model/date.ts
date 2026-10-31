export function dateKey(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function parseDateKey(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)

  if (!match) return undefined

  const [, year, month, day] = match
  const date = new Date(Number(year), Number(month) - 1, Number(day))

  return dateKey(date) === value ? date : undefined
}

export function isSameDate(a: Date, b: Date) {
  return dateKey(a) === dateKey(b)
}

export function getMonthDateRange(month: string) {
  const year = Number(month.slice(0, 4))
  const monthIndex = Number(month.slice(5, 7)) - 1

  return {
    startDate: `${month}-01`,
    endDate: dateKey(new Date(year, monthIndex + 1, 0)),
  }
}

export function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}
