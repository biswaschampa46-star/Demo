import {
  pgTable,
  pgEnum,
  uuid,
  serial,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ */
/*  Products                                                           */
/* ------------------------------------------------------------------ */

export type VariantGroup = { name: string; options: string[] };

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: varchar("slug", { length: 160 }).notNull().unique(),
    name: varchar("name", { length: 160 }).notNull(),
    description: text("description").notNull().default(""),
    material: text("material").notNull().default(""),
    category: varchar("category", { length: 40 }).notNull(),
    price: integer("price").notNull(), // in BDT
    compareAtPrice: integer("compare_at_price"),
    image: varchar("image", { length: 300 }).notNull(),
    isFeatured: boolean("is_featured").notNull().default(false),
    isNew: boolean("is_new").notNull().default(false),
    stock: integer("stock").notNull().default(25),
    variants: jsonb("variants").$type<VariantGroup[]>().notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("products_category_idx").on(t.category)],
);

export type Product = typeof products.$inferSelect;

/* ------------------------------------------------------------------ */
/*  Orders                                                             */
/* ------------------------------------------------------------------ */

export const ORDER_STAGES = [
  "pending_payment",
  "payment_verified",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
] as const;

export type OrderStage = (typeof ORDER_STAGES)[number];

export const orderStatusEnum = pgEnum("order_status", [
  "pending_payment",
  "payment_verified",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);

export type OrderItem = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  variant: string;
  price: number;
  qty: number;
};

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderNumber: varchar("order_number", { length: 24 }).notNull().unique(),
    customerName: varchar("customer_name", { length: 120 }).notNull(),
    phone: varchar("phone", { length: 20 }).notNull(),
    email: varchar("email", { length: 160 }),
    address: text("address").notNull(),
    city: varchar("city", { length: 80 }).notNull(),
    notes: text("notes"),
    paymentMethod: varchar("payment_method", { length: 20 }).notNull(), // bkash | nagad | rocket
    senderNumber: varchar("sender_number", { length: 20 }),
    transactionId: varchar("transaction_id", { length: 60 }),
    subtotal: integer("subtotal").notNull(),
    shippingFee: integer("shipping_fee").notNull(),
    total: integer("total").notNull(),
    items: jsonb("items").$type<OrderItem[]>().notNull(),
    status: orderStatusEnum("status").notNull().default("pending_payment"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("orders_phone_idx").on(t.phone)],
);

export type Order = typeof orders.$inferSelect;

/* ------------------------------------------------------------------ */
/*  Newsletter                                                         */
/* ------------------------------------------------------------------ */

export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 160 }).notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* ------------------------------------------------------------------ */
/*  Contact messages                                                   */
/* ------------------------------------------------------------------ */

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 160 }).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
