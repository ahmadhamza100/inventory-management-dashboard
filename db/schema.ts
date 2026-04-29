import {
  integer,
  decimal,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  pgEnum,
  index,
  primaryKey,
  foreignKey
} from "drizzle-orm/pg-core"

const timestamps = {
  deletedAt: timestamp(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp()
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date())
}

export const products = pgTable(
  "products",
  {
    id: uuid().primaryKey().defaultRandom(),
    adminId: text("admin_id").notNull(),
    name: varchar({ length: 256 }).notNull(),
    price: decimal({ precision: 10, scale: 2 }).notNull(),
    stock: integer().notNull(),
    sku: varchar({ length: 256 }).notNull(),
    images: text().array().notNull().default([]),
    ...timestamps
  },
  (table) => [
    index("products_admin_deleted_idx").on(table.adminId, table.deletedAt)
  ]
)

export type Product = typeof products.$inferSelect

export const customers = pgTable(
  "customers",
  {
    id: uuid().primaryKey().defaultRandom(),
    adminId: text("admin_id").notNull(),
    name: varchar({ length: 256 }).notNull(),
    email: varchar({ length: 320 }),
    phone: varchar({ length: 15 }),
    address: text(),
    ...timestamps
  },
  (table) => [
    index("customers_admin_deleted_idx").on(table.adminId, table.deletedAt)
  ]
)

export type Customer = typeof customers.$inferSelect

export const invoices = pgTable(
  "invoices",
  {
    id: varchar({ length: 50 }).notNull(),
    adminId: text("admin_id").notNull(),
    customerId: uuid().references(() => customers.id),
    total: decimal({ precision: 10, scale: 2 }).notNull(),
    amountPaid: decimal({ precision: 10, scale: 2 }).notNull(),
    ...timestamps
  },
  (table) => [
    primaryKey({
      name: "invoices_admin_id_id_pk",
      columns: [table.adminId, table.id]
    }),
    index("invoices_admin_deleted_idx").on(table.adminId, table.deletedAt),
    index("invoices_customer_id_idx").on(table.customerId)
  ]
)

export type Invoice = typeof invoices.$inferSelect

export const invoiceItems = pgTable(
  "invoice_items",
  {
    id: uuid().primaryKey().defaultRandom(),
    adminId: text("admin_id").notNull(),
    invoiceId: varchar({ length: 50 }).notNull(),
    productId: uuid().references(() => products.id),
    quantity: integer().notNull(),
    price: decimal({ precision: 10, scale: 2 }).notNull(),
    ...timestamps
  },
  (table) => [
    foreignKey({
      name: "invoice_items_admin_id_invoiceId_invoices_admin_id_id_fk",
      columns: [table.adminId, table.invoiceId],
      foreignColumns: [invoices.adminId, invoices.id]
    }).onDelete("cascade"),
    index("invoice_items_invoice_id_idx").on(table.invoiceId),
    index("invoice_items_admin_invoice_id_idx").on(
      table.adminId,
      table.invoiceId
    ),
    index("invoice_items_product_id_idx").on(table.productId)
  ]
)

export type InvoiceItem = typeof invoiceItems.$inferSelect

export const invoiceCounters = pgTable("invoice_counters", {
  adminId: text("admin_id").primaryKey().notNull(),
  nextValue: integer("next_value").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
})

export const transactionTypeEnum = pgEnum("transaction_type_enum", [
  "cash_in",
  "cash_out"
])

export const transactions = pgTable(
  "transactions",
  {
    id: uuid().primaryKey().defaultRandom(),
    adminId: text("admin_id").notNull(),
    type: transactionTypeEnum("type").notNull(),
    amount: decimal({ precision: 10, scale: 2 }).notNull(),
    date: timestamp().notNull(),
    description: text(),
    ...timestamps
  },
  (table) => [
    index("transactions_admin_deleted_idx").on(table.adminId, table.deletedAt)
  ]
)

export type Transaction = typeof transactions.$inferSelect
