import type { WorkbookParseResult } from "@/features/finance-dashboard/upload/workbook-parser"
import {
  WORKBOOK_PARSE_ERROR,
  type WorkbookParseRequest,
  type WorkbookParseResponse,
} from "@/features/finance-dashboard/upload/worker/protocol"

type WorkerPort = Pick<
  Worker,
  "onmessage" | "onerror" | "onmessageerror" | "terminate"
> & {
  postMessage: (message: WorkbookParseRequest, transfer: Transferable[]) => void
}
type WorkerFactory = () => WorkerPort
type ParseOutcome =
  | { ok: true; result: WorkbookParseResult }
  | { ok: false; error: unknown }
class WorkerUnavailableError extends Error {}
let nextTaskId = 0

function createWorker(): WorkerPort {
  return new Worker(new URL("./workbook.worker.ts", import.meta.url), {
    type: "module",
  })
}

async function parseOnMainThread(buffer: ArrayBuffer, signal: AbortSignal) {
  signal.throwIfAborted()
  const { parseWorkbookWithDiagnostics } =
    await import("@/features/finance-dashboard/upload/workbook-parser")
  signal.throwIfAborted()
  try {
    const result = await parseWorkbookWithDiagnostics(buffer)
    signal.throwIfAborted()
    return result
  } catch {
    signal.throwIfAborted()
    throw new Error(WORKBOOK_PARSE_ERROR)
  }
}

/** One worker per upload. Fall back only before transferring the workbook. */
export async function parseWorkbookInBackground(
  buffer: ArrayBuffer,
  signal: AbortSignal,
  factory: WorkerFactory = createWorker
): Promise<WorkbookParseResult> {
  signal.throwIfAborted()
  let worker: WorkerPort
  try {
    worker = factory()
  } catch {
    return parseOnMainThread(buffer, signal)
  }
  try {
    return await new Promise<WorkbookParseResult>((resolve, reject) => {
      const id = ++nextTaskId
      let transferred = false
      let settled = false
      const finish = (outcome: ParseOutcome) => {
        if (settled) return
        settled = true
        clearTimeout(startTimer)
        signal.removeEventListener("abort", abort)
        worker.onmessage = null
        worker.onerror = null
        worker.onmessageerror = null
        worker.terminate()
        if (outcome.ok) resolve(outcome.result)
        else reject(outcome.error)
      }
      const fail = (error: unknown) => finish({ ok: false, error })
      const failWorker = () =>
        fail(
          transferred
            ? new Error(WORKBOOK_PARSE_ERROR)
            : new WorkerUnavailableError()
        )
      const abort = () => fail(signal.reason)
      const startTimer = setTimeout(
        () => fail(new WorkerUnavailableError()),
        10000
      )
      signal.addEventListener("abort", abort, { once: true })
      worker.onerror = (event) => {
        event.preventDefault()
        failWorker()
      }
      worker.onmessageerror = failWorker
      worker.onmessage = ({ data }: MessageEvent<WorkbookParseResponse>) => {
        if (!data || settled) return
        if (data.type === "ready") {
          if (transferred) return
          clearTimeout(startTimer)
          transferred = true
          try {
            worker.postMessage({ id, buffer }, [buffer])
          } catch {
            fail(new Error(WORKBOOK_PARSE_ERROR))
          }
          return
        }
        if (!transferred || data.id !== id) return
        if (data.type === "error") fail(new Error(WORKBOOK_PARSE_ERROR))
        else if (data.type === "result")
          finish({ ok: true, result: data.result })
      }
    })
  } catch (error) {
    if (error instanceof WorkerUnavailableError)
      return parseOnMainThread(buffer, signal)
    throw error
  }
}
