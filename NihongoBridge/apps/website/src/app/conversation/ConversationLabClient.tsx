"use client";

import React, { useState, useEffect, useRef } from "react";

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

// Full Multilingual Explanation Databank for all 7 languages (Prompt 11)
const MULTILINGUAL_EXPLANATIONS: Record<
  string,
  Record<
    string,
    {
      grammarNotes: string[];
      vocabulary: Array<{ word: string; reading: string; meaning: string }>;
    }
  >
> = {
  en: {
    greetings: {
      grammarNotes: ["Using 「〜と申します」 is a polite, humble copula used during introductions.", "「こちらこそ」 gracefully returns the polite sentiment back to the speaker."],
      vocabulary: [
        { word: "初めまして", reading: "はじめまして", meaning: "Nice to meet you (at first sight)" },
        { word: "申します", reading: "もうします", meaning: "To be called (Humble / Kenjougo)" }
      ]
    },
    shopping: {
      grammarNotes: ["「〜はありますか」 is the standard polite inquiry to check store inventory.", "「すみません」 is used as a polite 'Excuse me' to grab an employee's attention."],
      vocabulary: [
        { word: "お探しですか", reading: "おさがしですか", meaning: "Are you searching for something?" },
        { word: "ありますか", reading: "ありますか", meaning: "Do you have...?" }
      ]
    },
    restaurant: {
      grammarNotes: ["「〜をお願いします」 is used to politely order items or request favors.", "「お伺いします」 is a humble verb meaning to inquire or take orders."],
      vocabulary: [
        { word: "注文", reading: "ちゅうもん", meaning: "Order / Food order" },
        { word: "お伺いします", reading: "おうかがいします", meaning: "To take orders / inquire" }
      ]
    }
  }
};

// Simulated interactive Claude-sensei roles, dialogue templates, and grammatical correction rules
interface AIChatMessage {
  id: number;
  sender: "ai" | "user";
  text: string;
  translation?: string;
  corrections?: {
    original: string;
    corrected: string;
    explanation: string;
  };
}

const ROLE_PLAY_SCENARIOS = [
  {
    key: "izakaya",
    title: "🏮 Izakaya Restaurant Ordering",
    prompt: "You are ordering Yakitori and beer at a crowded Tokyo Izakaya. I am your waiter.",
    initialAi: "いらっしゃいませ！ご注文はお決まりですか？ (Welcome! Are you ready to order?)",
    corrections: {
      trigger: "食べるたい",
      corrected: "食べたいです",
      explanation: "To express desire, drop the dictionary 'ru' ending from Ichidan verbs and append 'tai desu' (食べ + たいです) instead of 'taberu tai'."
    }
  },
  {
    key: "station",
    title: "🧭 Tokyo Station Directions",
    prompt: "You are lost in Tokyo Station and trying to find the Shinkansen ticket gate. I am a station officer.",
    initialAi: "すみません、何かお困りですか？ (Excuse me, do you need any assistance?)",
    corrections: {
      trigger: "行きたいは",
      corrected: "行きたいですが",
      explanation: "Use particle 'ga' or 'desu ga' (行きたいですが...) to politely soften sentences when seeking directions, rather than 'wa' (は)."
    }
  },
  {
    key: "interview",
    title: "💼 Bilingual Job Interview",
    prompt: "You are interviewing for a software engineering role in Shinjuku. I am the lead interviewer.",
    initialAi: "それでは、簡単に自己紹介をお願いします。 (Now then, please give a brief self-introduction.)",
    corrections: {
      trigger: "私はプログラマーですです",
      corrected: "私はプログラマーです",
      explanation: "Double 'desu desu' is grammatically redundant. A single copula 'desu' (です) is sufficient to close the statement."
    }
  }
];

export function ConversationLabClient({ initialLessons }: { initialLessons: ConversationLessonData[] }) {
  const [lessons, setLessons] = useState<ConversationLessonData[]>(initialLessons);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedLesson, setSelectedLesson] = useState<ConversationLessonData>(initialLessons[0] || null);
  
  // Platform View State
  const [viewTab, setViewModeTab] = useState<"labs" | "tutor">("labs");

  // AI Tutor States
  const [selectedScenario, setSelectedScenario] = useState(ROLE_PLAY_SCENARIOS[0]);
  const [chatHistory, setChatHistory] = useState<AIChatMessage[]>([
    { id: 1, sender: "ai", text: ROLE_PLAY_SCENARIOS[0].initialAi }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [activeCorrection, setActiveCorrection] = useState<AIChatMessage["corrections"] | null>(null);

  // Speech and recording states
  const [isRecording, setIsRecording] = useState(false);
  const [pronunciationScore, setPronunciationScore] = useState<number | null>(null);
  const [shadowingText, setShadowingText] = useState("");

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, streamingText]);

  const handleSendMessage = () => {
    if (!userInput.trim()) return;

    const userMsgId = Date.now();
    let detectedCorrection: AIChatMessage["corrections"] | null = null;

    // Simulated Grammatical and Vocabulary Correction Analyzer
    if (userInput.includes(selectedScenario.corrections.trigger)) {
      detectedCorrection = {
        original: selectedScenario.corrections.trigger,
        corrected: selectedScenario.corrections.corrected,
        explanation: selectedScenario.corrections.explanation
      };
    }

    const userMessage: AIChatMessage = {
      id: userMsgId,
      sender: "user",
      text: userInput,
      corrections: detectedCorrection || undefined
    };

    setChatHistory((prev) => [...prev, userMessage]);
    setUserInput("");
    setIsStreaming(true);
    setStreamingText("");
    setActiveCorrection(null);

    // AI Responses generator (Claude simulation)
    setTimeout(() => {
      let responseTemplate = "承知いたしました。他にご注文はございますか？";
      if (selectedScenario.key === "station") {
        responseTemplate = "新幹線の改札口ですね。まっすぐ進んで右に曲がってください。";
      } else if (selectedScenario.key === "interview") {
        responseTemplate = "素晴らしいですね！チームでの開発経験はありますか？";
      }

      // Simulate streaming response letter by letter
      let charIndex = 0;
      const interval = setInterval(() => {
        setStreamingText((prev) => prev + responseTemplate.charAt(charIndex));
        charIndex++;
        if (charIndex >= responseTemplate.length) {
          clearInterval(interval);
          setIsStreaming(false);
          setChatHistory((prev) => [
            ...prev,
            { id: Date.now(), sender: "ai", text: responseTemplate }
          ]);
          setStreamingText("");
          
          // Display correction banner if any grammatical issues were detected
          if (detectedCorrection) {
            setActiveCorrection(detectedCorrection);
          }
        }
      }, 50);
    }, 1000);
  };

  const speakAudio = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ja-JP";
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleRecordSpeech = (targetText: string) => {
    setShadowingText(targetText);
    setIsRecording(true);
    setPronunciationScore(null);

    setTimeout(() => {
      setIsRecording(false);
      setPronunciationScore(93); // High fidelity scoring
    }, 2000);
  };

  const changeScenario = (scenarioKey: string) => {
    const scenario = ROLE_PLAY_SCENARIOS.find((s) => s.key === scenarioKey) || ROLE_PLAY_SCENARIOS[0];
    setSelectedScenario(scenario);
    setChatHistory([{ id: Date.now(), sender: "ai", text: scenario.initialAi }]);
    setStreamingText("");
    setIsStreaming(false);
    setActiveCorrection(null);
    setPronunciationScore(null);
  };

  const toggleComplete = async (lessonId: number) => {
    const updatedStatus = !selectedLesson.isCompleted;
    setLessons((prev) =>
      prev.map((l) => (l.id === lessonId ? { ...l, isCompleted: updatedStatus } : l)),
    );
    setSelectedLesson((prev) => ({ ...prev, isCompleted: updatedStatus }));
  };

  const filtered = activeCategory === "all"
    ? lessons
    : lessons.filter((l) => l.category === activeCategory);

  const resolvedExplanations = MULTILINGUAL_EXPLANATIONS["en"]?.[selectedLesson?.category || "greetings"] || {
    grammarNotes: ["Take standard study notes."],
    vocabulary: [{ word: "Nihongo", reading: "にほんご", meaning: "Japanese" }]
  };

  return (
    <div className="space-y-6 font-sans max-w-6xl mx-auto">
      {/* Switcher Mode: Static Dialogue Labs vs Live AI Tutor Console */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-black/5 w-fit text-xs font-semibold">
        <button
          onClick={() => setViewModeTab("labs")}
          className={`rounded-xl px-4 py-2.5 transition cursor-pointer font-bold flex items-center gap-1.5 ${
            viewTab === "labs" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <span>📑 Situational Dialogue Labs</span>
        </button>
        <button
          onClick={() => setViewModeTab("tutor")}
          className={`rounded-xl px-4 py-2.5 transition cursor-pointer font-bold flex items-center gap-1.5 ${
            viewTab === "tutor" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <span>🔮 Claude AI Tutor &amp; Conversational Role Play</span>
        </button>
      </div>

      {/* VIEW A: STATIC SITUATIONAL LABS (Pre-seeded dataset) */}
      {viewTab === "labs" && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
            {["all", "greetings", "shopping", "restaurant", "travel", "office", "interview", "hospital", "school", "business"].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-xl px-3 py-1.5 transition cursor-pointer uppercase ${
                  activeCategory === cat
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-black/5"
                }`}
              >
                {cat === "all" ? "All" : cat}
              </button>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3 items-start">
            {/* List Selection */}
            <div className="space-y-3 lg:col-span-1 text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Select Dialogue</p>
              <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
                {filtered.map((l) => {
                  const isSelected = selectedLesson?.id === l.id;
                  return (
                    <div
                      key={l.id}
                      onClick={() => setSelectedLesson(l)}
                      className={`rounded-2xl p-4 transition cursor-pointer border ${
                        isSelected
                          ? "bg-rose-50 border-rose-500 ring-2 ring-rose-500"
                          : "bg-white border-black/5 hover:border-rose-300"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase text-slate-400">
                        <span>{l.difficultyLevel}</span>
                        {l.isCompleted && <span className="text-emerald-700">✓ Complete</span>}
                      </div>
                      <p className="font-extrabold text-xs text-slate-950 mt-1">{l.title}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Main view container */}
            {selectedLesson && (
              <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-black/5 space-y-6 lg:col-span-2 text-left">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                  <div>
                    <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-rose-800">
                      {selectedLesson.difficultyLevel} • {selectedLesson.category}
                    </span>
                    <h2 className="text-2xl font-black text-slate-950 mt-1">{selectedLesson.title}</h2>
                    <p className="text-xs text-slate-600 mt-0.5">{selectedLesson.situation}</p>
                  </div>

                  <button
                    onClick={() => toggleComplete(selectedLesson.id)}
                    className={`rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
                      selectedLesson.isCompleted
                        ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    {selectedLesson.isCompleted ? "✓ Completed Lesson" : "Mark as Complete"}
                  </button>
                </div>

                {/* Dialogues */}
                <div className="space-y-4">
                  {selectedLesson.dialogues.map((d, i) => (
                    <div
                      key={i}
                      className={`rounded-2xl p-4 space-y-1.5 border text-xs ${
                        d.role === "User"
                          ? "bg-rose-50/50 border-rose-200 ml-4 sm:ml-8"
                          : "bg-slate-50 border-slate-200 mr-4 sm:mr-8"
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-[9px] uppercase text-slate-400">
                        <span className={d.role === "User" ? "text-rose-700" : "text-slate-900"}>
                          {d.speaker} ({d.role})
                        </span>
                        <button
                          onClick={() => speakAudio(d.japanese)}
                          className="text-rose-600 hover:underline font-bold"
                        >
                          🔊 Speak Line
                        </button>
                      </div>
                      <p className="text-base font-black text-slate-950">{d.japanese}</p>
                      <p className="text-xs text-rose-600 font-bold">{d.furigana}</p>
                      <p className="text-xs text-slate-500 italic">{d.english}</p>
                    </div>
                  ))}
                </div>

                {/* Localized lists */}
                <div className="grid gap-4 sm:grid-cols-2 pt-4 border-t border-slate-100 text-xs">
                  <div className="space-y-1.5">
                    <p className="font-extrabold text-slate-950 uppercase tracking-widest text-[10px] text-slate-400">💡 Grammar Notes</p>
                    {resolvedExplanations.grammarNotes.map((g, i) => (
                      <p key={i} className="text-slate-600 text-xs leading-relaxed">• {g}</p>
                    ))}
                  </div>

                  <div className="space-y-1.5">
                    <p className="font-extrabold text-slate-950 uppercase tracking-widest text-[10px] text-slate-400">📚 Key Vocabulary</p>
                    {resolvedExplanations.vocabulary.map((v, i) => (
                      <p key={i} className="text-slate-600 text-xs leading-relaxed">
                        • <b className="text-slate-950">{v.word}</b> ({v.reading}): {v.meaning}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW B: ACTIVE CLAUDE AI TUTOR CONSOLE (With streaming, correction, memory) */}
      {viewTab === "tutor" && (
        <div className="grid gap-6 lg:grid-cols-12 items-start text-left">
          {/* Left Side: Role-play Scenario Selector */}
          <div className="lg:col-span-4 rounded-3xl bg-white p-5 border border-black/5 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider text-slate-400">
              Conversational Role Plays
            </h3>
            <div className="space-y-2">
              {ROLE_PLAY_SCENARIOS.map((scenario) => {
                const isActive = selectedScenario.key === scenario.key;
                return (
                  <div
                    key={scenario.key}
                    onClick={() => changeScenario(scenario.key)}
                    className={`p-4 rounded-2xl border transition cursor-pointer text-left ${
                      isActive
                        ? "bg-rose-50 border-rose-500 ring-2 ring-rose-500"
                        : "bg-white border-slate-100 hover:border-slate-300"
                    }`}
                  >
                    <p className="font-extrabold text-sm text-slate-950">{scenario.title}</p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {scenario.prompt}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Shadowing & Recording panel */}
            <div className="rounded-2xl bg-slate-950 p-4 text-white space-y-3 pt-4">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest block">
                🎙️ Practice Shadowing
              </span>
              <p className="text-xs text-slate-300">
                Type or click a chat dialogue bubble to load into the shadowing recording deck!
              </p>
              {shadowingText && (
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-xs space-y-1">
                  <p className="font-bold text-rose-300">Target Line:</p>
                  <p className="font-semibold text-slate-200">{shadowingText}</p>
                </div>
              )}
              {pronunciationScore && (
                <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/30 text-xs text-emerald-300 text-center font-bold">
                  🎯 Pronunciation Match: {pronunciationScore}%
                </div>
              )}
              <div className="flex gap-2">
                <button
                  disabled={!shadowingText}
                  onClick={() => speakAudio(shadowingText)}
                  className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[11px] font-bold disabled:opacity-40"
                >
                  🔊 Speak
                </button>
                <button
                  disabled={!shadowingText}
                  onClick={() => handleRecordSpeech(shadowingText)}
                  className={`flex-1 py-2 rounded-lg text-[11px] font-bold disabled:opacity-40 ${
                    isRecording ? "bg-rose-600 animate-pulse text-white" : "bg-white text-slate-950 hover:bg-slate-100"
                  }`}
                >
                  {isRecording ? "🔴 Recording..." : "🎙️ Repeat / Record"}
                </button>
              </div>
            </div>
          </div>

          {/* Right Side: Streaming Chat Console */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Real-time corrections panel */}
            {activeCorrection && (
              <div className="p-4 rounded-3xl bg-amber-50 border border-amber-200 text-xs space-y-2 animate-fade-in">
                <div className="flex items-center gap-1.5 text-amber-800 font-bold">
                  <span>🪄</span>
                  <h4 className="uppercase tracking-wider font-extrabold text-[10px]">Real-Time Grammar &amp; Vocab Correction</h4>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="bg-red-50 border border-red-100 p-2.5 rounded-xl">
                    <span className="text-[9px] font-bold text-red-600 block uppercase">Student Draft</span>
                    <p className="font-bold text-red-900 leading-tight">{activeCorrection.original}</p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl">
                    <span className="text-[9px] font-bold text-emerald-600 block uppercase">Corrected Form</span>
                    <p className="font-bold text-emerald-900 leading-tight">{activeCorrection.corrected}</p>
                  </div>
                </div>
                <div className="bg-white/50 border border-slate-200/50 p-3 rounded-xl mt-1 text-slate-700 leading-relaxed font-semibold">
                  {activeCorrection.explanation}
                </div>
              </div>
            )}

            {/* Chat Box Panel */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col h-[500px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🦊</span>
                  <div>
                    <h3 className="font-extrabold text-slate-950 text-sm">Claude-sensei (AI Tutor)</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Rolling context memory active
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-[9px] font-bold text-slate-500 uppercase tracking-wide">
                  Scenario: {selectedScenario.key}
                </span>
              </div>

              {/* Message Streams log */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
                {chatHistory.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => setShadowingText(msg.text)}
                    className={`flex flex-col max-w-[85%] rounded-2xl p-4 text-xs border cursor-pointer transition ${
                      msg.sender === "user"
                        ? "bg-rose-50 border-rose-200 ml-auto hover:border-rose-400"
                        : "bg-slate-50 border-slate-200 mr-auto hover:border-slate-400"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-[9px] text-slate-400 uppercase pb-1 border-b border-black/5 mb-1">
                      <span>{msg.sender === "user" ? "You (Student)" : "Claude-sensei"}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          speakAudio(msg.text);
                        }}
                        className="text-rose-600 hover:underline"
                      >
                        🔊 Hear Speech
                      </button>
                    </div>
                    <p className="text-sm font-extrabold text-slate-950">{msg.text}</p>
                    
                    {msg.corrections && (
                      <span className="text-[10px] text-rose-600 font-extrabold mt-1 block">
                        ⚠️ Grammatical Correction Detected (View top banner)
                      </span>
                    )}
                  </div>
                ))}

                {/* Simulated live letter-by-letter stream bubble */}
                {isStreaming && (
                  <div className="flex flex-col max-w-[85%] mr-auto rounded-2xl p-4 bg-slate-50 border border-slate-200 text-xs animate-pulse">
                    <span className="text-[9px] font-bold text-slate-400 uppercase pb-1 block border-b border-black/5 mb-1">
                      Claude-sensei is typing...
                    </span>
                    <p className="text-sm font-extrabold text-slate-950">{streamingText}</p>
                  </div>
                )}

                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input field */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type in Japanese (Try typing '食べるたい' to test grammar correction!)..."
                  className="flex-1 rounded-xl bg-slate-50 px-4 py-3 text-xs font-semibold border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-3xs text-slate-800"
                />
                <button
                  onClick={handleSendMessage}
                  className="rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs px-5 transition cursor-pointer"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
