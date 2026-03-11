import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";

interface BrandingState {
  logoDataUrl: string | null;
  faviconDataUrl: string | null;
  showLogoInFooter: boolean;
  logoSize: "sm" | "md" | "lg";
  logoAlignment: "left" | "center";
  footerLogoSize: "sm" | "md" | "lg";
  footerLogoVisibility: "all" | "home" | "none";
}

interface BrandingContextValue extends BrandingState {
  updateBranding: (data: Partial<BrandingState>) => void;
}

const BrandingContext = createContext<BrandingContextValue | undefined>(undefined);

const STORAGE_KEY = "calorievision_branding_settings";

const defaultState: BrandingState = {
  logoDataUrl: null,
  faviconDataUrl: null,
  showLogoInFooter: false,
  logoSize: "md",
  logoAlignment: "left",
  footerLogoSize: "md",
  footerLogoVisibility: "all",
};

function applyFavicons(faviconDataUrl: string | null) {
  if (typeof document === "undefined") return;

  const ids = ["dynamic-favicon-16", "dynamic-favicon-32", "dynamic-apple-touch-icon"];

  const href = faviconDataUrl ?? "/favicon-v4.png";

  const createOrUpdate = (id: string, rel: string, sizes?: string) => {
    let link = document.head.querySelector<HTMLLinkElement>(`link#${id}`);
    if (!link) {
      link = document.createElement("link");
      link.id = id;
      link.rel = rel;
      document.head.appendChild(link);
    }
    link.href = href;
    if (sizes) {
      link.sizes = sizes;
    }
    if (rel === "icon") {
      link.type = "image/png";
    }
  };

  // 16×16 & 32×32 favicons + 180×180 Apple Touch icon
  createOrUpdate("dynamic-favicon-16", "icon", "16x16");
  createOrUpdate("dynamic-favicon-32", "icon", "32x32");
  createOrUpdate("dynamic-apple-touch-icon", "apple-touch-icon", "180x180");
}

export const BrandingProvider = ({ children }: PropsWithChildren) => {
  const [state, setState] = useState<BrandingState>(() => {
    if (typeof window === "undefined") return defaultState;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState;
      const parsed = JSON.parse(raw) as Partial<BrandingState>;
      return {
        logoDataUrl: parsed.logoDataUrl ?? null,
        faviconDataUrl: parsed.faviconDataUrl ?? null,
        showLogoInFooter: parsed.showLogoInFooter ?? false,
        logoSize: parsed.logoSize ?? defaultState.logoSize,
        logoAlignment: parsed.logoAlignment ?? defaultState.logoAlignment,
        footerLogoSize: parsed.footerLogoSize ?? defaultState.footerLogoSize,
        footerLogoVisibility: parsed.footerLogoVisibility ?? defaultState.footerLogoVisibility,
      };
    } catch {
      return defaultState;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    applyFavicons(state.faviconDataUrl);
  }, [state.faviconDataUrl]);

  const updateBranding = (data: Partial<BrandingState>) => {
    setState((prev) => ({
      ...prev,
      ...data,
    }));
  };

  const value = useMemo(
    () => ({
      ...state,
      updateBranding,
    }),
    [state],
  );

  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
};

export const useBranding = () => {
  const ctx = useContext(BrandingContext);
  if (!ctx) {
    throw new Error("useBranding must be used within a BrandingProvider");
  }
  return ctx;
};
