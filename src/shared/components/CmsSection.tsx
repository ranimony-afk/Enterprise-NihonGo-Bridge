import React from "react";
import type { BrandConfig } from "@/lib/brands";
import { sectionKindFor } from "@/shared/cms";

export interface CmsCardItem {
  image?: string;
  title: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
  category?: string;
  tags?: string[];
  status?: string;
  scheduledDate?: string;
  author?: string;
  quote?: string;
  stats?: string;
  japanese?: string;
  furigana?: string;
  meaning?: string;
  strokeCount?: number;
  q?: string;
  a?: string;
  href?: string;
  size?: string;
}

export interface CmsSectionData {
  id: number;
  sectionKey: string;
  title: string | null;
  subtitle: string | null;
  status: string;
  content: Record<string, unknown>;
}

export function CmsSection({
  section,
  brand,
  preview = false,
}: {
  section: CmsSectionData;
  brand: BrandConfig;
  preview?: boolean;
}) {
  const c = section.content ?? {};
  const kind = sectionKindFor(section.sectionKey);
  const items = Array.isArray(c.items) ? (c.items as CmsCardItem[]) : null;

  return (
    <section
      id={section.sectionKey}
      className="rounded-3xl bg-white/85 p-6 sm:p-8 shadow-sm border border-black/5 space-y-4"
      data-cms-key={section.sectionKey}
      data-cms-kind={kind}
      data-cms-status={section.status}
    >
      {/* Editorial Status & Category Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {preview && section.status !== "published" && (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
              {section.status}
            </span>
          )}
          {Boolean(c.category) && (
            <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-700">
              {String(c.category)}
            </span>
          )}
        </div>

        {Boolean(c.scheduledDate) && (
          <span className="text-[11px] font-semibold text-slate-500">
            📅 {String(c.scheduledDate)}
          </span>
        )}
      </div>

      {/* Section Titles */}
      {section.title && (
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: brand.theme.primary }}>
          {section.title}
        </h2>
      )}
      {section.subtitle && (
        <p className="text-sm font-medium opacity-75 max-w-2xl">{section.subtitle}</p>
      )}

      {/* Section Content Body */}
      {Boolean(c.body) && <p className="text-sm opacity-85 leading-relaxed">{String(c.body)}</p>}

      {/* 1. Announcement Bar */}
      {kind === "announcement" && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-rose-50 p-4 border border-rose-200/60 text-xs">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-rose-600 px-2 py-0.5 font-bold text-white uppercase text-[10px]">
              {String(c.badge ?? "NEW")}
            </span>
            <span className="font-semibold text-slate-900">{String(c.message ?? section.title)}</span>
          </div>
          {Boolean(c.ctaHref) && (
            <a href={String(c.ctaHref)} className="font-bold text-rose-700 hover:underline">
              {String(c.ctaText ?? "Learn More →")}
            </a>
          )}
        </div>
      )}

      {/* 2. Countdown Clock Box */}
      {kind === "countdown" && (
        <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-rose-950 p-6 text-white text-center space-y-4">
          <p className="text-xs uppercase font-bold tracking-widest text-rose-300">
            {String(c.examName ?? "Next Official JLPT Exam")}
          </p>
          <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto text-center">
            <div className="rounded-xl bg-white/10 p-2">
              <p className="text-2xl font-bold">{String(c.days ?? "114")}</p>
              <p className="text-[10px] uppercase opacity-70">Days</p>
            </div>
            <div className="rounded-xl bg-white/10 p-2">
              <p className="text-2xl font-bold">{String(c.hours ?? "18")}</p>
              <p className="text-[10px] uppercase opacity-70">Hours</p>
            </div>
            <div className="rounded-xl bg-white/10 p-2">
              <p className="text-2xl font-bold">{String(c.minutes ?? "42")}</p>
              <p className="text-[10px] uppercase opacity-70">Mins</p>
            </div>
            <div className="rounded-xl bg-white/10 p-2">
              <p className="text-2xl font-bold">{String(c.seconds ?? "09")}</p>
              <p className="text-[10px] uppercase opacity-70">Secs</p>
            </div>
          </div>
          {Boolean(c.ctaHref) && (
            <a
              href={String(c.ctaHref)}
              className="inline-block rounded-xl px-6 py-2.5 text-xs font-bold text-white transition hover:opacity-90"
              style={{ background: brand.theme.accent }}
            >
              {String(c.ctaText ?? "Register for Mock Test →")}
            </a>
          )}
        </div>
      )}

      {/* 3. Reusable Structured Cards Grid (for courses, articles, learning paths, partners, downloads, spotlight, events) */}
      {items && items.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-2">
          {items.map((it, idx) => (
            <div
              key={idx}
              className="group flex flex-col justify-between rounded-2xl bg-white p-5 shadow-2xs border border-black/5 transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="space-y-2">
                {/* Category & Tags Header */}
                <div className="flex flex-wrap items-center justify-between text-[11px] gap-1">
                  {it.category && (
                    <span className="rounded-md bg-rose-50 px-2 py-0.5 font-bold text-rose-800 uppercase text-[10px]">
                      {it.category}
                    </span>
                  )}
                  {it.scheduledDate && (
                    <span className="text-slate-400 text-[10px]">📅 {it.scheduledDate}</span>
                  )}
                </div>

                {/* Japanese / Kanji display if present */}
                {it.japanese && (
                  <div className="text-center py-2 bg-slate-50 rounded-xl">
                    <p className="text-3xl font-bold text-slate-950">{it.japanese}</p>
                    {it.furigana && <p className="text-xs text-rose-600 font-medium">{it.furigana}</p>}
                    {it.meaning && <p className="text-xs text-slate-700 mt-1">{it.meaning}</p>}
                  </div>
                )}

                {/* Card Title & Subtitle */}
                {it.title && (
                  <h3 className="font-bold text-slate-950 group-hover:text-rose-700 transition text-base">
                    {it.title}
                  </h3>
                )}
                {it.subtitle && <p className="text-xs font-medium text-slate-700">{it.subtitle}</p>}
                {it.description && <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{it.description}</p>}

                {/* Q&A for FAQs */}
                {it.q && <p className="font-bold text-sm text-slate-900">{it.q}</p>}
                {it.a && <p className="text-xs text-slate-600 mt-1">{it.a}</p>}

                {/* Testimonial Quote */}
                {it.quote && (
                  <blockquote className="border-l-2 pl-3 text-xs italic text-slate-700" style={{ borderColor: brand.theme.accent }}>
                    “{it.quote}” {it.author && <span className="block not-italic font-bold text-slate-900 mt-1">— {it.author}</span>}
                  </blockquote>
                )}

                {/* Tags */}
                {Array.isArray(it.tags) && it.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {it.tags.map((t, ti) => (
                      <span key={ti} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card CTA Action Button */}
              {(it.ctaHref || it.href) && (
                <div className="mt-4 border-t border-black/5 pt-3 flex items-center justify-between text-xs">
                  {it.size && <span className="text-slate-400 text-[10px]">{it.size}</span>}
                  <a
                    href={it.ctaHref || it.href}
                    className="font-bold text-rose-700 hover:underline inline-flex items-center gap-1 ml-auto"
                  >
                    {it.ctaText || "Explore"} →
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 4. Newsletter Box */}
      {kind === "newsletter" && (
        <form className="flex flex-col sm:flex-row gap-2 max-w-md pt-2">
          <input
            type="email"
            placeholder="Enter your email for daily JLPT tips..."
            className="flex-1 rounded-xl bg-white px-4 py-2.5 text-xs font-medium border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
          <button
            type="button"
            className="rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-xs"
            style={{ background: brand.theme.accent }}
          >
            {String(c.ctaText ?? "Subscribe")}
          </button>
        </form>
      )}

      {/* 5. Partner Logos Strip */}
      {kind === "logos" && Array.isArray(c.logos) && (
        <div className="flex flex-wrap items-center justify-around gap-6 pt-2 opacity-75">
          {(c.logos as Array<{ name: string }>).map((lg, li) => (
            <span key={li} className="text-xs font-bold uppercase tracking-widest text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg bg-slate-50">
              {lg.name}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
