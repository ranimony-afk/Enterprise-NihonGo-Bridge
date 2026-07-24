import React from "react";
import type { BrandConfig } from "@/lib/brands";
import { sectionKindFor } from "@/shared/cms";

/** Shape mirrors the `content_sections` row plus loose content. */
export interface CmsSectionData {
  id: number;
  sectionKey: string;
  title: string | null;
  subtitle: string | null;
  status: string;
  content: Record<string, unknown>;
}

type AnyItem = Record<string, unknown>;

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

  return (
    <section
      id={section.sectionKey}
      className="rounded-2xl bg-white/80 p-8 shadow-sm"
      data-cms-kind={kind}
      data-cms-status={section.status}
    >
      {preview && section.status !== "published" && (
        <span className="mb-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-800">
          {section.status}
        </span>
      )}
      <h2 className="text-2xl font-semibold" style={{ color: brand.theme.primary }}>
        {section.title}
      </h2>
      {section.subtitle && (
        <p className="mt-1 text-sm font-medium opacity-70">{section.subtitle}</p>
      )}

      <div className="mt-4 space-y-3 text-sm opacity-90">
        {Boolean(c.body) && <p>{String(c.body)}</p>}

        {/* Hero-specific CTA */}
        {kind === "hero" && Boolean(c.ctaText) && (
          <a
            href={String(c.ctaHref ?? "#")}
            className="inline-block rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: brand.theme.accent }}
          >
            {String(c.ctaText)}
          </a>
        )}

        {/* CTA banner */}
        {kind === "cta" && Boolean(c.ctaText) && (
          <a
            href={String(c.ctaHref ?? "#")}
            className="inline-block rounded-xl px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: brand.theme.primary }}
          >
            {String(c.ctaText)} →
          </a>
        )}

        {/* Stats */}
        {Array.isArray(c.stats) && (
          <div className="grid grid-cols-3 gap-4 pt-3">
            {(c.stats as Array<{ label: string; value: string }>).map((st, idx) => (
              <div key={idx} className="rounded-xl bg-slate-50 p-3 text-center">
                <p className="text-lg font-bold" style={{ color: brand.theme.primary }}>{st.value}</p>
                <p className="text-xs opacity-70">{st.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Faculty / members */}
        {Array.isArray(c.members) && (
          <div className="grid gap-4 sm:grid-cols-2 pt-3">
            {(c.members as Array<{ name: string; role: string; bio: string }>).map((m, idx) => (
              <div key={idx} className="rounded-xl bg-slate-50 p-4">
                <p className="font-semibold" style={{ color: brand.theme.primary }}>{m.name}</p>
                <p className="text-xs font-medium opacity-75">{m.role}</p>
                <p className="mt-1 text-xs opacity-70">{m.bio}</p>
              </div>
            ))}
          </div>
        )}

        {/* Testimonials / quotes */}
        {Array.isArray(c.quotes) && (
          <div className="pt-2 space-y-2">
            {(c.quotes as Array<{ quote: string; author: string }>).map((q, idx) => (
              <blockquote key={idx} className="border-l-4 pl-4 italic opacity-85" style={{ borderColor: brand.theme.accent }}>
                “{q.quote}” — <span className="font-semibold">{q.author}</span>
              </blockquote>
            ))}
          </div>
        )}

        {/* Feature grid (generic items with title + blurb) */}
        {kind === "feature_grid" && Array.isArray(c.items) && (
          <div className="grid gap-4 sm:grid-cols-3 pt-2">
            {(c.items as Array<{ title: string; blurb?: string }>).map((it, idx) => (
              <div key={idx} className="rounded-xl bg-slate-50 p-4">
                <p className="font-semibold" style={{ color: brand.theme.primary }}>{it.title}</p>
                {it.blurb && <p className="mt-1 text-xs opacity-70">{it.blurb}</p>}
              </div>
            ))}
          </div>
        )}

        {/* JLPT levels */}
        {Array.isArray(c.levels) && (
          <div className="grid gap-3 sm:grid-cols-5 pt-2">
            {(c.levels as Array<{ level: string; focus: string; href?: string }>).map((lv, idx) => (
              <a key={idx} href={lv.href ?? "#"} className="rounded-xl bg-slate-50 p-4 text-center transition hover:shadow-md">
                <p className="text-lg font-bold" style={{ color: brand.theme.accent }}>{lv.level}</p>
                <p className="mt-1 text-[11px] opacity-70">{lv.focus}</p>
              </a>
            ))}
          </div>
        )}

        {/* Vocabulary / Kanji daily decks */}
        {(kind === "vocabulary" || kind === "kanji") && Array.isArray(c.items) && (
          <div className="grid gap-3 sm:grid-cols-3 pt-2">
            {(c.items as AnyItem[]).map((it, idx) => (
              <div key={idx} className="rounded-xl bg-slate-50 p-4 text-center">
                <p className="text-2xl font-bold text-slate-900">{String(it.japanese ?? "")}</p>
                {it.furigana ? <p className="text-xs font-medium" style={{ color: brand.theme.accent }}>{String(it.furigana)}</p> : null}
                <p className="mt-1 text-xs opacity-75">{String(it.meaning ?? "")}</p>
                {it.strokeCount ? <p className="mt-1 text-[10px] opacity-50">{String(it.strokeCount)} strokes</p> : null}
              </div>
            ))}
          </div>
        )}

        {/* News feed */}
        {kind === "news" && Array.isArray(c.items) && (
          <div className="space-y-3 pt-2">
            {(c.items as Array<{ title: string; date?: string; excerpt?: string }>).map((n, idx) => (
              <div key={idx} className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs opacity-50">{n.date ?? ""}</p>
                <p className="font-semibold text-slate-900">{n.title}</p>
                {n.excerpt && <p className="mt-1 text-xs opacity-70">{n.excerpt}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Downloads */}
        {kind === "download" && Array.isArray(c.items) && (
          <ul className="divide-y divide-black/5 rounded-xl bg-slate-50">
            {(c.items as Array<{ title: string; href: string; size?: string }>).map((d, idx) => (
              <li key={idx} className="flex items-center justify-between px-4 py-3">
                <a href={d.href} className="font-medium text-slate-900 hover:underline">⬇ {d.title}</a>
                {d.size && <span className="text-xs opacity-50">{d.size}</span>}
              </li>
            ))}
          </ul>
        )}

        {/* FAQ */}
        {kind === "faq" && Array.isArray(c.items) && (
          <div className="space-y-3 pt-2">
            {(c.items as Array<{ q: string; a: string }>).map((faq, idx) => (
              <div key={idx} className="rounded-lg bg-slate-50 p-3">
                <p className="font-medium text-slate-900">{faq.q}</p>
                <p className="mt-1 text-xs text-slate-600">{faq.a}</p>
              </div>
            ))}
          </div>
        )}

        {/* Conversation practice */}
        {kind === "generic" && section.sectionKey === "practice" && Array.isArray(c.items) && (
          <div className="space-y-3 pt-2">
            {(c.items as Array<{ title: string; ja: string; en: string }>).map((d, idx) => (
              <div key={idx} className="rounded-lg bg-slate-50 p-3">
                <p className="font-medium text-slate-900">{d.title}</p>
                <p className="mt-1 text-sm" style={{ color: brand.theme.primary }}>{d.ja}</p>
                <p className="text-xs text-slate-600">{d.en} <span className="float-right cursor-pointer">🔊</span></p>
              </div>
            ))}
          </div>
        )}

        {/* Social links */}
        {section.sectionKey === "social_links" && Array.isArray(c.items) && (
          <div className="flex flex-wrap gap-2 pt-2">
            {(c.items as Array<{ label: string; href: string }>).map((s, idx) => (
              <a
                key={idx}
                href={s.href}
                className="rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold text-slate-800 transition hover:bg-slate-200"
              >
                {s.label}
              </a>
            ))}
          </div>
        )}

        {/* Contact info */}
        {Boolean(c.email) && (
          <p className="pt-1 text-xs">
            Email: <a href={`mailto:${c.email}`} className="font-medium underline">{String(c.email)}</a>
          </p>
        )}
        {Boolean(c.phone) && <p className="text-xs">Phone: {String(c.phone)}</p>}
      </div>
    </section>
  );
}
