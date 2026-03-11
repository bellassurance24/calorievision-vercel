import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Play, Image as ImageIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface MediaShowcaseItem {
  id: string;
  title: string | null;
  description: string | null;
  media_type: "image" | "video";
  media_url: string;
  thumbnail_url: string | null;
  display_order: number;
  is_visible: boolean;
  aspect_ratio: string | null;
  image_position: string | null;
  text_align: string | null;
  image_width_custom?: number | null;
  image_height_custom?: number | null;
  image_auto_scale?: boolean | null;
}

interface MediaShowcaseSettings {
  show: boolean;
  title: string;
  description: string;
}

const getAspectRatioClass = (ratio: string | null): string => {
  switch (ratio) {
    case "16:9": return "aspect-video";
    case "4:3": return "aspect-[4/3]";
    case "1:1": return "aspect-square";
    case "9:16": return "aspect-[9/16]";
    case "auto": return "";
    default: return "aspect-video";
  }
};

const getObjectPositionClass = (position: string | null): string => {
  switch (position) {
    case "left": return "object-left";
    case "right": return "object-right";
    case "center":
    default: return "object-center";
  }
};

const getTextAlignClass = (align: string | null): string => {
  switch (align) {
    case "center": return "text-center";
    case "right": return "text-right";
    case "justify": return "text-justify";
    case "left":
    default: return "text-left";
  }
};

const getContentAlignClass = (position: string | null): string => {
  switch (position) {
    case "left":
      return "justify-self-start";
    case "right":
      return "justify-self-end";
    case "center":
    default:
      return "justify-self-center";
  }
};

export default function MediaShowcaseSection() {
  const [items, setItems] = useState<MediaShowcaseItem[]>([]);
  const [settings, setSettings] = useState<MediaShowcaseSettings>({
    show: true,
    title: "Discover Our Features",
    description: "See how CalorieVision can help you understand your meals better",
  });
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Translation system
  const { language } = useLanguage();
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedTitle, setTranslatedTitle] = useState<string>("");
  const [translatedDescription, setTranslatedDescription] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch media items
        const { data: mediaItems } = await supabase
          .from("media_showcase_items")
          .select("*")
          .eq("is_visible", true)
          .order("display_order");

        if (mediaItems) {
          setItems(mediaItems as MediaShowcaseItem[]);
        }

        // Fetch settings from site_settings
        const { data: siteSettings } = await supabase
          .from("site_settings")
          .select("media_showcase_show_section, media_showcase_title, media_showcase_description")
          .limit(1)
          .single();

        if (siteSettings) {
          setSettings({
            show: siteSettings.media_showcase_show_section ?? true,
            title: siteSettings.media_showcase_title ?? "Discover Our Features",
            description: siteSettings.media_showcase_description ?? "",
          });
        }
      } catch (error) {
        console.error("Error fetching media showcase data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Translate title and description when language changes - reads from cache first
  useEffect(() => {
    const translateContent = async () => {
      if (language === "en") {
        setTranslatedTitle(settings.title);
        setTranslatedDescription(settings.description);
        setIsTranslating(false);
        return;
      }

      setIsTranslating(true);
      
      try {
        // Try to read from cache first (no AI credits needed)
        const { data: cachedTitle } = await supabase
          .from("translation_cache")
          .select("translated_content")
          .eq("page_id", "media-showcase-title")
          .eq("language", language)
          .maybeSingle();
        
        const { data: cachedDesc } = await supabase
          .from("translation_cache")
          .select("translated_content")
          .eq("page_id", "media-showcase-description")
          .eq("language", language)
          .maybeSingle();

        if (cachedTitle?.translated_content) {
          setTranslatedTitle(cachedTitle.translated_content);
        } else {
          // Fallback to edge function if no cache
          const { data: titleData } = await supabase.functions.invoke("translate-blog", {
            body: {
              text: settings.title,
              targetLanguage: language,
              pageId: "media-showcase-title",
              stripHtml: true,
            },
          });
          if (titleData?.translatedText) {
            setTranslatedTitle(titleData.translatedText);
          } else {
            setTranslatedTitle(settings.title);
          }
        }

        if (cachedDesc?.translated_content) {
          setTranslatedDescription(cachedDesc.translated_content);
        } else {
          // Fallback to edge function if no cache
          const { data: descData } = await supabase.functions.invoke("translate-blog", {
            body: {
              text: settings.description,
              targetLanguage: language,
              pageId: "media-showcase-description",
              stripHtml: true,
            },
          });
          if (descData?.translatedText) {
            setTranslatedDescription(descData.translatedText);
          } else {
            setTranslatedDescription(settings.description);
          }
        }
      } catch (error) {
        console.error("Translation error:", error);
        setTranslatedTitle(settings.title);
        setTranslatedDescription(settings.description);
      } finally {
        setIsTranslating(false);
      }
    };

    if (settings.title || settings.description) {
      translateContent();
    }
  }, [language, settings.title, settings.description]);

  // Don't render if section is hidden or no items
  if (!settings.show || (items.length === 0 && !isLoading)) {
    return null;
  }

  if (isLoading) {
    return (
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-card">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        {(settings.title || settings.description) && (
          <div className="text-center mb-10">
            {settings.title && (
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-3">
                {isTranslating ? (
                  <span className="animate-pulse bg-muted rounded h-8 w-64 inline-block" />
                ) : (
                  translatedTitle || settings.title
                )}
              </h2>
            )}
            {settings.description && (
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {isTranslating ? (
                  <span className="animate-pulse bg-muted rounded h-4 w-96 inline-block" />
                ) : (
                  translatedDescription || settings.description
                )}
              </p>
            )}
          </div>
        )}

        {/* Media Grid */}
        {items.length > 0 && (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
            {items.map((item) => (
              <div key={item.id} className={getContentAlignClass(item.image_position)}>
                <div className="group relative rounded-xl overflow-hidden bg-card border border-border shadow-lg transition-transform hover:scale-[1.02] hover:shadow-xl w-full max-w-xl">
                  {/* Media Container */}
                  <div className={`relative ${getAspectRatioClass(item.aspect_ratio)}`}>
                    {item.media_type === "video" ? (
                      <>
                        {item.thumbnail_url ? (
                          <img
                            src={item.thumbnail_url}
                            alt={item.title || "Video thumbnail"}
                            className={`w-full h-full object-cover ${getObjectPositionClass(item.image_position)}`}
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <Play className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                        <button
                          onClick={() => setSelectedVideo(item.media_url)}
                          className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Play video"
                        >
                          <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center">
                            <Play className="h-8 w-8 text-primary-foreground ml-1" />
                          </div>
                        </button>
                      </>
                    ) : (
                      <img
                        src={item.media_url}
                        alt={item.title || "Media image"}
                        className={`w-full h-full object-cover ${getObjectPositionClass(item.image_position)}`}
                      />
                    )}
                  </div>

                  {/* Text Content */}
                  {(item.title || item.description) && (
                    <div className={`p-4 ${getTextAlignClass(item.text_align)}`}>
                      {item.title && (
                        <h3 className="font-medium text-foreground mb-1">{item.title}</h3>
                      )}
                      {item.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State - only shows if no items */}
        {items.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No media content available yet.</p>
          </div>
        )}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              src={selectedVideo}
              controls
              autoPlay
              className="w-full h-full"
            />
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              aria-label="Close video"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
