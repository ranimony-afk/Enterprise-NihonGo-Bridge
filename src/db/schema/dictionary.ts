import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  jsonb,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { brands, users } from "./users";

/* ------------------------------------------------------------------ */
/* Dictionary & Lexicon                                               */
/* ------------------------------------------------------------------ */

export const nihongoLearningItems = pgTable(
  "nihongo_learning_items",
  {
    id: serial("id").primaryKey(),
    brandId: integer("brand_id").references(() => brands.id, { onDelete: "cascade" }),
    category: varchar("category", { length: 64 }).notNull(),
    jlptLevel: varchar("jlpt_level", { length: 12 }).default("N5"),
    japanese: varchar("japanese", { length: 256 }).notNull(),
    furigana: varchar("furigana", { length: 256 }),
    romaji: varchar("romaji", { length: 256 }),
    meaning: text("meaning").notNull(),
    partOfSpeech: varchar("part_of_speech", { length: 64 }).default("Noun"),
    pitchAccent: varchar("pitch_accent", { length: 64 }),
    imageUrl: text("image_url"),
    synonyms: jsonb("synonyms").$type<string[]>().default([]),
    antonyms: jsonb("antonyms").$type<string[]>().default([]),
    frequency: integer("frequency").default(100),
    isFavorite: boolean("is_favorite").default(false),
    isBookmarked: boolean("is_bookmarked").default(false),
    reviewStatus: varchar("review_status", { length: 32 }).default("learning"),
    exampleSentenceJa: text("example_sentence_ja"),
    exampleSentenceEn: text("example_sentence_en"),
    grammarStructure: text("grammar_structure"),
    strokeCount: integer("stroke_count"),
    radicals: varchar("radicals", { length: 128 }),
    audioUrl: text("audio_url"),
    tags: jsonb("tags").$type<string[]>().default([]),
    status: varchar("status", { length: 24 }).notNull().default("published"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    nliCategoryIdx: index("nihongo_items_category_idx").on(t.category),
    nliJlptIdx: index("nihongo_items_jlpt_idx").on(t.jlptLevel),
  }),
);

export const userWordLists = pgTable(
  "user_word_lists",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 256 }).notNull(),
    shareCode: varchar("share_code", { length: 64 }),
    words: jsonb("words").$type<Array<{ japanese: string; reading: string; meaning: string; pitchAccent?: string }>>().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    userWordListShareIdx: index("user_word_lists_share_idx").on(t.shareCode),
  }),
);
