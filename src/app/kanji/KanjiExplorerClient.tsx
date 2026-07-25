"use client";

import React, { useState } from "react";

export interface KanjiItem {
  id: number;
  kanji: string;
  meaning: string;
  onyomi?: string | null;
  kunyomi?: string | null;
  radicals?: string | null;
  strokeCount: number;
  frequencyRank?: number | null;
  gradeLevel?: number | null;
  jlptLevel?: string | null;
  themeCategory?: string | null;
  strokeOrderSvg?: string | null;
  componentBreakdown?: Array<{ component: string; meaning: string }> | null;
  kanjiFamilies?: Array<{ family: string; members: string[] }> | null;
  similarKanji?: Array<{ kanji: string; meaning: string; distinction: string }> | null;
  isFavorite?: boolean | null;
  masteryScore?: number | null;
  examples?: Array<{ word: string; reading: string; meaning: string }> | null;
}

export function KanjiExplorerClient({ initialKanji }: { initialKanji: KanjiItem[] }) {
  const [items, setItems] = useState<KanjiItem[]>(initialKanji);
  const [selectedKanji, setSelectedKanji] = useState<KanjiItem>(initialKanji[0] || null);
  const [activeTheme, setActiveTheme] = useState("all");
  const [activeLevel, setActiveLevel] = useState("all");
  const [search, setSearch] = useState("");
  const [writingDone, setWritingDone] = useState(false);

  const toggleFavorite = async (id: number) => {
    setItems((prev) =>
      prev.map((k) => (k.id === id ? { ...k, isFavorite: !k.isFavorite } : k)),
    );
    if (selectedKanji?.id === id) {
      setSelectedKanji((prev) => ({ ...prev, isFavorite: !prev.isFavorite }));
    }
    try {
      await fetch("/api/v1/kanji", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_favorite", kanjiId: id }),
      });
    } catch {}
  };

  const handlePracticeStroke = async () => {
    setWritingDone(true);
    const newScore = Math.min(100, (selectedKanji.masteryScore || 0) + 15);
    setItems((prev) =>
      prev.map((k) => (k.id === selectedKanji.id ? { ...k, masteryScore: newScore } : k)),
    );
    setSelectedKanji((prev) => ({ ...prev, masteryScore: newScore }));

    try {
      await fetch("/api/v1/kanji", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submit_writing_score", kanjiId: selectedKanji.id, score: newScore }),
      });
    } catch {}
  };

  const filtered = items.filter((k) => {
    const matchTheme = activeTheme === "all" || k.themeCategory === activeTheme;
    const matchLvl = activeLevel === "all" || k.jlptLevel === activeLevel;
    const q = search.toLowerCase().trim();
    const matchQ =
      !q ||
      k.kanji.includes(q) ||
      k.meaning.toLowerCase().includes(q) ||
      (k.onyomi && k.onyomi.toLowerCase().includes(q)) ||
      (k.kunyomi && k.kunyomi.toLowerCase().includes(q));

    return matchTheme && matchLvl && matchQ;
  });

  return (
    <div className="space-y-8 font-sans">
      {/* 1. Filter Bar & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-white p-5 shadow-sm border border-black/5 text-xs font-semibold">
        <div className="flex flex-wrap items-center gap-2">
          {["all", "nature", "people", "actions"].map((thm) => (
            <button
              key={thm}
              onClick={() => setActiveTheme(thm)}
              className={`rounded-xl px-3 py-1.5 capitalize transition cursor-pointer ${
                activeTheme === thm
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {thm === "all" ? "All Radical Maps" : thm}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={activeLevel}
            onChange={(e) => setActiveLevel(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
          >
            <option value="all">All JLPT Levels</option>
            <option value="N5">JLPT N5</option>
            <option value="N4">JLPT N4</option>
            <option value="N3">JLPT N3</option>
          </select>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search kanji, meaning, readings..."
            className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-rose-500 w-48"
          />
        </div>
      </div>

      {/* 2. Interactive Main Explorer View: Detail Panel on Left, Visual Grid on Right */}
      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* Left 1 Column: Interactive Kanji Deep-Dive & Writing Practice Box */}
        {selectedKanji && (
          <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-black/5 space-y-6 lg:col-span-1">
            <div className="flex items-center justify-between text-xs">
              <span className="rounded-full bg-rose-100 px-2.5 py-0.5 font-bold text-rose-800 uppercase text-[10px]">
                {selectedKanji.jlptLevel} • Grade {selectedKanji.gradeLevel}
              </span>
              <button
                onClick={() => toggleFavorite(selectedKanji.id)}
                className="text-sm cursor-pointer hover:scale-125 transition"
                title="Favorite"
              >
                {selectedKanji.isFavorite ? "⭐ Favorited" : "☆ Favorite"}
              </button>
            </div>

            {/* Giant Animated Stroke Order Character Card */}
            <div className="rounded-2xl bg-gradient-to-b from-rose-50 to-white p-6 text-center border border-rose-100 space-y-2">
              <p className="text-7xl font-black text-slate-950 tracking-wider animate-pulse">
                {selectedKanji.kanji}
              </p>
              <p className="text-sm font-bold text-rose-800">{selectedKanji.meaning}</p>
              <p className="text-[11px] text-slate-500 font-mono">
                {selectedKanji.strokeCount} Strokes • Radical: {selectedKanji.radicals}
              </p>
            </div>

            {/* Readings Table */}
            <div className="rounded-2xl bg-slate-50 p-4 text-xs space-y-2 border border-black/5">
              <div className="flex justify-between border-b border-black/5 pb-1">
                <span className="font-bold text-slate-700">音読み (Onyomi):</span>
                <span className="font-mono text-slate-900">{selectedKanji.onyomi || "—"}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="font-bold text-slate-700">訓読み (Kunyomi):</span>
                <span className="font-mono text-slate-900">{selectedKanji.kunyomi || "—"}</span>
              </div>
            </div>

            {/* Interactive Grid Writing Practice Box */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-900">✍️ Writing Practice Box</span>
                <span className="text-emerald-700">{selectedKanji.masteryScore || 0}% Mastered</span>
              </div>

              <div className="relative h-32 w-full rounded-2xl border-2 border-dashed border-rose-300 bg-rose-50/40 flex items-center justify-center">
                <span className="text-5xl font-thin text-rose-200 select-none">{selectedKanji.kanji}</span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-full w-px border-r border-dashed border-rose-200" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-px border-b border-dashed border-rose-200" />
                </div>
              </div>

              <button
                onClick={handlePracticeStroke}
                className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition cursor-pointer shadow-xs"
              >
                Trace &amp; Verify Stroke Order (+15%)
              </button>
            </div>

            {/* Component Breakdown & Similar Kanji */}
            {selectedKanji.componentBreakdown && selectedKanji.componentBreakdown.length > 0 && (
              <div className="text-xs space-y-1.5 pt-2 border-t border-black/5">
                <p className="font-bold text-slate-900">🧩 Component Breakdown</p>
                {selectedKanji.componentBreakdown.map((cb, i) => (
                  <p key={i} className="text-[11px] text-slate-600">
                    <b className="text-slate-900 font-mono">{cb.component}</b>: {cb.meaning}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Right 2 Columns: Visual Radical Maps Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Visual Radical Grid ({filtered.length} Kanji)</span>
            <span className="text-slate-400">Click any card to inspect &amp; trace</span>
          </div>

          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
            {filtered.map((k) => {
              const isSelected = selectedKanji?.id === k.id;
              return (
                <div
                  key={k.id}
                  onClick={() => {
                    setSelectedKanji(k);
                    setWritingDone(false);
                  }}
                  className={`rounded-2xl p-5 text-center transition cursor-pointer border shadow-2xs ${
                    isSelected
                      ? "bg-rose-50 border-rose-500 ring-2 ring-rose-500 scale-95"
                      : "bg-white border-black/5 hover:border-rose-300 hover:shadow-sm"
                  }`}
                >
                  <p className="text-4xl font-black text-slate-950">{k.kanji}</p>
                  <p className="text-xs font-bold text-rose-800 mt-1">{k.meaning}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{k.strokeCount} strokes • {k.jlptLevel}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
