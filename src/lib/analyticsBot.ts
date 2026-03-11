export const isLikelyBotUserAgent = (ua: string | null | undefined): boolean => {
  if (!ua) return false;

  const s = ua.toLowerCase();

  // Fast substring checks for common bots/crawlers/scanners
  const indicators = [
    // Generic
    "bot",
    "crawler",
    "spider",
    "crawl",
    "slurp",

    // Search engines
    "googlebot",
    "bingbot",
    "bingpreview",
    "yandex",
    "baiduspider",
    "duckduckbot",
    "petalbot",
    "sogou",

    // SEO tools
    "ahrefs",
    "semrush",
    "mj12bot",
    "dotbot",

    // Social/link previews
    "facebookexternalhit",
    "twitterbot",
    "linkedinbot",
    "slackbot",
    "discordbot",
    "whatsapp",
    "telegrambot",

    // Programmatic clients
    "python-requests",
    "curl/",
    "wget/",
    "okhttp",
    "go-http-client",
    "node-fetch",
    "axios",

    // Headless automation
    "headlesschrome",
    "puppeteer",
    "playwright",
  ];

  return indicators.some((x) => s.includes(x));
};
