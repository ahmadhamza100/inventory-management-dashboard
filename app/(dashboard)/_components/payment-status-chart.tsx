"use client"

import { useMemo } from "react"
import { Card, CardHeader, Skeleton, cn } from "@heroui/react"
import { usePaymentStatusQuery } from "@/queries/use-payment-status-query"
import { chartSeriesColors, chartTheme } from "@/utils/chart-theme"
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
} from "recharts"

const CHART_OUTLINE_RESET =
  "outline-none focus:outline-none [&_.recharts-wrapper]:outline-none [&_.recharts-surface]:outline-none [&_svg]:outline-none"

const CHART_CARD_CLASS = cn(
  "overflow-hidden border border-divider/60 shadow-sm outline-none focus-visible:outline-none",
  CHART_OUTLINE_RESET
)

type PaymentStatusData = {
  name: string
  value: number
}

type TooltipContentProps = {
  active?: boolean
  payload?: Array<{
    payload: PaymentStatusData & { fill?: string }
    value: number
  }>
  total: number
}

function ChartTooltip({ active, payload, total }: TooltipContentProps) {
  if (!active || !payload?.length || !total) return null
  const row = payload[0]
  if (!row) return null
  const pct = ((row.value / total) * 100).toFixed(1)
  return (
    <div className="rounded-md border border-divider bg-surface px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-foreground">{row.payload.name}</p>
      <p className="text-default-600">
        Count:{" "}
        <span className="font-medium text-foreground">{row.value}</span>
      </p>
      <p className="text-default-600">
        Share:{" "}
        <span className="font-medium text-foreground">{pct}%</span>
      </p>
    </div>
  )
}

export function PaymentStatusChart() {
  const { data, isLoading } = usePaymentStatusQuery()

  const total = useMemo(
    () => (data ?? []).reduce((s, d) => s + d.value, 0),
    [data]
  )

  const dataWithColors = useMemo(() => {
    if (!data?.length) return []
    return data.map((d, i) => ({
      ...d,
      fill: chartSeriesColors[i % chartSeriesColors.length]
    }))
  }, [data])

  if (isLoading) {
    return (
      <Card className={CHART_CARD_CLASS}>
        <CardHeader className="border-b border-divider/40 px-4 py-3">
          <Skeleton className="h-5 w-56 rounded" />
        </CardHeader>
        <Card.Content className="px-4 pb-4 pt-2">
          <Skeleton className="h-[260px] w-full rounded-lg" />
        </Card.Content>
      </Card>
    )
  }

  if (!data || data.length === 0 || total === 0) {
    return (
      <Card className={CHART_CARD_CLASS}>
        <CardHeader className="border-b border-divider/40 px-4 py-3">
          <h3 className="text-base font-semibold">Payment status</h3>
        </CardHeader>
        <Card.Content className="px-4 pb-4 pt-2">
          <div className="flex h-[260px] items-center justify-center text-sm text-default-500">
            No invoice data yet
          </div>
        </Card.Content>
      </Card>
    )
  }

  return (
    <Card className={CHART_CARD_CLASS}>
      <CardHeader className="border-b border-divider/40 px-4 py-3">
        <h3 className="text-base font-semibold">Payment status</h3>
        <p className="text-xs text-default-500">Share of invoices by status</p>
      </CardHeader>
      <Card.Content className="px-2 pb-3 pt-1 sm:px-4">
        <div className={cn("h-[260px] w-full min-w-0", CHART_OUTLINE_RESET)}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dataWithColors}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="52%"
                outerRadius="78%"
                paddingAngle={2}
                stroke={chartTheme.surface}
                strokeWidth={2}
              >
                {dataWithColors.map((entry, index) => (
                  <Cell key={`cell-${entry.name}-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip total={total} />} />
              <Legend
                verticalAlign="bottom"
                height={28}
                formatter={(value) => (
                  <span className="text-xs text-default-600">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card.Content>
    </Card>
  )
}
