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
import { nihongoLearningItems } from "./dictionary";

/* ------------------------------------------------------------------ */
/* Progress, Spaced Repetition & Gamification                         */
/* ------------------------------------------------------------------ */

export const customDecks = pgTable(
  "custom_decks",
  {
    id: serial("id").primaryKey(),
    brandId: integer("brand_id").references(() => brands.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 256 }).notNull(),
    description: text("description"),
    jlptLevel: varchar("jlpt_level", { length: 12 }).default("N5"),
    isPublic: boolean("is_public").notNull().default(true),
    shareCode: varchar("share_code", { length: 64 }),
    tags: jsonb("tags").$type<string[]>().default([]),
    cardCount: integer("card_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    deckShareIdx: index("custom_decks_share_idx").on(t.shareCode),
  }),
);

export const customDeckCards = pgTable(
  "custom_deck_cards",
  {
    id: serial("id").primaryKey(),
    deckId: integer("deck_id").notNull().references(() => customDecks.id, { onDelete: "cascade" }),
    cardType: varchar("card_type", { length: 32 }).notNull().default("vocab"),
    front: text("front").notNull(),
    back: text("back").notNull(),
    furigana: varchar("furigana", { length: 256 }),
    romaji: varchar("romaji", { length: 256 }),
    notes: text("notes"),
    audioUrl: text("audio_url"),
    position: integer("position").notNull().default(0),
    easeFactor: integer("ease_factor").notNull().default(250),
    intervalDays: integer("interval_days").notNull().default(1),
    repetitions: integer("repetitions").notNull().default(0),
    accuracy: integer("accuracy").notNull().default(100),
    nextReviewAt: timestamp("next_review_at", { withTimezone: true }).defaultNow().notNull(),
    lastReviewedAt: timestamp("last_reviewed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    deckCardIdx: index("custom_deck_cards_deck_idx").on(t.deckId),
  }),
);

export const srsFlashcards = pgTable(
  "srs_flashcards",
  {
    id: serial("id").primaryKey(),
    itemId: integer("item_id").notNull().references(() => nihongoLearningItems.id, { onDelete: "cascade" }),
    userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
    intervalDays: integer("interval_days").notNull().default(1),
    easeFactor: integer("ease_factor").notNull().default(250),
    repetitions: integer("repetitions").notNull().default(0),
    nextReviewAt: timestamp("next_review_at", { withTimezone: true }).defaultNow().notNull(),
    lastReviewedAt: timestamp("last_reviewed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    srsItemUserIdx: index("srs_flashcards_item_user_idx").on(t.itemId, t.userId),
  }),
);

export const learnerGamification = pgTable(
  "learner_gamification",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
    brandId: integer("brand_id").references(() => brands.id, { onDelete: "cascade" }),
    xp: integer("xp").notNull().default(420),
    streakDays: integer("streak_days").notNull().default(8),
    dailyGoalMinutes: integer("daily_goal_minutes").notNull().default(15),
    weeklyGoalMinutes: integer("weekly_goal_minutes").notNull().default(90),
    totalStudyMinutes: integer("total_study_minutes").notNull().default(135),
    completedLessonsCount: integer("completed_lessons_count").notNull().default(14),
    completedReviewsCount: integer("completed_reviews_count").notNull().default(95),
    averageTestScore: integer("average_test_score").notNull().default(92),
    streakFreezes: integer("streak_freezes").notNull().default(2),
    level: integer("level").notNull().default(3),
    levelTitle: varchar("level_title", { length: 64 }).notNull().default("Hiragana Adept"),
    bookmarks: jsonb("bookmarks").$type<number[]>().default([1, 2]),
    achievements: jsonb("achievements").$type<string[]>().default(["First 100 XP", "7-Day Streak Warrior", "Kanji Novice"]),
    badges: jsonb("badges").$type<Array<{ name: string; icon: string; description: string }>>().default([
      { name: "First 100 XP", icon: "⚡", description: "Earned your first 100 XP" },
      { name: "7-Day Streak", icon: "🔥", description: "Studied 7 days in a row" },
    ]),
    dailyChallenges: jsonb("daily_challenges").$type<Array<{ title: string; xpReward: number; isCompleted: boolean }>>().default([
      { title: "Review 10 flashcards in Spaced Repetition", xpReward: 20, isCompleted: true },
      { title: "Read today’s Japanese news article", xpReward: 30, isCompleted: true },
    ]),
    weakAreas: jsonb("weak_areas").$type<Array<{ item: string; meaning: string; accuracy: number }>>().default([
      { item: "食べる (taberu)", meaning: "To eat (Ichidan verb)", accuracy: 65 },
      { item: "日本 (nihon)", meaning: "Japan (4 strokes)", accuracy: 70 },
    ]),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    gamifyUserBrandIdx: index("learner_gamify_idx").on(t.userId, t.brandId),
  }),
);
