"use client"

import { AnalyticsCards } from "./_components/analytics-cards"
import { MonthlySalesChart } from "./_components/monthly-sales-chart"
import { PaymentStatusChart } from "./_components/payment-status-chart"

export default function DashboardPage() {
  return (
    <main className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-default-500">
          Overview of your business analytics
        </p>
      </div>

      <AnalyticsCards />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MonthlySalesChart />
        <PaymentStatusChart />
      </div>
    </main>
  )
}
