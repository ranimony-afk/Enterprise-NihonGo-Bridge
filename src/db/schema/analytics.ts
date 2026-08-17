import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { downloadableResources } from "./media";

/* ------------------------------------------------------------------ */
/* Analytics, Leaderboards, Audits & Metrics                          */
/* ------------------------------------------------------------------ */

export const leaderboards = pgTable(
  "leaderboards",
  {
    id: serial("id").primaryKey(),
    displayName: varchar("display_name", { length: 128 }).notNull(),
    xp: integer("xp").notNull(),
    rank: integer("rank").notNull(),
    avatarEmoji: varchar("avatar_emoji", { length: 8 }).default("🦊"),
    streakDays: integer("streak_days").notNull().default(1),
    league: varchar("league", { length: 32 }).notNull().default("Sapphire League"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    lbRankIdx: index("leaderboards_rank_idx").on(t.rank),
  }),
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: serial("id").primaryKey(),
    action: varchar("action", { length: 64 }).notNull(),
    entityType: varchar("entity_type", { length: 32 }).notNull(),
    entityId: integer("entity_id").notNull(),
    actorId: integer("actor_id").references(() => users.id, { onDelete: "set null" }),
    details: jsonb("details").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    actionIdx: index("audit_logs_action_idx").on(t.action),
    entityIdx: index("audit_logs_entity_idx").on(t.entityType, t.entityId),
  }),
);

export const downloadHistory = pgTable(
  "download_history",
  {
    id: serial("id").primaryKey(),
    resourceId: integer("resource_id").notNull().references(() => downloadableResources.id, { onDelete: "cascade" }),
    userEmail: varchar("user_email", { length: 256 }).notNull(),
    downloadedAt: timestamp("downloaded_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    dhUserIdx: index("download_hist_user_idx").on(t.userEmail),
  }),
);
