/**
 * Unified Platform Schema
 * -----------------------
 * Powers BOTH brands (Ascend Academy + Nihongo Bridge) from ONE backend.
 *
 * Phase 6 Duolingo-Style Gamification Additions:
 *  - learner_gamification: Extended with weeklyGoalMinutes, totalStudyMinutes,
 *    completedLessonsCount, completedReviewsCount, averageTestScore,
 *    streakFreezes, level, levelTitle, dailyChallenges, weakAreas, badges.
 *  - leaderboards: Public weekly and all-time XP leaderboards with ranking.
 */

import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  jsonb,
  uniqueIndex,
  index,
  boolean,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ */
/* Brands                                                              */
/* ------------------------------------------------------------------ */

export const brands = pgTable(
  "brands",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 64 }).notNull(),
    name: varchar("name", { length: 128 }).notNull(),
    tagline: varchar("tagline", { length: 256 }),
    defaultLocale: varchar("default_locale", { length: 12 }).notNull().default("en"),
    theme: jsonb("theme").$type<Record<string, string>>().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    slugUnique: uniqueIndex("brands_slug_unique").on(t.slug),
  }),
);

/* ------------------------------------------------------------------ */
/* Users                                                              */
/* ------------------------------------------------------------------ */

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 256 }).notNull(),
    displayName: varchar("display_name", { length: 128 }),
    role: varchar("role", { length: 32 }).notNull().default("learner"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    emailUnique: uniqueIndex("users_email_unique").on(t.email),
  }),
);

/* ------------------------------------------------------------------ */
/* DAM: Asset Folders & Collections                                    */
/* ------------------------------------------------------------------ */

export const assetFolders = pgTable(
  "asset_folders",
  {
    id: serial("id").primaryKey(),
    brandId: integer("brand_id").references(() => brands.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 128 }).notNull(),
    slug: varchar("slug", { length: 128 }).notNull(),
    parentId: integer("parent_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    brandFolderIdx: index("asset_folders_brand_idx").on(t.brandId),
  }),
);

export const assetCollections = pgTable(
  "asset_collections",
  {
    id: serial("id").primaryKey(),
    brandId: integer("brand_id").references(() => brands.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 128 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 64 }).default("general"),
    tags: jsonb("tags").$type<string[]>().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    brandCollectionIdx: index("asset_collections_brand_idx").on(t.brandId),
  }),
);

/* ------------------------------------------------------------------ */
/* Digital Asset Management (DAM) - Enterprise                         */
/* ------------------------------------------------------------------ */

export const assets = pgTable(
  "assets",
  {
    id: serial("id").primaryKey(),
    brandId: integer("brand_id").references(() => brands.id, { onDelete: "cascade" }),
    folderId: integer("folder_id").references(() => assetFolders.id, { onDelete: "set null" }),
    collectionId: integer("collection_id").references(() => assetCollections.id, { onDelete: "set null" }),
    kind: varchar("kind", { length: 32 }).notNull(),
    url: text("url").notNull(),
    cdnUrl: text("cdn_url"),
    title: varchar("title", { length: 256 }),
    altText: varchar("alt_text", { length: 512 }),
    caption: text("caption"),
    category: varchar("category", { length: 64 }).default("media"),
    tags: jsonb("tags").$type<string[]>().default([]),
    copyright: varchar("copyright", { length: 256 }),
    licensing: varchar("licensing", { length: 128 }),
    owner: varchar("owner", { length: 128 }),
    usageRights: varchar("usage_rights", { length: 128 }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    checksum: varchar("checksum", { length: 128 }),
    mimeType: varchar("mime_type", { length: 128 }),
    bytes: integer("bytes"),
    width: integer("width"),
    height: integer("height"),
    aspectRatio: varchar("aspect_ratio", { length: 16 }),
    variants: jsonb("variants").$type<Record<string, string>>().default({}),
    transcodeStatus: varchar("transcode_status", { length: 32 }).default("ready"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    brandIdx: index("assets_brand_idx").on(t.brandId),
    kindIdx: index("assets_kind_idx").on(t.kind),
    checksumIdx: index("assets_checksum_idx").on(t.checksum),
    categoryIdx: index("assets_category_idx").on(t.category),
  }),
);

export const assetVersions = pgTable(
  "asset_versions",
  {
    id: serial("id").primaryKey(),
    assetId: integer("asset_id")
      .notNull()
      .references(() => assets.id, { onDelete: "cascade" }),
    versionNumber: integer("version_number").notNull().default(1),
    url: text("url").notNull(),
    bytes: integer("bytes"),
    mimeType: varchar("mime_type", { length: 128 }),
    changeNotes: text("change_notes"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    assetVersionIdx: index("asset_versions_asset_idx").on(t.assetId),
  }),
);

export const assetUsages = pgTable(
  "asset_usages",
  {
    id: serial("id").primaryKey(),
    assetId: integer("asset_id")
      .notNull()
      .references(() => assets.id, { onDelete: "cascade" }),
    entityType: varchar("entity_type", { length: 32 }).notNull(),
    entityId: integer("entity_id").notNull(),
    field: varchar("field", { length: 64 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    assetUsageIdx: index("asset_usages_asset_idx").on(t.assetId),
    entityUsageIdx: index("asset_usages_entity_idx").on(t.entityType, t.entityId),
  }),
);

/* ------------------------------------------------------------------ */
/* CMS Pages                                                           */
/* ------------------------------------------------------------------ */

export const pages = pgTable(
  "pages",
  {
    id: serial("id").primaryKey(),
    brandId: integer("brand_id")
      .notNull()
      .references(() => brands.id, { onDelete: "cascade" }),
    slug: varchar("slug", { length: 128 }).notNull(),
    title: varchar("title", { length: 256 }).notNull(),
    body: text("body").notNull().default(""),
    status: varchar("status", { length: 24 }).notNull().default("draft"),
    locale: varchar("locale", { length: 12 }).notNull().default("en"),
    authorId: integer("author_id").references(() => users.id, { onDelete: "set null" }),
    heroAssetId: integer("hero_asset_id").references(() => assets.id, { onDelete: "set null" }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    brandSlugLocaleUnique: uniqueIndex("pages_brand_slug_locale_unique").on(
      t.brandId,
      t.slug,
      t.locale,
    ),
    statusIdx: index("pages_status_idx").on(t.status),
  }),
);

export const contentSections = pgTable(
  "content_sections",
  {
    id: serial("id").primaryKey(),
    brandId: integer("brand_id")
      .notNull()
      .references(() => brands.id, { onDelete: "cascade" }),
    pageSlug: varchar("page_slug", { length: 128 }).notNull(),
    sectionKey: varchar("section_key", { length: 64 }).notNull(),
    title: varchar("title", { length: 256 }),
    subtitle: text("subtitle"),
    content: jsonb("content").$type<Record<string, unknown>>().default({}),
    position: integer("position").notNull().default(0),
    status: varchar("status", { length: 24 }).notNull().default("published"),
    locale: varchar("locale", { length: 12 }).notNull().default("en"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    lookupUnique: uniqueIndex("content_sections_lookup_unique").on(
      t.brandId,
      t.pageSlug,
      t.sectionKey,
      t.locale,
    ),
    sectionKeyIdx: index("content_sections_key_idx").on(t.sectionKey),
  }),
);

export const contentVersions = pgTable(
  "content_versions",
  {
    id: serial("id").primaryKey(),
    entityType: varchar("entity_type", { length: 32 }).notNull(),
    entityId: integer("entity_id").notNull(),
    versionNumber: integer("version_number").notNull().default(1),
    snapshot: jsonb("snapshot").$type<Record<string, unknown>>().notNull(),
    changeSummary: text("change_summary"),
    isAutosave: boolean("is_autosave").notNull().default(false),
    authorId: integer("author_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    entityVersionIdx: index("content_versions_entity_idx").on(t.entityType, t.entityId),
  }),
);

export const brandSettings = pgTable(
  "brand_settings",
  {
    id: serial("id").primaryKey(),
    brandId: integer("brand_id")
      .notNull()
      .references(() => brands.id, { onDelete: "cascade" }),
    category: varchar("category", { length: 64 }).notNull(),
    data: jsonb("data").$type<Record<string, unknown>>().notNull().default({}),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    brandCategoryUnique: uniqueIndex("brand_settings_category_unique").on(t.brandId, t.category),
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

/* ------------------------------------------------------------------ */
/* LMS: Courses -> Modules -> Lessons                                  */
/* ------------------------------------------------------------------ */

export const courses = pgTable(
  "courses",
  {
    id: serial("id").primaryKey(),
    brandId: integer("brand_id")
      .notNull()
      .references(() => brands.id, { onDelete: "cascade" }),
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
    brandSlugLocaleUnique: uniqueIndex("courses_brand_slug_locale_unique").on(
      t.brandId,
      t.slug,
      t.locale,
    ),
    statusIdx: index("courses_status_idx").on(t.status),
  }),
);

export const modules = pgTable(
  "modules",
  {
    id: serial("id").primaryKey(),
    courseId: integer("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 256 }).notNull(),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    courseIdx: index("modules_course_idx").on(t.courseId),
  }),
);

export const lessons = pgTable(
  "lessons",
  {
    id: serial("id").primaryKey(),
    moduleId: integer("module_id")
      .notNull()
      .references(() => modules.id, { onDelete: "cascade" }),
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

/* ------------------------------------------------------------------ */
/* Phase 7: Nihongo Learning Master Items                              */
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

/* ------------------------------------------------------------------ */
/* Phase 3 & 8: Custom Quizlet-Style Decks & Cards                     */
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
    deckId: integer("deck_id")
      .notNull()
      .references(() => customDecks.id, { onDelete: "cascade" }),
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
    itemId: integer("item_id")
      .notNull()
      .references(() => nihongoLearningItems.id, { onDelete: "cascade" }),
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

export const nihongoQuizzes = pgTable(
  "nihongo_quizzes",
  {
    id: serial("id").primaryKey(),
    brandId: integer("brand_id").references(() => brands.id, { onDelete: "cascade" }),
    category: varchar("category", { length: 64 }).notNull(),
    jlptLevel: varchar("jlpt_level", { length: 12 }).default("N5"),
    question: text("question").notNull(),
    options: jsonb("options").$type<string[]>().notNull(),
    correctIndex: integer("correct_index").notNull().default(0),
    explanation: text("explanation"),
    audioPrompt: text("audio_prompt"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    quizCatIdx: index("nihongo_quizzes_cat_idx").on(t.category),
  }),
);

/* ------------------------------------------------------------------ */
/* Phase 6: Duolingo-Style Gamification & Leaderboards                */
/* ------------------------------------------------------------------ */

export const learnerGamification = pgTable(
  "learner_gamification",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
    brandId: integer("brand_id").references(() => brands.id, { onDelete: "cascade" }),
    xp: integer("xp").notNull().default(340),
    streakDays: integer("streak_days").notNull().default(8),
    dailyGoalMinutes: integer("daily_goal_minutes").notNull().default(15),
    weeklyGoalMinutes: integer("weekly_goal_minutes").notNull().default(90),
    totalStudyMinutes: integer("total_study_minutes").notNull().default(125),
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
      { name: "JLPT Explorer", icon: "🗾", description: "Completed your first JLPT practice module" },
    ]),
    dailyChallenges: jsonb("daily_challenges").$type<Array<{ title: string; xpReward: number; isCompleted: boolean }>>().default([
      { title: "Review 10 flashcards in Spaced Repetition", xpReward: 20, isCompleted: true },
      { title: "Read today's Japanese news article", xpReward: 30, isCompleted: false },
      { title: "Score 100% on a JLPT N5 quiz", xpReward: 25, isCompleted: false },
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

/* ------------------------------------------------------------------ */
/* Phase 5 Daily News Engine (TODAI-Style Japanese News Reader)        */
/* ------------------------------------------------------------------ */

export const newsArticles = pgTable(
  "news_articles",
  {
    id: serial("id").primaryKey(),
    brandId: integer("brand_id").references(() => brands.id, { onDelete: "cascade" }),
    slug: varchar("slug", { length: 128 }).notNull(),
    title: varchar("title", { length: 256 }).notNull(),
    summary: text("summary").notNull(),
    japaneseText: text("japanese_text").notNull(),
    furiganaText: text("furigana_text"),
    englishTranslation: text("english_translation").notNull(),
    tamilTranslation: text("tamil_translation"),
    malayalamTranslation: text("malayalam_translation"),
    difficultyLevel: varchar("difficulty_level", { length: 12 }).notNull().default("N5"),
    readingMinutes: integer("reading_minutes").notNull().default(3),
    audioUrl: text("audio_url"),
    grammarHighlights: jsonb("grammar_highlights").$type<string[]>().default([]),
    extractedVocabulary: jsonb("extracted_vocabulary").$type<Array<{ japanese: string; furigana: string; meaning: string }>>().default([]),
    extractedKanji: jsonb("extracted_kanji").$type<Array<{ kanji: string; meaning: string; strokes: number }>>().default([]),
    comprehensionQuestions: jsonb("comprehension_questions").$type<Array<{ question: string; options: string[]; correctIndex: number; explanation: string }>>().default([]),
    isToday: boolean("is_today").notNull().default(false),
    status: varchar("status", { length: 24 }).notNull().default("published"),
    publishedAt: timestamp("published_at", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    newsSlugIdx: index("news_articles_slug_idx").on(t.slug),
    newsTodayIdx: index("news_articles_today_idx").on(t.isToday),
  }),
);

/* ------------------------------------------------------------------ */
/* Translations (locale overlays for any entity)                       */
/* ------------------------------------------------------------------ */

export const translations = pgTable(
  "translations",
  {
    id: serial("id").primaryKey(),
    entityType: varchar("entity_type", { length: 32 }).notNull(),
    entityId: integer("entity_id").notNull(),
    locale: varchar("locale", { length: 12 }).notNull(),
    field: varchar("field", { length: 64 }).notNull(),
    value: text("value").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    lookupUnique: uniqueIndex("translations_lookup_unique").on(
      t.entityType,
      t.entityId,
      t.locale,
      t.field,
    ),
  }),
);

export const translationMemory = pgTable(
  "translation_memory",
  {
    id: serial("id").primaryKey(),
    sourceText: text("source_text").notNull(),
    sourceLocale: varchar("source_locale", { length: 12 }).notNull().default("en"),
    targetLocale: varchar("target_locale", { length: 12 }).notNull(),
    translatedText: text("translated_text").notNull(),
    context: varchar("context", { length: 128 }),
    qualityScore: integer("quality_score").notNull().default(100),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    tmLookupIdx: index("translation_memory_lookup_idx").on(t.sourceLocale, t.targetLocale),
  }),
);

export const translationWorkflows = pgTable(
  "translation_workflows",
  {
    id: serial("id").primaryKey(),
    entityType: varchar("entity_type", { length: 32 }).notNull(),
    entityId: integer("entity_id").notNull(),
    targetLocale: varchar("target_locale", { length: 12 }).notNull(),
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    missingKeys: jsonb("missing_keys").$type<string[]>().default([]),
    assignedTranslator: varchar("assigned_translator", { length: 128 }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    twLookupIdx: index("translation_workflows_lookup_idx").on(t.entityType, t.entityId, t.targetLocale),
  }),
);

export const editorialComments = pgTable(
  "editorial_comments",
  {
    id: serial("id").primaryKey(),
    entityType: varchar("entity_type", { length: 32 }).notNull(),
    entityId: integer("entity_id").notNull(),
    authorId: integer("author_id").references(() => users.id, { onDelete: "set null" }),
    body: text("body").notNull(),
    mentions: jsonb("mentions").$type<string[]>().default([]),
    isResolved: boolean("is_resolved").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    ecLookupIdx: index("editorial_comments_lookup_idx").on(t.entityType, t.entityId),
  }),
);

export const editorialTasks = pgTable(
  "editorial_tasks",
  {
    id: serial("id").primaryKey(),
    entityType: varchar("entity_type", { length: 32 }).notNull(),
    entityId: integer("entity_id").notNull(),
    title: varchar("title", { length: 256 }).notNull(),
    assigneeId: integer("assignee_id").references(() => users.id, { onDelete: "set null" }),
    reviewerId: integer("reviewer_id").references(() => users.id, { onDelete: "set null" }),
    approverId: integer("approver_id").references(() => users.id, { onDelete: "set null" }),
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    dueDate: timestamp("due_date", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    etLookupIdx: index("editorial_tasks_lookup_idx").on(t.entityType, t.entityId),
  }),
);

export const editorialCalendar = pgTable(
  "editorial_calendar",
  {
    id: serial("id").primaryKey(),
    brandId: integer("brand_id").references(() => brands.id, { onDelete: "cascade" }),
    entityType: varchar("entity_type", { length: 32 }).notNull(),
    entityId: integer("entity_id").notNull(),
    title: varchar("title", { length: 256 }).notNull(),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
    status: varchar("status", { length: 32 }).notNull().default("scheduled"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    calLookupIdx: index("editorial_calendar_lookup_idx").on(t.brandId, t.scheduledAt),
  }),
);

export const editorialNotifications = pgTable(
  "editorial_notifications",
  {
    id: serial("id").primaryKey(),
    recipientId: integer("recipient_id").references(() => users.id, { onDelete: "cascade" }),
    actorId: integer("actor_id").references(() => users.id, { onDelete: "set null" }),
    type: varchar("type", { length: 64 }).notNull(),
    message: text("message").notNull(),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    notifRecipientIdx: index("editorial_notif_recipient_idx").on(t.recipientId),
  }),
);

export const editorialEvents = pgTable(
  "editorial_events",
  {
    id: serial("id").primaryKey(),
    entityType: varchar("entity_type", { length: 32 }).notNull(),
    entityId: integer("entity_id").notNull(),
    fromStatus: varchar("from_status", { length: 24 }),
    toStatus: varchar("to_status", { length: 24 }).notNull(),
    actorId: integer("actor_id").references(() => users.id, { onDelete: "set null" }),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    entityIdx: index("editorial_events_entity_idx").on(t.entityType, t.entityId),
  }),
);
