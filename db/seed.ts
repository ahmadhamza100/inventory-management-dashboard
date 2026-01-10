import "dotenv/config"

import { db } from "./index"
import { customers, invoiceItems, invoices, products } from "./schema"
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

async function seed() {
  console.log("🌱 Starting seed...")

  console.log("🗑️  Clearing existing data...")
  await db.delete(invoiceItems)
  await db.delete(invoices)
  await db.delete(products)
  await db.delete(customers)

  console.log("👥 Seeding customers...")
  const seededCustomers = await db
    .insert(customers)
    .values(
      customerNames.map((name, index) => ({
        name,
        email: customerEmails[index],
        phone: `+1-${randomInt(200, 999)}-${randomInt(100, 999)}-${randomInt(1000, 9999)}`,
        address: `${randomInt(100, 9999)} Main St, City, State ${randomInt(10000, 99999)}`
      }))
    )
    .returning()

  console.log(`✅ Created ${seededCustomers.length} customers`)

  console.log("📦 Seeding products...")
  const seededProducts = await db
    .insert(products)
    .values(
      productNames.map((name) => ({
        name,
        price: randomFloat(10, 500).toString(),
        stock: randomInt(0, 200),
        sku: generateSKU(),
        image:
          Math.random() > 0.3
            ? `https://picsum.photos/400/400?random=${Math.random()}`
            : null
      }))
    )
    .returning()

  console.log(`✅ Created ${seededProducts.length} products`)

  console.log("🧾 Preparing invoice data across the last 12 months...")
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

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
          customerId: customer.id,
          total: total.toString(),
          amountPaid: amountPaid.toString(),
          createdAt: invoiceDate,
          updatedAt: invoiceDate
        },
        items: selectedProducts.map((item) => ({
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

  console.log(
    `💾 Inserting ${invoiceItemsToInsert.length} invoice items...`
  )
  await db.insert(invoiceItems).values(
    invoiceItemsToInsert.map((item) => ({
      invoiceId: seededInvoices[item.invoiceIndex].id,
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

seed()
  .then(() => {
    console.log("🎉 Database seeded!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Error seeding database:", error)
    process.exit(1)
  })
