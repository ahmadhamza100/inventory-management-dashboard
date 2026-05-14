"use client"

import { useId } from "react"
import { Card, CardHeader, Skeleton, cn } from "@heroui/react"
import { useMonthlyPerformanceQuery } from "@/queries/use-monthly-performance-query"
import { formatPrice } from "@/utils/helpers"
import { chartTheme } from "@/utils/chart-theme"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"

const CHART_OUTLINE_RESET =
  "outline-none focus:outline-none [&_.recharts-wrapper]:outline-none [&_.recharts-surface]:outline-none [&_svg]:outline-none"

const CHART_CARD_CLASS = cn(
  "overflow-hidden border border-divider/60 shadow-sm outline-none focus-visible:outline-none",
  CHART_OUTLINE_RESET
)

type MonthlyPerformanceData = {
  month: string
  sales: number
  invoices: number
}

type TooltipContentProps = {
  active?: boolean
  payload?: Array<{
    payload: MonthlyPerformanceData
    value: number
  }>
}

function ChartTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null
  const row = payload[0]
  if (!row) return null
  return (
    <div className="rounded-md border border-divider bg-surface px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-foreground">{row.payload.month}</p>
      <p className="text-default-600">
        Sales:{" "}
        <span className="font-medium text-foreground">
          {formatPrice(row.value)}
        </span>
      </p>
      <p className="text-default-600">
        Invoices:{" "}
        <span className="font-medium text-foreground">
          {row.payload.invoices}
        </span>
      </p>
    </div>
  )
}

export function MonthlySalesChart() {
  const { data, isLoading } = useMonthlyPerformanceQuery()

  const gradientId = useId().replace(/:/g, "")

  if (isLoading) {
    return (
      <Card className={CHART_CARD_CLASS}>
        <CardHeader className="border-b border-divider/40 px-4 py-3">
          <Skeleton className="h-5 w-48 rounded" />
        </CardHeader>
        <Card.Content className="px-4 pb-4 pt-2">
          <Skeleton className="h-[260px] w-full rounded-lg" />
        </Card.Content>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card className={CHART_CARD_CLASS}>
        <CardHeader className="border-b border-divider/40 px-4 py-3">
          <h3 className="text-base font-semibold">Monthly sales</h3>
        </CardHeader>
        <Card.Content className="px-4 pb-4 pt-2">
          <div className="flex h-[260px] items-center justify-center text-sm text-default-500">
            No data available
          </div>
        </Card.Content>
      </Card>
    )
  }

  return (
    <Card className={CHART_CARD_CLASS}>
      <CardHeader className="border-b border-divider/40 px-4 py-3">
        <h3 className="text-base font-semibold">Monthly sales</h3>
        <p className="text-xs text-default-500">
          Last 12 months — sales and invoice volume
        </p>
      </CardHeader>
      <Card.Content className="px-2 pb-3 pt-1 sm:px-4">
        <div className={cn("h-[260px] w-full min-w-0", CHART_OUTLINE_RESET)}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={chartTheme.accent}
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="100%"
                    stopColor={chartTheme.accent}
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={chartTheme.grid}
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fill: chartTheme.muted, fontSize: 11 }}
                dy={4}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={44}
                tick={{ fill: chartTheme.muted, fontSize: 11 }}
                tickFormatter={(value: number) =>
                  value >= 1000 ? `${(value / 1000).toFixed(1)}k` : `${value}`
                }
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ stroke: chartTheme.border, strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke={chartTheme.accent}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                fillOpacity={1}
                dot={false}
                activeDot={{ r: 4, fill: chartTheme.accent }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card.Content>
    </Card>
  )
}
