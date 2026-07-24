import { notFound } from "next/navigation";
import { getBrand } from "@/lib/brands";
import { ensureSeed } from "@/lib/seed";
import { BrandService, CourseService, PageService, CmsService } from "@/shared/services";
import { BrandHeader, CourseCard } from "@/shared/components";
import { CmsSection } from "@/shared/components/CmsSection";
import { db } from "@/db";
import { translations, nihongoLearningItems, nihongoQuizzes } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function BrandHome({
  params,
  searchParams,
}: {
  params: Promise<{ brand: string }>;
  searchParams: Promise<{ lang?: string; tab?: string }>;
}) {
  await ensureSeed();
  const { brand: brandSlug } = await params;
  const { lang = "en", tab = "all" } = await searchParams;
  const cfg = getBrand(brandSlug);
  if (!cfg) notFound();

  const brand = await BrandService.getBySlug(brandSlug);
  if (!brand) notFound();

  // Translations
  const dbTranslationRows = await db
    .select()
    .from(translations)
    .where(
      and(
        eq(translations.entityType, "brand"),
        eq(translations.entityId, brand.id),
        eq(translations.locale, lang),
      ),
    );

  const tMap = new Map(dbTranslationRows.map((r) => [r.field, r.value]));
  const localizedTagline = tMap.get("tagline") ?? cfg.tagline;
  const localizedBadge = tMap.get("hero_badge") ?? (cfg.key === "nihongo" ? "JLPT • Japan Careers" : "Engineering & Leadership");
  const localizedNavCourses = tMap.get("nav_courses") ?? "Curriculum & Programs";

  const home = await PageService.getPublished(brand.id, "home", "en");
  const publishedCourses = await CourseService.getPublished(brand.id, "en");
  const cmsSections = await CmsService.getSections(brand.id, "home", "en");
  const footerSettings = (await CmsService.getSettings(brand.id, "footer")) as { copyright?: string; tagline?: string } | null;

  // Nihongo Bridge specific items & quizzes
  const nihongoItems = cfg.key === "nihongo" ? await db.select().from(nihongoLearningItems) : [];
  const quizzes = cfg.key === "nihongo" ? await db.select().from(nihongoQuizzes) : [];

  return (
    <main
      className="min-h-screen px-6 py-12"
      style={{ background: cfg.theme.surface, color: cfg.theme.text }}
    >
      <head>
        <link rel="alternate" hrefLang="en" href={`/${brandSlug}?lang=en`} />
        <link rel="alternate" hrefLang="ta" href={`/${brandSlug}?lang=ta`} />
        <link rel="alternate" hrefLang="ml" href={`/${brandSlug}?lang=ml`} />
        <link rel="alternate" hrefLang="ja" href={`/${brandSlug}?lang=ja`} />
        <link rel="alternate" hrefLang="x-default" href={`/${brandSlug}`} />
      </head>

      <div className="mx-auto max-w-5xl space-y-12">
        <BrandHeader brand={cfg} currentLocale={lang} />

        {/* Gamification Bar for Nihongo Bridge */}
        {cfg.key === "nihongo" && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-2xl bg-white/90 p-4 shadow-sm border border-black/5 text-center">
            <div className="rounded-xl bg-amber-50 p-2">
              <p className="text-xs text-amber-700 font-semibold uppercase tracking-wider">⚡ Total XP</p>
              <p className="text-xl font-bold text-amber-900">240 XP</p>
            </div>
            <div className="rounded-xl bg-rose-50 p-2">
              <p className="text-xs text-rose-700 font-semibold uppercase tracking-wider">🔥 Day Streak</p>
              <p className="text-xl font-bold text-rose-900">7 Days</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-2">
              <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wider">🎯 Daily Goal</p>
              <p className="text-xl font-bold text-emerald-900">15 / 15m</p>
            </div>
            <div className="rounded-xl bg-indigo-50 p-2">
              <p className="text-xs text-indigo-700 font-semibold uppercase tracking-wider">🏆 Level</p>
              <p className="text-xl font-bold text-indigo-900">JLPT N5 Ready</p>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <header className="rounded-3xl bg-white/70 p-8 sm:p-12 shadow-sm">
          <span
            className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white"
            style={{ background: cfg.theme.accent }}
          >
            {localizedBadge}
          </span>
          <h1 className="mt-4 text-4xl font-semibold sm:text-5xl" style={{ color: cfg.theme.primary }}>
            {home?.title ?? cfg.name}
          </h1>
          <p className="mt-3 max-w-2xl text-base opacity-80">
            {localizedTagline}
          </p>
        </header>

        {/* Nihongo Learning Modules & Tools (Phases 7 & 8) */}
        {cfg.key === "nihongo" && nihongoItems.length > 0 && (
          <section className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold" style={{ color: cfg.theme.primary }}>
                Japanese Learning Tools & Modules
              </h2>
              <div className="flex flex-wrap gap-1 text-xs font-medium">
                {["all", "vocabulary", "kanji", "grammar", "business", "culture"].map((cat) => (
                  <a
                    key={cat}
                    href={`/${brandSlug}?tab=${cat}`}
                    className={`rounded-lg px-3 py-1 capitalize ${
                      tab === cat ? "bg-slate-900 text-white" : "bg-white/80 hover:bg-white text-slate-700"
                    }`}
                  >
                    {cat}
                  </a>
                ))}
              </div>
            </div>

            {/* Vocabulary & Kanji Flashcards Grid with Spaced Repetition (SRS) */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {nihongoItems
                .filter((item) => tab === "all" || item.category === tab)
                .map((item) => (
                  <div key={item.id} className="rounded-2xl bg-white p-5 shadow-sm border border-black/5 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="rounded-full bg-rose-100 text-rose-800 px-2 py-0.5 font-bold uppercase">
                        {item.jlptLevel}
                      </span>
                      <span className="opacity-50 uppercase tracking-widest text-[10px]">{item.category}</span>
                    </div>

                    <div className="text-center py-2">
                      <p className="text-3xl font-bold text-slate-950">{item.japanese}</p>
                      {item.furigana && <p className="text-xs text-rose-600 font-medium">{item.furigana}</p>}
                      {item.romaji && <p className="text-[11px] opacity-60 italic">{item.romaji}</p>}
                    </div>

                    <p className="text-sm font-semibold text-slate-800 text-center border-t border-black/5 pt-2">
                      {item.meaning}
                    </p>

                    {item.exampleSentenceJa && (
                      <div className="rounded-lg bg-slate-50 p-2 text-xs space-y-1">
                        <p className="font-medium text-slate-900">{item.exampleSentenceJa}</p>
                        <p className="opacity-70 text-[11px]">{item.exampleSentenceEn}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-black/5 text-xs text-slate-500">
                      <span>SRS Review: Daily</span>
                      <span className="text-rose-600 font-medium cursor-pointer hover:underline">🔊 Listen</span>
                    </div>
                  </div>
                ))}
            </div>

            {/* Interactive JLPT Quizzes & Mock Exams */}
            {quizzes.length > 0 && (
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-black/5 space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">JLPT Practice Quiz & Mock Exam</h3>
                {quizzes.map((q) => (
                  <div key={q.id} className="rounded-xl bg-slate-50 p-4 space-y-3">
                    <p className="font-medium text-sm text-slate-900">{q.question}</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`rounded-lg p-2 text-xs font-medium border ${
                            oIdx === q.correctIndex
                              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                              : "bg-white border-slate-200 text-slate-700"
                          }`}
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                    {q.explanation && (
                      <p className="text-xs text-slate-600 italic">💡 {q.explanation}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Dynamic CMS Sections (published, ordered, reusable renderer) */}
        {cmsSections.map((sec) => (
          <CmsSection key={sec.id} section={sec as never} brand={cfg} />
        ))}

        {/* LMS Courses Section */}
        <section id="programs" className="space-y-4">
          <h2 className="text-2xl font-semibold" style={{ color: cfg.theme.primary }}>
            {localizedNavCourses}
          </h2>
          {publishedCourses.length === 0 ? (
            <p className="text-sm opacity-70">No published courses yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {publishedCourses.map((c) => (
                <CourseCard
                  key={c.id}
                  brandSlug={brandSlug}
                  course={c}
                  brand={cfg}
                />
              ))}
            </div>
          )}
        </section>

        {/* CMS-Managed Footer */}
        <footer className="mt-16 border-t border-black/10 pt-8 text-center text-xs opacity-60">
          <p>{footerSettings?.copyright ?? `© ${new Date().getFullYear()} ${cfg.name}. All rights reserved.`}</p>
          <p className="mt-1">{footerSettings?.tagline ?? cfg.tagline}</p>
        </footer>
      </div>
    </main>
  );
}
