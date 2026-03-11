import { useEffect } from "react";

interface PageMetadataOptions {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: string;
}

const BASE_URL = "https://calorievision.online";
const DEFAULT_IMAGE = "https://calorievision.online/favicon.png";

export function usePageMetadata({ title, description, path, image, type = "website" }: PageMetadataOptions) {
  useEffect(() => {
    if (typeof document === "undefined") return;

    // Title
    document.title = title;

    // Meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", description);
    }

    // Canonical URL
    const canonicalHref = path ? `${BASE_URL}${path}` : BASE_URL;
    let canonicalLink = document.querySelector("link[rel='canonical']");
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", canonicalHref);

    // Open Graph tags
    const ogTags = {
      "og:title": title,
      "og:description": description,
      "og:url": canonicalHref,
      "og:image": image || DEFAULT_IMAGE,
      "og:type": type,
      "og:site_name": "CalorieVision",
    };

    Object.entries(ogTags).forEach(([property, content]) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("property", property);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    });

    // Twitter Card tags
    const twitterTags = {
      "twitter:card": "summary_large_image",
      "twitter:title": title,
      "twitter:description": description,
      "twitter:image": image || DEFAULT_IMAGE,
      "twitter:site": "@CalorieVision",
    };

    Object.entries(twitterTags).forEach(([name, content]) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", name);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    });

  }, [title, description, path, image, type]);
}

// Helper to inject JSON-LD structured data
export function useStructuredData(data: Record<string, unknown>) {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const scriptId = `structured-data-${JSON.stringify(data["@type"])}`;
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      ...data,
    });

    return () => {
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [data]);
}
