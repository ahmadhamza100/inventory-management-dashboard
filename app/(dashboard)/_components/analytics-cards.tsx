"use client"

import { Card, CardBody, cn, Skeleton } from "@heroui/react"
import { useAnalyticsCardsQuery } from "@/queries/use-analytics-cards-query"
import { formatPrice } from "@/utils/helpers"
import {
  IconTrendingUp,
  IconTrendingDown,
  IconCurrencyDollar,
  IconCalendar,
  IconUsers,
  IconTransactionDollar
} from "@tabler/icons-react"

export function AnalyticsCards() {
  const { data, isLoading } = useAnalyticsCardsQuery()

  type CardConfig = {
    title: string
    value: number
    icon: typeof IconCalendar
    bgColor: string
    iconColor: string
    trend?: number
    format: (val: number) => string
  }

  const dailyTransactionsFlow = data?.dailyTransactionsFlow ?? 0
  const monthlyTransactionsFlow = data?.monthlyTransactionsFlow ?? 0

  const cards: CardConfig[] = [
    {
      title: "Monthly Sales",
      value: data?.monthlySales ?? 0,
      icon: IconCalendar,
      bgColor: "bg-primary/10",
      iconColor: "text-primary",
      trend: data?.monthlyGrowth ?? 0,
      format: (val: number) => formatPrice(val)
    },
    {
      title: "Today Sales",
      value: data?.todaySales ?? 0,
      icon: IconCurrencyDollar,
      bgColor: "bg-success/10",
      iconColor: "text-success",
      format: (val: number) => formatPrice(val)
    },
    {
      title: "Total Customers",
      value: data?.totalCustomers ?? 0,
      icon: IconUsers,
      bgColor: "bg-secondary/10",
      iconColor: "text-secondary",
      format: (val: number) => val.toLocaleString()
    },
    {
      title: "Monthly Growth",
      value: data?.monthlyGrowth ?? 0,
      icon: IconTrendingUp,
      bgColor: "bg-warning/10",
      iconColor: "text-warning",
      format: (val: number) => `${val >= 0 ? "+" : ""}${val.toFixed(1)}%`
    },
    {
      title: "Daily Transactions Flow",
      value: dailyTransactionsFlow,
      icon: IconTransactionDollar,
      bgColor: dailyTransactionsFlow >= 0 ? "bg-success/10" : "bg-danger/10",
      iconColor: dailyTransactionsFlow >= 0 ? "text-success" : "text-danger",
      format: (val: number) => `${val >= 0 ? "+" : ""}${formatPrice(Math.abs(val))}`
    },
    {
      title: "Monthly Transactions Flow",
      value: monthlyTransactionsFlow,
      icon: IconTransactionDollar,
      bgColor: monthlyTransactionsFlow >= 0 ? "bg-success/10" : "bg-danger/10",
      iconColor: monthlyTransactionsFlow >= 0 ? "text-success" : "text-danger",
      format: (val: number) => `${val >= 0 ? "+" : ""}${formatPrice(Math.abs(val))}`
    }
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.title} className="min-h-34">
            <CardBody className="p-6">
              <Skeleton className="mb-2 h-4 w-24 rounded-lg" />
              <Skeleton className="mb-2 h-8 w-32 rounded-lg" />
              <Skeleton className="h-3 w-16 rounded-lg" />
            </CardBody>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon
        const isPositive = card.trend !== undefined ? card.trend >= 0 : true

        return (
          <Card key={card.title} className="border border-divider">
            <CardBody className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-medium text-default-500">
                  {card.title}
                </p>
                <div
                  className={cn(
                    "flex size-10 items-center justify-center rounded-lg",
                    card.bgColor
                  )}
                >
                  <Icon size={20} className={card.iconColor} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-semibold">
                  {card.format(card.value)}
                </p>
                {card.trend !== undefined && (
                  <div
                    className={cn(
                      "flex items-center gap-1 text-xs font-medium",
                      isPositive ? "text-success" : "text-danger"
                    )}
                  >
                    {isPositive ? (
                      <IconTrendingUp size={14} />
                    ) : (
                      <IconTrendingDown size={14} />
                    )}
                    <span>{Math.abs(card.trend).toFixed(1)}%</span>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        )
      })}
    </div>
  )
}
