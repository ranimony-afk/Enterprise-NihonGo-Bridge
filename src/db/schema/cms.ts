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
import { brands, users } from "./users";
import { assets } from "./media";

/* ------------------------------------------------------------------ */
/* CMS Pages, Sections, Versions, Settings, Audit Logs                 */
/* ------------------------------------------------------------------ */

export const pages = pgTable(
  "pages",
  {
    id: serial("id").primaryKey(),
    brandId: integer("brand_id").notNull().references(() => brands.id, { onDelete: "cascade" }),
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
    brandSlugLocaleUnique: uniqueIndex("pages_brand_slug_locale_unique").on(t.brandId, t.slug, t.locale),
    statusIdx: index("pages_status_idx").on(t.status),
  }),
);

export const contentSections = pgTable(
  "content_sections",
  {
    id: serial("id").primaryKey(),
    brandId: integer("brand_id").notNull().references(() => brands.id, { onDelete: "cascade" }),
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
    lookupUnique: uniqueIndex("content_sections_lookup_unique").on(t.brandId, t.pageSlug, t.sectionKey, t.locale),
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
    brandId: integer("brand_id").notNull().references(() => brands.id, { onDelete: "cascade" }),
    category: varchar("category", { length: 64 }).notNull(),
    data: jsonb("data").$type<Record<string, unknown>>().notNull().default({}),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    brandCategoryUnique: uniqueIndex("brand_settings_category_unique").on(t.brandId, t.category),
  }),
);

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

export const studyJapanItems = pgTable(
  "study_japan_items",
  {
    id: serial("id").primaryKey(),
    brandId: integer("brand_id").references(() => brands.id, { onDelete: "cascade" }),
    category: varchar("category", { length: 64 }).notNull(),
    title: varchar("title", { length: 256 }).notNull(),
    summary: text("summary").notNull(),
    body: text("body"),
    location: varchar("location", { length: 128 }),
    stipendOrTuition: varchar("stipend_tuition", { length: 128 }),
    tags: jsonb("tags").$type<string[]>().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    sjiCatIdx: index("study_japan_cat_idx").on(t.category),
  }),
);

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
    lookupUnique: uniqueIndex("translations_lookup_unique").on(t.entityType, t.entityId, t.locale, t.field),
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

export const subscribers = pgTable(
  "subscribers",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 256 }).notNull(),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    subEmailUnique: uniqueIndex("subscribers_email_unique").on(t.email),
  })
);

export const contacts = pgTable(
  "contacts",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 128 }).notNull(),
    email: varchar("email", { length: 256 }).notNull(),
    message: text("message").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  }
);

export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 128 }).notNull(),
    slug: varchar("slug", { length: 128 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    catSlugUnique: uniqueIndex("categories_slug_unique").on(t.slug),
  })
);

export const tags = pgTable(
  "tags",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 128 }).notNull(),
    slug: varchar("slug", { length: 128 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    tagSlugUnique: uniqueIndex("tags_slug_unique").on(t.slug),
  })
);

export const languages = pgTable(
  "languages",
  {
    id: serial("id").primaryKey(),
    code: varchar("code", { length: 12 }).notNull(),
    name: varchar("name", { length: 128 }).notNull(),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    langCodeUnique: uniqueIndex("languages_code_unique").on(t.code),
  })
);
