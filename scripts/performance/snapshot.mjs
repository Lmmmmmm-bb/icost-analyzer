import assert from "node:assert/strict"
import { writeFile } from "node:fs/promises"
import { join } from "node:path"
import { snapshot, generateReport } from "lighthouse"
import desktopConfig from "lighthouse/core/config/desktop-config.js"
import { launchBrowser, pause, upload, visitCharts } from "./browser.mjs"
import { createFixture } from "./fixtures.mjs"

export async function snapshots(config) {
  const fixture = await createFixture(config.output, 10000)
  const browser = await launchBrowser(config.chrome)
  const results = []
  try {
    for (const theme of ["light", "dark"]) {
      const context = await browser.createBrowserContext()
      try {
        const page = await context.newPage()
        await page.setViewport({ width: 1440, height: 1000 })
        await page.emulateTimezone("Asia/Shanghai")
        await page.emulateMediaFeatures([
          { name: "prefers-color-scheme", value: theme },
        ])
        await page.goto(config.url, { waitUntil: "networkidle0" })
        await upload(page, fixture.file, fixture.count)
        for (const label of [
          "分类汇总排序",
          "标签汇总排序",
          "账户支出排序",
          "热力图颜色范围",
          "交易明细排序",
          "每页交易条数",
        ]) {
          const trigger = await page.$(`button[aria-label="${label}"]`)
          assert.ok(trigger, `缺少控件：${label}`)
          await trigger.scrollIntoView()
          await trigger.focus()
          await page.keyboard.press("ArrowDown")
          await page.waitForFunction(
            (trigger) => {
              const list = document.getElementById(
                trigger.getAttribute("aria-controls")
              )
              return (
                trigger.getAttribute("aria-expanded") === "true" &&
                list?.contains(document.activeElement)
              )
            },
            {},
            trigger
          )
          await page.keyboard.press("Escape")
          await page.waitForFunction(
            (trigger) =>
              trigger.getAttribute("aria-expanded") === "false" &&
              document.activeElement === trigger,
            {},
            trigger
          )
          assert.ok(
            await trigger.evaluate((el) => document.activeElement === el),
            "关闭弹层后焦点没有返回触发器"
          )
        }
        await visitCharts(page)
        await page.evaluate(() => scrollTo(0, 0))
        await pause(1000)
        const result = await snapshot(page, {
          config: desktopConfig,
          flags: {
            logLevel: "error",
            onlyCategories: ["accessibility", "best-practices", "seo"],
          },
        })
        await writeFile(
          join(config.output, `dashboard-${theme}.json`),
          JSON.stringify(result.lhr, null, 2)
        )
        await writeFile(
          join(config.output, `dashboard-${theme}.html`),
          generateReport(result.lhr)
        )
        await page.screenshot({
          path: join(config.output, `dashboard-${theme}.png`),
          fullPage: true,
        })
        const failed = [
          "button-name",
          "color-contrast",
          "heading-order",
          "label-content-name-mismatch",
        ].filter((id) => result.lhr.audits[id]?.score === 0)
        results.push({
          theme,
          accessibility: result.lhr.categories.accessibility.score,
          failed,
        })
        console.log(JSON.stringify(results.at(-1)))
      } finally {
        await context.close()
      }
    }
  } finally {
    await browser.close()
  }
  await writeFile(
    join(config.output, "snapshots.json"),
    JSON.stringify(results, null, 2)
  )
  assert.ok(
    results.every((r) => r.accessibility >= 0.95 && !r.failed.length),
    "看板可访问性验收失败，详情见报告"
  )
}
