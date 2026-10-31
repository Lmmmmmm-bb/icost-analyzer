import { useCallback, useMemo, useState } from "react"

import { useAgentAccess } from "../agent/use-agent-access"
import { unique } from "../model/collections"
import type { Transaction } from "../model/types"
import { useWorkbookUpload } from "../upload/use-workbook-upload"
import { useDashboardAnalysis } from "./use-dashboard-analysis"
import { useDashboardViewState } from "./use-dashboard-view-state"
import { useExchangeRates } from "./use-exchange-rates"

export function useDashboardController() {
  const [workbook, setWorkbook] = useState<{
    transactions: Transaction[]
    fileName: string
  }>({ transactions: [], fileName: "" })
  const { state: view, actions } = useDashboardViewState()
  const exchange = useExchangeRates()
  const { rates, initialize: initializeRates } = exchange
  const { transactions, fileName } = workbook
  const { filters } = view
  const context = useMemo(
    () => ({ transactions, filters, rates, asOf: new Date().toISOString() }),
    [transactions, filters, rates]
  )
  const analysis = useDashboardAnalysis({ ...view, ...context })
  const agentAccess = useAgentAccess({
    ...context,
    currentViewRows: analysis.filtered,
  })

  const applyParsedWorkbook = useCallback(
    (parsed: Transaction[], file: File) => {
      setWorkbook({ transactions: parsed, fileName: file.name })
      actions.applyWorkbook()
      initializeRates(unique(parsed.map((tx) => tx.currency)))
    },
    [actions, initializeRates]
  )
  const { uploadState, uploadWorkbook } = useWorkbookUpload({
    onParsed: applyParsedWorkbook,
    onStart: agentAccess.revokeForUpload,
    onFinish: agentAccess.finishUpload,
  })

  return {
    transactions,
    fileName,
    asOf: context.asOf,
    view,
    actions,
    exchange,
    analysis,
    agentAccess,
    uploadState,
    uploadWorkbook,
    hasTransactions: transactions.length > 0,
    hasAnalysisCharts: analysis.filtered.length > 0,
  }
}

export type DashboardController = ReturnType<typeof useDashboardController>
