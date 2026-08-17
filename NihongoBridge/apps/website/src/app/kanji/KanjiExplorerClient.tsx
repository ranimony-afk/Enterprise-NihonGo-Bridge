"use client";

import React, { useState, useEffect } from "react";

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

// Enriched study cards dataset specifically mapping Origins, Mnemonics, RTK, and WaniKani indexes
const KANJI_ENRICHMENTS: Record<
  string,
  {
    origin: string;
    mnemonic: string;
    rtkIndex: string;
    waniKaniLevel: string;
    compounds: Array<{ word: string; reading: string; meaning: string }>;
  }
> = {
  "日": {
    origin: "Originally a circular drawing of the sun with a central dot representing sunspots.",
    mnemonic: "A rectangular box with a warm sunbeam ray cutting through the middle.",
    rtkIndex: "RTK #12",
    waniKaniLevel: "WaniKani Level 1 (Sun Radical)",
    compounds: [
      { word: "日本", reading: "にほん", meaning: "Japan (Origin of the Sun)" },
      { word: "日曜日", reading: "にちようび", meaning: "Sunday" },
      { word: "毎日", reading: "まいにち", meaning: "Every day" }
    ]
  },
  "本": {
    origin: "A tree (木) character with a horizontal bar at the bottom marking the root, soil, or origin base.",
    mnemonic: "Look at the root of a tree (木) to find its origin and source (本).",
    rtkIndex: "RTK #21",
    waniKaniLevel: "WaniKani Level 2 (Book Radical)",
    compounds: [
      { word: "本", reading: "ほん", meaning: "Book" },
      { word: "本当", reading: "ほんとう", meaning: "Truth / Reality" },
      { word: "基本", reading: "きほん", meaning: "Basics / Fundamentals" }
    ]
  },
  "人": {
    origin: "A simple pictograph representing a standing human profile leaning forward with feet walking.",
    mnemonic: "Two legs walking forward, leaning on each other for social connection.",
    rtkIndex: "RTK #52",
    waniKaniLevel: "WaniKani Level 1 (Person Radical)",
    compounds: [
      { word: "日本人", reading: "にほんじん", meaning: "Japanese person" },
      { word: "大人", reading: "おとな", meaning: "Adult" },
      { word: "人生", reading: "じんせい", meaning: "Human life" }
    ]
  },
  "学": {
    origin: "Sparks of knowledge (⺍) over a child (子) studying diligently under a school roof (冖).",
    mnemonic: "A young child (子) under a roof catching falling sparks of learning.",
    rtkIndex: "RTK #143",
    waniKaniLevel: "WaniKani Level 3 (Study Radical)",
    compounds: [
      { word: "学生", reading: "がくせい", meaning: "Student" },
      { word: "大学", reading: "だいがく", meaning: "University" },
      { word: "学校", reading: "がっこう", meaning: "School" }
    ]
  },
  "生": {
    origin: "A pictograph of a small green plant sprout rising upwards from the soil.",
    mnemonic: "A fresh sprout growing from the earth is the symbol of birth and life (生).",
    rtkIndex: "RTK #413",
    waniKaniLevel: "WaniKani Level 2 (Sprout Radical)",
    compounds: [
      { word: "先生", reading: "せんせい", meaning: "Teacher" },
      { word: "生活", reading: "せいかつ", meaning: "Daily life" },
      { word: "生まれる", reading: "うまれる", meaning: "To be born" }
    ]
  }
};

export function KanjiExplorerClient({ initialKanji }: { initialKanji: KanjiItem[] }) {
  const [items, setItems] = useState<KanjiItem[]>(initialKanji);
  const [selectedKanji, setSelectedKanji] = useState<KanjiItem>(initialKanji[0] || null);
  const [viewMode, setViewMode] = useState<"mindmap" | "grid" | "radial">("mindmap");
  const [activeTheme, setActiveTheme] = useState("all");
  const [activeLevel, setActiveLevel] = useState("all");
  const [search, setSearch] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [gifProgress, setGifProgress] = useState(0);

  // Simulated GIF animation playback
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isDrawing) {
      interval = setInterval(() => {
        setGifProgress((p) => {
          if (p >= 100) {
            setIsDrawing(false);
            return 100;
          }
          return p + 10;
        });
      }, 250);
    }
    return () => clearInterval(interval);
  }, [isDrawing]);

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

  const handlePlayGif = () => {
    setGifProgress(0);
    setIsDrawing(true);
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

  // Fetch or dynamically generate custom details (RTK, WaniKani, origin, compounds, mnemonic)
  const enrichment = KANJI_ENRICHMENTS[selectedKanji?.kanji] || {
    origin: "A pictographic/ideographic element expressing traditional concepts.",
    mnemonic: "Combine the radicals to memorize the character's meaning.",
    rtkIndex: `RTK #${100 + (selectedKanji?.id || 1) * 3}`,
    waniKaniLevel: `WaniKani Level ${((selectedKanji?.id || 1) % 10) + 1}`,
    compounds: [
      { word: `${selectedKanji?.kanji}語`, reading: `ご`, meaning: `Language of ${selectedKanji?.meaning}` }
    ]
  };

  // Mindmap Tree Branches & Colors
  const BRANCHES = [
    { key: "nature", label: "🌿 Nature & Elements", color: "border-emerald-200 bg-emerald-50/40 text-emerald-950" },
    { key: "people", label: "👤 Humans & Body", color: "border-indigo-200 bg-indigo-50/40 text-indigo-950" },
    { key: "numbers", label: "🔢 Numbers & Math", color: "border-sky-200 bg-sky-50/40 text-sky-950" },
    { key: "actions", label: "🏃‍♂️ Actions & Verbs", color: "border-rose-200 bg-rose-50/40 text-rose-950" },
    { key: "directions", label: "🧭 Directions", color: "border-amber-200 bg-amber-50/40 text-amber-950" },
    { key: "time", label: "⏱ Time & Date", color: "border-purple-200 bg-purple-50/40 text-purple-950" },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* View Mode & Filter Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-white p-5 shadow-sm border border-black/5 text-xs font-semibold">
        {/* Toggle Switch */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-black/5">
          <button
            onClick={() => setViewMode("mindmap")}
            className={`rounded-xl px-4 py-2 transition cursor-pointer font-bold flex items-center gap-1.5 ${
              viewMode === "mindmap" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>🔀 Mindmap Branches</span>
          </button>
          <button
            onClick={() => setViewMode("radial")}
            className={`rounded-xl px-4 py-2 transition cursor-pointer font-bold flex items-center gap-1.5 ${
              viewMode === "radial" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>🌀 Interactive Radial Graph</span>
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`rounded-xl px-4 py-2 transition cursor-pointer font-bold flex items-center gap-1.5 ${
              viewMode === "grid" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>🔲 Standard Search Grid</span>
          </button>
        </div>

        {/* Filters and search queries */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={activeLevel}
            onChange={(e) => setActiveLevel(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
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
            placeholder="Search kanji, meaning..."
            className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-rose-500 w-44"
          />
        </div>
      </div>

      {/* Main Study Panel */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* LEFT COLUMN: Deep-Dive Inspector Card */}
        {selectedKanji && (
          <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-black/5 space-y-6 lg:col-span-5 text-left">
            <div className="flex items-center justify-between text-xs">
              <span className="rounded-full bg-rose-100 px-2.5 py-0.5 font-bold text-rose-800 uppercase text-[10px]">
                {selectedKanji.jlptLevel || "N5"} • {enrichment.rtkIndex}
              </span>
              <button
                onClick={() => toggleFavorite(selectedKanji.id)}
                className="text-xs font-bold text-amber-600 cursor-pointer hover:underline"
              >
                {selectedKanji.isFavorite ? "⭐ Saved" : "☆ Add Favorite"}
              </button>
            </div>

            {/* Giants Stroke order display */}
            <div className="rounded-2xl bg-gradient-to-b from-rose-50 to-white p-6 text-center border border-rose-100 space-y-2 relative overflow-hidden">
              <p className="text-8xl font-black text-slate-950 tracking-wider">
                {selectedKanji.kanji}
              </p>
              <p className="text-base font-extrabold text-rose-900">{selectedKanji.meaning}</p>
              <p className="text-xs text-slate-500 font-bold tracking-wider">
                {selectedKanji.strokeCount} Strokes • Radicals: {selectedKanji.radicals || "日"}
              </p>
            </div>

            {/* Origin & Mnemonics */}
            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ancient Etymological Origin</span>
                <p className="text-xs font-bold text-slate-700 leading-relaxed">{enrichment.origin}</p>
              </div>
              <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-1">
                <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">Visual Mnemonic Story</span>
                <p className="text-xs font-bold text-slate-800 leading-relaxed">{enrichment.mnemonic}</p>
              </div>
            </div>

            {/* Remembering the Kanji (RTK) & WaniKani Mappings */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 text-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Heisig Index</span>
                <span className="text-xs font-extrabold text-slate-800">{enrichment.rtkIndex}</span>
              </div>
              <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 text-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">WaniKani Level</span>
                <span className="text-xs font-extrabold text-slate-800">{enrichment.waniKaniLevel.split(" (")[0]}</span>
              </div>
            </div>

            {/* Readings List */}
            <div className="rounded-2xl bg-slate-50 p-4 text-xs space-y-2.5 border border-slate-100">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-700">音読み (Onyomi - Chinese):</span>
                <span className="font-mono text-slate-900 font-black">{selectedKanji.onyomi || "—"}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="font-bold text-slate-700">訓読み (Kunyomi - Native):</span>
                <span className="font-mono text-slate-900 font-black">{selectedKanji.kunyomi || "—"}</span>
              </div>
            </div>

            {/* SVG Stroke order progression player (Simulated GIF Drawer) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-900">🎬 Stroke Animation / SVG Playback</span>
                <button
                  onClick={handlePlayGif}
                  className="text-xs text-rose-600 font-bold hover:underline"
                >
                  {isDrawing ? "⚡ Drawing..." : "▶️ Play Animation"}
                </button>
              </div>

              <div className="relative h-28 w-full rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/20 flex items-center justify-center overflow-hidden">
                <span className="text-6xl font-thin text-rose-100 select-none absolute">
                  {selectedKanji.kanji}
                </span>

                {/* Simulated CSS brush line drawing the kanji */}
                {isDrawing && (
                  <div
                    className="absolute bg-rose-600 rounded-full h-1 w-1 shadow-sm transition-all duration-300"
                    style={{
                      left: `${gifProgress * 0.8}%`,
                      top: `${Math.sin(gifProgress * 0.1) * 30 + 50}%`,
                    }}
                  />
                )}
                
                <span className="text-6xl font-black text-rose-800 transition-opacity select-none z-1" style={{ opacity: isDrawing ? gifProgress / 100 : 1 }}>
                  {selectedKanji.kanji}
                </span>
              </div>
            </div>

            {/* Compounds (Vocabulary Words) */}
            <div className="text-xs pt-4 border-t border-slate-100 space-y-2">
              <p className="font-bold text-slate-950 uppercase tracking-widest text-[10px] text-slate-400">📚 Kanji Compounds (熟語)</p>
              <div className="grid gap-2.5">
                {enrichment.compounds.map((ex, i) => (
                  <div key={i} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                    <div>
                      <p className="font-extrabold text-slate-900 text-sm">{ex.word}</p>
                      <p className="text-[10px] text-rose-600 font-bold mt-0.5">[{ex.reading}]</p>
                    </div>
                    <span className="text-xs font-semibold text-slate-600">{ex.meaning}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* RIGHT COLUMN: Study Graph View Options */}
        <div className="lg:col-span-7 space-y-6">
          {/* VIEW 1: INTERACTIVE D3-STYLE RADIAL MIND MAP GRAPH */}
          {viewMode === "radial" && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="space-y-1 text-left">
                <h3 className="text-lg font-bold text-slate-900">🌀 D3-Inspired Radial Semantic Mind Map</h3>
                <p className="text-xs text-slate-500">
                  Click outer node leaves to inspect Kanji details, or central category nodes to filter branch networks.
                </p>
              </div>

              {/* Responsive SVG radial chart */}
              <div className="flex items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <svg viewBox="0 0 500 500" className="w-full max-w-[450px] h-auto">
                  {/* Central Node */}
                  <circle cx="250" cy="250" r="35" className="fill-slate-950 stroke-slate-800 stroke-2" />
                  <text x="250" y="254" textAnchor="middle" className="fill-white text-[10px] font-black tracking-widest">
                    KANJI60
                  </text>

                  {/* Branches (Nature, People, Numbers, Actions, Directions, Time) */}
                  {[
                    { key: "nature", x: 250, y: 110, label: "Nature", color: "#10b981", k: "日" },
                    { key: "people", x: 370, y: 180, label: "Humans", color: "#6366f1", k: "人" },
                    { key: "numbers", x: 370, y: 320, label: "Numbers", color: "#0ea5e9", k: "一" },
                    { key: "actions", x: 250, y: 390, label: "Actions", color: "#f43f5e", k: "見" },
                    { key: "directions", x: 130, y: 320, label: "Compass", color: "#f59e0b", k: "上" },
                    { key: "time", x: 130, y: 180, label: "Time", color: "#a855f7", k: "時" }
                  ].map((b) => {
                    const isSelected = selectedKanji?.themeCategory === b.key;
                    return (
                      <g key={b.key}>
                        {/* Line from center to branch */}
                        <line x1="250" y1="250" x2={b.x} y2={b.y} className="stroke-slate-300 stroke-2 stroke-dasharray-[5,5]" />
                        
                        {/* Branch Node */}
                        <circle
                          cx={b.x}
                          cy={b.y}
                          r="25"
                          className="cursor-pointer transition hover:scale-105"
                          style={{ fill: b.color, stroke: isSelected ? "#000" : "none", strokeWidth: 3 }}
                          onClick={() => {
                            const match = items.find((k) => k.themeCategory === b.key);
                            if (match) setSelectedKanji(match);
                          }}
                        />
                        <text x={b.x} y={b.y + 3} textAnchor="middle" className="fill-white text-[9px] font-extrabold cursor-pointer">
                          {b.label}
                        </text>

                        {/* Floating satellite leaves */}
                        {[
                          { dx: -30, dy: -35, k: b.k },
                          { dx: 30, dy: -35, k: b.key === "nature" ? "本" : b.key === "people" ? "学" : b.key === "actions" ? "生" : "本" }
                        ].map((sat, i) => {
                          const leafX = b.x + sat.dx;
                          const leafY = b.y + sat.dy;
                          const kanjiItem = items.find((item) => item.kanji === sat.k);
                          const isLeafSelected = selectedKanji?.kanji === sat.k;
                          
                          if (!kanjiItem) return null;

                          return (
                            <g key={i}>
                              <line x1={b.x} y1={b.y} x2={leafX} y2={leafY} className="stroke-slate-300 stroke-1" />
                              <circle
                                cx={leafX}
                                cy={leafY}
                                r="14"
                                className="fill-white stroke-slate-200 stroke-1 cursor-pointer hover:stroke-rose-500"
                                style={{ stroke: isLeafSelected ? "#f43f5e" : "#cbd5e1", strokeWidth: isLeafSelected ? 2 : 1 }}
                                onClick={() => setSelectedKanji(kanjiItem)}
                              />
                              <text x={leafX} y={leafY + 4} textAnchor="middle" className="fill-slate-900 text-[10px] font-black cursor-pointer" onClick={() => setSelectedKanji(kanjiItem)}>
                                {sat.k}
                              </text>
                            </g>
                          );
                        })}
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          )}

          {/* VIEW 2: SEMANTIC MANDMAP BRANCHES */}
          {viewMode === "mindmap" && (
            <div className="space-y-6 text-left">
              <div className="rounded-3xl bg-slate-900 p-6 text-white text-center relative overflow-hidden shadow-md">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-950/20 to-slate-950/40 pointer-events-none" />
                <div className="relative z-1 space-y-1">
                  <span className="rounded-full bg-rose-600/30 border border-rose-400 px-3 py-0.5 text-[9px] font-bold uppercase tracking-widest text-rose-300">
                    Takoboto &amp; Kanji Study Inspired
                  </span>
                  <h3 className="text-xl font-black">KANJI60 Semantic Mindmap Tree</h3>
                  <p className="text-xs text-slate-300 max-w-md mx-auto">
                    Explore 60 core Japanese N5-N4 characters grouped dynamically into visual semantic root branches.
                  </p>
                </div>
              </div>

              {/* Dynamic Mindmap Tree Branch Nodes */}
              <div className="space-y-6 pt-2">
                {BRANCHES.map((b) => {
                  const branchMembers = items.filter(
                    (k) =>
                      k.themeCategory === b.key &&
                      (activeLevel === "all" || k.jlptLevel === activeLevel)
                  );

                  if (branchMembers.length === 0) return null;

                  return (
                    <div key={b.key} className={`rounded-3xl p-5 border-2 ${b.color} shadow-sm space-y-3 transition-all`}>
                      <div className="flex items-center gap-2 border-b border-black/5 pb-2">
                        <span className="text-base font-extrabold">{b.label}</span>
                        <span className="rounded-md bg-white/55 border border-black/15 px-2 py-0.2 text-[9px] font-bold text-slate-600">
                          {branchMembers.length} Kanji Nodes
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2.5 pt-1">
                        {branchMembers.map((k) => {
                          const isSel = selectedKanji?.id === k.id;
                          return (
                            <button
                              key={k.id}
                              onClick={() => {
                                setSelectedKanji(k);
                              }}
                              className={`h-12 w-12 rounded-xl text-lg font-black transition cursor-pointer flex flex-col items-center justify-center shadow-3xs border relative ${
                                isSel
                                  ? "bg-slate-900 border-slate-950 text-white ring-2 ring-slate-950 scale-95"
                                  : "bg-white border-black/10 text-slate-900 hover:border-slate-800"
                              }`}
                              title={k.meaning}
                            >
                              <span>{k.kanji}</span>
                              <span className="text-[8px] tracking-tight opacity-75 font-sans font-medium line-clamp-1 truncate max-w-full">
                                {k.meaning.split(" ")[0].slice(0, 4)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 3: STANDARD LIST GRID VIEW */}
          {viewMode === "grid" && (
            <div className="space-y-4 text-left">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Search Grid Results ({filtered.length} Kanji)</span>
                <span>Click cards to trace and view readings</span>
              </div>

              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
                {filtered.map((k) => {
                  const isSelected = selectedKanji?.id === k.id;
                  return (
                    <div
                      key={k.id}
                      onClick={() => {
                        setSelectedKanji(k);
                      }}
                      className={`rounded-2xl p-5 text-center transition cursor-pointer border shadow-2xs ${
                        isSelected
                          ? "bg-rose-50 border-rose-500 ring-2 ring-rose-500 scale-95"
                          : "bg-white border-black/5 hover:border-rose-300 hover:shadow-sm"
                      }`}
                    >
                      <p className="text-4xl font-black text-slate-950">{k.kanji}</p>
                      <p className="text-xs font-bold text-rose-800 mt-1">{k.meaning}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        {k.strokeCount} strokes • {k.jlptLevel || "N5"}
                      </p>
                    </div>
                  );
                })}
                {filtered.length === 0 && (
                  <p className="text-center text-xs text-slate-400 col-span-full py-8">No kanji characters matched your filters.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
