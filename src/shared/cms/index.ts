/**
 * Shared Headless CMS Page, Section Registry & Metadata Helpers
 */

export interface PageContent {
  id: number;
  brandId: number;
  slug: string;
  title: string;
  body: string;
  status: string;
  locale: string;
  publishedAt: Date | null;
}

export function buildPageSeo(page: { title: string; body: string }, brandName: string) {
  const snippet = page.body.slice(0, 160).replace(/\s+/g, " ").trim();
  return {
    title: `${page.title} | ${brandName}`,
    description: snippet || `Learn more with ${brandName}`,
  };
}

/* ------------------------------------------------------------------ */
/* Reusable Page Section Type Registry (Admin Dashboard + Renderer)   */
/* ------------------------------------------------------------------ */

export type CmsSectionKind =
  | "hero"
  | "feature_grid"
  | "cta"
  | "faq"
  | "download"
  | "testimonial"
  | "news"
  | "vocabulary"
  | "kanji"
  | "generic";

export interface CmsSectionTypeDef {
  key: string;
  label: string;
  kind: CmsSectionKind;
  description: string;
}

export const SECTION_TYPES: CmsSectionTypeDef[] = [
  { key: "hero", label: "Hero", kind: "hero", description: "Page hero with badge, heading, subtitle and CTA." },
  { key: "about", label: "About / Intro", kind: "generic", description: "Intro body copy with optional stat cards." },
  { key: "featured_courses", label: "Featured Courses", kind: "feature_grid", description: "Grid of featured courses or programs." },
  { key: "jlpt", label: "JLPT Levels", kind: "feature_grid", description: "JLPT N5–N1 level cards linking to practice." },
  { key: "daily_vocab", label: "Daily Vocabulary", kind: "vocabulary", description: "Rotating daily vocabulary deck." },
  { key: "daily_kanji", label: "Daily Kanji", kind: "kanji", description: "Rotating daily kanji with readings and stroke count." },
  { key: "faculty", label: "Faculty / Instructors", kind: "generic", description: "Instructor directory with roles and bios." },
  { key: "testimonials", label: "Testimonials", kind: "testimonial", description: "Learner quotes with attribution." },
  { key: "news", label: "News / Blog Feed", kind: "news", description: "Latest announcements and articles." },
  { key: "faqs", label: "FAQ", kind: "faq", description: "Question & answer accordion items." },
  { key: "downloads", label: "Downloadable Materials", kind: "download", description: "PDFs, workbooks, and resource downloads." },
  { key: "contact", label: "Contact Information", kind: "generic", description: "Email, phone and office contact block." },
  { key: "cta", label: "Call-to-Action", kind: "cta", description: "Conversion banner with primary button." },
  { key: "social_links", label: "Social Links", kind: "generic", description: "Social media profile links." },
  { key: "practice", label: "Conversation Practice", kind: "generic", description: "Dialogue scripts and practice prompts." },
];

export const SECTION_TYPE_KIND: Record<string, CmsSectionKind> = Object.fromEntries(
  SECTION_TYPES.map((s) => [s.key, s.kind]),
) as Record<string, CmsSectionKind>;

export function sectionKindFor(key: string): CmsSectionKind {
  return SECTION_TYPE_KIND[key] ?? "generic";
}

/** Workflow statuses supported by the CMS editor. */
export const CMS_STATUSES = ["draft", "preview", "published", "archived"] as const;
export type CmsStatus = (typeof CMS_STATUSES)[number];

export function isCmsStatus(v: unknown): v is CmsStatus {
  return typeof v === "string" && (CMS_STATUSES as readonly string[]).includes(v);
}
