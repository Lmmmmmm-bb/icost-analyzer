import { performance } from "node:perf_hooks"
import { fileURLToPath } from "node:url"
import { createRequire } from "node:module"
import { existsSync } from "node:fs"
import {
  mkdtemp,
  readdir,
  readFile,
  mkdir,
  writeFile,
  rm,
} from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import ts from "typescript"

// Compile only the pure model and generated fixtures into an isolated directory.
// Compilation and data generation are outside timings. No browser or server runs.
const root = fileURLToPath(
  new URL("../src/features/finance-dashboard/", import.meta.url)
)
const output = await mkdtemp(path.join(tmpdir(), "icost-analytics-benchmark-"))
async function compileDirectory(relative) {
  const directory = path.join(root, relative)
  await mkdir(path.join(output, relative), { recursive: true })
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const name = path.join(relative, entry.name)
    if (entry.isDirectory()) await compileDirectory(name)
    else if (entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts")) {
      const source = await readFile(path.join(root, name), "utf8")
      const result = ts.transpileModule(source, {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2023,
        },
      })
      await writeFile(
        path.join(output, name.replace(/\.ts$/, ".js")),
        result.outputText
      )
    }
  }
}

try {
  await writeFile(path.join(output, "package.json"), '{"type":"commonjs"}')
  await compileDirectory("model")
  await compileDirectory("testing")
  const load = createRequire(path.join(output, "package.json"))
  const analytics = load("./model/analytics.js")
  const details = existsSync(path.join(output, "model/transaction-details.js"))
    ? load("./model/transaction-details.js")
    : null
  const filtering = load("./model/filtering.js")
  const constants = load("./model/constants.js")
  const fixtures = load("./testing/transactions.js")
  // The fallbacks let the same harness run against the characterization commit.
  const monthly = analytics.getMonthlySummary ?? analytics.getMonthly
  const daily = analytics.getDailySummary ?? analytics.getDailyCashflow
  const rates = { CNY: 1, USD: 7 }
  const now = new Date(2026, 9, 31, 12)
  function measure(run) {
    const timings = []
    for (let i = 0; i < 10; i++) {
      const start = performance.now()
      run()
      if (i) timings.push(performance.now() - start)
    }
    timings.sort((a, b) => a - b)
    return Number(timings[4].toFixed(2))
  }
  function aggregate(rows, fx) {
    analytics.getStats(rows, fx)
    monthly(rows, fx)
    daily(rows, fx)
    for (const key of ["category", "subcategory", "currency", "account1"])
      analytics.summarizeBy(rows, fx, (row) => row[key])
    analytics.getWeekSummary(rows, fx)
    analytics.getHeatmap(rows, fx)
  }
  const results = [1000, 10000, 50000].map((count) => {
    const rows = fixtures.generateTransactions(count)
    return {
      rows: count,
      aggregateMs: measure(() => aggregate(rows, rates)),
      keywordAndAggregateMs: measure(() =>
        aggregate(
          filtering.filterTransactions(
            rows,
            { ...constants.EMPTY_FILTERS, keyword: "演示分类 3" },
            ...("time" in constants.EMPTY_FILTERS ? [now] : [false, now])
          ),
          rates
        )
      ),
      rateChangeMs: measure(() => aggregate(rows, { ...rates, USD: 8 })),
      openMonthMs: measure(() =>
        details
          ? details.selectMonthDetails(rows, rates, "2026-01")
          : monthly(rows, rates).find((item) => item.month === "2026-01")?.bills
      ),
    }
  })
  console.log(
    JSON.stringify(
      {
        environment:
          "Node; generated data; median of 9 warm runs; excludes parsing, React and chart rendering",
        results,
      },
      null,
      2
    )
  )
} finally {
  await rm(output, { recursive: true, force: true })
}
