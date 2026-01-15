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
    subInfo?: {
      in: number
      out: number
    }
  }

  const dailyTransactions = data?.dailyTransactionsFlow
  const monthlyTransactions = data?.monthlyTransactionsFlow

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
      value: dailyTransactions?.flow ?? 0,
      icon: IconTransactionDollar,
      bgColor:
        (dailyTransactions?.flow ?? 0) >= 0 ? "bg-success/10" : "bg-danger/10",
      iconColor:
        (dailyTransactions?.flow ?? 0) >= 0 ? "text-success" : "text-danger",
      format: (val: number) =>
        `${val >= 0 ? "+" : ""}${formatPrice(Math.abs(val))}`,
      subInfo: {
        in: dailyTransactions?.in ?? 0,
        out: dailyTransactions?.out ?? 0
      }
    },
    {
      title: "Monthly Transactions Flow",
      value: monthlyTransactions?.flow ?? 0,
      icon: IconTransactionDollar,
      bgColor:
        (monthlyTransactions?.flow ?? 0) >= 0 ? "bg-success/10" : "bg-danger/10",
      iconColor:
        (monthlyTransactions?.flow ?? 0) >= 0 ? "text-success" : "text-danger",
      format: (val: number) =>
        `${val >= 0 ? "+" : ""}${formatPrice(Math.abs(val))}`,
      subInfo: {
        in: monthlyTransactions?.in ?? 0,
        out: monthlyTransactions?.out ?? 0
      }
    }
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.title} className="min-h-40">
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
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
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

                  {card.subInfo && (
                    <div className="flex items-center gap-2 text-[10px] font-medium text-default-400">
                      <div className="flex items-center gap-0.5 text-success/80">
                        <IconTrendingUp size={12} />
                        <span>{formatPrice(card.subInfo.in)}</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-danger/80">
                        <IconTrendingDown size={12} />
                        <span>{formatPrice(card.subInfo.out)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        )
      })}
    </div>
  )
}
