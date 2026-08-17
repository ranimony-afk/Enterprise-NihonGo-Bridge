import {
  pgTable,
  serial,
  varchar,
  integer,
  boolean,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { brands, users } from "./users";

/* ------------------------------------------------------------------ */
/* Payments, Billing & Coupons                                        */
/* ------------------------------------------------------------------ */

export const coupons = pgTable(
  "coupons",
  {
    id: serial("id").primaryKey(),
    brandId: integer("brand_id").references(() => brands.id, { onDelete: "cascade" }),
    code: varchar("code", { length: 64 }).notNull(),
    discountPercent: integer("discount_percent").notNull().default(0),
    active: boolean("active").notNull().default(true),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    couponCodeUnique: uniqueIndex("coupons_code_unique").on(t.code),
    couponBrandIdx: index("coupons_brand_idx").on(t.brandId),
  })
);

export const transactions = pgTable(
  "transactions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
    brandId: integer("brand_id").references(() => brands.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(),
    currency: varchar("currency", { length: 12 }).notNull().default("INR"),
    gateway: varchar("gateway", { length: 32 }).notNull().default("stripe"),
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    referenceId: varchar("reference_id", { length: 256 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    transactionUserIdx: index("transactions_user_idx").on(t.userId),
    transactionBrandIdx: index("transactions_brand_idx").on(t.brandId),
    transactionStatusIdx: index("transactions_status_idx").on(t.status),
    transactionRefIdx: index("transactions_ref_idx").on(t.referenceId),
  })
);
