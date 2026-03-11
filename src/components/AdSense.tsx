import { cn } from "@/lib/utils";

type AdSize = 
  // Responsive
  | "responsive"           // Auto-sizing
  | "auto"                 // Auto Ads
  // Rectangular
  | "medium-rectangle"     // 300x250
  | "large-rectangle"      // 336x280
  | "square"               // 250x250
  | "small-square"         // 200x200
  // Horizontal Banners
  | "leaderboard"          // 728x90
  | "large-leaderboard"    // 970x90
  | "banner"               // 468x60
  // Vertical
  | "half-page"            // 300x600
  | "wide-skyscraper"      // 160x600
  | "skyscraper"           // 120x600
  // Mobile
  | "large-mobile"         // 320x100
  | "mobile-banner"        // 320x50
  // Large Formats
  | "billboard"            // 970x250
  | "portrait"             // 300x1050
  // Native
  | "in-feed"              // In-feed Ads
  | "in-article"           // In-article Ads
  | "matched-content";     // Matched Content

interface AdSenseProps {
  size?: AdSize;
  className?: string;
  slot?: string;
}

const adSizeClasses: Record<AdSize, string> = {
  // Responsive
  "responsive": "w-full min-h-[100px]",
  "auto": "w-full min-h-[90px]",
  // Rectangular
  "medium-rectangle": "w-[300px] h-[250px]",
  "large-rectangle": "w-[336px] h-[280px]",
  "square": "w-[250px] h-[250px]",
  "small-square": "w-[200px] h-[200px]",
  // Horizontal Banners
  "leaderboard": "w-[728px] h-[90px] max-w-full",
  "large-leaderboard": "w-[970px] h-[90px] max-w-full",
  "banner": "w-[468px] h-[60px] max-w-full",
  // Vertical
  "half-page": "w-[300px] h-[600px]",
  "wide-skyscraper": "w-[160px] h-[600px]",
  "skyscraper": "w-[120px] h-[600px]",
  // Mobile
  "large-mobile": "w-[320px] h-[100px]",
  "mobile-banner": "w-[320px] h-[50px]",
  // Large Formats
  "billboard": "w-[970px] h-[250px] max-w-full",
  "portrait": "w-[300px] h-[1050px]",
  // Native
  "in-feed": "w-full min-h-[120px]",
  "in-article": "w-full min-h-[250px]",
  "matched-content": "w-full min-h-[200px]",
};

const adSizeLabels: Record<AdSize, string> = {
  // Responsive
  "responsive": "Responsive",
  "auto": "Auto Ads",
  // Rectangular
  "medium-rectangle": "300×250",
  "large-rectangle": "336×280",
  "square": "250×250",
  "small-square": "200×200",
  // Horizontal Banners
  "leaderboard": "728×90",
  "large-leaderboard": "970×90",
  "banner": "468×60",
  // Vertical
  "half-page": "300×600",
  "wide-skyscraper": "160×600",
  "skyscraper": "120×600",
  // Mobile
  "large-mobile": "320×100",
  "mobile-banner": "320×50",
  // Large Formats
  "billboard": "970×250",
  "portrait": "300×1050",
  // Native
  "in-feed": "In-feed",
  "in-article": "In-article",
  "matched-content": "Matched Content",
};

export const AdSense = ({ 
  size = "responsive", 
  className,
  slot = "XXXXXXXXXX" 
}: AdSenseProps) => {
  const isNative = ["in-feed", "in-article", "matched-content"].includes(size);
  const isResponsive = ["responsive", "auto"].includes(size);
  
  return (
    <div 
      className={cn(
        "flex items-center justify-center bg-muted/30 border border-dashed border-muted-foreground/20 rounded-lg overflow-hidden",
        adSizeClasses[size],
        className
      )}
      data-ad-slot={slot}
      data-ad-format={isResponsive ? "auto" : isNative ? "fluid" : "fixed"}
    >
      <ins 
        className="adsbygoogle w-full h-full"
        style={{ display: "block" }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot={slot}
        data-ad-format={isResponsive ? "auto" : isNative ? "fluid" : undefined}
        data-full-width-responsive={isResponsive ? "true" : undefined}
        data-ad-layout={isNative ? "in-article" : undefined}
      />
    </div>
  );
};

// Horizontal ad banner for between sections
export const AdBanner = ({ className }: { className?: string }) => (
  <div className={cn("w-full flex justify-center py-4", className)}>
    <AdSense size="leaderboard" className="hidden md:flex" />
    <AdSense size="large-mobile" className="flex md:hidden" />
  </div>
);

// Large horizontal banner for wide screens
export const AdBannerLarge = ({ className }: { className?: string }) => (
  <div className={cn("w-full flex justify-center py-4", className)}>
    <AdSense size="large-leaderboard" className="hidden xl:flex" />
    <AdSense size="leaderboard" className="hidden md:flex xl:hidden" />
    <AdSense size="large-mobile" className="flex md:hidden" />
  </div>
);

// Billboard for hero sections
export const AdBillboard = ({ className }: { className?: string }) => (
  <div className={cn("w-full flex justify-center py-6", className)}>
    <AdSense size="billboard" className="hidden xl:flex" />
    <AdSense size="leaderboard" className="hidden md:flex xl:hidden" />
    <AdSense size="large-mobile" className="flex md:hidden" />
  </div>
);

// Sidebar ad for desktop (medium rectangle)
export const AdSidebar = ({ className }: { className?: string }) => (
  <div className={cn("hidden lg:block", className)}>
    <AdSense size="medium-rectangle" />
  </div>
);

// Sidebar ad large (large rectangle)
export const AdSidebarLarge = ({ className }: { className?: string }) => (
  <div className={cn("hidden lg:block", className)}>
    <AdSense size="large-rectangle" />
  </div>
);

// Square ads for sidebars
export const AdSquare = ({ className }: { className?: string }) => (
  <div className={cn("hidden lg:block", className)}>
    <AdSense size="square" />
  </div>
);

// Vertical skyscraper for side positions
export const AdSkyscraper = ({ className }: { className?: string }) => (
  <div className={cn("hidden xl:block", className)}>
    <AdSense size="wide-skyscraper" />
  </div>
);

// Half page vertical ad
export const AdHalfPage = ({ className }: { className?: string }) => (
  <div className={cn("hidden 2xl:block", className)}>
    <AdSense size="half-page" />
  </div>
);

// Portrait ad for sidebars
export const AdPortrait = ({ className }: { className?: string }) => (
  <div className={cn("hidden 2xl:block", className)}>
    <AdSense size="portrait" />
  </div>
);

// In-content responsive ad
export const AdInContent = ({ className }: { className?: string }) => (
  <div className={cn("w-full flex justify-center py-6", className)}>
    <AdSense size="responsive" className="max-w-[336px] min-h-[280px]" />
  </div>
);

// In-feed native ad
export const AdInFeed = ({ className }: { className?: string }) => (
  <div className={cn("w-full py-4", className)}>
    <AdSense size="in-feed" />
  </div>
);

// In-article native ad
export const AdInArticle = ({ className }: { className?: string }) => (
  <div className={cn("w-full py-6 my-4", className)}>
    <AdSense size="in-article" />
  </div>
);

// Matched content ad
export const AdMatchedContent = ({ className }: { className?: string }) => (
  <div className={cn("w-full py-4", className)}>
    <AdSense size="matched-content" />
  </div>
);

// Mobile-only banner
export const AdMobile = ({ className }: { className?: string }) => (
  <div className={cn("w-full flex justify-center py-3 md:hidden", className)}>
    <AdSense size="mobile-banner" />
  </div>
);

// Auto Ads script component (add to head or layout)
export const AdAutoScript = () => (
  <script
    async
    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
    crossOrigin="anonymous"
  />
);

export default AdSense;
