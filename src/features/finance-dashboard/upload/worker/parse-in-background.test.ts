import { afterEach, describe, expect, it, vi } from "vitest"
import * as XLSX from "xlsx"
import { parseWorkbookInBackground } from "@/features/finance-dashboard/upload/worker/parse-in-background"
import { parseWorkbookWithDiagnostics } from "@/features/finance-dashboard/upload/workbook-parser"
import {
  WORKBOOK_PARSE_ERROR,
  type WorkbookParseResponse,
} from "@/features/finance-dashboard/upload/worker/protocol"

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

function fixture() {
  const book = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(
    book,
    XLSX.utils.aoa_to_sheet([
      ["日期", "金额", "分类"],
      ["2024-02-29 12:30", -12.5, "虚构分类"],
      ["2024-02-30", -9, "无效日期"],
    ]),
    "虚构账单"
  )
  return XLSX.write(book, { type: "array", bookType: "xlsx" }) as ArrayBuffer
}

afterEach(() => vi.useRealTimers())

describe("background workbook parsing", () => {
  it("transfers once after ready, ignores stale results and disposes after success", async () => {
    const buffer = fixture()
    const expected = await parseWorkbookWithDiagnostics(buffer)
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
      result: structuredClone(expected),
    })
    expect(await result).toEqual(expected)
    expect((await result).transactions[0].date).toBeInstanceOf(Date)
    expect(worker.terminate).toHaveBeenCalledOnce()
    expect(worker.onmessage).toBeNull()
  })

  it.each([false, true])(
    "aborts a pending task (already transferred: %s) without accepting late results",
    async (ready) => {
      const worker = new FakeWorker()
      const abort = new AbortController()
      const result = parseWorkbookInBackground(
        fixture(),
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
    }
  )

  it("does not construct a worker for an already cancelled upload", async () => {
    const controller = new AbortController()
    controller.abort()
    const factory = vi.fn(() => new FakeWorker())
    await expect(
      parseWorkbookInBackground(fixture(), controller.signal, factory)
    ).rejects.toMatchObject({ name: "AbortError" })
    expect(factory).not.toHaveBeenCalled()
  })

  it.each([null, false, 0, ""])(
    "rejects cancellation with a falsy reason: %s",
    async (reason) => {
      const worker = new FakeWorker()
      const controller = new AbortController()
      const result = parseWorkbookInBackground(
        fixture(),
        controller.signal,
        () => worker
      )
      const rejected = expect(result).rejects.toBe(reason)
      controller.abort(reason)
      await rejected
      expect(worker.terminate).toHaveBeenCalledOnce()
    }
  )

  it("falls back on a message failure before transferring the workbook", async () => {
    const buffer = fixture()
    const expected = await parseWorkbookWithDiagnostics(buffer)
    const worker = new FakeWorker()
    const result = parseWorkbookInBackground(
      buffer,
      new AbortController().signal,
      () => worker
    )
    worker.failMessage()
    expect(await result).toEqual(expected)
    expect(worker.postMessage).not.toHaveBeenCalled()
    expect(worker.terminate).toHaveBeenCalledOnce()
  })

  it("falls back to the same parser when construction or startup fails", async () => {
    const buffer = fixture()
    const expected = await parseWorkbookWithDiagnostics(buffer)
    expect(
      await parseWorkbookInBackground(
        buffer,
        new AbortController().signal,
        () => {
          throw new Error("unsupported")
        }
      )
    ).toEqual(expected)
    const worker = new FakeWorker()
    const result = parseWorkbookInBackground(
      buffer,
      new AbortController().signal,
      () => worker
    )
    worker.fail()
    expect(await result).toEqual(expected)
    expect(worker.postMessage).not.toHaveBeenCalled()
    expect(worker.terminate).toHaveBeenCalledOnce()
  })

  it("releases a worker that never starts before fallback", async () => {
    vi.useFakeTimers()
    const worker = new FakeWorker()
    const result = parseWorkbookInBackground(
      fixture(),
      new AbortController().signal,
      () => worker
    )
    await vi.advanceTimersByTimeAsync(10000)
    expect((await result).transactions).toHaveLength(1)
    expect(worker.terminate).toHaveBeenCalledOnce()
  })

  it.each(["error", "crash", "message-error"])(
    "does not reparse or disclose contents after transfer: %s",
    async (mode) => {
      const worker = new FakeWorker()
      const result = parseWorkbookInBackground(
        fixture(),
        new AbortController().signal,
        () => worker
      )
      const rejected = expect(result).rejects.toThrow(WORKBOOK_PARSE_ERROR)
      worker.send({ type: "ready" })
      if (mode === "error") worker.send({ type: "error", id: worker.taskId })
      else if (mode === "crash") worker.fail()
      else worker.failMessage()
      await rejected
      expect(worker.terminate).toHaveBeenCalledOnce()
    }
  )
})
