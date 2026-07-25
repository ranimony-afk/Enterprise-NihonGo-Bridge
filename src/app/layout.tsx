import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nihongo Bridge — Master Japanese, JLPT & Careers in Japan",
  description:
    "Learn Japanese from zero to JLPT N1 with vocabulary, kanji, grammar, reading, listening, conversation practice, mock exams, and Japan career guidance. Fully CMS-driven next-generation learning platform.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-100 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
