/**
 * Idempotent seed — guarantees brands, starter catalog, CMS sections,
 * translations, Nihongo learning items, custom decks, daily news, and Phase 6 Duolingo-style gamification & leaderboards.
 */

import { db } from "@/db";
import {
  brands,
  courses,
  modules,
  lessons,
  pages,
  contentSections,
  brandSettings,
  translations,
  translationMemory,
  nihongoLearningItems,
  nihongoQuizzes,
  customDecks,
  customDeckCards,
  newsArticles,
  learnerGamification,
  leaderboards,
} from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { BRANDS, type BrandKey } from "@/lib/brands";

let seededPromise: Promise<void> | null = null;

export function ensureSeed(): Promise<void> {
  if (!seededPromise) {
    seededPromise = doSeed().catch((err) => {
      seededPromise = null;
      throw err;
    });
  }
  return seededPromise;
}

async function doSeed(): Promise<void> {
  await db.execute(sql`select 1`);

  for (const cfg of Object.values(BRANDS)) {
    const existing = await db
      .select()
      .from(brands)
      .where(eq(brands.slug, cfg.slug))
      .limit(1);

    let brandId: number;
    if (existing.length === 0) {
      const inserted = await db
        .insert(brands)
        .values({
          slug: cfg.slug,
          name: cfg.name,
          tagline: cfg.tagline,
          defaultLocale: cfg.defaultLocale,
          theme: cfg.theme,
        })
        .returning({ id: brands.id });
      brandId = inserted[0].id;
    } else {
      brandId = existing[0].id;
    }

    await seedContent(brandId, cfg.key);
    await seedCmsSectionsAndSettings(brandId, cfg.key);
    await seedTranslations(brandId, cfg.key);
    if (cfg.key === "nihongo") {
      await seedNihongoPlatform(brandId);
      await seedCustomDecks(brandId);
      await seedNewsArticles(brandId);
      await seedGamificationAndLeaderboards(brandId);
    }
  }
}

async function seedGamificationAndLeaderboards(brandId: number): Promise<void> {
  const existingGamify = await db.select().from(learnerGamification).limit(1);
  if (existingGamify.length === 0) {
    await db.insert(learnerGamification).values({
      brandId,
      xp: 420,
      streakDays: 8,
      dailyGoalMinutes: 15,
      weeklyGoalMinutes: 90,
      totalStudyMinutes: 135,
      completedLessonsCount: 14,
      completedReviewsCount: 95,
      averageTestScore: 92,
      streakFreezes: 2,
      level: 3,
      levelTitle: "Hiragana Adept",
      bookmarks: [1, 2],
      achievements: ["First 100 XP", "7-Day Streak Warrior", "Kanji Novice", "Speed Matcher"],
      badges: [
        { name: "First 100 XP", icon: "⚡", description: "Earned your first 100 XP" },
        { name: "7-Day Streak", icon: "🔥", description: "Studied 7 days in a row" },
        { name: "JLPT Explorer", icon: "🗾", description: "Completed your first JLPT practice module" },
        { name: "Quiz Master", icon: "🎯", description: "Scored 100% on a practice quiz" },
      ],
      dailyChallenges: [
        { title: "Review 10 flashcards in Spaced Repetition", xpReward: 20, isCompleted: true },
        { title: "Read today's Japanese news article", xpReward: 30, isCompleted: true },
        { title: "Score 100% on a JLPT N5 quiz", xpReward: 25, isCompleted: false },
      ],
      weakAreas: [
        { item: "食べる (taberu)", meaning: "To eat (Ichidan verb)", accuracy: 65 },
        { item: "日本 (nihon)", meaning: "Japan (4 strokes)", accuracy: 70 },
        { item: "勉強する (benkyou suru)", meaning: "To study (Suru verb)", accuracy: 72 },
      ],
    });
  }

  const existingLb = await db.select().from(leaderboards).limit(1);
  if (existingLb.length === 0) {
    const defaultRanks = [
      { displayName: "Yuki M. (You)", xp: 420, rank: 1, avatarEmoji: "🦊", streakDays: 8, league: "Sapphire League" },
      { displayName: "Kenji S.", xp: 390, rank: 2, avatarEmoji: "🐼", streakDays: 14, league: "Sapphire League" },
      { displayName: "Sarah C.", xp: 360, rank: 3, avatarEmoji: "🐱", streakDays: 5, league: "Sapphire League" },
      { displayName: "David K.", xp: 310, rank: 4, avatarEmoji: "🦁", streakDays: 12, league: "Sapphire League" },
      { displayName: "Elena R.", xp: 280, rank: 5, avatarEmoji: "🦉", streakDays: 3, league: "Sapphire League" },
    ];
    for (const r of defaultRanks) {
      await db.insert(leaderboards).values(r);
    }
  }
}

async function seedNewsArticles(brandId: number): Promise<void> {
  for (const art of SEED_NEWS_ARTICLES) {
    const existing = await db
      .select()
      .from(newsArticles)
      .where(and(eq(newsArticles.brandId, brandId), eq(newsArticles.slug, art.slug)))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(newsArticles).values({
        brandId,
        slug: art.slug,
        title: art.title,
        summary: art.summary,
        japaneseText: art.japaneseText,
        furiganaText: art.furiganaText,
        englishTranslation: art.englishTranslation,
        tamilTranslation: art.tamilTranslation,
        malayalamTranslation: art.malayalamTranslation,
        difficultyLevel: art.difficultyLevel,
        readingMinutes: art.readingMinutes,
        audioUrl: art.audioUrl,
        grammarHighlights: art.grammarHighlights,
        extractedVocabulary: art.extractedVocabulary,
        extractedKanji: art.extractedKanji,
        comprehensionQuestions: art.comprehensionQuestions,
        isToday: art.isToday,
        status: "published",
      });
    }
  }
}

async function seedCustomDecks(brandId: number): Promise<void> {
  for (const d of SEED_DECKS) {
    const existing = await db
      .select()
      .from(customDecks)
      .where(and(eq(customDecks.brandId, brandId), eq(customDecks.title, d.title)))
      .limit(1);

    let deckId: number;
    if (existing.length === 0) {
      const inserted = await db
        .insert(customDecks)
        .values({
          brandId,
          title: d.title,
          description: d.description,
          jlptLevel: d.jlptLevel,
          isPublic: true,
          shareCode: d.shareCode,
          tags: d.tags,
          cardCount: d.cards.length,
        })
        .returning({ id: customDecks.id });
      deckId = inserted[0].id;
    } else {
      deckId = existing[0].id;
    }

    for (let i = 0; i < d.cards.length; i++) {
      const c = d.cards[i];
      const existingCard = await db
        .select()
        .from(customDeckCards)
        .where(and(eq(customDeckCards.deckId, deckId), eq(customDeckCards.front, c.front)))
        .limit(1);

      if (existingCard.length === 0) {
        await db.insert(customDeckCards).values({
          deckId,
          cardType: c.cardType,
          front: c.front,
          back: c.back,
          furigana: c.furigana,
          romaji: c.romaji,
          notes: c.notes,
          position: i,
          easeFactor: 250,
          intervalDays: 1,
          repetitions: 0,
          accuracy: 100,
        });
      }
    }
  }
}

async function seedNihongoPlatform(brandId: number): Promise<void> {
  for (const item of NIHONGO_ITEMS) {
    const existing = await db
      .select()
      .from(nihongoLearningItems)
      .where(
        and(
          eq(nihongoLearningItems.brandId, brandId),
          eq(nihongoLearningItems.japanese, item.japanese),
          eq(nihongoLearningItems.category, item.category),
        ),
      )
      .limit(1);

    if (existing.length === 0) {
      await db.insert(nihongoLearningItems).values({
        brandId,
        category: item.category,
        jlptLevel: item.jlptLevel,
        japanese: item.japanese,
        furigana: item.furigana,
        romaji: item.romaji,
        meaning: item.meaning,
        exampleSentenceJa: item.exampleSentenceJa,
        exampleSentenceEn: item.exampleSentenceEn,
        grammarStructure: item.grammarStructure,
        strokeCount: item.strokeCount,
        radicals: item.radicals,
        tags: item.tags,
      });
    }
  }

  for (const q of NIHONGO_QUIZZES) {
    const existing = await db
      .select()
      .from(nihongoQuizzes)
      .where(
        and(
          eq(nihongoQuizzes.brandId, brandId),
          eq(nihongoQuizzes.question, q.question),
        ),
      )
      .limit(1);

    if (existing.length === 0) {
      await db.insert(nihongoQuizzes).values({
        brandId,
        category: q.category,
        jlptLevel: q.jlptLevel,
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
      });
    }
  }
}

async function seedTranslations(brandId: number, key: BrandKey): Promise<void> {
  const localizedData = DB_TRANSLATIONS[key];

  for (const item of localizedData) {
    const existing = await db
      .select()
      .from(translations)
      .where(
        and(
          eq(translations.entityType, item.entityType),
          eq(translations.entityId, brandId),
          eq(translations.locale, item.locale),
          eq(translations.field, item.field),
        ),
      )
      .limit(1);

    if (existing.length === 0) {
      await db.insert(translations).values({
        entityType: item.entityType,
        entityId: brandId,
        locale: item.locale,
        field: item.field,
        value: item.value,
      });
    }

    const existingTm = await db
      .select()
      .from(translationMemory)
      .where(
        and(
          eq(translationMemory.sourceText, item.field),
          eq(translationMemory.targetLocale, item.locale),
        ),
      )
      .limit(1);

    if (existingTm.length === 0) {
      await db.insert(translationMemory).values({
        sourceText: item.field,
        sourceLocale: "en",
        targetLocale: item.locale,
        translatedText: item.value,
        context: `${key}-ui`,
      });
    }
  }
}

async function seedCmsSectionsAndSettings(brandId: number, key: BrandKey): Promise<void> {
  const sections = CMS_DATA[key];

  for (const s of sections) {
    const existing = await db
      .select()
      .from(contentSections)
      .where(
        and(
          eq(contentSections.brandId, brandId),
          eq(contentSections.pageSlug, s.pageSlug),
          eq(contentSections.sectionKey, s.sectionKey),
          eq(contentSections.locale, "en"),
        ),
      )
      .limit(1);

    if (existing.length === 0) {
      await db.insert(contentSections).values({
        brandId,
        pageSlug: s.pageSlug,
        sectionKey: s.sectionKey,
        title: s.title,
        subtitle: s.subtitle,
        content: s.content,
        position: s.position,
        status: "published",
        locale: "en",
      });
    }
  }

  const settingsList = [
    {
      category: "navigation",
      data: {
        links: [
          { label: "Home", href: `/${key}` },
          { label: "News", href: "/news" },
          { label: "Decks", href: "/decks" },
          { label: "Flashcards", href: "/study/flashcards" },
          { label: "Leaderboard", href: "/leaderboard" },
          { label: "Study Japan", href: "/nihongo/study-japan" },
          { label: "Jobs", href: "/nihongo/jobs" },
        ],
      },
    },
    {
      category: "footer",
      data: {
        copyright: `© ${new Date().getFullYear()} ${key === "ascend" ? "Ascend Academy" : "Nihongo Bridge"}. All rights reserved.`,
        tagline: key === "ascend" ? "Empowering modern engineers and leaders." : "Your bridge to fluent Japanese and life in Japan.",
      },
    },
    {
      category: "seo",
      data: {
        metaTitle: key === "ascend" ? "Ascend Academy — Rise Through Mastery" : "Nihongo Bridge — Duolingo-Style Gamified Japanese Learning",
        metaDescription: key === "ascend" ? "Engineering leadership, systems design, and software craftsmanship." : "Level up your Japanese with XP, streaks, leaderboards, daily goals, and spaced repetition.",
      },
    },
  ];

  for (const set of settingsList) {
    const existing = await db
      .select()
      .from(brandSettings)
      .where(and(eq(brandSettings.brandId, brandId), eq(brandSettings.category, set.category)))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(brandSettings).values({
        brandId,
        category: set.category,
        data: set.data,
      });
    }
  }
}

async function seedContent(brandId: number, key: BrandKey): Promise<void> {
  const catalog = STARTER_CATALOG[key];

  const homeSlug = "home";
  const existingHome = await db
    .select()
    .from(pages)
    .where(and(eq(pages.brandId, brandId), eq(pages.slug, homeSlug), eq(pages.locale, "en")))
    .limit(1);

  if (existingHome.length === 0) {
    await db.insert(pages).values({
      brandId,
      slug: homeSlug,
      title: catalog.home.title,
      body: catalog.home.body,
      status: "published",
      locale: "en",
      publishedAt: new Date(),
    });
  }

  for (const c of catalog.courses) {
    const existingCourse = await db
      .select()
      .from(courses)
      .where(and(eq(courses.brandId, brandId), eq(courses.slug, c.slug), eq(courses.locale, "en")))
      .limit(1);

    let courseId: number;
    if (existingCourse.length === 0) {
      const inserted = await db
        .insert(courses)
        .values({
          brandId,
          slug: c.slug,
          title: c.title,
          summary: c.summary,
          level: c.level,
          locale: "en",
          status: "published",
          isFeatured: c.featured,
        })
        .returning({ id: courses.id });
      courseId = inserted[0].id;
    } else {
      courseId = existingCourse[0].id;
    }

    for (let mi = 0; mi < c.modules.length; mi++) {
      const m = c.modules[mi];
      const existingModules = await db
        .select()
        .from(modules)
        .where(and(eq(modules.courseId, courseId), eq(modules.title, m.title)))
        .limit(1);

      let moduleId: number;
      if (existingModules.length === 0) {
        const inserted = await db
          .insert(modules)
          .values({ courseId, title: m.title, position: mi })
          .returning({ id: modules.id });
        moduleId = inserted[0].id;
      } else {
        moduleId = existingModules[0].id;
      }

      for (let li = 0; li < m.lessons.length; li++) {
        const l = m.lessons[li];
        const existingLesson = await db
          .select()
          .from(lessons)
          .where(and(eq(lessons.moduleId, moduleId), eq(lessons.slug, l.slug)))
          .limit(1);
        if (existingLesson.length === 0) {
          await db.insert(lessons).values({
            moduleId,
            slug: l.slug,
            title: l.title,
            body: l.body,
            position: li,
            durationMinutes: l.durationMinutes,
          });
        }
      }
    }
  }
}

const SEED_NEWS_ARTICLES = [
  {
    slug: "cherry-blossom-season-forecast",
    title: "東京で桜の開花予想が発表されました",
    summary: "Japan Meteorological Corporation announces the 2026 cherry blossom schedule across Tokyo and Kyoto.",
    japaneseText: "気象庁は今年の桜の開花予想を発表しました。東京では３月２０日ごろに咲き始める予定です。多くの人々がお花見を楽しみにしています。",
    furiganaText: "気象庁(きしょうちょう)は今年(ことし)の桜(さくら)の開花(かいか)予想(よそう)を発表(はっぴょう)しました。東京(とうきょう)では３月(がつ)２０日(はつか)ごろに咲(さ)き始(はじ)める予定(よてい)です。多(おお)くの人々(ひとびと)がお花見(はなみ)を楽(たの)しみにしています。",
    englishTranslation: "The meteorological agency announced this year's cherry blossom forecast. In Tokyo, blossoms are expected to start blooming around March 20th. Many people are looking forward to flower viewing (hanami).",
    tamilTranslation: "வானிலை ஆய்வு மையம் இந்த ஆண்டின் செர்ரி மலர் மலரும் முன்னறிவிப்பை வெளியிட்டுள்ளது. டோக்கியோவில் மார்ச் 20 ஆம் தேதி பூக்கத் தொடங்கும் என எதிர்பார்க்கப்படுகிறது.",
    malayalamTranslation: "കാലാവസ്ഥാ നിരീക്ഷണ കേന്ദ്രം ഈ വർഷത്തെ ചെറി പൂക്കളുടെ വിരിഞ്ഞുനിൽക്കൽ പ്രവചനം പ്രഖ്യാപിച്ചു. ടോക്കിയോയിൽ മാർച്ച് 20 ഓടെ പൂവിടാൻ തുടങ്ങും.",
    difficultyLevel: "N5",
    readingMinutes: 3,
    audioUrl: "https://audio.nihongobridge.com/news/sakura-2026.mp3",
    grammarHighlights: ["〜予定です (Scheduled to...)", "〜を楽しみにしています (Looking forward to...)"],
    extractedVocabulary: [
      { japanese: "桜", furigana: "さくら", meaning: "Cherry blossom" },
      { japanese: "開花", furigana: "かいか", meaning: "Blooming / flowering" },
      { japanese: "予想", furigana: "よそう", meaning: "Forecast / prediction" },
      { japanese: "お花見", furigana: "おはなみ", meaning: "Flower viewing picnic" },
    ],
    extractedKanji: [
      { kanji: "桜", meaning: "Cherry blossom", strokes: 10 },
      { kanji: "花", meaning: "Flower", strokes: 7 },
      { kanji: "予", meaning: "In advance / previous", strokes: 4 },
    ],
    comprehensionQuestions: [
      {
        question: "When are the cherry blossoms in Tokyo expected to begin blooming?",
        options: ["Around March 20th", "Around April 15th", "Around May 1st", "In late February"],
        correctIndex: 0,
        explanation: "According to the passage: 「東京では３月２０日ごろに咲き始める予定です。」",
      },
      {
        question: "What is 「お花見」(ohanami)?",
        options: ["Flower viewing picnic", "Snow festival", "Tea ceremony", "Temple visit"],
        correctIndex: 0,
        explanation: "Ohanami is the traditional Japanese custom of enjoying the beauty of blooming cherry blossoms.",
      },
    ],
    isToday: true,
  },
  {
    slug: "shinkansen-new-bullet-train",
    title: "次世代新幹線の試験運転が始まります",
    summary: "Next-generation Shinkansen bullet train begins high-speed test runs connecting Tokyo and Osaka.",
    japaneseText: "新しい新幹線の試験運転が来月から始まります。最高速度は時速３６０キロメートルで、東京と大阪の間をより速く結びます。",
    furiganaText: "新(あたら)しい新幹線(しんかんせん)の試験(しけん)運転(うんてん)が来月(らいげつ)から始(はじ)まります。最高(さいこう)速度(そくど)は時速(じそく)３６０キロメートルで、東京(とうきょう)と大阪(おおさか)の間(あいだ)をより速(はや)く結(むす)びます。",
    englishTranslation: "Test operations for the new bullet train will begin next month. With a maximum speed of 360 km/h, it connects Tokyo and Osaka even faster.",
    tamilTranslation: "புதிய புல்லட் ரயிலின் சோதனை ஓட்டம் அடுத்த மாதம் தொடங்குகிறது. மணிக்கு 360 கிமீ வேகத்தில் டோக்கியோ மற்றும் ஒசாகாவை இணைக்கிறது.",
    malayalamTranslation: "പുതിയ ബുള്ളറ്റ് ട്രെയിനിന്റെ പരീക്ഷണ ഓട്ടം അടുത്ത മാസം ആരംഭിക്കും. മണിക്കൂറിൽ 360 കി.മീ വേഗതയിൽ ടോക്കിയോയെയും ഒസാക്കയെയും ബന്ധിപ്പിക്കുന്നു.",
    difficultyLevel: "N4",
    readingMinutes: 4,
    audioUrl: "https://audio.nihongobridge.com/news/shinkansen-2026.mp3",
    grammarHighlights: ["〜から始まります (Starts from...)", "より〜 (More / even more...)"],
    extractedVocabulary: [
      { japanese: "新幹線", furigana: "しんかんせん", meaning: "Bullet train" },
      { japanese: "試験運転", furigana: "しけんうんてん", meaning: "Test run / trial operation" },
      { japanese: "最高速度", furigana: "さいこうそくど", meaning: "Maximum speed" },
    ],
    extractedKanji: [
      { kanji: "新", meaning: "New", strokes: 13 },
      { kanji: "速", meaning: "Fast / speed", strokes: 10 },
    ],
    comprehensionQuestions: [
      {
        question: "What is the maximum speed of the new Shinkansen?",
        options: ["360 km/h", "280 km/h", "500 km/h", "200 km/h"],
        correctIndex: 0,
        explanation: "The article specifies: 「最高速度は時速３６０キロメートル」 (360 km/h).",
      },
    ],
    isToday: false,
  },
];

const SEED_DECKS = [
  {
    title: "JLPT N5 Core Vocabulary",
    description: "Essential verbs, nouns, and adjectives for JLPT N5 success.",
    jlptLevel: "N5",
    shareCode: "deck-n5-core-vocab",
    tags: ["JLPT N5", "Vocabulary", "Verbs"],
    cards: [
      { cardType: "vocab", front: "食べる", back: "To eat", furigana: "たべる", romaji: "taberu", notes: "Ichidan verb" },
      { cardType: "vocab", front: "飲む", back: "To drink", furigana: "のむ", romaji: "nomu", notes: "Godan verb" },
      { cardType: "vocab", front: "行く", back: "To go", furigana: "いく", romaji: "iku", notes: "Irregular te-form: 行って" },
      { cardType: "vocab", front: "見る", back: "To see / watch", furigana: "みる", romaji: "miru", notes: "Ichidan verb" },
      { cardType: "vocab", front: "話す", back: "To speak / talk", furigana: "はなす", romaji: "hanasu", notes: "Godan verb" },
      { cardType: "vocab", front: "勉強する", back: "To study", furigana: "べんきょうする", romaji: "benkyou suru", notes: "Suru verb" },
    ],
  },
  {
    title: "JLPT N5 Essential Kanji",
    description: "The first 20 kanji every beginner needs to recognize.",
    jlptLevel: "N5",
    shareCode: "deck-n5-kanji",
    tags: ["JLPT N5", "Kanji", "Radicals"],
    cards: [
      { cardType: "kanji", front: "日", back: "Sun / Day", furigana: "ひ / にち", romaji: "hi / nichi", notes: "4 strokes" },
      { cardType: "kanji", front: "本", back: "Book / Origin", furigana: "ほん / もと", romaji: "hon / moto", notes: "5 strokes" },
      { cardType: "kanji", front: "人", back: "Person", furigana: "ひと / じん", romaji: "hito / jin", notes: "2 strokes" },
      { cardType: "kanji", front: "学", back: "Study / Learning", furigana: "がく / まなぶ", romaji: "gaku", notes: "8 strokes" },
      { cardType: "kanji", front: "生", back: "Life / Birth", furigana: "せい / なま", romaji: "sei / nama", notes: "5 strokes" },
    ],
  },
  {
    title: "Business Japanese & Keigo",
    description: "Honorific and humble phrases for the Japanese workplace.",
    jlptLevel: "N3",
    shareCode: "deck-business-keigo",
    tags: ["Business", "Keigo", "Careers"],
    cards: [
      { cardType: "phrase", front: "お世話になっております", back: "Thank you for your continuous support", furigana: "おせわになっております", romaji: "osewa ni natte orimasu", notes: "Standard greeting in emails/calls" },
      { cardType: "phrase", front: "よろしくお願いいたします", back: "Thank you in advance / Please treat me well", furigana: "よろしくおねがいいたします", romaji: "yoroshiku onegai itashimasu", notes: "Closing remark" },
      { cardType: "phrase", front: "承知いたしました", back: "Understood (Humble / Kenjougo)", furigana: "しょうちいたしました", romaji: "shouchi itashimashita", notes: "Polite confirmation to client or boss" },
    ],
  },
];

const NIHONGO_ITEMS = [
  {
    category: "vocabulary",
    jlptLevel: "N5",
    japanese: "食べる",
    furigana: "たべる",
    romaji: "taberu",
    meaning: "To eat",
    exampleSentenceJa: "毎日、朝ご飯を食べます。",
    exampleSentenceEn: "I eat breakfast every day.",
    tags: ["verbs", "daily", "N5"],
  },
  {
    category: "vocabulary",
    jlptLevel: "N5",
    japanese: "飲む",
    furigana: "のむ",
    romaji: "nomu",
    meaning: "To drink",
    exampleSentenceJa: "お茶を飲みます。",
    exampleSentenceEn: "I drink green tea.",
    tags: ["verbs", "daily", "N5"],
  },
  {
    category: "kanji",
    jlptLevel: "N5",
    japanese: "日本",
    furigana: "にほん",
    romaji: "nihon",
    meaning: "Japan (Sun's origin)",
    strokeCount: 4,
    radicals: "日 (sun), 本 (book/origin)",
    exampleSentenceJa: "来年、日本へ留学します。",
    exampleSentenceEn: "I will study in Japan next year.",
    tags: ["kanji", "N5"],
  },
  {
    category: "kanji",
    jlptLevel: "N4",
    japanese: "勉強",
    furigana: "べんきょう",
    romaji: "benkyou",
    meaning: "Study / Diligence",
    strokeCount: 10,
    radicals: "力 (power)",
    exampleSentenceJa: "日本語を一生懸命勉強しています。",
    exampleSentenceEn: "I am studying Japanese very hard.",
    tags: ["kanji", "N4"],
  },
  {
    category: "grammar",
    jlptLevel: "N5",
    japanese: "〜たいです",
    furigana: "〜たいです",
    romaji: "-tai desu",
    meaning: "Want to do [Verb]",
    grammarStructure: "Verb stem + たいです",
    exampleSentenceJa: "日本に行きたいです。",
    exampleSentenceEn: "I want to go to Japan.",
    tags: ["grammar", "N5"],
  },
  {
    category: "business",
    jlptLevel: "N3",
    japanese: "お世話になっております",
    furigana: "おせわになっております",
    romaji: "osewa ni natte orimasu",
    meaning: "Thank you for your ongoing support (Standard Business Greeting)",
    exampleSentenceJa: "いつも大変お世話になっております。",
    exampleSentenceEn: "Thank you very much for your continuous cooperation.",
    tags: ["business", "keigo", "N3"],
  },
  {
    category: "interview",
    jlptLevel: "N3",
    japanese: "自己PR",
    furigana: "じこぴーあーる",
    romaji: "jiko PR",
    meaning: "Self-introduction & strengths presentation in a job interview",
    exampleSentenceJa: "私の強みは粘り強く問題を解決することです。",
    exampleSentenceEn: "My strength is persistent problem-solving.",
    tags: ["interview", "careers"],
  },
  {
    category: "culture",
    jlptLevel: "N5",
    japanese: "お辞儀",
    furigana: "おじぎ",
    romaji: "ojigi",
    meaning: "Bowing etiquette in Japanese social and business life",
    exampleSentenceJa: "挨拶の時にお辞儀をします。",
    exampleSentenceEn: "We bow when exchanging greetings.",
    tags: ["culture", "etiquette"],
  },
];

const NIHONGO_QUIZZES = [
  {
    category: "quiz",
    jlptLevel: "N5",
    question: "What is the correct reading and meaning for 「日本」?",
    options: ["にほん (Japan)", "ちゅうごく (China)", "かんこく (Korea)", "アメリカ (America)"],
    correctIndex: 0,
    explanation: "「日本」 is pronounced にほん (Nihon) or にっぽん (Nippon) meaning Japan.",
  },
  {
    category: "quiz",
    jlptLevel: "N5",
    question: "Which sentence correctly uses 「〜たいです」 (want to do)?",
    options: ["ラーメンを食べたいです。", "ラーメンを食べますたい。", "ラーメンを食べるたい。", "ラーメンの食べたい。"],
    correctIndex: 0,
    explanation: "Use Verb stem (食べ) + たいです: 食べたいです。",
  },
];

const DB_TRANSLATIONS: Record<
  BrandKey,
  Array<{ entityType: string; locale: string; field: string; value: string }>
> = {
  ascend: [
    { entityType: "brand", locale: "ta", field: "tagline", value: "திறமை மூலம் உயருங்கள்." },
    { entityType: "brand", locale: "ta", field: "nav_courses", value: "பாடநெறிகள்" },
    { entityType: "brand", locale: "ta", field: "hero_badge", value: "பொறியியல் சிறப்பு" },
    { entityType: "brand", locale: "ml", field: "tagline", value: "പ്രാവീണ്യത്തിലൂടെ ഉയരുക." },
    { entityType: "brand", locale: "ml", field: "nav_courses", value: "കോഴ്സുകൾ" },
    { entityType: "brand", locale: "ml", field: "hero_badge", value: "എൻജിനീയറിംഗ് മികവ്" },
    { entityType: "brand", locale: "ja", field: "tagline", value: "卓越した技術で高みへ。" },
    { entityType: "brand", locale: "ja", field: "nav_courses", value: "コース一覧" },
    { entityType: "brand", locale: "ja", field: "hero_badge", value: "エンジニアリングの卓越性" },
  ],
  nihongo: [
    { entityType: "brand", locale: "ta", field: "tagline", value: "ஜப்பானிய மொழிக்கான உங்கள் பாலம்." },
    { entityType: "brand", locale: "ta", field: "nav_courses", value: "ஜே.எல்.பி.டி பாடங்கள்" },
    { entityType: "brand", locale: "ta", field: "hero_badge", value: "ஜப்பான் படிப்பு மற்றும் வேலைவாய்ப்பு" },
    { entityType: "brand", locale: "ml", field: "tagline", value: "ജാപ്പനീസ് ഭാഷയിലേക്കുള്ള നിങ്ങളുടെ പാലം." },
    { entityType: "brand", locale: "ml", field: "nav_courses", value: "ജെ.എൽ.പി.ടി കോഴ്സുകൾ" },
    { entityType: "brand", locale: "ml", field: "hero_badge", value: "ജപ്പാൻ പഠനവും കരിയറും" },
    { entityType: "brand", locale: "ja", field: "tagline", value: "日本語学習・日本留学・キャリアへの架け橋。" },
    { entityType: "brand", locale: "ja", field: "nav_courses", value: "JLPT対策コース" },
    { entityType: "brand", locale: "ja", field: "hero_badge", value: "日本語・留学・就職支援" },
  ],
};

const CMS_DATA: Record<
  BrandKey,
  Array<{
    pageSlug: string;
    sectionKey: string;
    title: string;
    subtitle?: string;
    content: Record<string, unknown>;
    position: number;
  }>
> = {
  ascend: [
    {
      pageSlug: "home",
      sectionKey: "hero",
      title: "Master Software Craft & Technical Leadership",
      subtitle: "Enterprise learning paths crafted by industry leaders.",
      content: { ctaText: "Explore Tracks", ctaHref: "#programs", badge: "Engineering Excellence" },
      position: 1,
    },
    {
      pageSlug: "home",
      sectionKey: "featured_courses",
      title: "Featured Programs",
      subtitle: "Certified tracks built with industry partners.",
      content: {
        items: [
          { title: "Engineering Foundations", blurb: "Core patterns of modern software craft." },
          { title: "Systems Design Pro", blurb: "Design resilient distributed systems." },
          { title: "Product Leadership", blurb: "From senior IC to confident team lead." },
        ],
      },
      position: 2,
    },
    {
      pageSlug: "home",
      sectionKey: "news",
      title: "Latest News",
      subtitle: "Announcements from Ascend Academy.",
      content: {
        items: [
          { title: "Winter 2026 Cohort Open", date: "2026-01-12", excerpt: "Applications now open for the Engineering Leadership cohort." },
          { title: "New Partnership: Cloud Guild", date: "2025-12-05", excerpt: "Hands-on architecture labs now included in every track." },
        ],
      },
      position: 3,
    },
    {
      pageSlug: "home",
      sectionKey: "cta",
      title: "Ready to Ascend?",
      subtitle: "Join 12,000+ engineers leveling up their craft.",
      content: { ctaText: "Apply for the Next Cohort", ctaHref: "#contact" },
      position: 7,
    },
  ],
  nihongo: [
    {
      pageSlug: "home",
      sectionKey: "hero",
      title: "Your Bridge to Fluent Japanese",
      subtitle: "Master Japanese, pass the JLPT, and launch your career in Japan.",
      content: { ctaText: "Start Learning", ctaHref: "#programs", badge: "JLPT N5 – N1 Ready" },
      position: 1,
    },
    {
      pageSlug: "home",
      sectionKey: "featured_courses",
      title: "Featured Courses",
      subtitle: "Structured paths from first kana to JLPT N1.",
      content: {
        items: [
          { title: "Hiragana in a Week", blurb: "Read every hiragana confidently in 7 days." },
          { title: "JLPT N5 Grammar", blurb: "Every grammar point on the N5 exam." },
          { title: "Business Japanese", blurb: "Keigo, email etiquette, and meeting phrases." },
        ],
      },
      position: 2,
    },
    {
      pageSlug: "home",
      sectionKey: "jlpt",
      title: "JLPT Preparation",
      subtitle: "Level-by-level study plans from N5 to N1.",
      content: {
        levels: [
          { level: "N5", focus: "Beginner grammar, 800 words, 100 kanji", href: "/nihongo?tab=grammar" },
          { level: "N4", focus: "Elementary reading, 1,500 words, 300 kanji", href: "/nihongo?tab=kanji" },
          { level: "N3", focus: "Intermediate listening & reading", href: "/nihongo" },
          { level: "N2", focus: "Business fluency & news articles", href: "/nihongo?tab=business" },
          { level: "N1", focus: "Near-native essays & editorials", href: "/nihongo" },
        ],
      },
      position: 3,
    },
    {
      pageSlug: "home",
      sectionKey: "daily_vocab",
      title: "Today’s Vocabulary",
      subtitle: "Learn five new words every day.",
      content: {
        items: [
          { japanese: "食べる", furigana: "たべる", meaning: "To eat" },
          { japanese: "飲む", furigana: "のむ", meaning: "To drink" },
          { japanese: "勉強する", furigana: "べんきょうする", meaning: "To study" },
        ],
      },
      position: 4,
    },
    {
      pageSlug: "home",
      sectionKey: "daily_kanji",
      title: "Today’s Kanji",
      subtitle: "One kanji a day keeps the dictionary away.",
      content: { items: [{ japanese: "日本", furigana: "にほん", meaning: "Japan", strokeCount: 4 }] },
      position: 5,
    },
    {
      pageSlug: "home",
      sectionKey: "news",
      title: "Japanese Learning News",
      subtitle: "Daily articles and study tips.",
      content: {
        items: [
          { title: "JLPT Registration Opens July 2026", date: "2026-01-10", excerpt: "Secure a seat early — N4 and N3 fill fastest." },
          { title: "New: Daily Furigana News", date: "2026-01-05", excerpt: "Read today’s news with full furigana support." },
        ],
      },
      position: 6,
    },
    {
      pageSlug: "home",
      sectionKey: "downloads",
      title: "Downloadable Materials",
      subtitle: "Free workbooks, cheat sheets, and audio packs.",
      content: {
        items: [
          { title: "Hiragana Practice Workbook (PDF)", href: "/downloads/hiragana-workbook.pdf", size: "2.1 MB" },
          { title: "JLPT N5 Grammar Cheat Sheet (PDF)", href: "/downloads/n5-grammar-cheatsheet.pdf", size: "0.9 MB" },
          { title: "Daily Conversation Audio Pack", href: "/downloads/conversation-audio.zip", size: "18 MB" },
        ],
      },
      position: 7,
    },
    {
      pageSlug: "home",
      sectionKey: "cta",
      title: "Start Your Japanese Journey Today",
      subtitle: "Free for beginners. No credit card required.",
      content: { ctaText: "Create Free Account", ctaHref: "/nihongo" },
      position: 8,
    },
    {
      pageSlug: "home",
      sectionKey: "social_links",
      title: "Follow Nihongo Bridge",
      subtitle: "Daily tips on social media.",
      content: {
        items: [
          { label: "YouTube", href: "https://youtube.com/@nihongobridge" },
          { label: "X (Twitter)", href: "https://x.com/nihongobridge" },
          { label: "Instagram", href: "https://instagram.com/nihongobridge" },
        ],
      },
      position: 9,
    },
    {
      pageSlug: "study-japan",
      sectionKey: "hero",
      title: "Study in Japan",
      subtitle: "Language schools, visas, scholarships, and housing — the complete guide.",
      content: { badge: "Study Abroad", ctaText: "Browse Guides", ctaHref: "#guides" },
      position: 1,
    },
    {
      pageSlug: "study-japan",
      sectionKey: "about",
      title: "Why Study Japanese in Japan?",
      subtitle: "Immersive learning accelerates fluency.",
      content: {
        body: "Six months of immersion in Japan typically equals two years of classroom study abroad. We help you pick a school, secure the student visa, and settle in.",
      },
      position: 2,
    },
    {
      pageSlug: "study-japan",
      sectionKey: "faqs",
      title: "Study in Japan FAQs",
      subtitle: "Visas, budgets, and school selection.",
      content: {
        items: [
          { q: "How much does a language school cost?", a: "Typically ¥600,000–¥850,000 per year excluding housing." },
          { q: "Can I work part-time on a student visa?", a: "Yes, up to 28 hours per week with a work permit." },
        ],
      },
      position: 3,
    },
    {
      pageSlug: "study-japan",
      sectionKey: "downloads",
      title: "Study Abroad Downloads",
      subtitle: "Checklists and budget planners.",
      content: {
        items: [
          { title: "Student Visa Checklist (PDF)", href: "/downloads/student-visa-checklist.pdf", size: "0.4 MB" },
          { title: "Tokyo Cost-of-Living Planner (PDF)", href: "/downloads/tokyo-budget-planner.pdf", size: "0.7 MB" },
        ],
      },
      position: 4,
    },
    {
      pageSlug: "study-japan",
      sectionKey: "cta",
      title: "Talk to a Japan Study Advisor",
      subtitle: "Free 30-minute consultation.",
      content: { ctaText: "Book a Consultation", ctaHref: "/nihongo#contact" },
      position: 5,
    },
    {
      pageSlug: "jobs",
      sectionKey: "hero",
      title: "Japanese Jobs & Careers",
      subtitle: "Engineering, IT, interpretation, and healthcare roles for Japanese speakers.",
      content: { badge: "Careers", ctaText: "See Open Roles", ctaHref: "#roles" },
      position: 1,
    },
    {
      pageSlug: "jobs",
      sectionKey: "about",
      title: "JLPT + Skills = Japan Career",
      subtitle: "Most employers ask for JLPT N3 or above.",
      content: {
        body: "Pair industry skills with Japanese fluency to unlock roles in Tokyo, Osaka, and Fukuoka — bridging engineering with bilingual communication.",
      },
      position: 2,
    },
    {
      pageSlug: "jobs",
      sectionKey: "faqs",
      title: "Japanese Job Hunt FAQs",
      content: {
        items: [
          { q: "What JLPT level do employers need?", a: "N3 minimum for most IT roles; N2 for client-facing work." },
          { q: "Do companies sponsor visas?", a: "Yes — many IT and engineering firms sponsor Engineer/Specialist visas." },
        ],
      },
      position: 3,
    },
    {
      pageSlug: "jobs",
      sectionKey: "cta",
      title: "Get Interview Coaching",
      subtitle: "Practice 自己PR and keigo with a native coach.",
      content: { ctaText: "Start Coaching", ctaHref: "/nihongo/conversation" },
      position: 4,
    },
    {
      pageSlug: "conversation",
      sectionKey: "hero",
      title: "Conversation Practice",
      subtitle: "Dialogue scripts for everyday situations — with audio.",
      content: { badge: "Speaking", ctaText: "Start Practicing", ctaHref: "#practice" },
      position: 1,
    },
    {
      pageSlug: "conversation",
      sectionKey: "practice",
      title: "Practice Dialogues",
      subtitle: "Shadow native speakers line by line.",
      content: {
        items: [
          { title: "At the Restaurant", ja: "注文(ちゅうもん)をお願いします。", en: "Can I order, please?" },
          { title: "On the Train", ja: "次(つぎ)の駅(えき)はどこですか。", en: "What is the next station?" },
          { title: "Self-Introduction", ja: "初(はじ)めまして、田中(たなか)と申(もう)します。", en: "Nice to meet you, my name is Tanaka." },
        ],
      },
      position: 2,
    },
    {
      pageSlug: "conversation",
      sectionKey: "cta",
      title: "Join Weekly Speaking Club",
      subtitle: "Live 30-minute sessions with native hosts.",
      content: { ctaText: "Reserve a Seat", ctaHref: "/nihongo#contact" },
      position: 3,
    },
  ],
};

const STARTER_CATALOG: Record<
  BrandKey,
  {
    home: { title: string; body: string };
    courses: Array<{
      slug: string;
      title: string;
      summary: string;
      level: "beginner" | "intermediate" | "advanced";
      featured: boolean;
      modules: Array<{
        title: string;
        lessons: Array<{
          slug: string;
          title: string;
          body: string;
          durationMinutes: number;
        }>;
      }>;
    }>;
  }
> = {
  ascend: {
    home: {
      title: "Welcome to Ascend Academy",
      body: "Structured learning paths in engineering, design, and leadership. Ascend at your own pace.",
    },
    courses: [
      {
        slug: "engineering-foundations",
        title: "Engineering Foundations",
        summary: "Core patterns every modern engineer should know.",
        level: "beginner",
        featured: true,
        modules: [
          {
            title: "Version Control",
            lessons: [
              {
                slug: "why-git",
                title: "Why Git?",
                body: "Understand the history and mental model of distributed VCS.",
                durationMinutes: 12,
              },
              {
                slug: "branching-workflows",
                title: "Branching workflows",
                body: "Trunk-based, GitFlow, and everything between.",
                durationMinutes: 18,
              },
            ],
          },
          {
            title: "Automated Testing",
            lessons: [
              {
                slug: "unit-vs-integration",
                title: "Unit vs Integration",
                body: "Choosing the right test level for confidence and speed.",
                durationMinutes: 15,
              },
            ],
          },
        ],
      },
      {
        slug: "product-leadership",
        title: "Product Leadership",
        summary: "Grow from senior IC to team lead without losing craft.",
        level: "intermediate",
        featured: false,
        modules: [
          {
            title: "First 90 Days",
            lessons: [
              {
                slug: "listen-tour",
                title: "The Listening Tour",
                body: "How to build trust before shipping change.",
                durationMinutes: 10,
              },
            ],
          },
        ],
      },
    ],
  },
  nihongo: {
    home: {
      title: "Nihongo Bridge へようこそ",
      body: "Learn Japanese from the ground up — hiragana, kanji, conversation, and JLPT prep.",
    },
    courses: [
      {
        slug: "hiragana-in-a-week",
        title: "Hiragana in a Week",
        summary: "Read every hiragana character with confidence in 7 days.",
        level: "beginner",
        featured: true,
        modules: [
          {
            title: "Vowels & K-row",
            lessons: [
              {
                slug: "a-i-u-e-o",
                title: "あ・い・う・え・お",
                body: "The five vowels — pronunciation and stroke order.",
                durationMinutes: 8,
              },
              {
                slug: "ka-row",
                title: "か・き・く・け・こ",
                body: "Adding your first consonants.",
                durationMinutes: 10,
              },
            ],
          },
        ],
      },
      {
        slug: "jlpt-n5-grammar",
        title: "JLPT N5 Grammar",
        summary: "Every grammar point required for the N5 exam.",
        level: "beginner",
        featured: true,
        modules: [
          {
            title: "Particles",
            lessons: [
              {
                slug: "wa-vs-ga",
                title: "は vs が",
                body: "The single most important particle distinction.",
                durationMinutes: 14,
              },
            ],
          },
        ],
      },
    ],
  },
};
