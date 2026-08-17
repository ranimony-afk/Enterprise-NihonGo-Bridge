import { NextResponse } from "next/server";
import { db } from "@/db";
import { newsArticles } from "@/db/schema";
import { desc } from "drizzle-orm";

// ------------------------------------------------------------------
// GET: Serves Compliant XML RSS Feed for Nihongo Bridge Daily Blogs & News
// ------------------------------------------------------------------
export async function GET() {
  try {
    const list = await db
      .select()
      .from(newsArticles)
      .orderBy(desc(newsArticles.publishedAt))
      .limit(20);

    const baseUrl = "https://nihongobridge.com";
    
    // Construct robust RSS XML String
    let rss = `<?xml version="1.0" encoding="UTF-8" ?>\n`;
    rss += `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">\n`;
    rss += `  <channel>\n`;
    rss += `    <title>Nihongo Bridge Daily Blogs &amp; News</title>\n`;
    rss += `    <link>${baseUrl}/news</link>\n`;
    rss += `    <description>Your daily bridge to fluent Japanese — shadowing news, grammar matrices, and culture articles.</description>\n`;
    rss += `    <language>ja-JP</language>\n`;
    rss += `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>\n`;
    rss += `    <atom:link href="${baseUrl}/api/v1/news/rss" rel="self" type="application/rss+xml" />\n`;

    for (const art of list) {
      const canonicalUrl = `${baseUrl}/news/${art.slug}`;
      rss += `    <item>\n`;
      rss += `      <title><![CDATA[${art.title}]]></title>\n`;
      rss += `      <link>${canonicalUrl}</link>\n`;
      rss += `      <guid isPermaLink="true">${canonicalUrl}</guid>\n`;
      rss += `      <description><![CDATA[${art.summary}]]></description>\n`;
      rss += `      <pubDate>${new Date(art.publishedAt).toUTCString()}</pubDate>\n`;
      rss += `      <dc:creator>Nihongo Bridge Editorial Team</dc:creator>\n`;
      rss += `    </item>\n`;
    }

    rss += `  </channel>\n`;
    rss += `</rss>\n`;

    return new NextResponse(rss, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    return new NextResponse(
      `<error>${(error as Error).message}</error>`,
      { status: 500, headers: { "Content-Type": "application/xml" } }
    );
  }
}
