import { useCallback, useEffect, useRef, useState } from "react"

import type { Transaction } from "../model/types"
import { parseWorkbook } from "./workbook-parser"

const PARSING_STATUS_DELAY_MS = 650
const PARSING_STATUS_MIN_VISIBLE_MS = 700
const LARGE_FILE_HINT_BYTES = 2 * 1024 * 1024

export type WorkbookUploadState = {
  error: string
  isParsing: boolean
  showParsingStatus: boolean
  parsingFileName: string
}

const IDLE_UPLOAD_STATE: WorkbookUploadState = {
  error: "",
  isParsing: false,
  showParsingStatus: false,
  parsingFileName: "",
}

type UseWorkbookUploadOptions = {
  onParsed: (parsed: Transaction[], file: File) => void | Promise<void>
}

export function useWorkbookUpload({ onParsed }: UseWorkbookUploadOptions) {
  const uploadSeq = useRef(0)
  const isParsingRef = useRef(false)
  const statusDelayTimer = useRef<number | null>(null)
  const statusExitTimer = useRef<number | null>(null)
  const resolveStatusExitWait = useRef<(() => void) | null>(null)
  const statusVisibleAt = useRef<number | null>(null)
  const [uploadState, setUploadState] =
    useState<WorkbookUploadState>(IDLE_UPLOAD_STATE)

  const clearStatusDelayTimer = useCallback(() => {
    if (statusDelayTimer.current === null) return
    window.clearTimeout(statusDelayTimer.current)
    statusDelayTimer.current = null
  }, [])

  const clearStatusExitTimer = useCallback(() => {
    if (statusExitTimer.current !== null) {
      window.clearTimeout(statusExitTimer.current)
      statusExitTimer.current = null
    }
    resolveStatusExitWait.current?.()
    resolveStatusExitWait.current = null
  }, [])

  const showParsingStatus = useCallback((seq: number) => {
    if (seq !== uploadSeq.current || statusVisibleAt.current !== null) return
    statusVisibleAt.current = performance.now()
    setUploadState((current) => ({ ...current, showParsingStatus: true }))
  }, [])

  const waitForNextPaint = useCallback(() => {
    return new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve())
    })
  }, [])

  const waitBeforeLeavingParsingStatus = useCallback(async () => {
    clearStatusDelayTimer()
    const visibleAt = statusVisibleAt.current
    if (visibleAt === null) return

    const elapsed = performance.now() - visibleAt
    const remaining = PARSING_STATUS_MIN_VISIBLE_MS - elapsed
    if (remaining <= 0) return

    await new Promise<void>((resolve) => {
      resolveStatusExitWait.current = resolve
      statusExitTimer.current = window.setTimeout(() => {
        statusExitTimer.current = null
        resolveStatusExitWait.current = null
        resolve()
      }, remaining)
    })
  }, [clearStatusDelayTimer])

  const finishParsing = useCallback(() => {
    clearStatusDelayTimer()
    clearStatusExitTimer()
    statusVisibleAt.current = null
    isParsingRef.current = false
    setUploadState((current) => ({
      ...current,
      isParsing: false,
      showParsingStatus: false,
      parsingFileName: "",
    }))
  }, [clearStatusDelayTimer, clearStatusExitTimer])

  const cancelPendingUpload = useCallback(() => {
    uploadSeq.current += 1
    clearStatusDelayTimer()
    clearStatusExitTimer()
    statusVisibleAt.current = null
    isParsingRef.current = false
  }, [clearStatusDelayTimer, clearStatusExitTimer])

  const resetUpload = useCallback(() => {
    cancelPendingUpload()
    setUploadState(IDLE_UPLOAD_STATE)
  }, [cancelPendingUpload])

  const uploadWorkbook = useCallback(
    async (file: File) => {
      if (isParsingRef.current) return

      const seq = (uploadSeq.current += 1)
      isParsingRef.current = true
      setUploadState({
        error: "",
        isParsing: true,
        showParsingStatus: false,
        parsingFileName: file.name,
      })
      statusDelayTimer.current = window.setTimeout(() => {
        statusDelayTimer.current = null
        showParsingStatus(seq)
      }, PARSING_STATUS_DELAY_MS)

      try {
        const buffer = await file.arrayBuffer()
        if (seq !== uploadSeq.current) return

        if (file.size >= LARGE_FILE_HINT_BYTES) {
          clearStatusDelayTimer()
          showParsingStatus(seq)
          await waitForNextPaint()
        }

        const parsed = await parseWorkbook(buffer)
        if (seq !== uploadSeq.current) return
        if (!parsed.length)
          throw new Error("未识别到有效交易记录，请确认是 iCost 导出的 Excel。")

        await waitBeforeLeavingParsingStatus()
        if (seq !== uploadSeq.current) return
        await onParsed(parsed, file)
      } catch (uploadError) {
        if (seq !== uploadSeq.current) return
        await waitBeforeLeavingParsingStatus()
        if (seq !== uploadSeq.current) return
        setUploadState((current) => ({
          ...current,
          error:
            uploadError instanceof Error
              ? uploadError.message
              : "Excel 解析失败",
        }))
      } finally {
        if (seq === uploadSeq.current) finishParsing()
      }
    },
    [
      clearStatusDelayTimer,
      finishParsing,
      onParsed,
      showParsingStatus,
      waitBeforeLeavingParsingStatus,
      waitForNextPaint,
    ]
  )

  useEffect(() => cancelPendingUpload, [cancelPendingUpload])

  return {
    uploadState,
    uploadWorkbook,
    resetUpload,
  }
}
