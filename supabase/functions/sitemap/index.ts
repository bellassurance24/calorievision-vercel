// Multilingual sitemap generator for SEO
// Includes all pages in all 9 supported languages

const SUPPORTED_LANGUAGES = ["en", "fr", "es", "pt", "zh", "ar", "it", "de", "nl"];
const BASE_URL = "https://calorievision.online";
const LAST_MOD = "2026-01-02";

interface PageConfig {
  path: string;
  changefreq: string;
  priority: string;
}

const PAGES: PageConfig[] = [
  { path: "", changefreq: "weekly", priority: "1.0" },
  { path: "/analyze", changefreq: "weekly", priority: "0.9" },
  { path: "/how-it-works", changefreq: "monthly", priority: "0.8" },
  { path: "/about", changefreq: "monthly", priority: "0.7" },
  { path: "/faq", changefreq: "monthly", priority: "0.7" },
  { path: "/contact", changefreq: "monthly", priority: "0.6" },
  { path: "/blog", changefreq: "daily", priority: "0.8" },
  { path: "/privacy-policy", changefreq: "yearly", priority: "0.3" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
  { path: "/cookie-policy", changefreq: "yearly", priority: "0.3" },
  { path: "/disclaimer", changefreq: "yearly", priority: "0.3" },
];

function generateSitemap(): string {
  const urlEntries: string[] = [];

  // Generate URL entries for each language and page
  for (const lang of SUPPORTED_LANGUAGES) {
    for (const page of PAGES) {
      const fullUrl = `${BASE_URL}/${lang}${page.path}`;
      
      // Generate hreflang alternates for this page
      const alternates = SUPPORTED_LANGUAGES.map(altLang => 
        `      <xhtml:link rel="alternate" hreflang="${altLang}" href="${BASE_URL}/${altLang}${page.path}" />`
      ).join("\n");
      
      // Add x-default pointing to English
      const xDefault = `      <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}/en${page.path}" />`;

      urlEntries.push(`  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${LAST_MOD}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
${alternates}
${xDefault}
  </url>`);
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries.join("\n")}
</urlset>`;
}

const sitemap = generateSitemap();

Deno.serve(async (req) => {
  // Allow public access without authentication
  return new Response(sitemap, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
});
