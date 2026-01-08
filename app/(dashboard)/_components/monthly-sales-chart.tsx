"use client"

import { Card, CardBody, CardHeader, Skeleton } from "@heroui/react"
import { useMonthlyPerformanceQuery } from "@/queries/use-monthly-performance-query"
import { formatPrice } from "@/utils/helpers"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"

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

const CustomTooltip = ({ active, payload }: TooltipContentProps) => {
  if (active && payload && payload.length) {
    const data = payload[0]
    if (!data) return null
    return (
      <div className="rounded-lg border border-divider bg-background p-3 shadow-lg">
        <p className="mb-2 text-sm font-medium">{data.payload.month}</p>
        <p className="text-sm text-default-600">
          <span className="text-primary">Sales: </span>
          {formatPrice(data.value)}
        </p>
        <p className="text-sm text-default-600">
          <span className="text-secondary">Invoices: </span>
          {data.payload.invoices}
        </p>
      </div>
    )
  }
  return null
}

export function MonthlySalesChart() {
  const { data, isLoading } = useMonthlyPerformanceQuery()

  if (isLoading) {
    return (
      <Card className="border border-divider">
        <CardHeader className="px-6 pt-6 pb-0">
          <Skeleton className="h-6 w-48 rounded-lg" />
        </CardHeader>
        <CardBody className="px-6 pb-6">
          <Skeleton className="h-80 w-full rounded-lg" />
        </CardBody>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card className="border border-divider">
        <CardHeader className="px-6 pt-6 pb-0">
          <h3 className="text-lg font-semibold">Monthly Sales Analytics</h3>
        </CardHeader>
        <CardBody className="px-6 pb-6">
          <div className="flex h-80 items-center justify-center text-default-500">
            No data available
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card className="border border-divider">
      <CardHeader className="flex flex-col items-start px-6 pt-6 pb-0">
        <h3 className="text-lg font-semibold">Monthly Sales Analytics</h3>
        <p className="text-sm text-default-500">
          Sales performance over the last 12 months
        </p>
      </CardHeader>
      <CardBody className="px-6 pb-6">
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--heroui-primary))"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--heroui-primary))"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--heroui-default-200))"
            />
            <XAxis
              dataKey="month"
              stroke="hsl(var(--heroui-default-500))"
              style={{ fontSize: "12px" }}
            />
            <YAxis
              stroke="hsl(var(--heroui-default-500))"
              style={{ fontSize: "12px" }}
              tickFormatter={(value: number) => {
                if (value >= 1000) {
                  return `${(value / 1000).toFixed(1)}k`
                }
                return value.toString()
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="hsl(var(--heroui-primary))"
              fillOpacity={1}
              fill="url(#colorSales)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  )
}
