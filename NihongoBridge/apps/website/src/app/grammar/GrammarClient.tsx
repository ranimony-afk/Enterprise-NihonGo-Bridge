"use client";

import React, { useState } from "react";

interface GrammarPoint {
  id: number;
  pattern: string;
  meaning: string;
  jlptLevel: string;
  structure: string;
  explanation: string;
  visualNodes: Array<{ label: string; role: string; color: string }>;
  examples: Array<{ ja: string; en: string; note?: string }>;
  aiNuances: string;
}

const STATIC_GRAMMAR_DATABASE: GrammarPoint[] = [
  {
    id: 1,
    pattern: "〜たいです",
    meaning: "Expressing desire ('I want to do...')",
    jlptLevel: "N5",
    structure: "Verb Stem (連用形) + たいです",
    explanation: "Appended to the stem of a verb to declare the speaker's own desires or intentions. Cannot be used directly to state a third-person's desire.",
    visualNodes: [
      { label: "私 (I)", role: "Subject", color: "bg-blue-100 text-blue-900 border-blue-200" },
      { label: "は", role: "Topic Particle", color: "bg-slate-100 text-slate-800 border-slate-200" },
      { label: "日本食 (Japanese food)", role: "Object", color: "bg-indigo-100 text-indigo-900 border-indigo-200" },
      { label: "を", role: "Object Particle", color: "bg-slate-100 text-slate-800 border-slate-200" },
      { label: "食べ (Eat)", role: "Verb Stem", color: "bg-rose-100 text-rose-900 border-rose-200" },
      { label: "たいです (Want to)", role: "Desire Suffix", color: "bg-rose-500 text-white border-rose-600 font-bold" }
    ],
    examples: [
      { ja: "日本料理が食べたいです。", en: "I want to eat Japanese food.", note: "Particle が can replace を when expressing desire." },
      { ja: "新しいカメラを買いたいです。", en: "I want to buy a new camera." }
    ],
    aiNuances: "Contrasting 〜たい with 〜たがる: Use 〜たい for 'I want to'. For third-person desires, conjugate to 〜たがる (e.g., 田中さんは食べたがっています)."
  },
  {
    id: 2,
    pattern: "〜てください",
    meaning: "Polite Request ('Please do...')",
    jlptLevel: "N5",
    structure: "Verb Te-Form (て形) + ください",
    explanation: "Used to make a polite, standard request or instruction. Common in daily social and workplace environments.",
    visualNodes: [
      { label: "窓 (Window)", role: "Object", color: "bg-indigo-100 text-indigo-900 border-indigo-200" },
      { label: "を", role: "Object Particle", color: "bg-slate-100 text-slate-800 border-slate-200" },
      { label: "開けて (Open)", role: "Verb Te-form", color: "bg-rose-100 text-rose-900 border-rose-200" },
      { label: "ください (Please)", role: "Request Suffix", color: "bg-rose-500 text-white border-rose-600 font-bold" }
    ],
    examples: [
      { ja: "ここに名前を書いてください。", en: "Please write your name here." },
      { ja: "ゆっくり話してください。", en: "Please speak slowly." }
    ],
    aiNuances: "Politeness registers: 〜てください is standard polite. For higher status/bosses, use 〜ていただけないでしょうか (Would you mind doing...). For casual peers, simply use the Te-form directly."
  },
  {
    id: 3,
    pattern: "〜てもいいです",
    meaning: "Permission / Approval ('May I... / You can...')",
    jlptLevel: "N5",
    structure: "Verb Te-Form (て形) + もいいです",
    explanation: "Used to grant permission to someone or to ask for permission to perform an action.",
    visualNodes: [
      { label: "写真 (Photos)", role: "Object", color: "bg-indigo-100 text-indigo-900 border-indigo-200" },
      { label: "を", role: "Object Particle", color: "bg-slate-100 text-slate-800 border-slate-200" },
      { label: "撮って (Take)", role: "Verb Te-form", color: "bg-rose-100 text-rose-900 border-rose-200" },
      { label: "もいいです (You may)", role: "Approval Suffix", color: "bg-rose-500 text-white border-rose-600 font-bold" }
    ],
    examples: [
      { ja: "ここで写真を撮ってもいいですか。", en: "May I take photos here?" },
      { ja: "テレビを見てもいいですよ。", en: "You may watch TV, you know." }
    ],
    aiNuances: "Nuance guide: Asking '〜てもいいですか' is standard and polite. In legal/highly formal rules, '〜ても差し支えありません' (There is no objection to...) is utilized."
  },
  {
    id: 4,
    pattern: "〜てはいけません",
    meaning: "Prohibition ('Must not do...')",
    jlptLevel: "N4",
    structure: "Verb Te-Form (て形) + はいけません",
    explanation: "States a clear rule, prohibition, or strict social boundary. Very common in warning signs, classroom guidelines, and legal notices.",
    visualNodes: [
      { label: "タバコ (Cigarette)", role: "Object", color: "bg-indigo-100 text-indigo-900 border-indigo-200" },
      { label: "を", role: "Object Particle", color: "bg-slate-100 text-slate-800 border-slate-200" },
      { label: "吸って (Smoke)", role: "Verb Te-form", color: "bg-rose-100 text-rose-900 border-rose-200" },
      { label: "はいけません (Prohibited)", role: "Prohibition Suffix", color: "bg-rose-500 text-white border-rose-600 font-bold" }
    ],
    examples: [
      { ja: "ここに車を止めてはいけません。", en: "You must not park your car here." },
      { ja: "テスト中に話してはいけません。", en: "You must not speak during the test." }
    ],
    aiNuances: "Softening prohibitions: 〜てはいけません is highly direct. To soften advice, say 〜ないほうがいいです (It is better not to...) or 〜ないでください (Please do not...)."
  },
  {
    id: 5,
    pattern: "〜たことがあります",
    meaning: "Past Experience ('Have done... before')",
    jlptLevel: "N5",
    structure: "Verb Past-Form (た形) + ことがあリます",
    explanation: "Declares historical personal experiences. Used to describe significant, memorable events, not mundane daily habits like waking up or eating.",
    visualNodes: [
      { label: "富士山 (Mt. Fuji)", role: "Destination", color: "bg-indigo-100 text-indigo-900 border-indigo-200" },
      { label: "に", role: "Destination Particle", color: "bg-slate-100 text-slate-800 border-slate-200" },
      { label: "登った (Climbed)", role: "Verb Past-form", color: "bg-rose-100 text-rose-900 border-rose-200" },
      { label: "ことがあります (Experience exists)", role: "Past Suffix", color: "bg-rose-500 text-white border-rose-600 font-bold" }
    ],
    examples: [
      { ja: "日本に行ったことがあります。", en: "I have been to Japan before." },
      { ja: "寿司を食べたことがありますか。", en: "Have you ever eaten sushi?" }
    ],
    aiNuances: "Avoid daily habits: Never say '昨日本を読んだことがあります' to mean 'I read a book yesterday'. Use it exclusively for lifetime achievements or distinct life trials."
  }
];

// PROGRAMMATIC CLIENT-SIDE VERB CONJUGATION ENGINE
const CONJUGATION_VERBS = [
  { dictionary: "食べる", stem: "食べ", group: "ichidan", stemType: "ru" },
  { dictionary: "飲む", stem: "飲み", group: "godan", stemType: "mu" },
  { dictionary: "行く", stem: "行き", group: "godan", stemType: "ku" },
  { dictionary: "話す", stem: "話し", group: "godan", stemType: "su" },
  { dictionary: "書く", stem: "書き", group: "godan", stemType: "ku" },
  { dictionary: "勉強する", stem: "勉強し", group: "irregular", stemType: "suru" }
];

export default function GrammarClient() {
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPointId, setSelectedPointId] = useState<number>(1);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");

  // Conjugation Engine State
  const [conjVerb, setConjVerb] = useState(CONJUGATION_VERBS[0]);
  const [conjType, setConjType] = useState("masu");

  const filteredPoints = STATIC_GRAMMAR_DATABASE.filter((p) => {
    const matchLevel = selectedLevel === "all" || p.jlptLevel === selectedLevel;
    const matchQ =
      !searchQuery ||
      p.pattern.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.meaning.toLowerCase().includes(searchQuery.toLowerCase());
    return matchLevel && matchQ;
  });

  const activePoint = STATIC_GRAMMAR_DATABASE.find((p) => p.id === selectedPointId) || filteredPoints[0] || STATIC_GRAMMAR_DATABASE[0];

  // Conjugation calculation engine
  const getConjugation = (verb: typeof CONJUGATION_VERBS[0], type: string): { form: string; meaning: string } => {
    const dict = verb.dictionary;
    const stem = verb.stem;
    const group = verb.group;

    if (group === "ichidan") {
      switch (type) {
        case "masu": return { form: `${stem}ます`, meaning: "Polite Present (I eat / will eat)" };
        case "nai": return { form: `${stem}ない`, meaning: "Plain Negative (I do not eat)" };
        case "te": return { form: `${stem}て`, meaning: "Te-form (Eating / Connective)" };
        case "ta": return { form: `${stem}た`, meaning: "Plain Past (I ate)" };
        case "potential": return { form: `${stem}られます`, meaning: "Potential (I can eat)" };
        case "volitional": return { form: `${stem}よう`, meaning: "Volitional (Let's eat!)" };
        default: return { form: dict, meaning: "Dictionary Form" };
      }
    } else if (group === "godan") {
      // Basic Godan rules mapping consonants
      const dictChar = dict.slice(-1);
      const baseWord = dict.slice(0, -1);

      if (type === "masu") {
        return { form: `${baseWord}${stem.slice(-1)}ます`, meaning: "Polite Present" };
      } else if (type === "nai") {
        let aForm = "";
        if (dictChar === "う") aForm = "わ";
        else if (dictChar === "む") aForm = "ま";
        else if (dictChar === "く") aForm = "か";
        else if (dictChar === "す") aForm = "さ";
        return { form: `${baseWord}${aForm}ない`, meaning: "Plain Negative" };
      } else if (type === "te") {
        let teSuffix = "て";
        if (dictChar === "う" || dictChar === "つ" || dictChar === "る") teSuffix = "って";
        else if (dictChar === "む" || dictChar === "ぶ" || dictChar === "ぬ") teSuffix = "んで";
        else if (dictChar === "く") teSuffix = dict === "行く" ? "って" : "いて";
        else if (dictChar === "す") teSuffix = "して";
        return { form: `${baseWord}${teSuffix}`, meaning: "Te-form (Connective)" };
      } else if (type === "ta") {
        let taSuffix = "た";
        if (dictChar === "う" || dictChar === "つ" || dictChar === "る") taSuffix = "った";
        else if (dictChar === "む" || dictChar === "ぶ" || dictChar === "ぬ") taSuffix = "んだ";
        else if (dictChar === "く") taSuffix = dict === "行く" ? "った" : "いた";
        else if (dictChar === "す") taSuffix = "した";
        return { form: `${baseWord}${taSuffix}`, meaning: "Plain Past" };
      } else if (type === "potential") {
        let eForm = "";
        if (dictChar === "む") eForm = "め";
        else if (dictChar === "く") eForm = "け";
        else if (dictChar === "す") eForm = "せ";
        return { form: `${baseWord}${eForm}る`, meaning: "Potential (I can do)" };
      } else if (type === "volitional") {
        let oForm = "";
        if (dictChar === "む") oForm = "もう";
        else if (dictChar === "く") oForm = "こう";
        else if (dictChar === "す") oForm = "そう";
        return { form: `${baseWord}${oForm}`, meaning: "Volitional (Let's do!)" };
      }
    } else if (group === "irregular") {
      // Irregular rules for する (suru)
      switch (type) {
        case "masu": return { form: "勉強します", meaning: "Polite Present" };
        case "nai": return { form: "勉強しない", meaning: "Plain Negative" };
        case "te": return { form: "勉強して", meaning: "Te-form (Connective)" };
        case "ta": return { form: "勉強した", meaning: "Plain Past" };
        case "potential": return { form: "勉強できます", meaning: "Potential (I can do)" };
        case "volitional": return { form: "勉強しよう", meaning: "Volitional (Let's do!)" };
      }
    }
    return { form: dict, meaning: "Dictionary Form" };
  };

  const handleAskAITutor = () => {
    setAiLoading(true);
    setAiResult("");
    setTimeout(() => {
      setAiLoading(false);
      setAiResult(
        `🪄 AI Explanation for 「${activePoint.pattern}」:\n\n` +
        `This pattern is essential for daily conversation and business context. Here is an immersive situational nuance:\n` +
        `- **In Daily Life**: Highly natural. Saying "お寿司が食べたい" (I want to eat sushi) indicates casual excitement.\n` +
        `- **In Business Offices**: Do NOT say '買いたいです' directly to clients or your supervisor, as it indicates raw demand. Instead, say "購入させていただきたく存じます" (Humbly wishing to purchase).\n\n` +
        `💡 **Mnemonic Strategy**: Think of 'Tai' as reaching towards a targeted prize with excitement!`
      );
    }, 1200);
  };

  const result = getConjugation(conjVerb, conjType);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* LEFT COLUMN: Timeline, Progress and Search List */}
      <div className="lg:col-span-4 space-y-6">
        <div className="rounded-3xl bg-slate-950 p-5 text-white space-y-4 shadow-sm border border-slate-900">
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-widest text-rose-400 uppercase">Interactive Timeline Path</span>
            <h3 className="text-lg font-black">N5 to N1 Study Progress</h3>
            <p className="text-[11px] text-slate-300">
              Select a grammar category below to load standard indexed syllabus entries.
            </p>
          </div>

          {/* Timeline Nodes */}
          <div className="grid grid-cols-5 gap-2 text-center">
            {["all", "N5", "N4", "N3", "N2"].map((level) => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`py-2 rounded-xl text-xs font-bold transition border cursor-pointer uppercase ${
                  selectedLevel === level
                    ? "bg-rose-500 border-rose-600 text-white"
                    : "bg-white/10 border-white/10 text-white hover:bg-white/20"
                }`}
              >
                {level === "all" ? "All" : level}
              </button>
            ))}
          </div>
        </div>

        {/* Search List */}
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 10,000 indexed patterns..."
              className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <span className="absolute top-1/2 right-4 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              10K DB
            </span>
          </div>

          <div className="space-y-2.5 max-h-[450px] overflow-y-auto pr-1">
            {filteredPoints.map((p) => {
              const isSelected = activePoint.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedPointId(p.id);
                    setAiResult("");
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition ${
                    isSelected
                      ? "bg-rose-50 border-rose-200 shadow-3xs"
                      : "bg-white border-slate-100 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base font-extrabold text-slate-900">{p.pattern}</span>
                    <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                      {p.jlptLevel}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-600 mt-1 line-clamp-1">{p.meaning}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Conjugation Engine & Rule Detail Viewer */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* INTERACTIVE CONJUGATION ENGINE MODULE */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-1.5">
              <span>⚙️</span> Japanese Verb Conjugation Engine
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Input a verb root and select conjugation forms to dynamically trace suffixes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">1. Select Verb Root</label>
              <select
                value={conjVerb.dictionary}
                onChange={(e) => {
                  const match = CONJUGATION_VERBS.find((v) => v.dictionary === e.target.value);
                  if (match) setConjVerb(match);
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
              >
                {CONJUGATION_VERBS.map((v) => (
                  <option key={v.dictionary} value={v.dictionary}>
                    {v.dictionary} (Group: {v.group.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">2. Select Conjugation Form</label>
              <select
                value={conjType}
                onChange={(e) => setConjType(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
              >
                <option value="masu">Polite present (~ます)</option>
                <option value="nai">Plain negative (~ない)</option>
                <option value="te">Connective / Request (~て)</option>
                <option value="ta">Plain past / Experience (~た)</option>
                <option value="potential">Potential form (Can do ~える)</option>
                <option value="volitional">Volitional / Suggestion (~よう)</option>
              </select>
            </div>
          </div>

          {/* Engine Output Box */}
          <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 p-5 text-white flex items-center justify-between border border-slate-900">
            <div>
              <span className="text-[9px] font-bold text-rose-400 uppercase tracking-widest block">Calculated output</span>
              <p className="text-3xl font-black tracking-tight">{result.form}</p>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Functional meaning</span>
              <p className="text-xs font-bold text-slate-200">{result.meaning}</p>
            </div>
          </div>
        </div>

        {/* GRAMMAR DETAIL INSPECTOR */}
        {activePoint && (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            
            {/* Header Title */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-black text-slate-900">{activePoint.pattern}</h2>
                  <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {activePoint.jlptLevel}
                  </span>
                </div>
                <p className="text-sm font-bold text-rose-800 mt-1">{activePoint.meaning}</p>
              </div>

              <button
                onClick={handleAskAITutor}
                className="self-start sm:self-center bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1"
              >
                🪄 Ask AI Grammar Tutor
              </button>
            </div>

            {/* Explanation and Structure */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Grammar Formula / Connection</span>
                <code className="text-xs font-mono font-bold text-rose-900 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 block w-fit">
                  {activePoint.structure}
                </code>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Interactive Explanation</span>
                <p className="text-sm font-semibold text-slate-700 leading-relaxed">
                  {activePoint.explanation}
                </p>
              </div>
            </div>

            {/* VISUAL CONNECTIVE SENTENCE DIAGRAM */}
            <div className="space-y-3 pt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Connective Structural Visual Diagram</span>
              <div className="flex flex-wrap items-center gap-2 border border-slate-100 rounded-2xl p-4 bg-slate-50">
                {activePoint.visualNodes.map((node, i) => (
                  <React.Fragment key={i}>
                    <div className={`p-3 rounded-xl border text-xs text-center space-y-0.5 ${node.color}`}>
                      <p className="font-extrabold">{node.label}</p>
                      <p className="text-[9px] opacity-75 font-bold uppercase tracking-wider">{node.role}</p>
                    </div>
                    {i < activePoint.visualNodes.length - 1 && (
                      <span className="text-slate-400 font-extrabold text-sm select-none">&rarr;</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Examples Grid */}
            <div className="space-y-3 pt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Contextual Sentence Examples</span>
              <div className="grid gap-3">
                {activePoint.examples.map((ex, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 text-sm space-y-1">
                    <p className="font-black text-slate-950 text-base">{ex.ja}</p>
                    <p className="text-xs font-bold text-slate-500">{ex.en}</p>
                    {ex.note && (
                      <p className="text-[10px] text-rose-600 font-bold italic mt-1">Note: {ex.note}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive AI tutor result */}
            {aiLoading && (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-slate-300 border-t-rose-500 animate-spin"></div>
                <p className="text-xs font-bold text-slate-700">AI Tutor is composing social situational context analysis...</p>
              </div>
            )}

            {aiResult && !aiLoading && (
              <div className="p-5 rounded-3xl bg-slate-950 text-white border border-slate-900 shadow-md relative overflow-hidden space-y-2">
                <div className="absolute top-0 right-0 p-8 text-7xl font-bold text-white/5 pointer-events-none select-none">
                  AI
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🪄</span>
                  <h4 className="text-xs font-black uppercase tracking-widest text-rose-400">Contextual Social Nuance Breakdown</h4>
                </div>
                <p className="text-xs font-medium leading-relaxed whitespace-pre-line text-slate-200">{aiResult}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
