import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const DEFAULT_FAVICON = "/favicon.png";

type PublicSiteAssetsResponse = {
  favicon?: {
    url?: string;
    version?: string | null;
    deleted?: boolean;
  };
};

function setOrCreateLink(selectorOrId: string, attrs: Record<string, string>) {
  if (typeof document === "undefined") return;

  const isId = selectorOrId.startsWith("#");
  const selector = isId ? `link${selectorOrId}` : selectorOrId;

  let link = document.head.querySelector<HTMLLinkElement>(selector);
  if (!link) {
    link = document.createElement("link");
    if (isId) link.id = selectorOrId.slice(1);
    document.head.appendChild(link);
  }

  Object.entries(attrs).forEach(([k, v]) => link!.setAttribute(k, v));
}

function applyFavicon(href: string) {
  // Update the static links from index.html
  setOrCreateLink('link[rel="icon"]', { rel: "icon", href, type: "image/png" });
  setOrCreateLink('link[rel="shortcut icon"]', { rel: "shortcut icon", href, type: "image/png" });
  setOrCreateLink('link[rel="apple-touch-icon"]', { rel: "apple-touch-icon", href });

  // Update dynamic links created by BrandingContext (if present)
  setOrCreateLink("#dynamic-favicon-16", { rel: "icon", href, sizes: "16x16", type: "image/png" });
  setOrCreateLink("#dynamic-favicon-32", { rel: "icon", href, sizes: "32x32", type: "image/png" });
  setOrCreateLink("#dynamic-apple-touch-icon", { rel: "apple-touch-icon", href, sizes: "180x180" });
}

export default function SiteAssetsHead() {
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { data, error } = await supabase.functions.invoke<PublicSiteAssetsResponse>(
          "public-site-assets",
          { method: "GET" },
        );

        if (error) throw error;

        const version = data?.favicon?.version ?? String(Date.now());
        const deleted = data?.favicon?.deleted ?? false;
        const baseUrl = deleted ? DEFAULT_FAVICON : (data?.favicon?.url || DEFAULT_FAVICON);
        const href = `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}v=${encodeURIComponent(version)}`;

        if (!cancelled) applyFavicon(href);
      } catch {
        // Last-resort fallback: still cache-bust so browser fetches newest default
        const href = `${DEFAULT_FAVICON}?v=${Date.now()}`;
        if (!cancelled) applyFavicon(href);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
