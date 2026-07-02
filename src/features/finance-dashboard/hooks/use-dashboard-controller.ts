import { useCallback, useState } from "react"

import { DEFAULT_RATES, EMPTY_FILTERS } from "../model/constants"
import {
  type AccountSort,
  RANK_LEVELS,
  type DetailSort,
  type RankLevel,
  type SummarySort,
  type TagSort,
} from "../model/dashboard-controls"
import { createRatesForCurrencies, makeRateInputs } from "../model/rate-inputs"
import type { Filters, RateMap, Transaction } from "../model/types"
import { unique } from "../model/collections"
import { getMonthDateRange } from "../model/date"
import { useWorkbookUpload } from "../upload/use-workbook-upload"
import { useDashboardAnalysis } from "./use-dashboard-analysis"

export function useDashboardController() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [fileName, setFileName] = useState("")
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [rates, setRates] = useState<RateMap>(DEFAULT_RATES)
  const [rateInputs, setRateInputs] = useState<Record<string, string>>(
    makeRateInputs(DEFAULT_RATES)
  )
  const [drillCategory, setDrillCategory] = useState("")
  const [rankLevel, setRankLevel] = useState<RankLevel>(RANK_LEVELS[0])
  const [summarySort, setSummarySort] = useState<SummarySort>("amount")
  const [tagSort, setTagSort] = useState<TagSort>("amount")
  const [accountSort, setAccountSort] = useState<AccountSort>("amount")
  const [detailSort, setDetailSort] = useState<DetailSort>("date")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  const analysis = useDashboardAnalysis({
    transactions,
    filters,
    rates,
    drillCategory,
    rankLevel,
    summarySort,
    tagSort,
    accountSort,
    detailSort,
    page,
    pageSize,
  })

  const resetAnalysisControls = useCallback(() => {
    setFilters(EMPTY_FILTERS)
    setDrillCategory("")
    setRankLevel(RANK_LEVELS[0])
    setSummarySort("amount")
    setTagSort("amount")
    setAccountSort("amount")
    setDetailSort("date")
    setPage(1)
  }, [])

  const applyParsedWorkbook = useCallback(
    (parsed: Transaction[], file: File) => {
      setTransactions(parsed)
      setFileName(file.name)
      resetAnalysisControls()
      const currencies = unique(parsed.map((tx) => tx.currency))
      const nextRates = createRatesForCurrencies(currencies)
      setRates(nextRates)
      setRateInputs(makeRateInputs(nextRates))
    },
    [resetAnalysisControls]
  )

  const { uploadState, uploadWorkbook } = useWorkbookUpload({
    onParsed: applyParsedWorkbook,
  })

  const applyMonth = useCallback((month: string) => {
    setFilters((current) => ({
      ...current,
      quickRange: EMPTY_FILTERS.quickRange,
      year: "",
      ...getMonthDateRange(month),
    }))
  }, [])

  const resetDrill = useCallback(() => setDrillCategory(""), [])
  const selectTag = useCallback((tag: string) => {
    setFilters((current) => ({ ...current, tags: [tag], excludedTags: [] }))
  }, [])
  const selectCategory = useCallback((category: string) => {
    setFilters((current) => ({ ...current, categories: [category] }))
  }, [])
  const selectAccount = useCallback((account: string) => {
    setFilters((current) => ({ ...current, accounts: [account] }))
  }, [])

  return {
    transactions,
    fileName,
    filters,
    rates,
    rateInputs,
    drillCategory,
    rankLevel,
    summarySort,
    tagSort,
    accountSort,
    detailSort,
    pageSize,
    uploadState,
    uploadWorkbook,
    hasTransactions: transactions.length > 0,
    hasAnalysisCharts: analysis.filtered.length > 0,
    analysis,
    setFilters,
    setRates,
    setRateInputs,
    setDrillCategory,
    setRankLevel,
    setSummarySort,
    setTagSort,
    setAccountSort,
    setDetailSort,
    setPage,
    setPageSize,
    applyMonth,
    resetDrill,
    selectTag,
    selectCategory,
    selectAccount,
  }
}

export type DashboardController = ReturnType<typeof useDashboardController>
