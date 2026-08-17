import { db } from "@/db";
import { ensureSeed } from "@/lib/seed";
import { BrandHeader } from "@/shared/components/BrandHeader";
import { getBrand } from "@/lib/brands";
import DictionaryClient from "./DictionaryClient";

export const dynamic = "force-dynamic";

export default async function DictionaryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await ensureSeed();
  const params = await searchParams;
  const q = params?.q || "";
  const cfg = getBrand("nihongo")!;

  return (
    <main
      className="min-h-screen px-4 py-8 sm:px-6 sm:py-12"
      style={{ background: cfg.theme.surface, color: cfg.theme.text }}
    >
      <div className="mx-auto max-w-6xl space-y-8">
        <BrandHeader brand={cfg} />

        <div className="space-y-3 text-left">
          <h1 className="text-4xl font-extrabold tracking-tight" style={{ color: cfg.theme.primary }}>
            Takoboto Enterprise Dictionary 📖
          </h1>
          <p className="text-sm opacity-80 max-w-2xl leading-relaxed">
            Search Japanese words, kanji, furigana readings, pitch accents, grammatical collocations, and cross-references. Features multi-locale translations for Indian learners (English, Tamil, Malayalam) and context-aware interactive AI etymology tutors.
          </p>
        </div>

        {/* Interactive Dictionary Component */}
        <DictionaryClient initialSearch={q} />
      </div>
    </main>
  );
}
