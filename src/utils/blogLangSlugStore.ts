/**
 * Module-level store for the current blog post's language → slug mapping.
 * BlogPost sets this when it loads a post; MainLayout reads it during
 * language switching to navigate to the correct localized slug.
 */

let slugMap: Record<string, string> = {};

export function setBlogLangSlugMap(map: Record<string, string>) {
  slugMap = { ...map };
}

export function getBlogLangSlugMap(): Record<string, string> {
  return slugMap;
}

export function clearBlogLangSlugMap() {
  slugMap = {};
}
