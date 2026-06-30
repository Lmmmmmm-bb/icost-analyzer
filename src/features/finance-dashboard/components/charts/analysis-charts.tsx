import { useMemo, useState } from "react"

import type { ECElementEvent } from "echarts"
import { zhCN } from "react-day-picker/locale"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, CalendarDayButton } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

import { dateKey } from "../../model/date"
import type {
  MonthlyBillItem,
  MonthlyItem,
  MonthlyLargestExpense,
} from "../../model/analytics-types"
import { formatMoney } from "../../model/money"
import { DashboardPanel } from "../shared/dashboard-panel"
import { EChart } from "./e-chart"
import { RANK_LEVELS, type ChartOptions, type RankLevel } from "./types"

type AnalysisChartsProps = {
  options: ChartOptions
  drillCategory: string
  rankLevel: RankLevel
  onApplyMonth: (month: string) => void
  onDrillCategoryChange: (category: string) => void
  onRankLevelChange: (level: RankLevel) => void
  onTagSelect: (tag: string) => void
}

export function AnalysisCharts({
  options,
  drillCategory,
  rankLevel,
  onApplyMonth,
  onDrillCategoryChange,
  onRankLevelChange,
  onTagSelect,
}: AnalysisChartsProps) {
  const dailyCashflowByDay = useMemo(
    () => new Map(options.dailyCashflow.map((item) => [item.day, item])),
    [options.dailyCashflow]
  )
  const latestCashflow = options.dailyCashflow.at(-1)
  const [selectedCashflowDay, setSelectedCashflowDay] = useState("")
  const safeSelectedCashflowDay = dailyCashflowByDay.has(selectedCashflowDay)
    ? selectedCashflowDay
    : latestCashflow?.day
  const selectedCashflowDate = safeSelectedCashflowDay
    ? dailyCashflowByDay.get(safeSelectedCashflowDay)?.date
    : undefined
  const selectedCashflow = safeSelectedCashflowDay
    ? dailyCashflowByDay.get(safeSelectedCashflowDay)
    : undefined
  const [reviewOpen, setReviewOpen] = useState(false)
  const [selectedReviewMonth, setSelectedReviewMonth] = useState("")
  function getName(params: ECElementEvent) {
    return String(params.name)
  }
  const monthlyReviewCards = useMemo(
    () =>
      [...options.monthlyReview].sort((a, b) => b.month.localeCompare(a.month)),
    [options.monthlyReview]
  )
  const selectedReview = selectedReviewMonth
    ? monthlyReviewCards.find((month) => month.month === selectedReviewMonth)
    : undefined

  return (
    <>
      <div className="grid gap-6">
        <Dialog
          open={reviewOpen}
          onOpenChange={(open) => {
            setReviewOpen(open)
            if (!open) setSelectedReviewMonth("")
          }}
        >
          <DashboardPanel
            title="月度收支趋势"
            description="柱状展示支出与收入，折线展示净结余；点击月份筛选到该月。"
            action={
              <DialogTrigger
                render={<Button type="button" variant="outline" size="xs" />}
              >
                打开月度复盘
              </DialogTrigger>
            }
          >
            <EChart
              option={options.monthlyOption}
              onClick={(params) => onApplyMonth(getName(params))}
            />
          </DashboardPanel>

          <DialogContent className="flex max-h-[min(48rem,calc(100svh-1rem))] flex-col overflow-hidden p-0 sm:max-w-5xl">
            <DialogHeader className="shrink-0 border-b border-border/70 bg-[radial-gradient(circle_at_18%_16%,color-mix(in_oklch,var(--primary),transparent_94%),transparent_38%),linear-gradient(135deg,color-mix(in_oklch,var(--muted),transparent_76%),transparent_64%)] p-5 pr-12">
              <div className="flex items-start justify-between gap-4">
                <div className="grid gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="w-fit font-mono">
                      MONTHLY REVIEW
                    </Badge>
                    {selectedReview ? (
                      <Badge variant="secondary" className="font-mono">
                        {selectedReview.month}
                      </Badge>
                    ) : null}
                  </div>
                  <DialogTitle className="font-heading text-2xl leading-tight font-semibold tracking-[-0.04em]">
                    {selectedReview ? "当月账单详情" : "月度财务复盘卡片"}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedReview
                      ? "按交易明细字段查看本月全部流水，确认日期、类型、分类、备注、标签、币种与金额。"
                      : "像翻阅一叠月末账单一样，逐月检查收入、支出、结余、储蓄率与本月最大消费线索。"}
                  </DialogDescription>
                </div>
                <div
                  aria-hidden="true"
                  className="hidden rotate-[-7deg] border border-primary/25 px-3 py-2 font-mono text-[10px] tracking-[0.2em] text-primary/70 uppercase opacity-60 sm:block"
                >
                  reconciled
                </div>
              </div>
            </DialogHeader>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
              {selectedReview ? (
                <MonthlyBillsDetail
                  month={selectedReview}
                  onBack={() => setSelectedReviewMonth("")}
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {monthlyReviewCards.map((month) => (
                    <article
                      key={month.month}
                      className="group/review relative overflow-hidden border border-border/80 bg-card/92 transition-colors hover:bg-card"
                    >
                      <div
                        aria-hidden="true"
                        className="absolute top-2 right-2 rotate-[-6deg] border border-border/45 bg-background/40 px-2 py-1 font-mono text-xl leading-none font-semibold tracking-[-0.06em] text-muted-foreground/20 select-none"
                      >
                        {month.month}
                      </div>
                      <div className="relative border-b border-border/70 p-4">
                        <div className="relative z-10 grid gap-1">
                          <div className="grid gap-1">
                            <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                              复盘月份
                            </p>
                            <div className="flex items-end justify-between gap-3">
                              <h3 className="font-heading text-xl leading-tight font-semibold tracking-tight">
                                {month.month}
                              </h3>
                              <Badge
                                className="w-fit shrink-0"
                                variant={
                                  month.net >= 0 ? "positive" : "destructive"
                                }
                              >
                                {month.net >= 0 ? "结余" : "透支"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="relative grid grid-cols-2 border-b border-border/70">
                        <ReviewMetric
                          label="本月收入"
                          value={formatMoney(month.income)}
                          tone="positive"
                        />
                        <ReviewMetric
                          label="本月支出"
                          value={formatMoney(month.expense)}
                          tone="destructive"
                        />
                        <ReviewMetric
                          label="本月结余"
                          value={formatMoney(month.net)}
                          tone={month.net >= 0 ? "positive" : "destructive"}
                        />
                        <ReviewMetric
                          label="储蓄率"
                          value={formatSavingsRate(month.savingsRate)}
                          tone={
                            month.savingsRate !== null && month.savingsRate >= 0
                              ? "positive"
                              : "destructive"
                          }
                        />
                      </div>

                      <div className="relative grid gap-3 p-4">
                        <ReviewFact
                          label="最大支出分类"
                          value={month.topExpenseCategory.name}
                          detail={formatMoney(month.topExpenseCategory.amount)}
                        />
                        <ReviewFact
                          label="最大单笔"
                          value={
                            month.largestExpense
                              ? getLargestExpenseTitle(month.largestExpense)
                              : "暂无支出"
                          }
                          detail={
                            month.largestExpense
                              ? `${month.largestExpense.day} · ${formatMoney(
                                  month.largestExpense.rmb
                                )}`
                              : "本月没有可复盘的支出记录"
                          }
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-1 w-full"
                          onClick={() => setSelectedReviewMonth(month.month)}
                        >
                          查看当月账单
                        </Button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <div className="grid gap-6 xl:grid-cols-2">
          <DashboardPanel
            title="支出分类占比"
            description={
              drillCategory
                ? `正在查看「${drillCategory}」下的二级分类`
                : "默认一级分类，点击扇区可下钻二级分类。"
            }
            action={
              drillCategory ? (
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => onDrillCategoryChange("")}
                >
                  返回一级分类
                </Button>
              ) : null
            }
          >
            <EChart
              option={options.pieOption}
              onClick={(params) => {
                if (!drillCategory) onDrillCategoryChange(getName(params))
              }}
            />
          </DashboardPanel>
          <DashboardPanel
            title="支出明细排行 Top 15"
            description="按折算人民币金额从高到低排序。"
            action={
              <div className="flex gap-1">
                {RANK_LEVELS.map((level) => (
                  <Button
                    key={level}
                    size="xs"
                    variant={rankLevel === level ? "default" : "outline"}
                    onClick={() => onRankLevelChange(level)}
                  >
                    {level}
                  </Button>
                ))}
              </div>
            }
          >
            <EChart option={options.rankingOption} />
          </DashboardPanel>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <DashboardPanel
            title="币种分布"
            description="以支出原币种分组，金额统一折算人民币。"
          >
            <EChart option={options.currencyOption} />
          </DashboardPanel>
          <DashboardPanel
            title="星期支出分布"
            description="观察消费集中发生在一周中的哪些日期。"
          >
            <EChart option={options.weekOption} />
          </DashboardPanel>
          <DashboardPanel
            title="标签支出排行"
            description="多标签交易会分别计入每个标签；点击柱子筛选标签。"
          >
            <EChart
              option={options.tagOption}
              onClick={(params) => onTagSelect(getName(params))}
            />
          </DashboardPanel>
        </div>
      </div>

      <DashboardPanel
        title="每日支出热力图"
        description="每个自然日一个格子，颜色越深代表支出越集中。"
      >
        <div className="grid gap-4">
          {options.heatmapOptions.map((heatmap) => (
            <div key={heatmap.year} className="grid gap-2">
              <div className="flex items-center gap-2 text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                <span className="h-px flex-1 bg-border" />
                {heatmap.year}
                <span className="h-px flex-1 bg-border" />
              </div>
              <EChart option={heatmap.option} className="h-40" />
            </div>
          ))}
        </div>
      </DashboardPanel>

      <DashboardPanel
        title="收支日历"
        description="每个日期同时标注收入与支出，点击日期查看当天流水截面。"
        contentClassName="p-0 min-h-unset"
      >
        <div className="grid xl:relative xl:block">
          <div className="m-0 overflow-x-auto border-b border-border/80 bg-transparent p-0 xl:w-[30rem] xl:border-r xl:border-b-0">
            <Calendar
              mode="single"
              selected={selectedCashflowDate}
              onSelect={(date) =>
                setSelectedCashflowDay(date ? dateKey(date) : "")
              }
              locale={zhCN}
              defaultMonth={selectedCashflowDate}
              numberOfMonths={1}
              showOutsideDays={false}
              disabled={(date) => !dailyCashflowByDay.has(dateKey(date))}
              className="m-0 w-full max-w-none overflow-visible bg-transparent p-0 [--cell-size:3.25rem]"
              classNames={{
                root: "relative m-0 w-full max-w-none overflow-visible p-0",
                months: "relative m-0 w-full max-w-none overflow-visible p-0",
                month: "m-0 w-full max-w-none gap-2 p-0",
                month_grid: "m-0 w-full max-w-none p-0",
                nav: "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1 px-0",
                weekdays: "m-0 flex p-0",
                weekday: "m-0 flex-1 p-0",
                week: "m-0 flex w-full p-0",
              }}
              components={{
                DayButton: ({ day, modifiers, className, ...props }) => {
                  const item = dailyCashflowByDay.get(dateKey(day.date))

                  return (
                    <CalendarDayButton
                      day={day}
                      modifiers={modifiers}
                      locale={zhCN}
                      className={cn(
                        "items-start justify-start overflow-hidden border border-transparent bg-transparent p-1.5 text-left transition-all group-data-[focused=true]/day:border-transparent group-data-[focused=true]/day:ring-0 hover:border-foreground/20 hover:bg-muted/55 data-[selected-single=true]:border-primary/60 data-[selected-single=true]:bg-primary/10 data-[selected-single=true]:text-foreground data-[selected-single=true]:shadow-none data-[selected-single=true]:ring-0 group-data-[focused=true]/day:data-[selected-single=true]:border-primary/60 data-[selected-single=true]:[&>span]:opacity-100",
                        item && "text-foreground",
                        !item && "opacity-45",
                        className
                      )}
                      {...props}
                    >
                      <span className="relative z-10 text-[0.7rem] font-medium">
                        {day.date.getDate()}
                      </span>
                      {item ? (
                        <span className="relative z-10 mt-auto flex w-full flex-col gap-0.5 text-[0.56rem] tracking-tight">
                          {item.income > 0 ? (
                            <span className="truncate text-positive">
                              +{formatMoney(item.income, true)}
                            </span>
                          ) : null}
                          {item.expense > 0 ? (
                            <span className="truncate text-destructive">
                              -{formatMoney(item.expense, true)}
                            </span>
                          ) : null}
                        </span>
                      ) : null}
                    </CalendarDayButton>
                  )
                },
              }}
            />
          </div>

          <div className="flex min-h-0 flex-col xl:absolute xl:inset-y-0 xl:right-0 xl:left-[30rem]">
            <div className="flex shrink-0 items-center justify-between gap-3 bg-transparent p-4">
              <div className="grid gap-1">
                <h3 className="font-heading text-lg font-semibold tracking-tight">
                  {selectedCashflow?.day ?? "选择日期账单"}
                </h3>
                {!selectedCashflow ? (
                  <p className="text-sm text-muted-foreground">
                    点击有色日期查看当天账单明细。
                  </p>
                ) : null}
              </div>
              {selectedCashflow ? (
                <Badge variant="outline">
                  共 {selectedCashflow.count} 笔记录
                </Badge>
              ) : null}
            </div>

            {selectedCashflow ? (
              <>
                <div className="grid shrink-0 border-y border-border/70 sm:grid-cols-3">
                  <div className="group/day-metric relative overflow-hidden border-b border-border/70 bg-transparent p-4 transition-colors duration-300 hover:bg-muted/50 sm:border-r sm:border-b-0">
                    <div
                      aria-hidden="true"
                      className="absolute -right-2.5 -bottom-2.5 size-8 border border-border/35 bg-background/15 opacity-55 transition-[opacity,transform] duration-300 group-hover/day-metric:translate-x-0.5 group-hover/day-metric:-translate-y-0.5 group-hover/day-metric:opacity-70"
                    />
                    <p className="font-mono text-xs tracking-[0.16em] text-muted-foreground uppercase">
                      收入
                    </p>
                    <p className="mt-2 font-heading text-xl leading-tight font-semibold tracking-tight text-positive tabular-nums">
                      {formatMoney(selectedCashflow.income)}
                    </p>
                  </div>
                  <div className="group/day-metric relative overflow-hidden border-b border-border/70 bg-transparent p-4 transition-colors duration-300 hover:bg-muted/50 sm:border-r sm:border-b-0">
                    <div
                      aria-hidden="true"
                      className="absolute -right-2.5 -bottom-2.5 size-8 border border-border/35 bg-background/15 opacity-55 transition-[opacity,transform] duration-300 group-hover/day-metric:translate-x-0.5 group-hover/day-metric:-translate-y-0.5 group-hover/day-metric:opacity-70"
                    />
                    <p className="font-mono text-xs tracking-[0.16em] text-muted-foreground uppercase">
                      支出
                    </p>
                    <p className="mt-2 font-heading text-xl leading-tight font-semibold tracking-tight text-destructive tabular-nums">
                      {formatMoney(selectedCashflow.expense)}
                    </p>
                  </div>
                  <div className="group/day-metric relative overflow-hidden bg-transparent p-4 transition-colors duration-300 hover:bg-muted/50">
                    <div
                      aria-hidden="true"
                      className="absolute -right-2.5 -bottom-2.5 size-8 border border-border/35 bg-background/15 opacity-55 transition-[opacity,transform] duration-300 group-hover/day-metric:translate-x-0.5 group-hover/day-metric:-translate-y-0.5 group-hover/day-metric:opacity-70"
                    />
                    <p className="font-mono text-xs tracking-[0.16em] text-muted-foreground uppercase">
                      结余
                    </p>
                    <p
                      className={cn(
                        "mt-2 font-heading text-xl leading-tight font-semibold tracking-tight tabular-nums",
                        selectedCashflow.net >= 0
                          ? "text-positive"
                          : "text-destructive"
                      )}
                    >
                      {formatMoney(selectedCashflow.net)}
                    </p>
                  </div>
                </div>

                <div className="flex min-h-0 flex-1 flex-col overflow-auto">
                  {selectedCashflow.bills.map((bill) => {
                    const signedAmount =
                      bill.direction === "expense"
                        ? -Math.abs(bill.amount)
                        : bill.amount
                    const signedRmb =
                      bill.direction === "expense"
                        ? -Math.abs(bill.rmb)
                        : bill.rmb
                    const badgeVariant =
                      bill.direction === "income"
                        ? "positive"
                        : bill.direction === "expense"
                          ? "destructive"
                          : "secondary"

                    return (
                      <div
                        key={bill.id}
                        className="grid gap-2 border-b border-border/70 bg-transparent p-4 last:border-b-0"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex min-w-0 flex-wrap items-center gap-2">
                              <p className="truncate text-sm font-medium">
                                {bill.category}
                                {bill.subcategory
                                  ? ` / ${bill.subcategory}`
                                  : ""}
                              </p>
                              <Badge variant={badgeVariant}>{bill.type}</Badge>
                              {bill.tags.length ? (
                                <>
                                  <span className="h-3 w-px bg-border" />
                                  <span className="flex min-w-0 flex-wrap items-center gap-1">
                                    {bill.tags.map((tag) => (
                                      <Badge key={tag} variant="outline">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </span>
                                </>
                              ) : null}
                            </div>
                            <p
                              className="mt-1 truncate text-xs text-muted-foreground"
                              title={`${bill.note} ${bill.location}`}
                            >
                              {bill.note || "未填写备注"}
                              {bill.location ? ` · ${bill.location}` : ""}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p
                              className={cn(
                                "font-heading text-base font-semibold",
                                bill.direction === "income" && "text-positive",
                                bill.direction === "expense" &&
                                  "text-destructive"
                              )}
                            >
                              {signedAmount.toLocaleString("zh-CN", {
                                maximumFractionDigits: 2,
                              })}{" "}
                              {bill.currency}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              折算 {formatMoney(signedRmb)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              <p className="text-sm leading-relaxed text-muted-foreground">
                无流水日期会保持不可选状态。
              </p>
            )}
          </div>
        </div>
      </DashboardPanel>
    </>
  )
}

type ReviewTone = "positive" | "destructive"

function MonthlyBillsDetail({
  month,
  onBack,
}: {
  month: MonthlyItem
  onBack: () => void
}) {
  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 border border-border/80 bg-card/70 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid gap-1">
          <h3 className="font-heading text-lg font-semibold tracking-tight">
            共 {month.bills.length} 笔账单
          </h3>
          <p className="text-xs text-muted-foreground">
            收入 {formatMoney(month.income)} · 支出 {formatMoney(month.expense)}{" "}
            · 结余 {formatMoney(month.net)}
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onBack}>
          返回复盘卡片
        </Button>
      </div>

      <div className="overflow-hidden border border-border/80 bg-card/90">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>日期</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>备注 / 地点</TableHead>
              <TableHead>标签</TableHead>
              <TableHead>币种</TableHead>
              <TableHead>原始金额</TableHead>
              <TableHead>折算人民币</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {month.bills.map((bill) => (
              <MonthlyBillRow key={bill.id} bill={bill} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function MonthlyBillRow({ bill }: { bill: MonthlyBillItem }) {
  return (
    <TableRow className="group/review-bill">
      <TableCell className="font-mono text-[11px] text-muted-foreground transition-colors group-hover/review-bill:text-foreground">
        {bill.dateText}
      </TableCell>
      <TableCell>
        <Badge variant={getBillBadgeVariant(bill)}>{bill.type}</Badge>
      </TableCell>
      <TableCell>
        {bill.category}
        {bill.subcategory ? ` / ${bill.subcategory}` : ""}
      </TableCell>
      <TableCell
        className="max-w-80 truncate"
        title={`${bill.note} ${bill.location}`}
      >
        {bill.note || "无备注"}
        {bill.location ? ` · ${bill.location}` : ""}
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {bill.tags.length ? (
            bill.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </div>
      </TableCell>
      <TableCell className="font-mono text-[11px]">{bill.currency}</TableCell>
      <TableCell className="font-mono text-[11px] tabular-nums">
        {bill.amount.toLocaleString("zh-CN", {
          maximumFractionDigits: 3,
        })}{" "}
        {bill.currency}
      </TableCell>
      <TableCell className="font-mono text-[11px] font-medium tabular-nums">
        {formatMoney(bill.rmb)}
      </TableCell>
    </TableRow>
  )
}

function getBillBadgeVariant(bill: MonthlyBillItem) {
  if (bill.direction === "expense") return "destructive"
  if (bill.direction === "income") return "positive"
  return "secondary"
}

function ReviewMetric({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: ReviewTone
}) {
  return (
    <div className="border-r border-b border-border/70 p-3 last:border-b-0 odd:border-r even:border-r-0 [&:nth-last-child(2)]:border-b-0">
      <p className="font-mono text-[9px] tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-heading text-base leading-tight font-semibold tabular-nums",
          tone === "positive" ? "text-positive" : "text-destructive"
        )}
      >
        {value}
      </p>
    </div>
  )
}

function ReviewFact({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="grid gap-1 border-l border-primary/40 pl-3">
      <p className="font-mono text-[9px] tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="truncate text-sm font-medium" title={value}>
        {value}
      </p>
      <p className="truncate text-xs text-muted-foreground" title={detail}>
        {detail}
      </p>
    </div>
  )
}

function formatSavingsRate(value: number | null) {
  if (value === null) return "—"
  return value.toLocaleString("zh-CN", {
    maximumFractionDigits: 1,
    style: "percent",
  })
}

function getLargestExpenseTitle(expense: MonthlyLargestExpense) {
  const category = expense.subcategory
    ? `${expense.category} / ${expense.subcategory}`
    : expense.category
  return expense.note ? `${category} · ${expense.note}` : category
}
