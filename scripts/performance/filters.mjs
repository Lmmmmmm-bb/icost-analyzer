import assert from "node:assert/strict"
import { writeFile } from "node:fs/promises"
import { join } from "node:path"
import {
  clickButton,
  expectRows,
  launchBrowser,
  nextPaint,
  pause,
  upload,
} from "./browser.mjs"
import { createFixture } from "./fixtures.mjs"

export async function filters(config) {
  const fixture = await createFixture(config.output, 1000)
  const browser = await launchBrowser(config.chrome)
  const checks = []
  try {
    const page = await browser.newPage()
    let errors = 0
    page.on("pageerror", () => errors++)
    await page.setViewport({ width: 1440, height: 1000 })
    await page.goto(config.url, { waitUntil: "networkidle0" })
    await upload(page, fixture.file, 1000)
    await pause(1500)
    const geometry = () =>
      page.evaluate(() => {
        const dock = document.querySelector('[data-slot="filter-dock"]')
        const rect = dock.getBoundingClientRect()
        const parent = dock.parentElement
        const style = getComputedStyle(parent)
        return {
          top: rect.top,
          left: rect.left,
          right: rect.right,
          expectedLeft:
            parent.getBoundingClientRect().left + parseFloat(style.paddingLeft),
          expectedRight:
            parent.getBoundingClientRect().right -
            parseFloat(style.paddingRight),
          overflow: document.documentElement.scrollWidth > innerWidth,
        }
      })
    for (const width of [1440, 390, 1440]) {
      await page.setViewport({ width, height: 1000 })
      await page.evaluate(() => scrollTo(0, 0))
      await nextPaint(page)
      assert.ok((await geometry()).top > 12, "回到页首后筛选条应回到文档位置")
      await page.evaluate(() => {
        const dock = document.querySelector('[data-slot="filter-dock"]')
        scrollTo(0, dock.getBoundingClientRect().top + scrollY + 500)
      })
      await nextPaint(page)
      const rect = await geometry()
      assert.ok(Math.abs(rect.top - 12) < 1, "跳转滚动后筛选条应吸顶")
      assert.ok(Math.abs(rect.left - rect.expectedLeft) < 1)
      assert.ok(Math.abs(rect.right - rect.expectedRight) < 1)
      assert.equal(rect.overflow, false)
      checks.push({ width, top: rect.top, overflow: rect.overflow })
    }
    await clickButton(page, "调整筛选")
    const input = await page.waitForSelector(
      '[role="dialog"] input[placeholder^="搜索备注"]'
    )
    await input.type("coffee")
    await expectRows(page, 200)
    await page.keyboard.press("Escape")
    await page.waitForSelector('[role="dialog"]', { hidden: true })
    await expectRows(page, 200)
    await clickButton(page, "清空")
    await expectRows(page, 1000)
    assert.equal(errors, 0)
    await writeFile(
      join(config.output, "filters.json"),
      JSON.stringify({ checks, errors, dialog: true, clear: true }, null, 2)
    )
    console.log(JSON.stringify({ checks, errors, dialog: true, clear: true }))
  } finally {
    await browser.close()
  }
}
