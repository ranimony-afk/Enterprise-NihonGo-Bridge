import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { newsArticles } from "../src/db/schema";
import { eq } from "drizzle-orm";

const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/app_db";

async function generateDailyBlog() {
  console.log("⚡ Starting Programmatic Daily Blog Generator...");
  
  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool);

  try {
    const today = new Date();
    const slug = `daily-japanese-culture-spotlight-${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    const title = `日本の「お盆」：先祖を迎える夏の伝統行事 (${today.getFullYear()})`;
    const summary = "An in-depth cultural exploration of 'Obon' (Japanese Festival of Souls) - its etymology, regional dances, and Buddhist origins.";
    const japaneseText = "お盆は、日本で夏に行われる仏教の伝統行事です。人々は先祖の霊を家に迎え、感謝を捧げます。お墓参りをしたり、盆踊りを踊ったりして、家族で時間を過ごします。";
    const furiganaText = "お盆(ぼん)は、日本(にほん)で夏(なつ)に行(おこな)われる仏教(ぶっきょう)の伝統(でんとう)行事(ぎょうじ)です。人々(ひとびと)は先祖(せんぞ)の霊(れい)を家(いえ)に迎(むか)え、感謝(かんしゃ)を捧(ささ)げます。お墓参(はかまい)りをしたり、盆踊(ぼんおど)りを踊(おど)ったりして、家族(かぞく)で時間(じかん)を過ご(すご)します。";
    const englishTranslation = "Obon is a traditional Buddhist event held in summer in Japan. People welcome the spirits of their ancestors into their homes and offer gratitude. Families spend time together, visiting graves and dancing Bon Odori.";
    const tamilTranslation = "ஒபோன் என்பது ஜப்பானில் கோடையில் நடைபெறும் ஒரு பாரம்பரிய பௌத்த நிகழ்வு ஆகும். மக்கள் தங்கள் முன்னோர்களின் ஆன்மாக்களை வரவேற்கிறார்கள்.";
    const malayalamTranslation = "ഒബോൺ എന്നത് ജപ്പാനിൽ വേനൽക്കാലത്ത് നടക്കുന്ന ഒരു പരമ്പരാഗത ബുദ്ധമത ചടങ്ങാണ്. ആളുകൾ തങ്ങളുടെ പൂർവ്വികരുടെ ആത്മാക്കളെ സ്വാഗതം ചെയ്യുന്നു.";

    const extractedVocabulary = [
      { japanese: "お盆", furigana: "おぼん", meaning: "Obon Festival of Souls" },
      { japanese: "先祖", furigana: "せんぞ", meaning: "Ancestors" },
      { japanese: "仏教", furigana: "ぶっきょう", meaning: "Buddhism" },
      { japanese: "盆踊り", furigana: "ぼんおどり", meaning: "Bon Odori traditional dance" }
    ];

    const extractedKanji = [
      { kanji: "盆", meaning: "Lantern festival / Tray", strokes: 9 },
      { kanji: "霊", meaning: "Spirits / Soul", strokes: 15 },
      { kanji: "墓", meaning: "Grave / Tomb", strokes: 13 }
    ];

    const comprehensionQuestions = [
      {
        question: "What is the primary spiritual focus of the Japanese Obon festival?",
        options: [
          "Welcoming and offering gratitude to ancestor spirits",
          "Celebrating the start of agricultural harvest",
          "Marking the official beginning of the winter season",
          "Commemorating traditional ancient samurai victories"
        ],
        correctIndex: 0,
        explanation: "Obon is a Buddhist custom to honor and welcome the spirits of ancestors (先祖の霊を家に迎え)."
      }
    ];

    // Check if article already exists for today
    const existing = await db
      .select()
      .from(newsArticles)
      .where(eq(newsArticles.slug, slug))
      .limit(1);

    if (existing.length > 0) {
      console.log("ℹ️  A daily article with this slug already exists in database. Skipping generation.");
      process.exit(0);
    }

    // Insert new daily news blog post
    await db.insert(newsArticles).values({
      brandId: 1, // Default Nihongo brand
      slug: slug,
      title: title,
      summary: summary,
      japaneseText: japaneseText,
      furiganaText: furiganaText,
      englishTranslation: englishTranslation,
      tamilTranslation: tamilTranslation,
      malayalamTranslation: malayalamTranslation,
      difficultyLevel: "N4",
      readingMinutes: 4,
      audioUrl: "https://audio.nihongobridge.com/news/obon-2026.mp3",
      grammarHighlights: ["〜を迎え (Welcoming ~)", "〜たり〜たりして (Doing things like ~)"],
      extractedVocabulary: extractedVocabulary,
      extractedKanji: extractedKanji,
      comprehensionQuestions: comprehensionQuestions,
      isToday: false, // Don't override primary home feature
      status: "published"
    });

    console.log(`✅ Success! Generated new daily SEO blog post: "${title}"`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to generate daily blog:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

generateDailyBlog();
