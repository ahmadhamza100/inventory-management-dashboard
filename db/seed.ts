import "dotenv/config"

import * as readline from "readline"
import { db } from "./index"
import {
  customers,
  invoiceItems,
  invoices,
  products,
  transactions
} from "./schema"
import { generateSKU, generateInvoiceId } from "@/utils/helpers"

const productNames = [
  "Wireless Headphones",
  "Smart Watch",
  "Laptop Stand",
  "USB-C Cable",
  "Mechanical Keyboard",
  "Gaming Mouse",
  "Monitor Stand",
  "Webcam HD",
  "Bluetooth Speaker",
  "Phone Case",
  "Tablet Stand",
  "Wireless Charger",
  "HDMI Cable",
  "USB Hub",
  "Laptop Sleeve",
  "Mouse Pad",
  "Keyboard Wrist Rest",
  "Desk Organizer",
  "Cable Management",
  "Screen Protector"
]

const customerNames = [
  "John Smith",
  "Emily Johnson",
  "Michael Brown",
  "Sarah Davis",
  "David Wilson",
  "Jessica Martinez",
  "Christopher Anderson",
  "Amanda Taylor",
  "Matthew Thomas",
  "Ashley Jackson"
]

const customerEmails = [
  "john.smith@example.com",
  "emily.j@example.com",
  "michael.brown@example.com",
  "sarah.davis@example.com",
  "david.w@example.com",
  "jessica.m@example.com",
  "chris.anderson@example.com",
  "amanda.t@example.com",
  "matt.thomas@example.com",
  "ashley.jackson@example.com"
]

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomFloat(min: number, max: number) {
  return Number((Math.random() * (max - min) + min).toFixed(2))
}

function randomDateInMonth(year: number, month: number): Date {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const day = randomInt(1, daysInMonth)
  const hour = randomInt(0, 23)
  const minute = randomInt(0, 59)
  const second = randomInt(0, 59)
  return new Date(year, month, day, hour, minute, second)
}

function question(rl: readline.Interface, query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer.trim())
    })
  })
}

async function clearDatabase() {
  console.log("🗑️  Clearing database...")
  await db.delete(invoiceItems)
  console.log("  ✓ Cleared invoice items")
  await db.delete(invoices)
  console.log("  ✓ Cleared invoices")
  await db.delete(transactions)
  console.log("  ✓ Cleared transactions")
  await db.delete(products)
  console.log("  ✓ Cleared products")
  await db.delete(customers)
  console.log("  ✓ Cleared customers")
  console.log("✅ Database cleared successfully!")
}

async function seed() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  const adminId = await question(
    rl,
    "Enter admin user ID (UUID from Supabase Auth): "
  )
  rl.close()

  if (!adminId || adminId.length < 10) {
    console.error("❌ A valid admin user ID is required to seed data.")
    process.exit(1)
  }

  console.log(`🌱 Starting seed for admin: ${adminId}`)

  await clearDatabase()

  console.log("👥 Seeding customers...")
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  const seededCustomers = await db
    .insert(customers)
    .values(
      customerNames.map((name, index) => {
        const monthsAgo = randomInt(1, 12)
        const targetMonth = currentMonth - monthsAgo
        const year = targetMonth < 0 ? currentYear - 1 : currentYear
        const month = targetMonth < 0 ? 12 + targetMonth : targetMonth
        const createdAt = randomDateInMonth(year, month)
        const updatedAt = new Date(
          createdAt.getTime() + randomInt(0, 30) * 24 * 60 * 60 * 1000
        )

        return {
          adminId,
          name,
          email: customerEmails[index],
          phone: `+1-${randomInt(200, 999)}-${randomInt(100, 999)}-${randomInt(1000, 9999)}`,
          address: `${randomInt(100, 9999)} Main St, City, State ${randomInt(10000, 99999)}`,
          createdAt,
          updatedAt
        }
      })
    )
    .returning()

  console.log(`✅ Created ${seededCustomers.length} customers`)

  console.log("📦 Seeding products...")
  const seededProducts = await db
    .insert(products)
    .values(
      productNames.map((name) => {
        const monthsAgo = randomInt(1, 12)
        const targetMonth = currentMonth - monthsAgo
        const year = targetMonth < 0 ? currentYear - 1 : currentYear
        const month = targetMonth < 0 ? 12 + targetMonth : targetMonth
        const createdAt = randomDateInMonth(year, month)
        const updatedAt = new Date(
          createdAt.getTime() + randomInt(0, 30) * 24 * 60 * 60 * 1000
        )

        return {
          adminId,
          name,
          price: randomFloat(10, 500).toString(),
          stock: randomInt(0, 200),
          sku: generateSKU(),
          images:
            Math.random() > 0.3
              ? [`https://picsum.photos/400/400?random=${Math.random()}`]
              : [],
          createdAt,
          updatedAt
        }
      })
    )
    .returning()

  console.log(`✅ Created ${seededProducts.length} products`)

  console.log("🧾 Preparing invoice data across the last 12 months...")

  const invoiceData = Array.from({ length: 12 }, (_, monthOffset) => {
    const targetMonth = currentMonth - (11 - monthOffset)
    const year = targetMonth < 0 ? currentYear - 1 : currentYear
    const month = targetMonth < 0 ? 12 + targetMonth : targetMonth

    const monthName = new Date(year, month, 1).toLocaleString("default", {
      month: "long",
      year: "numeric"
    })

    const invoicesPerMonth = randomInt(2, 10)
    console.log(
      `  📅 Preparing ${invoicesPerMonth} invoices for ${monthName}...`
    )

    return Array.from({ length: invoicesPerMonth }, () => {
      const customer = seededCustomers[randomInt(0, seededCustomers.length - 1)]
      const itemCount = randomInt(1, 10)

      const selectedProducts = Array.from({ length: itemCount }, () => {
        const product = seededProducts[randomInt(0, seededProducts.length - 1)]
        const quantity = randomInt(1, 5)
        return {
          product,
          quantity,
          price: product.price
        }
      })

      const total = selectedProducts.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0
      )

      const paymentStatus = Math.random()
      const amountPaid =
        paymentStatus < 0.4
          ? total
          : paymentStatus < 0.8
            ? randomFloat(total * 0.1, total * 0.9)
            : randomFloat(0, total * 0.3)

      const invoiceDate = randomDateInMonth(year, month)

      return {
        invoice: {
          adminId,
          customerId: customer.id,
          total: total.toString(),
          amountPaid: amountPaid.toString(),
          createdAt: invoiceDate,
          updatedAt: invoiceDate
        },
        items: selectedProducts.map((item) => ({
          adminId,
          productId: item.product.id,
          quantity: item.quantity,
          price: item.price,
          createdAt: invoiceDate,
          updatedAt: invoiceDate
        }))
      }
    })
  }).flat()

  const invoicesToInsert = invoiceData.map((data, index) => ({
    ...data.invoice,
    id: generateInvoiceId(index + 1)
  }))

  const invoiceItemsToInsert = invoiceData.flatMap((data, invoiceIndex) =>
    data.items.map((item) => ({
      invoiceIndex,
      ...item
    }))
  )

  console.log(`💾 Bulk inserting ${invoicesToInsert.length} invoices...`)
  const seededInvoices = await db
    .insert(invoices)
    .values(invoicesToInsert)
    .returning()

  console.log(`💾 Inserting ${invoiceItemsToInsert.length} invoice items...`)
  await db.insert(invoiceItems).values(
    invoiceItemsToInsert.map((item) => ({
      invoiceId: seededInvoices[item.invoiceIndex].id,
      adminId: item.adminId,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }))
  )

  console.log(
    `✅ Created ${seededInvoices.length} invoices with items across 12 months`
  )

  console.log("✨ Seed completed successfully!")
}

// Parse command line arguments
const args = process.argv.slice(2)
const clearOnly = args.includes("-c") || args.includes("--clear")

if (clearOnly) {
  // Clear database only
  clearDatabase()
    .then(() => {
      console.log("🎉 Database cleared!")
      process.exit(0)
    })
    .catch((error) => {
      console.error("❌ Error clearing database:", error)
      process.exit(1)
    })
} else {
  // Full seed
  seed()
    .then(() => {
      console.log("🎉 Database seeded!")
      process.exit(0)
    })
    .catch((error) => {
      console.error("❌ Error seeding database:", error)
      process.exit(1)
    })
}
