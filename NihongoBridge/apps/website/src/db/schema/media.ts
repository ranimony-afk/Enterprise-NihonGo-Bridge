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
import { brands } from "./users";

/* ------------------------------------------------------------------ */
/* DAM: Asset Folders, Collections, Assets, Versions, Usages          */
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
    assetId: integer("asset_id").notNull().references(() => assets.id, { onDelete: "cascade" }),
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
    assetId: integer("asset_id").notNull().references(() => assets.id, { onDelete: "cascade" }),
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

export const downloadableResources = pgTable(
  "downloadable_resources",
  {
    id: serial("id").primaryKey(),
    brandId: integer("brand_id").references(() => brands.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 256 }).notNull(),
    description: text("description"),
    fileType: varchar("file_type", { length: 32 }).notNull(),
    category: varchar("category", { length: 64 }).notNull(),
    fileUrl: text("file_url").notNull(),
    fileSize: varchar("file_size", { length: 32 }),
    format: varchar("format", { length: 32 }).default("PDF"),
    requiresRegistration: boolean("requires_registration").notNull().default(true),
    downloadCount: integer("download_count").notNull().default(0),
    rating: integer("rating").notNull().default(49),
    ratingCount: integer("rating_count").notNull().default(128),
    bookmarkCount: integer("bookmark_count").notNull().default(42),
    tags: jsonb("tags").$type<string[]>().default([]),
    jlptLevel: varchar("jlpt_level", { length: 12 }).default("N5"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    drCategoryIdx: index("download_res_cat_idx").on(t.category),
  }),
);
