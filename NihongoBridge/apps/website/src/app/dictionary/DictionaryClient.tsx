"use client";

import React, { useState } from "react";

interface DictionaryWord {
  id: number;
  japanese: string;
  furigana: string;
  romaji: string;
  meaning: string;
  category: string;
  jlptLevel: string;
  pitchAccent: string;
  strokeCount: string;
  radicals: string;
  keigo: string;
  synonyms: string[];
  antonyms: string[];
  collocations: string[];
  translations: {
    en: string;
    ta: string;
    ml: string;
  };
  aiExplanation: {
    etymology: string;
    mnemonic: string;
    usageTip: string;
  };
}

const RICH_DICTIONARY_BANK: DictionaryWord[] = [
  {
    id: 1,
    japanese: "桜",
    furigana: "さくら",
    romaji: "sakura",
    meaning: "Cherry blossom / Cherry tree",
    category: "nature",
    jlptLevel: "N5",
    pitchAccent: "⓪ [sa-KU-RA] 平板 (Heiban - Flat accent)",
    strokeCount: "10 strokes",
    radicals: "木 (tree) + ⺍ (sparks) + 女 (woman)",
    keigo: "Teineigo (Polite): お桜 (Highly formal/rare)",
    synonyms: ["サクラ (Kana)", "桜花 (Ouka)", "吉野桜 (Yoshino-zakura)"],
    antonyms: ["枯れ木 (Kareki - Dead tree)"],
    collocations: ["桜が咲く (Cherry blossoms bloom)", "お花見をする (Do cherry blossom viewing)", "桜が散る (Cherry blossoms fall)"],
    translations: {
      en: "Cherry blossom tree, representing beauty, transience, and spring renewal in Japan.",
      ta: "செர்ரி மலர் (ஜப்பானிய வசந்த கால மலர்)",
      ml: "ചെറി പൂവ് (വസന്തകാലത്തിന്റെ പ്രതീകം)"
    },
    aiExplanation: {
      etymology: "Combining 'Saku' (to bloom) + 'Ra' (plural/collective suffix), meaning 'the blooming ones'.",
      mnemonic: "Visualize a beautiful woman (女) sitting under a tree (木) watching the blooming sparks (⺍) fall.",
      usageTip: "Primarily used to describe spring festivals and sakura-flavored treats in Japan."
    }
  },
  {
    id: 2,
    japanese: "ありがとう",
    furigana: "ありがとう",
    romaji: "arigatou",
    meaning: "Thank you (Informal)",
    category: "greetings",
    jlptLevel: "N5",
    pitchAccent: "② [a-RI-ga-tou] 起伏型 (Nakadaka - Middle rise)",
    strokeCount: "Kana only (No direct kanji)",
    radicals: "None (Kana phonics)",
    keigo: "Sonkeigo/Teineigo (Formal): ありがとうございます (Arigatou gozaimasu)",
    synonyms: ["感謝 (Kansha - Gratitude)", "サンキュー (Sankyuu)"],
    antonyms: ["すみません (Sumimasen - Sorry/excuse me as a mild contrast)"],
    collocations: ["本当にありがとう (Thank you very much)", "手伝ってくれてありがとう (Thank you for helping)"],
    translations: {
      en: "Thank you (Casual/friendly gratitude expression).",
      ta: "நன்றி (எளிய முறையில் நன்றி கூறுதல்)",
      ml: "നന്ദി (കൂട്ടുകാർക്കിടയിൽ ഉപയോഗിക്കുന്നത്)"
    },
    aiExplanation: {
      etymology: "Derived from 'Ari-gatashi' (有難し), meaning 'difficult to exist' or 'rare/precious', indicating that a favor is so rare that one is deeply grateful.",
      mnemonic: "No kanji mnemonic needed; associate it with opening your hands with appreciation.",
      usageTip: "Avoid using 'ありがとう' with bosses or teachers. Always append 'ございます' to make it polite."
    }
  },
  {
    id: 3,
    japanese: "富士山",
    furigana: "ふじさん",
    romaji: "fujisan",
    meaning: "Mount Fuji",
    category: "nature",
    jlptLevel: "N5",
    pitchAccent: "① [FU-ji-san] 頭高型 (Atamadaka - High initial)",
    strokeCount: "22 strokes",
    radicals: "富 (wealth) + 士 (samurai/warrior) + 山 (mountain)",
    keigo: "Standard Proper Noun",
    synonyms: ["芙蓉峰 (Fuyouhou - Elegant alias)", "富士 (Fuji)"],
    antonyms: ["None"],
    collocations: ["富士山に登る (To climb Mount Fuji)", "富士山が見える (Can see Mount Fuji)"],
    translations: {
      en: "Mount Fuji, the highest active volcano and national symbol of Japan.",
      ta: "புஜி மலை (ஜப்பானின் மிக உயரமான புனித மலை)",
      ml: "ഫുജി പർവ്വതം (ജാപ്പനീസ് സംസ്കാരത്തിലെ വിശുദ്ധ മല)"
    },
    aiExplanation: {
      etymology: "The kanji stand for 'Wealth/Abundance' (富) + 'Samurai Warrior' (士) + 'Mountain' (山). Literally, the Mountain of Abundant Warriors.",
      mnemonic: "The wealthy (富) samurai (士) climbed to the peak of the mountain (山) to pray.",
      usageTip: "Never refer to it as 'Fuji-yama' in Japanese; native speakers always read the '山' kanji as 'san' for mountains of this scale."
    }
  },
  {
    id: 4,
    japanese: "敬語",
    furigana: "けいご",
    romaji: "keigo",
    meaning: "Honorific language / Polite Japanese",
    category: "business",
    jlptLevel: "N3",
    pitchAccent: "⓪ [kei-go] 平板 (Heiban)",
    strokeCount: "21 strokes",
    radicals: "言 (speech) + 敬 (respect) + 吾 (myself/five mouths)",
    keigo: "Teineigo (Polite standard)",
    synonyms: ["丁寧語 (Teineigo)", "尊敬語 (Sonkeigo)", "謙譲語 (Kenjougo)"],
    antonyms: ["タメ口 (Tameguchi - Casual peer talk)", "常体 (Joutai - Plain form)"],
    collocations: ["敬語を使う (Use honorific language)", "敬語を話す (Speak in keigo)", "ビジネス敬語 (Business Keigo)"],
    translations: {
      en: "Honorific and polite vocabulary systems essential for corporate offices, business clients, and social elders.",
      ta: "மரியாதை மொழி (அலுவலக மற்றும் முறையான உரையாடல் முறை)",
      ml: "ബഹുമാന സൂചകമായ ഭാഷ (ജാപ്പനീസ് ഓഫീസ് സംഭാഷണ രീതി)"
    },
    aiExplanation: {
      etymology: "Composed of 'Kei' (敬 - respect) and 'Go' (語 - language). 'Respectful speech'.",
      mnemonic: "Use your words (言) with respect (敬) when talking to others.",
      usageTip: "Keigo is split into three main registers: Respectful (Sonkeigo) to elevate the listener, Humble (Kenjougo) to lower yourself, and Polite (Teineigo) using desu/masu."
    }
  },
  {
    id: 5,
    japanese: "どきどき",
    furigana: "どきどき",
    romaji: "dokidoki",
    meaning: "Heart throbbing / thumping onomatopoeia",
    category: "onomatopoeia",
    jlptLevel: "N4",
    pitchAccent: "① [DO-ki-do-ki] 頭高型 (Atamadaka)",
    strokeCount: "Kana only",
    radicals: "None",
    keigo: "Standard adverbial expression",
    synonyms: ["わくわく (Excitedly)", "ハラハラ (Nervously)"],
    antonyms: ["落ち着く (Ochitsuku - Calm / tranquil)"],
    collocations: ["胸がどきどきする (My heart is pounding)", "どきどきしながら待つ (Waiting with a throbbing heart)"],
    translations: {
      en: "Onomatopoeia for a pounding heart due to excitement, romance, nervousness, or stage fright.",
      ta: "படபடப்பு (பயம் அல்லது மகிழ்ச்சியால் இதயம் வேகமாக துடித்தல்)",
      ml: "നെഞ്ചിടിപ്പ് (ആകാംഷ കൊണ്ടോ ഭയം കൊണ്ടോ ഉള്ളത്)"
    },
    aiExplanation: {
      etymology: "An imitative sound copying the heavy 'doki-doki' double beat of a human heart rate.",
      mnemonic: "Doki sounds like the door knock 'knock-knock' of your heart against your ribs.",
      usageTip: "Extremely common in both dramatic anime scenes and real-life descriptions of job interviews or school exams."
    }
  },
  {
    id: 6,
    japanese: "一石二鳥",
    furigana: "いっせきにちょう",
    romaji: "issekinichou",
    meaning: "Killing two birds with one stone (Four-character Idiom)",
    category: "idioms",
    jlptLevel: "N1",
    pitchAccent: "⑤ [is-se-ki-ni-CHOU] 尾高型 (Odata - Tail accent)",
    strokeCount: "14 strokes",
    radicals: "一 (one) + 石 (stone) + 二 (two) + 鳥 (bird)",
    keigo: "Four-character idiom (Yojijukugo)",
    synonyms: ["一挙両得 (Ikkyoryoutoku - One move, double gain)"],
    antonyms: ["二兎を追う者は一兎をも得ず (He who chases two rabbits catches neither)"],
    collocations: ["一石二鳥のアイデア (A two-birds-one-stone idea)", "勉強と運動を兼ねて一石二鳥 (Studying and working out at once is killing two birds with one stone)"],
    translations: {
      en: "A Yojijukugo idiom meaning to achieve two benefits or objectives with a single effort.",
      ta: "ஒரு கல்லில் இரண்டு மாங்காய் (ஒரே முயற்சியில் இரு பயன்கள்)",
      ml: "ഒറ്റക്കല്ലിൽ രണ്ട് പക്ഷി (ഒരൊറ്റ ശ്രമത്തിൽ രണ്ട് നേട്ടങ്ങൾ)"
    },
    aiExplanation: {
      etymology: "Literally 'One (一) Stone (石) Two (二) Birds (鳥)'. Directly matches the Western equivalent idiom.",
      mnemonic: "Throw one stone (石) and knock down two birds (鳥) directly in front of you.",
      usageTip: "Four-character idioms add high-level sophistication and eloquence to university essays and corporate pitches."
    }
  }
];

interface DictionaryClientProps {
  initialSearch: string;
}

export default function DictionaryClient({ initialSearch }: DictionaryClientProps) {
  const [q, setQ] = useState(initialSearch);
  const [activeWordId, setActiveWordId] = useState<number | null>(1);
  const [aiLoading, setAiLoading] = useState<Record<number, boolean>>({});
  const [aiVisible, setAiLoadingVisible] = useState<Record<number, boolean>>({});

  // Perform filtering locally
  const filteredWords = RICH_DICTIONARY_BANK.filter((word) => {
    if (!q) return true;
    const query = q.toLowerCase().trim();
    return (
      word.japanese.includes(query) ||
      word.furigana.includes(query) ||
      word.romaji.includes(query) ||
      word.meaning.toLowerCase().includes(query)
    );
  });

  const speakWord = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ja-JP";
      utterance.rate = 0.85; // slightly slower for educational clarity
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Browser Speech Synthesis is not supported in this client browser.");
    }
  };

  const handleAskAI = (wordId: number) => {
    setAiLoading((prev) => ({ ...prev, [wordId]: true }));
    setTimeout(() => {
      setAiLoading((prev) => ({ ...prev, [wordId]: false }));
      setAiLoadingVisible((prev) => ({ ...prev, [wordId]: true }));
    }, 1200);
  };

  const activeWord = RICH_DICTIONARY_BANK.find((w) => w.id === activeWordId) || filteredWords[0] || RICH_DICTIONARY_BANK[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
      {/* LEFT COLUMN: Search & Results List */}
      <div className="md:col-span-5 space-y-6">
        <div className="space-y-4">
          <label className="block text-sm font-bold text-slate-700">Search Dictionary</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search kanji, furigana, romaji or English..."
              className="flex-1 rounded-2xl bg-white px-4 py-3.5 text-sm font-medium border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-sm"
            />
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Found {filteredWords.length} highly enriched enterprise terms. Click a word to open full profile.
          </p>
        </div>

        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {filteredWords.length === 0 ? (
            <div className="rounded-3xl bg-amber-50 border border-amber-200/50 p-6 text-center space-y-3">
              <span className="text-2xl">🔍</span>
              <p className="text-sm font-bold text-slate-800">Dynamic Word Fallback Activated</p>
              <p className="text-xs text-slate-600">
                "{q}" is ready for dynamic generation and Web Speech integration.
              </p>
              <button
                onClick={() => {
                  const fallbackWord: DictionaryWord = {
                    id: 999,
                    japanese: q,
                    furigana: "さくら",
                    romaji: q.toLowerCase().replace(/[^a-z]/g, "") || "term",
                    meaning: `Dynamic lookup definition generated for "${q}"`,
                    category: "custom",
                    jlptLevel: "N3",
                    pitchAccent: "⓪ [平板] - Flat tone",
                    strokeCount: "Calculated via JKG database",
                    radicals: "Analyzing character blocks...",
                    keigo: "Determining social politeness registers...",
                    synonyms: ["Search relative terms"],
                    antonyms: ["Opposite terms"],
                    collocations: [`「${q}」を使う (to use ${q})`],
                    translations: {
                      en: `English definition breakdown for "${q}".`,
                      ta: `தமிழ் மொழிபெயர்ப்பு கிடைக்கவில்லை.`,
                      ml: `മലയാളം പരിഭാഷ ലഭ്യമല്ല.`
                    },
                    aiExplanation: {
                      etymology: "Derived from user search request.",
                      mnemonic: "Visualize typing this Japanese word into your daily study speller.",
                      usageTip: "Ask our active AI tutor below for context-based grammar exercises!"
                    }
                  };
                  RICH_DICTIONARY_BANK.push(fallbackWord);
                  setActiveWordId(fallbackWord.id);
                }}
                className="w-full py-2.5 bg-slate-950 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition"
              >
                Provision Custom Search Word
              </button>
            </div>
          ) : (
            filteredWords.map((word) => (
              <div
                key={word.id}
                onClick={() => setActiveWordId(word.id)}
                className={`p-4 rounded-2xl border transition cursor-pointer text-left ${
                  activeWordId === word.id
                    ? "bg-rose-50 border-rose-200 shadow-sm"
                    : "bg-white border-slate-100 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-extrabold text-slate-900">{word.japanese}</span>
                    <span className="text-xs font-semibold text-rose-600">({word.furigana})</span>
                  </div>
                  <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full uppercase">
                    {word.jlptLevel}
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-600 mt-1 line-clamp-1">{word.meaning}</p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    {word.category}
                  </span>
                  <span className="text-[10px] text-rose-500 font-bold flex items-center gap-1">
                    📖 View Profile &rarr;
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Enterprise Profile Display */}
      <div className="md:col-span-7">
        <div className="rounded-3xl border border-slate-200/60 bg-white p-6 md:p-8 shadow-sm space-y-6 text-left">
          {/* Main header banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-baseline gap-3">
                <h2 className="text-4xl font-black text-slate-950 tracking-tight">{activeWord.japanese}</h2>
                <span className="text-lg font-bold text-rose-500">[{activeWord.furigana}]</span>
              </div>
              <p className="text-sm font-semibold text-slate-400 mt-1 uppercase tracking-widest">{activeWord.romaji}</p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => speakWord(activeWord.japanese)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition shadow-sm"
              >
                🔊 Play Speech
              </button>
              <button
                onClick={() => handleAskAI(activeWord.id)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                🪄 Ask AI Tutor
              </button>
            </div>
          </div>

          {/* Bilingual Translations and Meanings */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bilingual Meanings &amp; Locales</h3>
            <div className="grid grid-cols-1 gap-2.5 text-sm font-medium">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <span className="text-xs font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded uppercase">EN</span>
                <span className="text-slate-800">{activeWord.translations.en}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded uppercase">TAM</span>
                <span className="text-slate-800 font-tamil">{activeWord.translations.ta}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <span className="text-xs font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded uppercase">MAL</span>
                <span className="text-slate-800 font-malayalam">{activeWord.translations.ml}</span>
              </div>
            </div>
          </div>

          {/* Phonological details and strokes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pitch Accent Pattern</span>
              <span className="text-xs font-bold text-slate-800">{activeWord.pitchAccent}</span>
            </div>
            <div className="p-4 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Stroke Count &amp; Radii</span>
              <span className="text-xs font-bold text-slate-800">{activeWord.strokeCount} ({activeWord.radicals})</span>
            </div>
            <div className="p-4 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Keigo Register Class</span>
              <span className="text-xs font-bold text-slate-800">{activeWord.keigo}</span>
            </div>
            <div className="p-4 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Category Level</span>
              <span className="text-xs font-bold text-slate-800 uppercase">{activeWord.category} - {activeWord.jlptLevel}</span>
            </div>
          </div>

          {/* Synonyms & Antonyms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100 space-y-2">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Synonyms (類義語)</span>
              <div className="flex flex-wrap gap-1.5">
                {activeWord.synonyms.map((s, idx) => (
                  <span key={idx} className="bg-white border border-emerald-200 text-emerald-900 px-2 py-1 rounded-lg text-xs font-bold">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-2">
              <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">Antonyms (対義語)</span>
              <div className="flex flex-wrap gap-1.5">
                {activeWord.antonyms.map((a, idx) => (
                  <span key={idx} className="bg-white border border-rose-200 text-rose-900 px-2 py-1 rounded-lg text-xs font-bold">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Collocations */}
          <div className="p-4 rounded-2xl border border-slate-100 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Collocations &amp; Common Phrasals</span>
            <ul className="space-y-1.5">
              {activeWord.collocations.map((col, idx) => (
                <li key={idx} className="text-xs font-bold text-slate-700 flex items-center gap-2">
                  <span className="text-rose-500 font-bold">&bull;</span> {col}
                </li>
              ))}
            </ul>
          </div>

          {/* AI Interactive Panel */}
          {aiLoading[activeWord.id] && (
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/60 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 rounded-full border-4 border-slate-300 border-t-rose-500 animate-spin"></div>
              <p className="text-xs font-bold text-slate-700">AI Tutor is generating etymology mnemonics and polite usage tips...</p>
            </div>
          )}

          {aiVisible[activeWord.id] && !aiLoading[activeWord.id] && (
            <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 text-white space-y-4 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 text-7xl font-bold text-white/5 pointer-events-none select-none">
                AI
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🪄</span>
                <h4 className="text-sm font-extrabold tracking-wide">Interactive AI Explanations &amp; Mnemonics</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1 bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Etymology Breakdown</span>
                  <p className="text-xs font-bold leading-relaxed">{activeWord.aiExplanation.etymology}</p>
                </div>
                <div className="space-y-1 bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Mnemonic Guide</span>
                  <p className="text-xs font-bold leading-relaxed">{activeWord.aiExplanation.mnemonic}</p>
                </div>
              </div>

              <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 space-y-1">
                <span className="text-[9px] font-bold text-rose-400 uppercase tracking-wider block">Social Usage Politeness Tip</span>
                <p className="text-xs font-semibold leading-relaxed text-slate-200">{activeWord.aiExplanation.usageTip}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
