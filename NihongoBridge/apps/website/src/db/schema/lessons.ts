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
  jsonb,
} from "drizzle-orm/pg-core";
import { brands } from "./users";
import { modules } from "./courses";
import { assets } from "./media";

/* ------------------------------------------------------------------ */
/* LMS Lessons & Conversation Lab                                      */
/* ------------------------------------------------------------------ */

export const lessons = pgTable(
  "lessons",
  {
    id: serial("id").primaryKey(),
    moduleId: integer("module_id").notNull().references(() => modules.id, { onDelete: "cascade" }),
    slug: varchar("slug", { length: 128 }).notNull(),
    title: varchar("title", { length: 256 }).notNull(),
    body: text("body").notNull().default(""),
    position: integer("position").notNull().default(0),
    durationMinutes: integer("duration_minutes").notNull().default(0),
    videoAssetId: integer("video_asset_id").references(() => assets.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    moduleSlugUnique: uniqueIndex("lessons_module_slug_unique").on(t.moduleId, t.slug),
  }),
);

export const conversationLessons = pgTable(
  "conversation_lessons",
  {
    id: serial("id").primaryKey(),
    brandId: integer("brand_id").references(() => brands.id, { onDelete: "cascade" }),
    category: varchar("category", { length: 64 }).notNull(), // greetings | shopping | restaurant | travel | office | interview | hospital | school | business
    title: varchar("title", { length: 256 }).notNull(),
    situation: text("situation").notNull(),
    difficultyLevel: varchar("difficulty_level", { length: 12 }).default("N5"),
    dialogues: jsonb("dialogues").$type<Array<{ speaker: string; role: string; japanese: string; furigana: string; romaji: string; english: string; audioUrl?: string }>>().default([]),
    vocabulary: jsonb("vocabulary").$type<Array<{ word: string; reading: string; meaning: string }>>().default([]),
    grammarNotes: jsonb("grammar_notes").$type<string[]>().default([]),
    rolePlayPrompt: text("role_play_prompt"),
    audioUrl: text("audio_url"),
    isCompleted: boolean("is_completed").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    convCatIdx: index("conv_lessons_cat_idx").on(t.category),
  }),
);
