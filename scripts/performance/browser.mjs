import { access, readFile } from "node:fs/promises"
import { resolve } from "node:path"
import puppeteer from "puppeteer-core"

export const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export async function launchBrowser(executablePath) {
  const candidates = [
    executablePath,
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter(Boolean)
  let chrome
  for (const candidate of candidates) {
    try {
      await access(candidate)
      chrome = candidate
      break
    } catch {
      if (
        candidate === executablePath ||
        candidate === process.env.CHROME_PATH
      ) {
        throw new Error("指定的浏览器不存在")
      }
    }
  }
  if (!chrome) throw new Error("请用 --chrome 或 CHROME_PATH 指定 Chrome")
  return puppeteer.launch({
    executablePath: chrome,
    headless: chrome.includes("headless-shell") ? "shell" : true,
    args: [
      "--no-first-run",
      "--disable-extensions",
      "--no-default-browser-check",
      "--disable-background-timer-throttling",
      "--disable-renderer-backgrounding",
    ],
  })
}

export async function instrument(page) {
  const vitals = await readFile(
    new URL("./web-vitals.iife.js", import.meta.resolve("web-vitals")),
    "utf8"
  )
  await page.evaluateOnNewDocument(vitals)
  await page.evaluateOnNewDocument(() => {
    window.__performanceAudit = { vitals: {}, tasks: [], events: [], marks: {} }
    const audit = window.__performanceAudit
    for (const name of ["onLCP", "onCLS", "onINP", "onFCP", "onTTFB"]) {
      window.webVitals[name](
        ({ name, value }) => {
          audit.vitals[name] = value
        },
        { reportAllChanges: true }
      )
    }
    new PerformanceObserver((list) => {
      audit.tasks.push(
        ...list
          .getEntries()
          .map(({ startTime, duration }) => ({ start: startTime, duration }))
      )
    }).observe({ type: "longtask", buffered: true })
    new PerformanceObserver((list) => {
      audit.events.push(
        ...list
          .getEntries()
          .filter((e) => e.interactionId)
          .map(({ startTime, duration, interactionId }) => ({
            start: startTime,
            duration,
            interactionId,
          }))
      )
    }).observe({ type: "event", buffered: true, durationThreshold: 16 })
  })
}

export async function mark(page, name) {
  await page.evaluate((name) => {
    window.__performanceAudit.marks[name] = performance.now()
  }, name)
}

export async function nextPaint(page) {
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve))
      )
  )
}

export async function clickButton(page, text) {
  const handle = await page.evaluateHandle(
    (text) =>
      [...document.querySelectorAll("button")].find(
        (b) => b.textContent.trim() === text && !b.disabled
      ),
    text
  )
  const element = handle.asElement()
  if (!element) throw new Error(`找不到按钮：${text}`)
  await element.scrollIntoView()
  await pause(150)
  await element.click()
  await handle.dispose()
}

export async function expectRows(page, count) {
  await page.waitForFunction(
    (count) =>
      [...document.querySelectorAll('[data-slot="card-description"]')].some(
        (e) => e.textContent.includes(`共 ${count} 条匹配记录`)
      ),
    {},
    count
  )
}

export async function upload(page, file, count) {
  await (await page.$('input[type="file"]')).uploadFile(resolve(file))
  await expectRows(page, count)
  await page.waitForFunction(
    () =>
      !document.querySelector('button[aria-busy="true"]') &&
      ![...document.querySelectorAll('[role="status"]')].some((e) =>
        /解析|准备分析/.test(e.textContent)
      )
  )
  await nextPaint(page)
}

export async function visitCharts(page) {
  // Visit the whole page, including charts created after the first viewport.
  for (
    let y = 0;
    y < (await page.evaluate(() => document.documentElement.scrollHeight));
    y += 650
  ) {
    await page.evaluate((y) => scrollTo(0, y), y)
    await pause(120)
  }
  await pause(600)
}

export async function pageStats(page) {
  return page.evaluate(() => ({
    nodes: document.querySelectorAll("*").length,
    charts: document.querySelectorAll("[_echarts_instance_]").length,
    heapBytes: performance.memory?.usedJSHeapSize,
    overflow: document.documentElement.scrollWidth > innerWidth,
    resources: performance.getEntriesByType("resource").map((r) => ({
      file: new URL(r.name).pathname.split("/").at(-1),
      bytes: r.encodedBodySize,
    })),
  }))
}
