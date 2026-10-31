import assert from "node:assert/strict"
import { writeFile } from "node:fs/promises"
import { basename, join } from "node:path"
import * as XLSX from "xlsx"
import { expectRows, launchBrowser, upload } from "./browser.mjs"

function workbook(file, date1904, bookType) {
  const book = XLSX.utils.book_new()
  book.Workbook = { WBProps: { date1904 } }
  XLSX.utils.book_append_sheet(
    book,
    XLSX.utils.aoa_to_sheet([
      ["日期", "金额", "分类"],
      ["2024-02-29 12:30", -12.5, "虚构分类"],
      [45292, -10, "虚构分类"],
      ["2024-02-30", -99, "无效日期"],
      ["2024-03-01", "", "空金额"],
    ]),
    "虚构工作表"
  )
  XLSX.writeFile(book, file, { bookType })
}

export async function uploads(config) {
  const modern = join(config.output, "boundary-1904.xlsx")
  const legacy = join(config.output, "boundary-1900.xls")
  const corrupt = join(config.output, "corrupt.xlsx")
  workbook(modern, true, "xlsx")
  workbook(legacy, false, "xls")
  await writeFile(corrupt, Buffer.from([0x50, 0x4b, 0x03, 0x04, 0]))
  const browser = await launchBrowser(config.chrome)
  const results = []
  try {
    for (const fallback of [false, true]) {
      const context = await browser.createBrowserContext()
      try {
        const page = await context.newPage()
        await page.setViewport({ width: 1440, height: 1000 })
        await page.emulateTimezone("Asia/Shanghai")
        let errors = 0
        page.on("pageerror", () => errors++)
        await page.evaluateOnNewDocument((fallback) => {
          if (fallback)
            Object.defineProperty(window, "scheduler", { value: undefined })
          const OriginalWorker = window.Worker
          window.__workerAudit = { created: 0, terminated: 0 }
          window.Worker = class extends OriginalWorker {
            constructor(...args) {
              if (fallback) throw new Error("Simulated unavailable Worker")
              super(...args)
              window.__workerAudit.created++
            }
            terminate() {
              window.__workerAudit.terminated++
              super.terminate()
            }
          }
        }, fallback)
        await page.goto(config.url, { waitUntil: "networkidle0" })
        await upload(page, modern, 2)
        await page.waitForFunction(() =>
          document.body.textContent.includes("有 2 行缺少有效日期或金额")
        )
        const contains = (text) =>
          page.evaluate(
            (text) => document.body.textContent.includes(text),
            text
          )
        assert.ok(await contains("2028-01-02 00:00"))
        assert.ok(await contains("2024-02-29 12:30"))
        await (await page.$('input[type="file"]')).uploadFile(corrupt)
        await page.waitForFunction(() =>
          document.body.textContent.includes("解析失败")
        )
        await expectRows(page, 2)
        assert.ok(await contains("2028-01-02 00:00"), "替换失败必须保留原账单")
        await upload(page, legacy, 2)
        // Both files have two rows, so the old row count cannot signal completion.
        await page.waitForFunction(
          (name) =>
            [...document.querySelectorAll("span")].some(
              (element) => element.textContent.trim() === name
            ) && !document.querySelector('input[type="file"]:disabled'),
          {},
          basename(legacy)
        )
        assert.ok(await contains("2024-01-01 00:00"))
        assert.equal(await contains("2028-01-02 00:00"), false)
        assert.equal(await contains("解析失败"), false)
        const worker = await page.evaluate(() => window.__workerAudit)
        assert.equal(worker.created, fallback ? 0 : 3)
        assert.equal(worker.terminated, worker.created)
        assert.equal(errors, 0)
        await page.reload({ waitUntil: "networkidle0" })
        assert.equal(await contains("条匹配记录"), false, "刷新不能保留账单")
        results.push({
          fallback,
          worker,
          errors,
          checks: [
            "xlsx",
            "xls",
            "date1904",
            "leap-day",
            "invalid-rows",
            "failed-replacement",
            "retry",
            "worker-release",
            "no-ledger-after-refresh",
          ],
        })
      } finally {
        await context.close()
      }
    }
  } finally {
    await browser.close()
  }
  await writeFile(
    join(config.output, "uploads.json"),
    JSON.stringify(results, null, 2)
  )
  console.log(JSON.stringify(results))
}
