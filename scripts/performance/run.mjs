import { execFileSync } from "node:child_process"
import { mkdir, writeFile } from "node:fs/promises"
import { resolve } from "node:path"
import { parseArgs } from "node:util"
import { navigation } from "./navigation.mjs"
import { workflows } from "./workflow.mjs"
import { snapshots } from "./snapshot.mjs"
import { charts } from "./charts.mjs"
import { uploads } from "./uploads.mjs"

const { values } = parseArgs({
  options: {
    mode: { type: "string", default: "all" },
    url: { type: "string", default: "http://127.0.0.1:4173/" },
    output: { type: "string", default: "artifacts/performance.local" },
    chrome: { type: "string" },
    runs: { type: "string", default: "3" },
    counts: { type: "string", default: "1000,10000,50000" },
    cpus: { type: "string", default: "1,4" },
    reduced: { type: "boolean", default: false },
  },
})
const positiveIntegers = (input, limit) =>
  input.split(",").map((value) => {
    const n = Number(value)
    if (!Number.isSafeInteger(n) || n < 1 || n > limit)
      throw new Error("测试参数超出范围")
    return n
  })
const url = new URL(values.url)
if (
  !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
  url.protocol !== "http:"
)
  throw new Error("性能工作流仅支持本机 HTTP 生产预览")
if (!values.output.endsWith(".local"))
  throw new Error("请将报告输出到 Git 忽略的 .local 目录")
const modes = {
  navigation,
  workflow: workflows,
  snapshot: snapshots,
  charts,
  uploads,
}
if (values.mode !== "all" && !modes[values.mode])
  throw new Error("未知测试模式")
const config = {
  ...values,
  output: resolve(values.output),
  runs: positiveIntegers(values.runs, 10)[0],
  counts: positiveIntegers(values.counts, 100000),
  cpus: positiveIntegers(values.cpus, 8),
}
await mkdir(config.output, { recursive: true })
const response = await fetch(config.url)
if (!response.ok || (await response.text()).includes("/@vite/client"))
  throw new Error("请先构建并启动 pnpm preview，不能使用开发服务器")
await writeFile(
  resolve(config.output, `environment-${values.mode}.json`),
  JSON.stringify(
    {
      ...config,
      commit: execFileSync("git", ["rev-parse", "HEAD"], {
        encoding: "utf8",
      }).trim(),
      dirty: Boolean(
        execFileSync("git", ["status", "--porcelain"], {
          encoding: "utf8",
        }).trim()
      ),
      node: process.version,
      date: new Date().toISOString(),
    },
    null,
    2
  )
)
for (const mode of values.mode === "all"
  ? Object.values(modes)
  : [modes[values.mode]])
  await mode(config)
