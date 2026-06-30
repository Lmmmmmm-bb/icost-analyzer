import { useMemo, useState } from "react"

import type { ECElementEvent } from "echarts"
import { zhCN } from "react-day-picker/locale"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, CalendarDayButton } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

import { dateKey } from "../../model/date"
import { RANK_LEVELS, type RankLevel } from "../../model/dashboard-controls"
import { formatMoney } from "../../model/money"
import { DashboardPanel } from "../shared/dashboard-panel"
import { EChart } from "./e-chart"
import { MonthlyTrendPanel } from "./monthly-trend-panel"
import type { ChartOptions } from "./types"

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
  const [reviewOpen, setReviewOpen] = useState(false)
  const safeSelectedCashflowDay = dailyCashflowByDay.has(selectedCashflowDay)
    ? selectedCashflowDay
    : latestCashflow?.day
  const selectedCashflowDate = safeSelectedCashflowDay
    ? dailyCashflowByDay.get(safeSelectedCashflowDay)?.date
    : undefined
  const selectedCashflow = safeSelectedCashflowDay
    ? dailyCashflowByDay.get(safeSelectedCashflowDay)
    : undefined
  function getName(params: ECElementEvent) {
    return String(params.name)
  }

  return (
    <>
      <div className="grid gap-6">
        <MonthlyTrendPanel
          option={options.monthlyOption}
          monthlyReview={options.monthlyReview}
          reviewOpen={reviewOpen}
          onReviewOpenChange={setReviewOpen}
          onApplyMonth={onApplyMonth}
        />

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
            title="支出分类排行 Top 15"
            description="按人民币折算金额从高到低排序，可切换一级/二级分类。"
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
            title="支出币种分布"
            description="按支出的原币种分组，并统一折算为人民币。"
          >
            <EChart option={options.currencyOption} />
          </DashboardPanel>
          <DashboardPanel
            title="星期支出分布"
            description="观察支出集中发生在一周中的哪些日期。"
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
        title="每日收支日历"
        description="在日历中标注每日收入与支出，点击日期查看当天交易。"
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
                  {selectedCashflow?.day ?? "选择日期查看交易"}
                </h3>
                {!selectedCashflow ? (
                  <p className="text-sm text-muted-foreground">
                    点击有记录的日期查看当天交易。
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
                              {bill.note || "无备注"}
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
                没有交易记录的日期不可选择。
              </p>
            )}
          </div>
        </div>
      </DashboardPanel>
    </>
  )
}
