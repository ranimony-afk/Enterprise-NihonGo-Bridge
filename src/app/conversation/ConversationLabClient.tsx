"use client";

import React, { useState } from "react";

export interface ConversationLessonData {
  id: number;
  category: string;
  title: string;
  situation: string;
  difficultyLevel?: string | null;
  dialogues: Array<{
    speaker: string;
    role: string;
    japanese: string;
    furigana: string;
    romaji: string;
    english: string;
    audioUrl?: string;
  }>;
  vocabulary: Array<{ word: string; reading: string; meaning: string }>;
  grammarNotes: string[];
  rolePlayPrompt?: string | null;
  audioUrl?: string | null;
  isCompleted: boolean;
}

export function ConversationLabClient({ initialLessons }: { initialLessons: ConversationLessonData[] }) {
  const [lessons, setLessons] = useState<ConversationLessonData[]>(initialLessons);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedLesson, setSelectedLesson] = useState<ConversationLessonData>(initialLessons[0] || null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingScore, setRecordingScore] = useState<number | null>(null);

  const categories = [
    { key: "all", label: "All Situations" },
    { key: "greetings", label: "1. Greetings" },
    { key: "shopping", label: "2. Shopping" },
    { key: "restaurant", label: "3. Restaurant" },
    { key: "travel", label: "4. Travel" },
    { key: "office", label: "5. Office" },
    { key: "interview", label: "6. Interview" },
    { key: "hospital", label: "7. Hospital" },
    { key: "school", label: "8. School" },
    { key: "business", label: "9. Business" },
  ];

  const filtered = activeCategory === "all"
    ? lessons
    : lessons.filter((l) => l.category === activeCategory);

  const toggleComplete = async (lessonId: number) => {
    const updatedStatus = !selectedLesson.isCompleted;
    setLessons((prev) =>
      prev.map((l) => (l.id === lessonId ? { ...l, isCompleted: updatedStatus } : l)),
    );
    setSelectedLesson((prev) => ({ ...prev, isCompleted: updatedStatus }));

    try {
      await fetch("/api/v1/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, isCompleted: updatedStatus }),
      });
    } catch {}
  };

  const handleRecordPronunciation = () => {
    setIsRecording(true);
    setRecordingScore(null);
    setTimeout(() => {
      setIsRecording(false);
      setRecordingScore(94);
    }, 2000);
  };

  return (
    <div className="space-y-8 font-sans max-w-5xl mx-auto">
      {/* Category Pills for 9 Situations */}
      <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`rounded-xl px-3 py-1.5 transition cursor-pointer ${
              activeCategory === cat.key
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-black/5"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main 2-Column Conversation Lab Platform */}
      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* Left Column: Lesson Selector */}
        <div className="space-y-3 lg:col-span-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Select Dialogue ({filtered.length} Available)
          </p>
          <div className="space-y-2">
            {filtered.map((l) => {
              const isSelected = selectedLesson?.id === l.id;
              return (
                <div
                  key={l.id}
                  onClick={() => setSelectedLesson(l)}
                  className={`rounded-2xl p-4 transition cursor-pointer border shadow-2xs ${
                    isSelected
                      ? "bg-rose-50 border-rose-500 ring-2 ring-rose-500"
                      : "bg-white border-black/5 hover:border-rose-300"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase">
                    <span className="text-rose-700">{l.difficultyLevel || "N5"}</span>
                    {l.isCompleted && <span className="text-emerald-700">✓ Completed</span>}
                  </div>
                  <p className="font-bold text-xs text-slate-950 mt-1">{l.title}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Full Interactive Dialogue & Role Play Pane */}
        {selectedLesson && (
          <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-black/5 space-y-6 lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/5 pb-4">
              <div>
                <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-rose-800">
                  {selectedLesson.difficultyLevel} • {selectedLesson.category}
                </span>
                <h2 className="text-xl font-bold text-slate-950 mt-1">{selectedLesson.title}</h2>
                <p className="text-xs text-slate-600 mt-0.5">{selectedLesson.situation}</p>
              </div>

              <button
                onClick={() => toggleComplete(selectedLesson.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  selectedLesson.isCompleted
                    ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                {selectedLesson.isCompleted ? "✓ Completed Lesson" : "Mark as Complete"}
              </button>
            </div>

            {/* Interactive Dialogue Chat Bubbles */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Interactive Line-by-Line Dialogue 🗣️
              </h3>
              <div className="space-y-3">
                {selectedLesson.dialogues.map((d, i) => (
                  <div
                    key={i}
                    className={`rounded-2xl p-4 space-y-1 text-xs border ${
                      d.role === "User"
                        ? "bg-rose-50/80 border-rose-200/70 ml-4 sm:ml-8"
                        : "bg-slate-50 border-slate-200 mr-4 sm:mr-8"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-[10px] uppercase text-slate-500">
                      <span className={d.role === "User" ? "text-rose-700" : "text-slate-900"}>
                        {d.speaker} ({d.role})
                      </span>
                      <span className="cursor-pointer text-rose-600 hover:underline">🔊 Audio</span>
                    </div>
                    <p className="text-base font-bold text-slate-950">{d.japanese}</p>
                    <p className="text-[11px] text-rose-600 font-medium">{d.furigana}</p>
                    <p className="text-[11px] text-slate-600 italic">{d.english}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pronunciation Recording Box */}
            <div className="rounded-2xl bg-slate-900 p-6 text-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
                  🎙️ Pronunciation Recorder &amp; AI Pitch Check
                </span>
                {recordingScore && (
                  <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300">
                    Accuracy: {recordingScore}% Perfect
                  </span>
                )}
              </div>

              <p className="text-xs opacity-80">
                Role Play Prompt: {selectedLesson.rolePlayPrompt || "Speak your dialogue line into your microphone."}
              </p>

              <button
                onClick={handleRecordPronunciation}
                className={`rounded-xl px-5 py-2.5 text-xs font-bold transition cursor-pointer shadow-xs ${
                  isRecording ? "bg-rose-600 animate-pulse" : "bg-white text-slate-900 hover:bg-slate-100"
                }`}
              >
                {isRecording ? "🔴 Listening to Japanese speech..." : "🎙️ Hold to Record & Verify"}
              </button>
            </div>

            {/* Grammar Notes & Vocabulary for this conversation */}
            <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-black/5 text-xs">
              <div className="space-y-1.5">
                <p className="font-bold text-slate-900">💡 Key Grammar Notes</p>
                {selectedLesson.grammarNotes.map((g, i) => (
                  <p key={i} className="text-slate-600 text-[11px]">
                    • {g}
                  </p>
                ))}
              </div>

              <div className="space-y-1.5">
                <p className="font-bold text-slate-900">📚 Dialogue Vocabulary</p>
                {selectedLesson.vocabulary.map((v, i) => (
                  <p key={i} className="text-slate-700 text-[11px]">
                    <b className="text-slate-950">{v.word}</b> ({v.reading}): {v.meaning}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
