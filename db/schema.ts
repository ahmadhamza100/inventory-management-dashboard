import {
  integer,
  decimal,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar
} from "drizzle-orm/pg-core"

const timestamps = {
  deletedAt: timestamp(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp()
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date())
}

export const products = pgTable("products", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 256 }).notNull(),
  price: decimal({ precision: 10, scale: 2 }).notNull(),
  stock: integer().notNull(),
  sku: varchar({ length: 256 }).notNull(),
  image: text(),
  ...timestamps
})

export type Product = typeof products.$inferSelect

export const customers = pgTable("customers", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 256 }).notNull(),
  email: varchar({ length: 320 }),
  phone: varchar({ length: 15 }),
  address: text(),
  ...timestamps
})

export type Customer = typeof customers.$inferSelect

export const invoices = pgTable("invoices", {
  id: uuid().primaryKey().defaultRandom(),
  customerId: uuid().references(() => customers.id),
  total: decimal({ precision: 10, scale: 2 }).notNull(),
  amountPaid: decimal({ precision: 10, scale: 2 }).notNull(),
  ...timestamps
})

export type Invoice = typeof invoices.$inferSelect

export const invoiceItems = pgTable("invoice_items", {
  id: uuid().primaryKey().defaultRandom(),
  invoiceId: uuid().references(() => invoices.id),
  productId: uuid().references(() => products.id),
  quantity: integer().notNull(),
  price: decimal({ precision: 10, scale: 2 }).notNull(),
  ...timestamps
})

export type InvoiceItem = typeof invoiceItems.$inferSelect
