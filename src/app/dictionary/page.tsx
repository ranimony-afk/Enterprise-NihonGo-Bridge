import Link from "next/link";
import { db } from "@/db";
import { nihongoLearningItems } from "@/db/schema";
import { ensureSeed } from "@/lib/seed";
import { BrandHeader } from "@/shared/components/BrandHeader";
import { getBrand } from "@/lib/brands";

export const dynamic = "force-dynamic";

export default async function DictionaryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await ensureSeed();
  const { q } = await searchParams;
  const cfg = getBrand("nihongo")!;

  let items = await db.select().from(nihongoLearningItems);
  if (q) {
    const query = q.toLowerCase();
    items = items.filter(
      (it) =>
        it.japanese.toLowerCase().includes(query) ||
        it.meaning.toLowerCase().includes(query) ||
        (it.romaji && it.romaji.toLowerCase().includes(query)),
    );
  }

  return (
    <main
      className="min-h-screen px-6 py-12"
      style={{ background: cfg.theme.surface, color: cfg.theme.text }}
    >
      <div className="mx-auto max-w-4xl space-y-8">
        <BrandHeader brand={cfg} />

        <div className="space-y-4">
          <h1 className="text-3xl font-bold" style={{ color: cfg.theme.primary }}>
            Takoboto-Style Japanese Dictionary 📖
          </h1>
          <p className="text-sm opacity-80">
            Search Japanese words, kanji, furigana, pitch accents, parts of speech, and JLPT levels.
          </p>

          <form action="/dictionary" method="get" className="flex gap-2">
            <input
              type="text"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Search kanji, kana, romaji or English..."
              className="flex-1 rounded-xl bg-white px-4 py-3 text-sm font-medium border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-6 py-3 text-xs font-bold text-white hover:bg-slate-800 transition"
            >
              Search
            </button>
          </form>
        </div>

        <div className="divide-y divide-black/5 rounded-3xl bg-white shadow-sm border border-black/5 overflow-hidden">
          {items.map((item) => (
            <div key={item.id} className="p-5 space-y-2 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-slate-950">{item.japanese}</span>
                  {item.furigana && <span className="text-xs font-semibold text-rose-600">[{item.furigana}]</span>}
                  <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800 uppercase">
                    {item.jlptLevel}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-800 mt-1">{item.meaning}</p>
                {item.exampleSentenceJa && (
                  <p className="text-xs text-slate-500 italic mt-0.5">{item.exampleSentenceJa}</p>
                )}
              </div>

              <span className="text-xs text-rose-600 font-medium cursor-pointer hover:underline">
                🔊 Audio / Pitch
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
