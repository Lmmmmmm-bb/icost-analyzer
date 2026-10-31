import { writeFile } from "node:fs/promises"
import { join } from "node:path"
import lighthouse from "lighthouse"
import desktopConfig from "lighthouse/core/config/desktop-config.js"
import { launchBrowser } from "./browser.mjs"

export async function navigation(config) {
  const results = []
  for (const reduced of config.reduced ? [false, true] : [false]) {
    for (let round = 1; round <= config.runs; round++) {
      for (const device of ["mobile", "desktop"]) {
        const browser = await launchBrowser(config.chrome)
        try {
          const page = await browser.newPage()
          await page.bringToFront()
          await page.emulateMediaFeatures([
            { name: "prefers-color-scheme", value: "light" },
            {
              name: "prefers-reduced-motion",
              value: reduced ? "reduce" : "no-preference",
            },
          ])
          const result = await lighthouse(
            config.url,
            {
              output: ["html", "json"],
              logLevel: "error",
              maxWaitForFcp: 10000,
              maxWaitForLoad: 15000,
              onlyCategories: [
                "performance",
                "accessibility",
                "best-practices",
                "seo",
              ],
            },
            device === "desktop" ? desktopConfig : undefined,
            page
          )
          const name = `${reduced ? "reduced" : "default"}-${device}-${round}`
          await writeFile(join(config.output, `${name}.html`), result.report[0])
          await writeFile(join(config.output, `${name}.json`), result.report[1])
          const { lhr } = result
          const row = {
            device,
            reduced,
            round,
            version: lhr.lighthouseVersion,
            config: lhr.configSettings,
            environment: lhr.environment,
            error: lhr.runtimeError,
            warnings: lhr.runWarnings,
            scores: Object.fromEntries(
              Object.entries(lhr.categories).map(([key, value]) => [
                key,
                value.score === null ? null : Math.round(value.score * 100),
              ])
            ),
            metrics: Object.fromEntries(
              [
                "first-contentful-paint",
                "largest-contentful-paint",
                "speed-index",
                "total-blocking-time",
                "cumulative-layout-shift",
              ].map((key) => [key, lhr.audits[key]?.numericValue])
            ),
          }
          results.push(row)
          await writeFile(
            join(config.output, "navigation.json"),
            JSON.stringify(results, null, 2)
          )
          console.log(
            JSON.stringify({
              name,
              scores: row.scores,
              metrics: row.metrics,
              error: row.error?.code,
            })
          )
        } finally {
          await browser.close()
        }
      }
    }
  }
  if (
    results.some(
      (r) =>
        r.error || Object.values(r.scores).some((s) => s === null || s < 95)
    )
  )
    throw new Error("首页 Lighthouse 验收失败，详情见报告")
}
