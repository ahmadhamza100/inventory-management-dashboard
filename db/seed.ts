import "dotenv/config"

import { db } from "./index"
import { customers, invoiceItems, invoices, products } from "./schema"
import { generateSKU } from "@/utils/helpers"

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

async function seed() {
  console.log("🌱 Starting seed...")

  // Clear existing data
  console.log("🗑️  Clearing existing data...")
  await db.delete(invoiceItems)
  await db.delete(invoices)
  await db.delete(products)
  await db.delete(customers)

  // Seed customers
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

  // Seed products
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

  // Seed invoices with items
  console.log("🧾 Seeding invoices...")
  const invoiceCount = randomInt(15, 25)
  const seededInvoices = []

  for (let i = 0; i < invoiceCount; i++) {
    const customer = seededCustomers[randomInt(0, seededCustomers.length - 1)]
    const itemCount = randomInt(1, 10)

    // Select random products for this invoice
    const selectedProducts = Array.from({ length: itemCount }, () => {
      const product = seededProducts[randomInt(0, seededProducts.length - 1)]
      const quantity = randomInt(1, 5)
      return {
        product,
        quantity,
        price: product.price
      }
    })

    // Calculate invoice total
    const total = selectedProducts.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    )
    const amountPaid = randomFloat(total * 0.5, total)

    // Create invoice
    const [invoice] = await db
      .insert(invoices)
      .values({
        customerId: customer.id,
        total: total.toString(),
        amountPaid: amountPaid.toString()
      })
      .returning()

    seededInvoices.push(invoice)

    // Create invoice items
    await db.insert(invoiceItems).values(
      selectedProducts.map((item) => ({
        invoiceId: invoice.id,
        productId: item.product.id,
        quantity: item.quantity,
        price: item.price
      }))
    )
  }

  console.log(`✅ Created ${seededInvoices.length} invoices with items`)

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
