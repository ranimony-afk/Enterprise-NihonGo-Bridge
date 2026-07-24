import Link from "next/link";
import { notFound } from "next/navigation";
import { getBrand } from "@/lib/brands";
import { ensureSeed } from "@/lib/seed";
import { BrandService, CmsService } from "@/shared/services";
import { SECTION_TYPES, isCmsStatus } from "@/shared/cms";
import { AdminShell } from "../AdminShell";
import {
  updateSection,
  setSectionStatus,
  moveSection,
  duplicateSection,
  createSection,
} from "../actions";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  draft: "bg-slate-200 text-slate-800",
  preview: "bg-indigo-100 text-indigo-800",
  published: "bg-emerald-100 text-emerald-800",
  archived: "bg-rose-100 text-rose-800",
};

const STATUS_ACTIONS = [
  { to: "draft", label: "Draft" },
  { to: "preview", label: "Preview" },
  { to: "published", label: "Publish" },
  { to: "archived", label: "Archive" },
] as const;

export default async function BrandCmsEditor({
  params,
  searchParams,
}: {
  params: Promise<{ brand: string }>;
  searchParams: Promise<{ page?: string; notice?: string }>;
}) {
  await ensureSeed();
  const { brand: brandSlug } = await params;
  const { page = "home", notice } = await searchParams;
  const cfg = getBrand(brandSlug);
  if (!cfg) notFound();

  const brand = await BrandService.getBySlug(brandSlug);
  if (!brand) notFound();

  const pages = await CmsService.listPages(brand.id);
  const activePage = pages.includes(page) ? page : (pages[0] ?? "home");
  const sections = await CmsService.getAllSections(brand.id, activePage);
  const navSettings = (await CmsService.getSettings(brand.id, "navigation")) as { links?: Array<{ label: string; href: string }> } | null;
  const seoSettings = (await CmsService.getSettings(brand.id, "seo")) as { metaTitle?: string; metaDescription?: string } | null;
  const footerSettings = (await CmsService.getSettings(brand.id, "footer")) as { copyright?: string; tagline?: string } | null;

  return (
    <AdminShell title={`${cfg.name} — CMS Editor`}>
      {notice && (
        <div className="mb-4 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-900">
          {notice}
        </div>
      )}

      {/* Page selector tabs */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
        {pages.map((p) => (
          <Link
            key={p}
            href={`/admin/${brandSlug}?page=${encodeURIComponent(p)}`}
            className={`rounded-lg px-3 py-1.5 ${
              p === activePage ? "bg-slate-900 text-white" : "bg-white hover:bg-slate-50"
            }`}
          >
            {p}
          </Link>
        ))}
        <Link
          href={`/admin/${brandSlug}/preview?page=${encodeURIComponent(activePage)}`}
          className="ml-auto rounded-lg bg-amber-600 px-3 py-1.5 text-white hover:bg-amber-500"
        >
          👁 Preview page
        </Link>
        <Link
          href={activePage === "home" ? `/${brandSlug}` : `/${brandSlug === "nihongo" ? `nihongo/${activePage}` : brandSlug}`}
          className="rounded-lg bg-white px-3 py-1.5 hover:bg-slate-50"
        >
          ↗ View live
        </Link>
      </div>

      {/* Sections list */}
      <div className="mt-6 space-y-4">
        {sections.map((sec, idx) => {
          const typeDef = SECTION_TYPES.find((t) => t.key === sec.sectionKey);
          return (
            <article key={sec.id} className="rounded-2xl bg-white p-5 shadow-sm">
              <header className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-[11px] text-slate-700">
                  {sec.sectionKey}
                </span>
                <h3 className="font-semibold">{sec.title ?? "(untitled)"}</h3>
                {typeDef && (
                  <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-800">
                    {typeDef.label}
                  </span>
                )}
                <span className={`ml-auto rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${STATUS_STYLE[sec.status] ?? "bg-slate-100"}`}>
                  {sec.status}
                </span>
              </header>

              {/* Status actions + reorder + duplicate + versions */}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold">
                {STATUS_ACTIONS.filter((a) => a.to !== sec.status).map((a) => (
                  <form key={a.to} action={setSectionStatus}>
                    <input type="hidden" name="sectionId" value={sec.id} />
                    <input type="hidden" name="brandSlug" value={brandSlug} />
                    <input type="hidden" name="pageSlug" value={activePage} />
                    <input type="hidden" name="status" value={a.to} />
                    <button
                      type="submit"
                      className={`rounded-lg px-3 py-1.5 transition ${
                        a.to === "published"
                          ? "bg-emerald-600 text-white hover:bg-emerald-500"
                          : a.to === "archived"
                            ? "bg-rose-100 text-rose-800 hover:bg-rose-200"
                            : "bg-slate-100 hover:bg-slate-200"
                      }`}
                    >
                      {a.label}
                    </button>
                  </form>
                ))}

                <span className="mx-1 h-4 w-px bg-slate-200" />

                <form action={moveSection}>
                  <input type="hidden" name="sectionId" value={sec.id} />
                  <input type="hidden" name="brandSlug" value={brandSlug} />
                  <input type="hidden" name="pageSlug" value={activePage} />
                  <input type="hidden" name="direction" value="up" />
                  <button type="submit" disabled={idx === 0} className="rounded-lg bg-slate-100 px-2.5 py-1.5 hover:bg-slate-200 disabled:opacity-30">↑</button>
                </form>
                <form action={moveSection}>
                  <input type="hidden" name="sectionId" value={sec.id} />
                  <input type="hidden" name="brandSlug" value={brandSlug} />
                  <input type="hidden" name="pageSlug" value={activePage} />
                  <input type="hidden" name="direction" value="down" />
                  <button type="submit" disabled={idx === sections.length - 1} className="rounded-lg bg-slate-100 px-2.5 py-1.5 hover:bg-slate-200 disabled:opacity-30">↓</button>
                </form>

                <form action={duplicateSection}>
                  <input type="hidden" name="sectionId" value={sec.id} />
                  <input type="hidden" name="brandSlug" value={brandSlug} />
                  <input type="hidden" name="pageSlug" value={activePage} />
                  <button type="submit" className="rounded-lg bg-slate-100 px-3 py-1.5 hover:bg-slate-200">⧉ Duplicate</button>
                </form>

                <Link
                  href={`/admin/${brandSlug}/section/${sec.id}/versions?page=${encodeURIComponent(activePage)}`}
                  className="rounded-lg bg-slate-100 px-3 py-1.5 hover:bg-slate-200"
                >
                  🕘 Versions
                </Link>
              </div>

              {/* Inline editor */}
              <details className="mt-3 rounded-xl border border-slate-200 bg-slate-50">
                <summary className="cursor-pointer px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900">
                  ✏️ Edit content
                </summary>
                <form action={updateSection} className="grid gap-3 p-4 text-xs">
                  <input type="hidden" name="sectionId" value={sec.id} />
                  <input type="hidden" name="brandSlug" value={brandSlug} />
                  <input type="hidden" name="pageSlug" value={activePage} />

                  <label className="grid gap-1">
                    <span className="font-semibold text-slate-600">Title</span>
                    <input name="title" defaultValue={sec.title ?? ""} className="rounded-lg border border-slate-300 px-3 py-2" />
                  </label>
                  <label className="grid gap-1">
                    <span className="font-semibold text-slate-600">Subtitle</span>
                    <input name="subtitle" defaultValue={sec.subtitle ?? ""} className="rounded-lg border border-slate-300 px-3 py-2" />
                  </label>
                  <label className="grid gap-1">
                    <span className="font-semibold text-slate-600">Status</span>
                    <select name="status" defaultValue={sec.status} className="rounded-lg border border-slate-300 px-3 py-2">
                      {STATUS_ACTIONS.map((s) => (
                        <option key={s.to} value={s.to}>{s.label}</option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-1">
                    <span className="font-semibold text-slate-600">Content (JSON)</span>
                    <textarea
                      name="contentJson"
                      rows={8}
                      defaultValue={JSON.stringify(sec.content ?? {}, null, 2)}
                      className="rounded-lg border border-slate-300 px-3 py-2 font-mono"
                    />
                  </label>
                  <button type="submit" className="w-fit rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800">
                    Save changes
                  </button>
                </form>
              </details>
            </article>
          );
        })}
      </div>

      {/* Create new section */}
      <div className="mt-8 rounded-2xl bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold">Add new section to “{activePage}”</h3>
        <form action={createSection} className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <input type="hidden" name="brandSlug" value={brandSlug} />
          <input type="hidden" name="pageSlug" value={activePage} />
          <select name="sectionKey" className="rounded-lg border border-slate-300 px-3 py-2">
            {SECTION_TYPES.map((t) => (
              <option key={t.key} value={t.key}>{t.label} ({t.key})</option>
            ))}
          </select>
          <button type="submit" className="rounded-lg bg-amber-600 px-4 py-2 font-semibold text-white hover:bg-amber-500">
            + Create draft
          </button>
        </form>
      </div>

      {/* Group-level blocks: navigation / footer / SEO / social */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 text-xs shadow-sm">
          <h4 className="font-semibold">🧭 Navigation</h4>
          <ul className="mt-2 space-y-1 text-slate-600">
            {(navSettings?.links ?? []).map((l, i) => (
              <li key={i}>{l.label} → <span className="font-mono">{l.href}</span></li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-white p-5 text-xs shadow-sm">
          <h4 className="font-semibold">🔍 SEO Metadata</h4>
          <p className="mt-2 text-slate-600"><b>Title:</b> {seoSettings?.metaTitle ?? "—"}</p>
          <p className="mt-1 text-slate-600"><b>Description:</b> {seoSettings?.metaDescription ?? "—"}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 text-xs shadow-sm">
          <h4 className="font-semibold">🦶 Footer</h4>
          <p className="mt-2 text-slate-600">{footerSettings?.copyright}</p>
          <p className="mt-1 text-slate-600">{footerSettings?.tagline}</p>
        </div>
      </div>
    </AdminShell>
  );
}
