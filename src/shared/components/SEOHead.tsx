import React from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  path: string;
  imageUrl?: string;
  schemaType?: "Article" | "Course" | "WebSite";
  schemaData?: Record<string, any>;
}

export function SEOHead({
  title,
  description,
  path,
  imageUrl = "https://nihongobridge.com/images/default-hero.jpg",
  schemaType = "WebSite",
  schemaData
}: SEOHeadProps) {
  const baseUrl = "https://nihongobridge.com";
  const canonicalUrl = `${baseUrl}${path}`;

  // Default Schema.org Structured Metadata
  const defaultSchema = {
    "@context": "https://schema.org",
    "@type": schemaType,
    "name": title,
    "description": description,
    "url": canonicalUrl,
    "image": imageUrl,
    ...(schemaData || {})
  };

  return (
    <>
      {/* 1. Canonical URLs */}
      <link rel="canonical" href={canonicalUrl} />

      {/* 2. OpenGraph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:type" content={schemaType === "Article" ? "article" : "website"} />
      <meta property="og:site_name" content="Nihongo Bridge" />

      {/* 3. Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {/* 4. Alternate Language Crawling headers (Google Multi-locale mapping) */}
      <link rel="alternate" hrefLang="en" href={`${baseUrl}/en${path}`} />
      <link rel="alternate" hrefLang="ta" href={`${baseUrl}/ta${path}`} />
      <link rel="alternate" hrefLang="ml" href={`${baseUrl}/ml${path}`} />
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />

      {/* 5. Google Discover requirements (Max image preview directive) */}
      <meta name="robots" content="max-image-preview:large" />

      {/* 6. Schema.org Structured JSON-LD Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(defaultSchema) }}
      />
    </>
  );
}
