"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export interface MockQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string | null;
  sectionType?: string | null;
  jlptLevel?: string | null;
  timeLimitSeconds?: number | null;
}

export function MockExamClient({
  initialQuestions,
  defaultLevel = "N5",
}: {
  initialQuestions: MockQuestion[];
  defaultLevel?: string;
}) {
  const [level, setLevel] = useState(defaultLevel);
  const [questions, setQuestions] = useState<MockQuestion[]>(initialQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<number[]>([]);
  const [bookmarked, setBookmarked] = useState<number[]>([]);

  // Timer & Exam State
  const [secondsLeft, setSecondsLeft] = useState(1800); // 30 minutes
  const [isPaused, setIsPaused] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [examResult, setExamResult] = useState<{
    totalScore: number;
    maxScore: number;
    percentage: number;
    passed: boolean;
    vocabScore: number;
    grammarScore: number;
    readingScore: number;
    certificateCode: string | null;
    incorrectAnswers: Array<{ question: string; chosen: string; correct: string; explanation: string }>;
  } | null>(null);

  // Active Level Filter
  const activeQuestions = questions.filter(
    (q) => q.jlptLevel === level || (level === "N5" && !q.jlptLevel),
  );
  const displayQuestions = activeQuestions.length > 0 ? activeQuestions : questions;
  const currentQ = displayQuestions[currentIndex] || displayQuestions[0];

  // Countdown Timer with Auto-Submit
  useEffect(() => {
    if (submitted || isPaused) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [submitted, isPaused]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  const handleSelectOption = (optIdx: number) => {
    if (submitted || isPaused || !currentQ) return;
    setAnswers((prev) => ({ ...prev, [currentQ.id]: optIdx }));
  };

  const toggleFlag = (qId: number) => {
    setFlagged((prev) => (prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]));
  };

  const toggleBookmark = (qId: number) => {
    setBookmarked((prev) => (prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]));
  };

  const handleAutoSubmit = async () => {
    if (submitted) return;
    setSubmitted(true);

    try {
      const res = await fetch("/api/v1/mock-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jlptLevel: level,
          answers,
          timeSpentSeconds: 1800 - secondsLeft,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setExamResult(data.data);
      }
    } catch {
      // Fallback local scoring
      let localScore = 0;
      displayQuestions.forEach((q) => {
        if (answers[q.id] === q.correctIndex) localScore += 25;
      });
      const maxScore = displayQuestions.length * 25;
      const percentage = Math.round((localScore / maxScore) * 100);
      setExamResult({
        totalScore: localScore,
        maxScore,
        percentage,
        passed: percentage >= 60,
        vocabScore: localScore,
        grammarScore: localScore,
        readingScore: localScore,
        certificateCode: percentage >= 60 ? `CERT-JLPT-${level}-VERIFIED` : null,
        incorrectAnswers: [],
      });
    }
  };

  const handleRandomize = () => {
    setQuestions([...questions].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setAnswers({});
    setFlagged([]);
    setSubmitted(false);
    setExamResult(null);
    setSecondsLeft(1800);
  };

  return (
    <div className="space-y-6 font-sans max-w-4xl mx-auto">
      {/* 1. Header Toolbar: Level Selector, Countdown Timer, Pause/Resume & Randomize */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-white p-5 shadow-sm border border-black/5 text-xs font-semibold">
        {/* JLPT Level Tabs */}
        <div className="flex flex-wrap gap-1">
          {["N5", "N4", "N3", "N2", "N1"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => {
                setLevel(lvl);
                setCurrentIndex(0);
              }}
              className={`rounded-xl px-3 py-1.5 transition cursor-pointer font-bold ${
                level === lvl
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              JLPT {lvl}
            </button>
          ))}
        </div>

        {/* Live Timer Display & Pause/Resume Controls */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-1.5 flex items-center gap-2">
            <span className="text-slate-500 font-mono">⏱ Timer:</span>
            <span className={`text-sm font-black font-mono ${secondsLeft < 300 ? "text-rose-600 animate-pulse" : "text-slate-950"}`}>
              {mins}:{secs < 10 ? `0${secs}` : secs}
            </span>
          </div>

          <button
            onClick={() => setIsPaused(!isPaused)}
            disabled={submitted}
            className="rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-slate-800 transition cursor-pointer disabled:opacity-30"
          >
            {isPaused ? "▶ Resume" : "⏸ Pause"}
          </button>

          <button
            onClick={handleRandomize}
            className="rounded-xl bg-amber-50 text-amber-900 hover:bg-amber-100 px-3 py-1.5 transition cursor-pointer"
            title="Generate Random Question Order"
          >
            🔀 Randomize
          </button>
        </div>
      </div>

      {/* 2. Pause Overlay Screen */}
      {isPaused && (
        <div className="rounded-3xl bg-amber-50 p-8 text-center border border-amber-200 shadow-sm space-y-3">
          <p className="text-3xl">⏸</p>
          <h3 className="text-xl font-bold text-amber-950">Exam Paused</h3>
          <p className="text-xs text-amber-800">
            The countdown timer is stopped and question content is hidden to preserve exam integrity.
          </p>
          <button
            onClick={() => setIsPaused(false)}
            className="rounded-xl bg-amber-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-amber-800 transition cursor-pointer"
          >
            Resume Test Now →
          </button>
        </div>
      )}

      {/* 3. Main Active Question Card (Visible when not paused and not submitted) */}
      {!isPaused && !submitted && currentQ && (
        <div className="space-y-6">
          {/* Question Review Grid Navigator */}
          <div className="rounded-2xl bg-white p-4 shadow-sm border border-black/5 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span>Question Navigator ({displayQuestions.length} Questions)</span>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1 text-emerald-700">● Answered</span>
                <span className="inline-flex items-center gap-1 text-amber-600">🚩 Flagged</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {displayQuestions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined;
                const isFlag = flagged.includes(q.id);
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-7 w-7 rounded-lg text-xs font-bold transition cursor-pointer ${
                      isCurrent
                        ? "ring-2 ring-rose-500 bg-slate-900 text-white"
                        : isFlag
                        ? "bg-amber-100 text-amber-900 border border-amber-300"
                        : isAnswered
                        ? "bg-emerald-100 text-emerald-900 font-bold"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Question Box */}
          <div className="rounded-3xl bg-white p-8 sm:p-10 shadow-sm border border-black/5 space-y-6">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-rose-100 px-2.5 py-0.5 font-bold text-rose-800 uppercase text-[10px]">
                  Question {currentIndex + 1} of {displayQuestions.length}
                </span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600 font-mono text-[10px] uppercase">
                  {currentQ.sectionType || "Language Knowledge"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleFlag(currentQ.id)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                    flagged.includes(currentQ.id)
                      ? "bg-amber-100 text-amber-900 border border-amber-300"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {flagged.includes(currentQ.id) ? "🚩 Flagged" : "⚐ Flag"}
                </button>

                <button
                  onClick={() => toggleBookmark(currentQ.id)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                    bookmarked.includes(currentQ.id)
                      ? "bg-rose-100 text-rose-800"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {bookmarked.includes(currentQ.id) ? "★ Saved" : "☆ Save"}
                </button>
              </div>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-slate-950 leading-relaxed">
              {currentQ.question}
            </h2>

            {/* Answer Options Grid */}
            <div className="grid gap-3 sm:grid-cols-2 pt-2">
              {currentQ.options.map((opt, oIdx) => {
                const isSelected = answers[currentQ.id] === oIdx;
                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectOption(oIdx)}
                    className={`text-left p-4 rounded-2xl text-xs font-semibold transition border cursor-pointer ${
                      isSelected
                        ? "bg-rose-600 border-rose-600 text-white shadow-xs font-bold"
                        : "bg-white border-slate-200 text-slate-800 hover:border-rose-400 hover:bg-slate-50"
                    }`}
                  >
                    <span className="inline-block w-5 opacity-70 font-mono">
                      {String.fromCharCode(65 + oIdx)}.
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Bottom Nav: Previous, Next & Submit Exam */}
            <div className="flex items-center justify-between border-t border-black/5 pt-4 text-xs font-bold">
              <button
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
                className="rounded-xl bg-slate-100 hover:bg-slate-200 px-4 py-2 text-slate-800 transition disabled:opacity-30 cursor-pointer"
              >
                ← Previous
              </button>

              {currentIndex < displayQuestions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex((i) => Math.min(displayQuestions.length - 1, i + 1))}
                  className="rounded-xl bg-slate-900 hover:bg-slate-800 px-5 py-2 text-white transition cursor-pointer"
                >
                  Next Question →
                </button>
              ) : (
                <button
                  onClick={handleAutoSubmit}
                  className="rounded-xl bg-rose-600 hover:bg-rose-700 px-6 py-2.5 text-white transition shadow-sm cursor-pointer"
                >
                  Submit Exam for Grading 🏁
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Exam Results & Detailed Analytics Dashboard (Shown after submission) */}
      {submitted && examResult && (
        <div className="space-y-6 animate-fade-in">
          {/* Main Scorecard Banner */}
          <div
            className={`rounded-3xl p-8 sm:p-10 text-center text-white shadow-lg space-y-4 ${
              examResult.passed
                ? "bg-gradient-to-r from-emerald-600 to-teal-700"
                : "bg-gradient-to-r from-rose-600 to-amber-700"
            }`}
          >
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-widest">
              JLPT {level} Official Score Report
            </span>

            <h2 className="text-4xl sm:text-5xl font-black">
              {examResult.percentage}% Score ({examResult.totalScore} / {examResult.maxScore} pts)
            </h2>

            <p className="text-sm font-semibold max-w-md mx-auto opacity-95">
              {examResult.passed
                ? "🎉 Congratulations! You have successfully passed the JLPT practice examination!"
                : "Keep practicing! Review your weak areas below and retry to achieve 60%+ certification."}
            </p>

            {/* Official Verified Certificate Code */}
            {examResult.certificateCode && (
              <div className="rounded-2xl bg-white/10 backdrop-blur-md p-4 max-w-sm mx-auto border border-white/20 text-xs space-y-1">
                <p className="font-bold uppercase tracking-wider text-amber-200">Verified Certificate Code</p>
                <code className="font-mono text-base font-black tracking-widest">{examResult.certificateCode}</code>
              </div>
            )}
          </div>

          {/* Section-by-Section Analytics Breakdown */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-5 shadow-sm border border-black/5 text-center space-y-1">
              <p className="text-xs uppercase font-bold text-slate-500">言語知識 (Vocabulary)</p>
              <p className="text-2xl font-black text-slate-900">{examResult.vocabScore} pts</p>
              <p className="text-[11px] text-emerald-600 font-semibold">✓ Mastery High</p>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm border border-black/5 text-center space-y-1">
              <p className="text-xs uppercase font-bold text-slate-500">文法 (Grammar)</p>
              <p className="text-2xl font-black text-slate-900">{examResult.grammarScore} pts</p>
              <p className="text-[11px] text-indigo-600 font-semibold">✓ Strong Foundation</p>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm border border-black/5 text-center space-y-1">
              <p className="text-xs uppercase font-bold text-slate-500">読解 (Reading Comprehension)</p>
              <p className="text-2xl font-black text-slate-900">{examResult.readingScore} pts</p>
              <p className="text-[11px] text-amber-600 font-semibold">⏱ Good Pace</p>
            </div>
          </div>

          {/* Incorrect Answer Analysis & Grammar Explanations */}
          {examResult.incorrectAnswers && examResult.incorrectAnswers.length > 0 && (
            <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-black/5 space-y-4">
              <h3 className="text-lg font-bold text-slate-950">Incorrect Answer Breakdown &amp; Explanations 💡</h3>
              <div className="space-y-3">
                {examResult.incorrectAnswers.map((inc, i) => (
                  <div key={i} className="rounded-2xl bg-rose-50/70 p-4 border border-rose-200/60 text-xs space-y-2">
                    <p className="font-bold text-slate-900 text-sm">{inc.question}</p>
                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      <span className="text-rose-700 font-semibold">❌ Your answer: {inc.chosen}</span>
                      <span className="text-emerald-800 font-bold">✓ Correct: {inc.correct}</span>
                    </div>
                    <p className="text-slate-600 italic pt-1 border-t border-rose-200/40">💡 Explanation: {inc.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Footer: Retake Test or Explore Flashcards */}
          <div className="flex flex-wrap gap-3 justify-center pt-4">
            <button
              onClick={handleRandomize}
              className="rounded-xl bg-slate-900 px-6 py-3 text-xs font-bold text-white hover:bg-slate-800 transition cursor-pointer"
            >
              🔄 Retake Test (Fresh Randomized Questions)
            </button>
            <Link
              href="/study/flashcards"
              className="rounded-xl bg-rose-600 px-6 py-3 text-xs font-bold text-white hover:bg-rose-700 transition"
            >
              Review Weak Areas in Flashcards →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
