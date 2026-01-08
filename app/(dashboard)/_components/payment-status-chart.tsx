"use client"

import { Card, CardBody, CardHeader, Skeleton } from "@heroui/react"
import { usePaymentStatusQuery } from "@/queries/use-payment-status-query"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  type PieLabelRenderProps
} from "recharts"

const COLORS = [
  "hsl(var(--heroui-success))",
  "hsl(var(--heroui-warning))",
  "hsl(var(--heroui-danger))"
]

type PaymentStatusData = {
  name: string
  value: number
}

type TooltipContentProps = {
  active?: boolean
  payload?: Array<{
    payload: PaymentStatusData
    value: number
  }>
  total: number
}

const CustomTooltip = ({ active, payload, total }: TooltipContentProps) => {
  if (active && payload && payload.length) {
    const data = payload[0]
    if (!data) return null
    const percentage = ((data.value / total) * 100).toFixed(1)
    return (
      <div className="rounded-lg border border-divider bg-background p-3 shadow-lg">
        <p className="mb-1 text-sm font-medium">{data.payload.name}</p>
        <p className="text-sm text-default-600">
          Count: <span className="font-semibold">{data.value}</span>
        </p>
        <p className="text-sm text-default-600">
          Percentage: <span className="font-semibold">{percentage}%</span>
        </p>
      </div>
    )
  }
  return null
}

const renderCustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent
}: PieLabelRenderProps) => {
  if (
    typeof cx !== "number" ||
    typeof cy !== "number" ||
    typeof midAngle !== "number" ||
    typeof innerRadius !== "number" ||
    typeof outerRadius !== "number" ||
    typeof percent !== "number"
  ) {
    return null
  }

  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  if (percent < 0.05) return null // Don't show label for very small slices

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={12}
      fontWeight="semibold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export function PaymentStatusChart() {
  const { data, isLoading } = usePaymentStatusQuery()

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
          <h3 className="text-lg font-semibold">Payment Status Distribution</h3>
        </CardHeader>
        <CardBody className="px-6 pb-6">
          <div className="flex h-80 items-center justify-center text-default-500">
            No data available
          </div>
        </CardBody>
      </Card>
    )
  }

  const total = data.reduce(
    (sum: number, item: PaymentStatusData) => sum + item.value,
    0
  )

  return (
    <Card className="border border-divider">
      <CardHeader className="flex flex-col items-start px-6 pt-6 pb-0">
        <h3 className="text-lg font-semibold">Payment Status Distribution</h3>
        <p className="text-sm text-default-500">
          Breakdown of invoice payment statuses
        </p>
      </CardHeader>
      <CardBody className="px-6 pb-6">
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={100}
              innerRadius={50}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry: PaymentStatusData, index: number) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip total={total} />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value: string) => (
                <span className="text-sm text-default-600">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  )
}
