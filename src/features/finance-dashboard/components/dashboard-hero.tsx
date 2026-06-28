import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

import type { Dimensions } from "../types"
import { MetricCard } from "./metric-card"

type DashboardHeroProps = {
  fileName: string
  error: string
  rangeText: string
  totalCount: number
  filteredCount: number
  dimensions: Dimensions
  onUpload: (file?: File) => void
}

export function DashboardHero({
  fileName,
  error,
  rangeText,
  totalCount,
  filteredCount,
  dimensions,
  onUpload,
}: DashboardHeroProps) {
  return (
    <section className="relative border-b bg-background/80 backdrop-blur-sm">
      <div className="absolute inset-0 bg-[linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,black,transparent_92%)] bg-[size:34px_34px] opacity-40" />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-5 py-8 md:px-8 lg:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex max-w-3xl flex-col gap-4">
            <Badge variant="outline" className="w-fit">
              iCost Excel · 多币种折算 · 交易联动分析
            </Badge>
            <div className="flex flex-col gap-3">
              <h1 className="font-heading text-5xl leading-none tracking-[-0.06em] text-balance md:text-7xl">
                Ledger Observatory
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                上传 iCost 固定结构 Excel
                后，即时透视收入、支出、旅行标签、外币消费和每日消费强度。所有卡片、图表与明细表都会跟随筛选和汇率变化同步重算。
              </p>
            </div>
          </div>
          <Card className="gap-0 py-0 lg:w-[420px]">
            <CardHeader className="border-b border-border/70 p-4">
              <CardTitle>上传 iCost 明细</CardTitle>
              <CardDescription>
                支持「日期 / 类型 / 金额 / 一级分类 / 二级分类 / 货币 / 标签 /
                位置」结构。
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 p-4">
              <Input
                type="file"
                accept=".xlsx,.xls"
                onChange={(event) => onUpload(event.target.files?.[0])}
              />
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary">{fileName || "尚未上传文件"}</Badge>
                <Badge variant="outline">汇率：手动维护，CNY = 1</Badge>
              </div>
              {error ? (
                <Alert variant="destructive">
                  <AlertTitle>解析失败</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <MetricCard
            label="覆盖时间"
            value={rangeText}
            caption="基于上传数据的最早与最晚交易"
          />
          <MetricCard
            label="记录总数"
            value={`${totalCount}`}
            caption={`当前筛选 ${filteredCount} 条`}
          />
          <MetricCard
            label="涉及币种"
            value={`${dimensions.currencies.length}`}
            caption={dimensions.currencies.join(" / ") || "等待数据"}
          />
          <MetricCard
            label="涉及标签"
            value={`${dimensions.tags.length}`}
            caption="空标签不参与标签统计"
          />
          <MetricCard
            label="汇率说明"
            value="手动"
            caption="修改后全局实时重算"
          />
        </div>
      </div>
    </section>
  )
}
