import { stat } from "node:fs/promises"
import { join } from "node:path"
import * as XLSX from "xlsx"

// Deterministic, fictional records. Never read a user's workbook for a benchmark.
export async function createFixture(directory, count) {
  const categories = [
    "餐饮",
    "交通",
    "购物",
    "旅行",
    "订阅",
    "居住",
    "医疗",
    "学习",
    "娱乐",
    "运动",
    "通信",
    "其他",
  ]
  const rows = Array.from({ length: count }, (_, i) => ({
    日期:
      new Date(Date.UTC(2024, 0, 1) + (i % 1000) * 86400000)
        .toISOString()
        .slice(0, 10) + " 12:30:00",
    类型: i % 11 === 0 ? "收入" : "支出",
    金额: i % 11 === 0 ? 1000 + (i % 100) : -(5 + ((i * 37) % 30000) / 100),
    货币: ["CNY", "USD", "JPY"][i % 3],
    一级分类: categories[i % 12],
    二级分类: `虚构子分类${i % 24}`,
    账户1: `测试账户${i % 8}`,
    账本: `测试账本${i % 3}`,
    备注: i % 5 === 0 ? "coffee sample" : "generated sample",
    标签: `标签${i % 12},标签${(i + 1) % 12}`,
    位置: `虚构地点${i % 6}`,
  }))
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(rows),
    "虚构测试数据"
  )
  const file = join(directory, `fictional-${count}.xlsx`)
  XLSX.writeFile(workbook, file, { compression: true })
  return { file, count, bytes: (await stat(file)).size }
}
