import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { makeTransaction } from "@/features/finance-dashboard/testing/transactions"
import { parseWorkbookInBackground } from "@/features/finance-dashboard/upload/worker/parse-in-background"
import { parseWorkbookWithDiagnostics } from "@/features/finance-dashboard/upload/workbook-parser"
import {
  WORKBOOK_PARSE_ERROR,
  type WorkbookParseResponse,
} from "@/features/finance-dashboard/upload/worker/protocol"

vi.mock("@/features/finance-dashboard/upload/workbook-parser", () => ({
  parseWorkbookWithDiagnostics: vi.fn(),
}))

const parsedWorkbook = {
  transactions: [makeTransaction("parsed")],
  skippedRows: 1,
}

class FakeWorker {
  onmessage: Worker["onmessage"] = null
  onerror: Worker["onerror"] = null
  onmessageerror: Worker["onmessageerror"] = null
  postMessage = vi.fn<(message: unknown, transfer: Transferable[]) => void>()
  terminate = vi.fn()
  send(data: WorkbookParseResponse) {
    this.onmessage?.call(
      this as unknown as Worker,
      { data } as MessageEvent<WorkbookParseResponse>
    )
  }
  fail() {
    this.onerror?.call(
      this as unknown as Worker,
      { preventDefault: vi.fn() } as unknown as ErrorEvent
    )
  }
  failMessage() {
    this.onmessageerror?.call(this as unknown as Worker, {} as MessageEvent)
  }
  get taskId() {
    return (this.postMessage.mock.calls[0][0] as { id: number }).id
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(parseWorkbookWithDiagnostics).mockResolvedValue(parsedWorkbook)
})

afterEach(() => vi.useRealTimers())

describe("background workbook parsing", () => {
  it("transfers once after ready, ignores stale results and disposes after success", async () => {
    const buffer = new ArrayBuffer(1)
    const worker = new FakeWorker()
    const result = parseWorkbookInBackground(
      buffer,
      new AbortController().signal,
      () => worker
    )
    expect(worker.postMessage).not.toHaveBeenCalled()
    worker.send({ type: "ready" })
    worker.send({ type: "ready" })
    expect(worker.postMessage).toHaveBeenCalledExactlyOnceWith(
      { id: worker.taskId, buffer },
      [buffer]
    )
    worker.send({
      type: "result",
      id: worker.taskId + 1,
      result: { transactions: [], skippedRows: 0 },
    })
    expect(worker.terminate).not.toHaveBeenCalled()
    worker.send({
      type: "result",
      id: worker.taskId,
      result: parsedWorkbook,
    })
    expect(await result).toEqual(parsedWorkbook)
    expect(parseWorkbookWithDiagnostics).not.toHaveBeenCalled()
    expect(worker.terminate).toHaveBeenCalledOnce()
    expect(worker.onmessage).toBeNull()
  })

  it.each([false, true])(
    "aborts a pending task (already transferred: %s) without accepting late results",
    async (ready) => {
      const worker = new FakeWorker()
      const abort = new AbortController()
      const result = parseWorkbookInBackground(
        new ArrayBuffer(1),
        abort.signal,
        () => worker
      )
      const rejected = expect(result).rejects.toMatchObject({
        name: "AbortError",
      })
      if (ready) worker.send({ type: "ready" })
      abort.abort()
      worker.send({
        type: "result",
        id: 0,
        result: { transactions: [], skippedRows: 0 },
      })
      await rejected
      expect(worker.terminate).toHaveBeenCalledOnce()
      expect(parseWorkbookWithDiagnostics).not.toHaveBeenCalled()
    }
  )

  it("does not construct a worker for an already cancelled upload", async () => {
    const controller = new AbortController()
    controller.abort()
    const factory = vi.fn(() => new FakeWorker())
    await expect(
      parseWorkbookInBackground(new ArrayBuffer(1), controller.signal, factory)
    ).rejects.toMatchObject({ name: "AbortError" })
    expect(factory).not.toHaveBeenCalled()
  })

  it("rejects rather than resolving when cancellation has a falsy reason", async () => {
    const worker = new FakeWorker()
    const controller = new AbortController()
    const result = parseWorkbookInBackground(
      new ArrayBuffer(1),
      controller.signal,
      () => worker
    )
    const rejected = expect(result).rejects.toBe(false)
    controller.abort(false)
    await rejected
    expect(worker.terminate).toHaveBeenCalledOnce()
  })

  it("falls back to the parser when worker construction fails", async () => {
    const buffer = new ArrayBuffer(1)
    expect(
      await parseWorkbookInBackground(
        buffer,
        new AbortController().signal,
        () => {
          throw new Error("unsupported")
        }
      )
    ).toEqual(parsedWorkbook)
    expect(parseWorkbookWithDiagnostics).toHaveBeenCalledWith(buffer)
  })

  it.each(["crash", "message-error", "timeout"])(
    "releases the worker and falls back before transfer: %s",
    async (mode) => {
      vi.useFakeTimers()
      const buffer = new ArrayBuffer(1)
      const worker = new FakeWorker()
      const result = parseWorkbookInBackground(
        buffer,
        new AbortController().signal,
        () => worker
      )
      if (mode === "crash") worker.fail()
      else if (mode === "message-error") worker.failMessage()
      else await vi.runAllTimersAsync()
      expect(await result).toEqual(parsedWorkbook)
      expect(parseWorkbookWithDiagnostics).toHaveBeenCalledWith(buffer)
      expect(worker.postMessage).not.toHaveBeenCalled()
      expect(worker.terminate).toHaveBeenCalledOnce()
    }
  )

  it.each(["error", "crash", "message-error"])(
    "does not reparse or disclose contents after transfer: %s",
    async (mode) => {
      const worker = new FakeWorker()
      const result = parseWorkbookInBackground(
        new ArrayBuffer(1),
        new AbortController().signal,
        () => worker
      )
      const rejected = expect(result).rejects.toThrow(WORKBOOK_PARSE_ERROR)
      worker.send({ type: "ready" })
      if (mode === "error") worker.send({ type: "error", id: worker.taskId })
      else if (mode === "crash") worker.fail()
      else worker.failMessage()
      await rejected
      expect(parseWorkbookWithDiagnostics).not.toHaveBeenCalled()
      expect(worker.terminate).toHaveBeenCalledOnce()
    }
  )
})
