import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { brands } from "./users";

/* ------------------------------------------------------------------ */
/* Grammar Rules                                                      */
/* ------------------------------------------------------------------ */

export const grammarRules = pgTable(
  "grammar_rules",
  {
    id: serial("id").primaryKey(),
    brandId: integer("brand_id").references(() => brands.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 256 }).notNull(),
    pattern: varchar("pattern", { length: 256 }).notNull(),
    meaning: text("meaning").notNull(),
    explanation: text("explanation").notNull(),
    level: varchar("level", { length: 12 }).default("N5"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    grammarBrandIdx: index("grammar_rules_brand_idx").on(t.brandId),
    grammarLevelIdx: index("grammar_rules_level_idx").on(t.level),
  })
);
