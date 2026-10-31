import { useCallback, useMemo, useState } from "react"

import { useAgentAccess } from "../agent/use-agent-access"
import { unique } from "../model/collections"
import type { Transaction } from "../model/types"
import type { TransactionSearchIndex } from "@/features/finance-dashboard/model/transaction-search"
import type { PreparedWorkbook } from "@/features/finance-dashboard/upload/prepare-workbook"
import { useWorkbookUpload } from "../upload/use-workbook-upload"
import { useDashboardAnalysis } from "./use-dashboard-analysis"
import { useDashboardViewModel } from "./use-dashboard-view-model"
import { useDashboardViewState } from "./use-dashboard-view-state"
import { useExchangeRates } from "./use-exchange-rates"

export function useDashboardController() {
  const [workbook, setWorkbook] = useState<{
    transactions: Transaction[]
    fileName: string
    searchIndex: TransactionSearchIndex
  }>(() => ({ transactions: [], fileName: "", searchIndex: new Map() }))
  const { state: view, actions } = useDashboardViewState()
  const exchange = useExchangeRates()
  const { rates, initialize: initializeRates } = exchange
  const { transactions, fileName, searchIndex } = workbook
  const { filters } = view
  const context = useMemo(
    () => ({ transactions, filters, rates, asOf: new Date().toISOString() }),
    [transactions, filters, rates]
  )
  const analysis = useDashboardAnalysis({ ...context, searchIndex })
  const display = useDashboardViewModel({ analysis, view, rates })
  const agentAccess = useAgentAccess({
    ...context,
    currentViewRows: analysis.filtered,
  })

  const applyParsedWorkbook = useCallback(
    ({ transactions: parsed, searchIndex }: PreparedWorkbook, file: File) => {
      setWorkbook({ transactions: parsed, fileName: file.name, searchIndex })
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
    totalRows: transactions.length,
    fileName,
    asOf: context.asOf,
    view,
    actions,
    exchange,
    analysis,
    display,
    agentAccess,
    uploadState,
    uploadWorkbook,
    hasTransactions: transactions.length > 0,
    hasAnalysisCharts: analysis.filtered.length > 0,
  }
}

export type DashboardController = ReturnType<typeof useDashboardController>
