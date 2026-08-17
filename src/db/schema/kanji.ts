import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  jsonb,
  boolean,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ */
/* Kanji Dictionary                                                   */
/* ------------------------------------------------------------------ */

export const kanjiDictionary = pgTable(
  "kanji_dictionary",
  {
    id: serial("id").primaryKey(),
    kanji: varchar("kanji", { length: 16 }).notNull(),
    meaning: varchar("meaning", { length: 256 }).notNull(),
    onyomi: varchar("onyomi", { length: 128 }),
    kunyomi: varchar("kunyomi", { length: 128 }),
    radicals: varchar("radicals", { length: 128 }),
    strokeCount: integer("stroke_count").notNull(),
    frequencyRank: integer("frequency_rank"),
    gradeLevel: integer("grade_level").default(1),
    jlptLevel: varchar("jlpt_level", { length: 12 }).default("N5"),
    themeCategory: varchar("theme_category", { length: 64 }).default("nature"),
    audioUrl: text("audio_url"),
    strokeOrderSvg: text("stroke_order_svg"),
    componentBreakdown: jsonb("component_breakdown").$type<Array<{ component: string; meaning: string }>>().default([]),
    kanjiFamilies: jsonb("kanji_families").$type<Array<{ family: string; members: string[] }>>().default([]),
    similarKanji: jsonb("similar_kanji").$type<Array<{ kanji: string; meaning: string; distinction: string }>>().default([]),
    isFavorite: boolean("is_favorite").default(false),
    masteryScore: integer("mastery_score").default(0),
    examples: jsonb("examples").$type<Array<{ word: string; reading: string; meaning: string }>>().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    kanjiUnique: uniqueIndex("kanji_dict_unique").on(t.kanji),
    kanjiJlptIdx: index("kanji_dict_jlpt_idx").on(t.jlptLevel),
    kanjiThemeIdx: index("kanji_dict_theme_idx").on(t.themeCategory),
  }),
);
