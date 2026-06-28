export function unique<T>(items: T[]) {
  return Array.from(new Set(items)).sort((a, b) =>
    String(a).localeCompare(String(b), "zh-CN")
  )
}
