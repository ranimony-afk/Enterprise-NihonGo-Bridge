import React from "react";
import Link from "next/link";
import { type BrandConfig, PLATFORM_LOCALES } from "@/lib/brands";

export function BrandHeader({
  brand,
  currentLocale = "en",
}: {
  brand: BrandConfig;
  currentLocale?: string;
}) {
  return (
    <nav className="flex flex-wrap items-center justify-between gap-4 text-sm">
      <Link href="/hub" className="opacity-70 hover:opacity-100 font-medium">
        ← All brands
      </Link>

      <div className="flex items-center gap-3">
        {/* Multilingual Language Selector */}
        <div className="flex items-center gap-1 rounded-xl bg-white/80 p-1 shadow-xs border border-black/5 text-xs">
          {PLATFORM_LOCALES.filter((l) => l.status === "active").map((loc) => {
            const isActive = loc.code === currentLocale;
            return (
              <Link
                key={loc.code}
                href={`/${brand.slug}?lang=${loc.code}`}
                className={`rounded-lg px-2.5 py-1 transition font-medium ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {loc.nativeName}
              </Link>
            );
          })}
        </div>

        <span
          className="rounded-full px-3 py-1 text-xs uppercase tracking-widest"
          style={{ background: brand.theme.accent, color: "#fff" }}
        >
          {brand.name}
        </span>
      </div>
    </nav>
  );
}
