import { parseWorkbookWithDiagnostics } from "@/features/finance-dashboard/upload/workbook-parser"
import {
  isParseRequest,
  type WorkbookParseResponse,
} from "@/features/finance-dashboard/upload/worker/protocol"

// Keep worker-only APIs local; the application is otherwise typed against DOM.
const scope = globalThis as unknown as {
  onmessage: (event: MessageEvent<unknown>) => void
  postMessage: (message: WorkbookParseResponse) => void
}
let started = false
scope.onmessage = async ({ data }) => {
  if (started || !isParseRequest(data)) return
  started = true
  try {
    const result = await parseWorkbookWithDiagnostics(data.buffer)
    scope.postMessage({ type: "result", id: data.id, result })
  } catch {
    // Parser errors may contain workbook contents; only send a fixed error code.
    scope.postMessage({ type: "error", id: data.id })
  }
}
scope.postMessage({ type: "ready" })
