import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import type { Filters, RateMap, Transaction } from "../model/types"
import type { LedgerSnapshot } from "./query-types"
import type { AgentAccessState } from "./webmcp"

type AgentSupportStatus = "checking" | "ready" | "unsupported" | "error"

type UseAgentAccessOptions = {
  transactions: Transaction[]
  currentViewRows: Transaction[]
  filters: Filters
  rates: RateMap
}

function hasSiteToolSupport() {
  if (typeof document === "undefined") return false
  return (
    typeof (
      document as Document & { modelContext?: { registerTool?: unknown } }
    ).modelContext?.registerTool === "function"
  )
}

export function useAgentAccess({
  transactions,
  currentViewRows,
  filters,
  rates,
}: UseAgentAccessOptions) {
  const [enabled, setEnabled] = useState(false)
  const [supportStatus, setSupportStatus] = useState<AgentSupportStatus>(() =>
    hasSiteToolSupport() ? "checking" : "unsupported"
  )
  const [supportError, setSupportError] = useState("")
  const [lastToolCall, setLastToolCall] = useState("")
  const [uploadEpoch, setUploadEpoch] = useState(0)
  const enabledRef = useRef(false)
  const parsingRef = useRef(false)
  const snapshotRef = useRef<LedgerSnapshot | null>(null)

  const snapshot = useMemo<LedgerSnapshot>(
    () => ({
      contextId: crypto.randomUUID(),
      transactions,
      currentViewRows,
      filters,
      rates,
      asOf: new Date().toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      uploadEpoch,
    }),
    [transactions, currentViewRows, filters, rates, uploadEpoch]
  )

  useLayoutEffect(() => {
    snapshotRef.current = snapshot
    return () => {
      snapshotRef.current = null
    }
  }, [snapshot])

  const getState = useCallback(
    (): AgentAccessState => ({
      enabled: enabledRef.current,
      parsing: parsingRef.current,
      snapshot: snapshotRef.current,
    }),
    []
  )

  useEffect(() => {
    if (!hasSiteToolSupport()) return

    const registration = new AbortController()
    queueMicrotask(async () => {
      if (registration.signal.aborted) return
      try {
        const { getSiteToolContext, registerWebMcpTools } =
          await import("./webmcp")
        if (registration.signal.aborted) return
        const context = getSiteToolContext()
        if (!context) {
          setSupportStatus("unsupported")
          return
        }
        await registerWebMcpTools(
          context,
          getState,
          registration.signal,
          setLastToolCall
        )
        if (!registration.signal.aborted) setSupportStatus("ready")
      } catch {
        if (registration.signal.aborted) return
        registration.abort()
        setSupportStatus("error")
        setSupportError("浏览器未能注册页面分析工具，请刷新页面后重试。")
      }
    })
    return () => registration.abort()
  }, [getState])

  const enable = useCallback(() => {
    if (
      supportStatus !== "ready" ||
      parsingRef.current ||
      !snapshotRef.current?.transactions.length
    )
      return
    enabledRef.current = true
    setEnabled(true)
  }, [supportStatus])

  const disable = useCallback(() => {
    enabledRef.current = false
    setEnabled(false)
  }, [])

  const revokeForUpload = useCallback(() => {
    enabledRef.current = false
    parsingRef.current = true
    setEnabled(false)
    setLastToolCall("")
    setUploadEpoch((value) => value + 1)
  }, [])

  const finishUpload = useCallback(() => {
    parsingRef.current = false
  }, [])

  return {
    enabled,
    supportStatus,
    supportError,
    lastToolCall,
    enable,
    disable,
    revokeForUpload,
    finishUpload,
  }
}
