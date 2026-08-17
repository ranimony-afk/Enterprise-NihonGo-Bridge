import { db } from "@/db";
import { ensureSeed } from "@/lib/seed";
import { BrandHeader } from "@/shared/components/BrandHeader";
import { getBrand } from "@/lib/brands";
import GrammarClient from "./GrammarClient";

export const dynamic = "force-dynamic";

export default async function GrammarPlatformPage() {
  await ensureSeed();
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
            Enterprise Grammar Platform &amp; Suffix Tracing ⛩️
          </h1>
          <p className="text-sm opacity-80 max-w-2xl leading-relaxed">
            Master over 10,000 indexed Japanese grammatical structures. Explore adaptive timeline learning tracks, query sentence connective visual tree diagrams, and utilize our automated, live Client-Side Suffix Conjugation Engine!
          </p>
        </div>

        {/* Interactive Grammar Component */}
        <GrammarClient />
      </div>
    </main>
  );
}
