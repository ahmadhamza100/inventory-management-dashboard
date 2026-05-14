"use client"

import { Skeleton } from "@heroui/react"
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
      title: "Monthly sales",
      value: data?.monthlySales ?? 0,
      icon: IconCalendar,
      trend: data?.monthlyGrowth ?? 0,
      format: (val: number) => formatPrice(val)
    },
    {
      title: "Today sales",
      value: data?.todaySales ?? 0,
      icon: IconCurrencyDollar,
      format: (val: number) => formatPrice(val)
    },
    {
      title: "Customers",
      value: data?.totalCustomers ?? 0,
      icon: IconUsers,
      format: (val: number) => val.toLocaleString()
    },
    {
      title: "Monthly growth",
      value: data?.monthlyGrowth ?? 0,
      icon: IconTrendingUp,
      format: (val: number) => `${val >= 0 ? "+" : ""}${val.toFixed(1)}%`
    },
    {
      title: "Daily transaction flow",
      value: dailyTransactions?.flow ?? 0,
      icon: IconTransactionDollar,
      format: (val: number) =>
        `${val >= 0 ? "+" : ""}${formatPrice(Math.abs(val))}`,
      subInfo: {
        in: dailyTransactions?.in ?? 0,
        out: dailyTransactions?.out ?? 0
      }
    },
    {
      title: "Monthly transaction flow",
      value: monthlyTransactions?.flow ?? 0,
      icon: IconTransactionDollar,
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
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-lg border border-divider/60 bg-surface px-4 py-3"
          >
            <Skeleton className="mb-2 h-3 w-24 rounded" />
            <Skeleton className="h-6 w-32 rounded" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon
        const isPositive = card.trend !== undefined ? card.trend >= 0 : true

        return (
          <div
            key={card.title}
            className="rounded-lg border border-divider/60 bg-surface px-4 py-3 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-medium text-default-500">{card.title}</p>
              <Icon
                size={16}
                className="mt-0.5 shrink-0 text-default-400"
                aria-hidden
              />
            </div>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <p className="text-lg font-semibold tracking-tight text-foreground tabular-nums">
                {card.format(card.value)}
              </p>
              {card.trend !== undefined && (
                <span
                  className={
                    isPositive
                      ? "inline-flex items-center gap-0.5 text-xs font-medium text-success"
                      : "inline-flex items-center gap-0.5 text-xs font-medium text-danger"
                  }
                >
                  {isPositive ? (
                    <IconTrendingUp size={12} aria-hidden />
                  ) : (
                    <IconTrendingDown size={12} aria-hidden />
                  )}
                  {Math.abs(card.trend).toFixed(1)}%
                </span>
              )}
              {card.subInfo && (
                <span className="flex items-center gap-2 text-[11px] text-default-400">
                  <span className="inline-flex items-center gap-0.5 text-success">
                    <IconTrendingUp size={11} aria-hidden />
                    {formatPrice(card.subInfo.in)}
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-danger">
                    <IconTrendingDown size={11} aria-hidden />
                    {formatPrice(card.subInfo.out)}
                  </span>
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
