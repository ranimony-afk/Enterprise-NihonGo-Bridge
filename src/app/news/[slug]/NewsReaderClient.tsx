"use client";

import React, { useState } from "react";
import Link from "next/link";

export interface NewsArticleData {
  id: number;
  slug: string;
  title: string;
  summary: string;
  japaneseText: string;
  furiganaText?: string | null;
  englishTranslation: string;
  tamilTranslation?: string | null;
  malayalamTranslation?: string | null;
  difficultyLevel: string;
  readingMinutes: number;
  audioUrl?: string | null;
  grammarHighlights?: string[] | null;
  extractedVocabulary?: Array<{ japanese: string; furigana: string; meaning: string }> | null;
  extractedKanji?: Array<{ kanji: string; meaning: string; strokes: number }> | null;
  comprehensionQuestions?: Array<{ question: string; options: string[]; correctIndex: number; explanation: string }> | null;
}

export function NewsReaderClient({ article }: { article: NewsArticleData }) {
  const [showFurigana, setShowFurigana] = useState(true);
  const [selectedLang, setSelectedLang] = useState<"en" | "ta" | "ml">("en");
  const [bookmarked, setBookmarked] = useState(false);
  const [markedRead, setMarkedRead] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [savedVocab, setSavedVocab] = useState<string[]>([]);

  const toggleSaveVocab = (word: string) => {
    setSavedVocab((s) => (s.includes(word) ? s.filter((w) => w !== word) : [...s, word]));
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Reader Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm border border-black/5 text-xs font-semibold">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFurigana(!showFurigana)}
            className={`rounded-lg px-3 py-1.5 transition ${
              showFurigana ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {showFurigana ? "振仮名 (Furigana ON)" : "振仮名 (Furigana OFF)"}
          </button>

          <button
            onClick={() => setBookmarked(!bookmarked)}
            className={`rounded-lg px-3 py-1.5 transition ${
              bookmarked ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {bookmarked ? "★ Bookmarked" : "☆ Bookmark"}
          </button>

          <button
            onClick={() => setMarkedRead(!markedRead)}
            className={`rounded-lg px-3 py-1.5 transition ${
              markedRead ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {markedRead ? "✓ Read" : "Mark as Read"}
          </button>
        </div>

        {/* Translation Language Switcher */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
          <button
            onClick={() => setSelectedLang("en")}
            className={`rounded-lg px-2.5 py-1 ${selectedLang === "en" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"}`}
          >
            English
          </button>
          <button
            onClick={() => setSelectedLang("ta")}
            className={`rounded-lg px-2.5 py-1 ${selectedLang === "ta" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"}`}
          >
            தமிழ்
          </button>
          <button
            onClick={() => setSelectedLang("ml")}
            className={`rounded-lg px-2.5 py-1 ${selectedLang === "ml" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"}`}
          >
            മലയാളം
          </button>
        </div>
      </div>

      {/* Main Japanese Article Reader Panel */}
      <article className="rounded-3xl bg-white p-8 sm:p-10 shadow-sm border border-black/5 space-y-6">
        <div className="flex items-center justify-between text-xs">
          <span className="rounded-full bg-rose-100 px-3 py-1 font-bold text-rose-800 uppercase">
            JLPT {article.difficultyLevel}
          </span>
          <span className="text-slate-500">⏱ {article.readingMinutes} min reading time</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 leading-relaxed">
          {article.title}
        </h1>

        {/* Japanese Reading Body with Toggleable Furigana */}
        <div className="rounded-2xl bg-slate-50 p-6 text-lg sm:text-xl font-medium leading-loose text-slate-900 border border-black/5">
          {showFurigana && article.furiganaText ? article.furiganaText : article.japaneseText}
        </div>

        {/* Active Multilingual Translation Box */}
        <div className="rounded-2xl bg-amber-50/70 p-6 border border-amber-200/60 text-sm space-y-2">
          <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">
            {selectedLang === "en" ? "English Translation" : selectedLang === "ta" ? "தமிழ் மொழிபெயர்ப்பு" : "മലയാളം പരിഭാഷ"}
          </p>
          <p className="text-slate-800 leading-relaxed">
            {selectedLang === "en"
              ? article.englishTranslation
              : selectedLang === "ta"
              ? article.tamilTranslation ?? article.englishTranslation
              : article.malayalamTranslation ?? article.englishTranslation}
          </p>
        </div>
      </article>

      {/* Extracted Vocabulary Glossary (TODAI-Style) */}
      {article.extractedVocabulary && article.extractedVocabulary.length > 0 && (
        <section className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-black/5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Extracted Vocabulary Glossary 📚</h2>
            <span className="text-xs text-slate-500">{article.extractedVocabulary.length} words found</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {article.extractedVocabulary.map((vocab, i) => {
              const isSaved = savedVocab.includes(vocab.japanese);
              return (
                <div key={i} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-black/5 text-xs">
                  <div>
                    <span className="text-base font-bold text-slate-950">{vocab.japanese}</span>
                    <span className="text-rose-600 font-medium ml-2">{vocab.furigana}</span>
                    <p className="text-slate-600 mt-0.5">{vocab.meaning}</p>
                  </div>

                  <button
                    onClick={() => toggleSaveVocab(vocab.japanese)}
                    className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                      isSaved ? "bg-emerald-600 text-white" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {isSaved ? "Saved" : "+ Save"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Extracted Kanji Breakdown */}
      {article.extractedKanji && article.extractedKanji.length > 0 && (
        <section className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-black/5 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Extracted Kanji Characters 🈸</h2>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
            {article.extractedKanji.map((kanji, i) => (
              <div key={i} className="rounded-xl bg-slate-50 p-3 text-center border border-black/5">
                <p className="text-3xl font-bold text-slate-950">{kanji.kanji}</p>
                <p className="text-xs font-semibold text-slate-800 mt-1">{kanji.meaning}</p>
                <p className="text-[10px] text-slate-500">{kanji.strokes} strokes</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Interactive Comprehension Quiz Questions */}
      {article.comprehensionQuestions && article.comprehensionQuestions.length > 0 && (
        <section className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-black/5 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Comprehension Quiz ❓</h2>
          {article.comprehensionQuestions.map((q, qIdx) => {
            const selectedOpt = quizAnswers[qIdx];
            return (
              <div key={qIdx} className="rounded-2xl bg-slate-50 p-5 space-y-3 border border-black/5">
                <p className="font-semibold text-sm text-slate-900">{q.question}</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {q.options.map((opt, oIdx) => {
                    const isSelected = selectedOpt === oIdx;
                    const isCorrect = oIdx === q.correctIndex;
                    return (
                      <button
                        key={oIdx}
                        onClick={() => setQuizAnswers((prev) => ({ ...prev, [qIdx]: oIdx }))}
                        className={`text-left rounded-xl p-3 text-xs font-medium transition border ${
                          selectedOpt !== undefined
                            ? isCorrect
                              ? "bg-emerald-100 border-emerald-400 text-emerald-950 font-bold"
                              : isSelected
                              ? "bg-rose-100 border-rose-400 text-rose-950"
                              : "bg-white border-slate-200 text-slate-600"
                            : "bg-white border-slate-200 text-slate-800 hover:border-rose-400"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {selectedOpt !== undefined && (
                  <p className="text-xs text-slate-600 italic pt-1">💡 {q.explanation}</p>
                )}
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
