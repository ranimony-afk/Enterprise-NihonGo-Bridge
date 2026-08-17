import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { brands, users } from "./users";
import { assets } from "./media";

/* ------------------------------------------------------------------ */
/* LMS Courses, Modules & Enrollments                                 */
/* ------------------------------------------------------------------ */

export const courses = pgTable(
  "courses",
  {
    id: serial("id").primaryKey(),
    brandId: integer("brand_id").notNull().references(() => brands.id, { onDelete: "cascade" }),
    slug: varchar("slug", { length: 128 }).notNull(),
    title: varchar("title", { length: 256 }).notNull(),
    summary: text("summary").notNull().default(""),
    level: varchar("level", { length: 32 }).notNull().default("beginner"),
    locale: varchar("locale", { length: 12 }).notNull().default("en"),
    status: varchar("status", { length: 24 }).notNull().default("draft"),
    coverAssetId: integer("cover_asset_id").references(() => assets.id, { onDelete: "set null" }),
    isFeatured: boolean("is_featured").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    brandSlugLocaleUnique: uniqueIndex("courses_brand_slug_locale_unique").on(t.brandId, t.slug, t.locale),
    statusIdx: index("courses_status_idx").on(t.status),
  }),
);

export const modules = pgTable(
  "modules",
  {
    id: serial("id").primaryKey(),
    courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 256 }).notNull(),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    courseIdx: index("modules_course_idx").on(t.courseId),
  }),
);

export const enrollments = pgTable(
  "enrollments",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  }
);
