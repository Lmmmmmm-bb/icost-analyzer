import assert from "node:assert/strict"
import { writeFile } from "node:fs/promises"
import { join } from "node:path"
import {
  clickButton,
  expectRows,
  instrument,
  launchBrowser,
  mark,
  nextPaint,
  pageStats,
  pause,
  upload,
  visitCharts,
} from "./browser.mjs"
import { createFixture } from "./fixtures.mjs"

export async function workflows(config) {
  const results = []
  const fixtures = new Map()
  for (const count of config.counts)
    fixtures.set(count, await createFixture(config.output, count))
  const browser = await launchBrowser(config.chrome)
  const browserVersion = await browser.version()
  try {
    for (const cpu of config.cpus)
      for (const count of config.counts) {
        if (cpu !== 1 && config.counts.includes(10000) && count !== 10000)
          continue
        for (let round = 1; round <= config.runs; round++) {
          console.log(`工作流：${count} 笔 / CPU ${cpu}× / 第 ${round} 轮`)
          const context = await browser.createBrowserContext()
          try {
            const page = await context.newPage()
            await page.setViewport({
              width: 1440,
              height: 1000,
              deviceScaleFactor: 1,
            })
            await page.emulateTimezone("Asia/Shanghai")
            await page.emulateMediaFeatures([
              { name: "prefers-color-scheme", value: "light" },
            ])
            await page.emulateCPUThrottling(cpu)
            await page.setCacheEnabled(false)
            let errors = 0
            page.on("pageerror", () => errors++)
            await instrument(page)
            await page.goto(config.url, { waitUntil: "networkidle0" })
            await pause(750)
            const initial = await pageStats(page)
            const phases = []
            const measure = async (name, action) => {
              await mark(page, `${name}:start`)
              await action()
              await nextPaint(page)
              await mark(page, `${name}:end`)
              await pause(500)
              phases.push(name)
            }
            await measure("upload", () =>
              upload(page, fixtures.get(count).file, count)
            )
            await pause(1000)
            const loaded = await pageStats(page)
            const typeKeyword = async () => {
              const input = await page.$('input[placeholder^="搜索备注"]')
              await input.scrollIntoView()
              await pause(350)
              await input.click()
              await input.type("coffee", { delay: 80 })
              await expectRows(page, Math.ceil(count / 5))
            }
            await measure("keyword", typeKeyword)
            await measure("reset", () => clickButton(page, "重置筛选"))
            await expectRows(page, count)
            await measure("expense", () => clickButton(page, "支出"))
            await expectRows(page, count - Math.ceil(count / 11))
            await measure("nextPage", () => clickButton(page, "下一页"))
            await page.waitForFunction(() =>
              document.body.textContent.includes("第 2 /")
            )
            await clickButton(page, "重置筛选")
            await visitCharts(page)
            const visited = await pageStats(page)
            await measure("visitedKeyword", typeKeyword)
            await measure("visitedReset", () => clickButton(page, "重置筛选"))
            await expectRows(page, count)
            const audit = await page.evaluate(() => window.__performanceAudit)
            const measurements = Object.fromEntries(
              phases.map((name) => {
                const start = audit.marks[`${name}:start`],
                  end = audit.marks[`${name}:end`]
                const tasks = audit.tasks.filter(
                  (e) => e.start >= start && e.start < end
                )
                const events = audit.events.filter(
                  (e) => e.start >= start && e.start < end
                )
                return [
                  name,
                  {
                    elapsedMs: end - start,
                    maxTaskMs: Math.max(0, ...tasks.map((e) => e.duration)),
                    blockingMs: tasks.reduce(
                      (sum, e) => sum + Math.max(0, e.duration - 50),
                      0
                    ),
                    maxEventMs: Math.max(0, ...events.map((e) => e.duration)),
                    longTasks: tasks.length,
                  },
                ]
              })
            )
            const row = {
              browserVersion,
              count,
              cpu,
              round,
              fixtureBytes: fixtures.get(count).bytes,
              initial,
              loaded,
              visited,
              phases: measurements,
              vitals: audit.vitals,
              errors,
            }
            results.push(row)
            await writeFile(
              join(config.output, "workflows.json"),
              JSON.stringify(results, null, 2)
            )
            console.log(
              JSON.stringify({
                count,
                cpu,
                round,
                phases: measurements,
                vitals: audit.vitals,
              })
            )
            assert.equal(errors, 0, "页面出现 JavaScript 错误")
            assert.equal(loaded.overflow, false, "出现整页水平溢出")
          } finally {
            await context.close()
          }
        }
      }
  } finally {
    await browser.close()
  }
}
