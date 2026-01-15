import { Hono } from "hono"
import { db } from "@/db"
import { and, isNull, sql, gte, lte, sum, count } from "drizzle-orm"
import { invoices, customers, invoiceItems, transactions } from "@/db/schema"

export const analyticsRouter = new Hono()
  // Get dashboard cards data (monthly sales, today sales, total customers)
  .get("/cards", async (c) => {
    const now = new Date()
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0
    )
    const endOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999
    )
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    )
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Execute all independent queries in parallel
    const [
      monthlySalesResult,
      todaySalesResult,
      totalCustomersResult,
      lastMonthSalesResult,
      dailyTransactionsResult,
      monthlyTransactionsResult
    ] = await Promise.all([
      // Monthly sales (current month)
      db
        .select({ total: sum(invoices.total) })
        .from(invoices)
        .where(
          and(isNull(invoices.deletedAt), gte(invoices.createdAt, startOfMonth))
        ),
      // Today sales
      db
        .select({ total: sum(invoices.total) })
        .from(invoices)
        .where(
          and(isNull(invoices.deletedAt), gte(invoices.createdAt, startOfToday))
        ),
      // Total customers
      db
        .select({ count: count() })
        .from(customers)
        .where(isNull(customers.deletedAt)),
      // Monthly growth (compare with last month)
      db
        .select({ total: sum(invoices.total) })
        .from(invoices)
        .where(
          and(
            isNull(invoices.deletedAt),
            gte(invoices.createdAt, startOfLastMonth),
            lte(invoices.createdAt, endOfLastMonth)
          )
        ),
      // Daily transactions flow (today's net cash flow: cash_in - cash_out)
      db
        .select({
          in: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'cash_in' THEN ${transactions.amount}::numeric ELSE 0 END), 0)`.as(
            "in"
          ),
          out: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'cash_out' THEN ${transactions.amount}::numeric ELSE 0 END), 0)`.as(
            "out"
          ),
          flow: sql<number>`COALESCE(
            SUM(CASE WHEN ${transactions.type} = 'cash_in' THEN ${transactions.amount}::numeric ELSE 0 END) -
            SUM(CASE WHEN ${transactions.type} = 'cash_out' THEN ${transactions.amount}::numeric ELSE 0 END),
            0
          )`.as("flow")
        })
        .from(transactions)
        .where(
          and(
            isNull(transactions.deletedAt),
            gte(transactions.date, startOfToday),
            lte(transactions.date, endOfToday)
          )
        ),
      // Monthly transactions flow (current month's net cash flow: cash_in - cash_out)
      db
        .select({
          in: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'cash_in' THEN ${transactions.amount}::numeric ELSE 0 END), 0)`.as(
            "in"
          ),
          out: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'cash_out' THEN ${transactions.amount}::numeric ELSE 0 END), 0)`.as(
            "out"
          ),
          flow: sql<number>`COALESCE(
            SUM(CASE WHEN ${transactions.type} = 'cash_in' THEN ${transactions.amount}::numeric ELSE 0 END) -
            SUM(CASE WHEN ${transactions.type} = 'cash_out' THEN ${transactions.amount}::numeric ELSE 0 END),
            0
          )`.as("flow")
        })
        .from(transactions)
        .where(
          and(
            isNull(transactions.deletedAt),
            gte(transactions.date, startOfMonth),
            lte(transactions.date, endOfMonth)
          )
        )
    ])

    const monthlySales = Number(monthlySalesResult[0]?.total ?? 0)
    const todaySales = Number(todaySalesResult[0]?.total ?? 0)
    const totalCustomers = Number(totalCustomersResult[0]?.count ?? 0)
    const lastMonthSales = Number(lastMonthSalesResult[0]?.total ?? 0)

    const dailyTransactionsFlow = {
      in: Number(dailyTransactionsResult[0]?.in ?? 0),
      out: Number(dailyTransactionsResult[0]?.out ?? 0),
      flow: Number(dailyTransactionsResult[0]?.flow ?? 0)
    }
    const monthlyTransactionsFlow = {
      in: Number(monthlyTransactionsResult[0]?.in ?? 0),
      out: Number(monthlyTransactionsResult[0]?.out ?? 0),
      flow: Number(monthlyTransactionsResult[0]?.flow ?? 0)
    }

    const monthlyGrowth =
      lastMonthSales > 0
        ? ((monthlySales - lastMonthSales) / lastMonthSales) * 100
        : 0

    return c.$json({
      monthlySales,
      todaySales,
      totalCustomers,
      monthlyGrowth,
      dailyTransactionsFlow,
      monthlyTransactionsFlow
    })
  })

  // Get monthly performance data for area chart
  .get("/monthly-performance", async (c) => {
    const now = new Date()
    const startOfYear = new Date(now.getFullYear(), now.getMonth() - 11, 1)
    const endOfCurrentMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59
    )

    // Fetch all invoices from the last 12 months in a single query
    const allInvoices = await db
      .select({
        total: invoices.total,
        createdAt: invoices.createdAt
      })
      .from(invoices)
      .where(
        and(
          isNull(invoices.deletedAt),
          gte(invoices.createdAt, startOfYear),
          lte(invoices.createdAt, endOfCurrentMonth)
        )
      )

    // Initialize month map for last 12 months
    const monthMap = new Map<string, { sales: number; invoices: number }>(
      Array.from({ length: 12 }, (_, i) => {
        const date = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1)
        const monthName = date.toLocaleString("default", { month: "short" })
        return [monthName, { sales: 0, invoices: 0 }]
      })
    )

    // Group invoices by month
    allInvoices.forEach((invoice) => {
      const invoiceDate = new Date(invoice.createdAt)
      const monthName = invoiceDate.toLocaleString("default", {
        month: "short"
      })
      const monthData = monthMap.get(monthName)

      if (monthData) {
        monthData.sales += Number(invoice.total)
        monthData.invoices += 1
      }
    })

    // Convert map to array in chronological order
    const months: Array<{ month: string; sales: number; invoices: number }> =
      Array.from({ length: 12 }, (_, i) => {
        const date = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1)
        const monthName = date.toLocaleString("default", { month: "short" })
        const monthData = monthMap.get(monthName) ?? { sales: 0, invoices: 0 }
        return {
          month: monthName,
          ...monthData
        }
      })

    return c.$json(months)
  })

  // Get payment status distribution for pie chart
  .get("/payment-status", async (c) => {
    // Use SQL to count payment statuses in a single query
    const paymentStatusResult = await db
      .select({
        fullyPaid:
          sql<number>`COUNT(CASE WHEN (${invoices.total}::numeric - ${invoices.amountPaid}::numeric) <= 0 THEN 1 END)`.as(
            "fullyPaid"
          ),
        partiallyPaid:
          sql<number>`COUNT(CASE WHEN (${invoices.total}::numeric - ${invoices.amountPaid}::numeric) > 0 AND ${invoices.amountPaid}::numeric > 0 THEN 1 END)`.as(
            "partiallyPaid"
          ),
        unpaid:
          sql<number>`COUNT(CASE WHEN ${invoices.amountPaid}::numeric = 0 THEN 1 END)`.as(
            "unpaid"
          )
      })
      .from(invoices)
      .where(isNull(invoices.deletedAt))

    const result = paymentStatusResult[0]

    return c.$json([
      { name: "Fully Paid", value: Number(result?.fullyPaid ?? 0) },
      { name: "Partially Paid", value: Number(result?.partiallyPaid ?? 0) },
      { name: "Unpaid", value: Number(result?.unpaid ?? 0) }
    ])
  })

  // Get top products by sales for pie chart (alternative)
  .get("/top-products", async (c) => {
    const { products } = await import("@/db/schema")

    // Use a single query with JOIN to get product names and sales
    const topProducts = await db
      .select({
        productId: invoiceItems.productId,
        productName: products.name,
        totalSales:
          sql<number>`COALESCE(SUM(${invoiceItems.price}::numeric * ${invoiceItems.quantity}), 0)`.as(
            "totalSales"
          )
      })
      .from(invoiceItems)
      .leftJoin(products, sql`${products.id} = ${invoiceItems.productId}`)
      .where(isNull(invoiceItems.deletedAt))
      .groupBy(invoiceItems.productId, products.name)
      .orderBy(sql`totalSales DESC`)
      .limit(5)

    const result = topProducts
      .map((item) => ({
        name: item.productName || "Unknown Product",
        value: Number(item.totalSales)
      }))
      .filter((item) => item.value > 0)

    return c.$json(result)
  })
