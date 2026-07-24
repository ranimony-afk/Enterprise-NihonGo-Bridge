import Link from "next/link";
import { db } from "@/db";
import { customDecks, customDeckCards } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { ensureSeed } from "@/lib/seed";
import { BrandHeader } from "@/shared/components/BrandHeader";
import { getBrand } from "@/lib/brands";

export const dynamic = "force-dynamic";

export default async function DecksPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>;
}) {
  await ensureSeed();
  const { level = "all" } = await searchParams;
  const cfg = getBrand("nihongo")!;

  const allDecks = await db.select().from(customDecks).orderBy(desc(customDecks.createdAt));
  const filtered = level === "all" ? allDecks : allDecks.filter((d) => d.jlptLevel === level);

  return (
    <main
      className="min-h-screen px-6 py-12"
      style={{ background: cfg.theme.surface, color: cfg.theme.text }}
    >
      <div className="mx-auto max-w-5xl space-y-8">
        <BrandHeader brand={cfg} />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: cfg.theme.primary }}>
              Quizlet-Style Custom Decks 🎴
            </h1>
            <p className="mt-1 text-sm opacity-80">
              Create, customize, import, export, and study Japanese flashcard decks with Spaced Repetition (SM-2).
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/study/flashcards"
              className="rounded-xl px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
              style={{ background: cfg.theme.accent }}
            >
              ⚡ Flashcards Mode
            </Link>
            <Link
              href="/study/write"
              className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              ✍️ Write Mode
            </Link>
            <Link
              href="/study/match"
              className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
            >
              🧩 Match Game
            </Link>
          </div>
        </div>

        {/* JLPT Level Filters */}
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          {["all", "N5", "N4", "N3", "N2", "N1"].map((lvl) => (
            <Link
              key={lvl}
              href={`/decks?level=${lvl}`}
              className={`rounded-lg px-3 py-1.5 transition ${
                level === lvl ? "bg-slate-900 text-white" : "bg-white/80 hover:bg-white text-slate-700 shadow-2xs"
              }`}
            >
              {lvl === "all" ? "All Levels" : `JLPT ${lvl}`}
            </Link>
          ))}
        </div>

        {/* Decks Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((deck) => (
            <Link
              key={deck.id}
              href={`/decks/${deck.id}`}
              className="group flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm border border-black/5 transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-800 uppercase">
                    {deck.jlptLevel}
                  </span>
                  <span className="text-xs font-medium opacity-60">
                    {deck.cardCount} cards
                  </span>
                </div>
                <h3 className="text-lg font-semibold group-hover:text-rose-700 transition" style={{ color: cfg.theme.primary }}>
                  {deck.title}
                </h3>
                {deck.description && (
                  <p className="text-xs opacity-75 line-clamp-2">{deck.description}</p>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-black/5 pt-3 text-xs font-medium">
                <span className="text-rose-600">Study Deck →</span>
                <span className="opacity-50">Share code: {deck.shareCode?.slice(0, 10)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
