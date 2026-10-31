import assert from "node:assert/strict"
import { writeFile } from "node:fs/promises"
import { join } from "node:path"
import {
  clickButton,
  expectRows,
  launchBrowser,
  pause,
  upload,
  visitCharts,
} from "./browser.mjs"
import { createFixture } from "./fixtures.mjs"

export async function charts(config) {
  const fixture = await createFixture(config.output, 10000)
  const browser = await launchBrowser(config.chrome)
  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 1440, height: 1000 })
    await page.emulateTimezone("Asia/Shanghai")
    let errors = 0
    page.on("pageerror", () => errors++)
    await page.goto(config.url, { waitUntil: "networkidle0" })
    assert.equal(
      await page.$$eval("[_echarts_instance_]", (es) => es.length),
      0
    )
    assert.equal(
      await page.evaluate(() =>
        performance
          .getEntriesByType("resource")
          .some((r) => /charts-echarts|chart-renderer/.test(r.name))
      ),
      false
    )
    await upload(page, fixture.file, 10000)
    await pause(500)
    const initialCount = await page.$$eval(
      "[_echarts_instance_]",
      (es) => es.length
    )
    await visitCharts(page)
    const visitedCount = await page.$$eval(
      "[_echarts_instance_]",
      (es) => es.length
    )
    assert.equal(visitedCount, 10)
    assert.ok(initialCount < visitedCount, "屏幕外图表不应全部初始化")

    const findChart = () =>
      page.evaluateHandle(() =>
        [...document.querySelectorAll('[data-slot="card"]')]
          .find(
            (e) =>
              e.querySelector('[data-slot="card-title"]')?.textContent ===
              "支出分类占比"
          )
          .querySelector("[data-chart-active]")
      )
    let chart = (await findChart()).asElement()
    const signature = () =>
      chart.evaluate((e) =>
        [...e.querySelectorAll("svg text")].map((t) => t.textContent).join("|")
      )
    const reveal = async () => {
      await chart.scrollIntoView()
      await page.waitForFunction(
        (e) =>
          e.dataset.chartActive === "true" &&
          e.querySelector("[_echarts_instance_]")?.style.visibility ===
            "visible",
        {},
        chart
      )
      await pause(650)
    }
    await reveal()
    const baseline = await signature()
    assert.match(baseline, /支出合计/)
    const input = await page.$('input[placeholder^="搜索备注"]')
    await input.scrollIntoView()
    await page.waitForFunction(
      (e) => e.dataset.chartActive === "false",
      {},
      chart
    )
    await input.type("coffee", { delay: 80 })
    await expectRows(page, 2000)
    assert.equal(await signature(), baseline, "离屏图表应暂停更新")
    await reveal()
    const filtered = await signature()
    assert.notEqual(filtered, baseline, "重新进入必须显示当前筛选结果")
    await clickButton(page, "重置筛选")
    await expectRows(page, 10000)
    await reveal()
    assert.equal(await signature(), baseline, "重置后图表结果应恢复")

    await page.setViewport({ width: 900, height: 900 })
    await reveal()
    assert.equal(
      await chart.evaluate(
        (e) =>
          Math.round(e.getBoundingClientRect().width) ===
          Math.round(Number(e.querySelector("svg").getAttribute("width")))
      ),
      true,
      "图表尺寸应跟随容器"
    )
    await page.emulateMediaFeatures([
      { name: "prefers-color-scheme", value: "dark" },
    ])
    await page.waitForFunction(() =>
      document.documentElement.classList.contains("dark")
    )
    await reveal()
    await page.screenshot({ path: join(config.output, "chart-dark.png") })

    await input.scrollIntoView()
    await input.type("no-matching-fictional-row", { delay: 10 })
    await expectRows(page, 0)
    assert.equal(
      await page.$$eval("[_echarts_instance_]", (es) => es.length),
      0,
      "空结果应释放原有图表"
    )
    await clickButton(page, "重置筛选")
    await expectRows(page, 10000)
    chart = (await findChart()).asElement()
    await reveal()
    assert.equal(await signature(), baseline)
    const point = await chart.evaluate((e) => {
      const path = [...e.querySelectorAll("svg path")].find((p) => {
        const box = p.getBBox()
        return (
          p.getAttribute("fill") !== "none" && box.width > 70 && box.height > 70
        )
      })
      const box = path.getBBox()
      for (let x = 0.1; x < 1; x += 0.1)
        for (let y = 0.1; y < 1; y += 0.1) {
          const p = new DOMPoint(box.x + x * box.width, box.y + y * box.height)
          if (path.isPointInFill(p)) {
            const screen = p.matrixTransform(path.getScreenCTM())
            return { x: screen.x, y: screen.y }
          }
        }
    })
    assert.ok(point, "应存在可点击分类扇区")
    await page.mouse.click(point.x, point.y)
    await page.waitForFunction(() =>
      document.body.textContent.includes("返回一级分类")
    )
    await clickButton(page, "返回一级分类")
    await reveal()
    assert.equal(await signature(), baseline)
    assert.equal(errors, 0)
    const result = {
      initialCount,
      visitedCount,
      errors,
      checks: [
        "lazy-runtime",
        "lazy-instances",
        "offscreen-freeze",
        "latest-on-reentry",
        "reset",
        "resize",
        "theme",
        "empty-result",
      ],
    }
    await writeFile(
      join(config.output, "charts.json"),
      JSON.stringify(result, null, 2)
    )
    console.log(JSON.stringify(result))
  } finally {
    await browser.close()
  }
}
