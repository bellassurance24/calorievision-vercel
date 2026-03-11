import { Play, Image as ImageIcon } from "lucide-react";

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

interface MediaShowcasePreviewProps {
  items: MediaShowcaseItem[];
  title: string;
  description: string;
  show: boolean;
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

export default function MediaShowcasePreview({ 
  items, 
  title, 
  description, 
  show 
}: MediaShowcasePreviewProps) {
  const visibleItems = items.filter(item => item.is_visible);

  if (!show) {
    return (
      <div className="border border-dashed border-border rounded-lg p-8 text-center text-muted-foreground">
        <p className="text-sm">Section hidden - toggle "Show Media Showcase" to preview</p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-gradient-to-b from-background to-muted/20">
      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          {(title || description) && (
            <div className="text-center mb-6">
              {title && (
                <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-2">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                  {description}
                </p>
              )}
            </div>
          )}

          {/* Media Grid */}
          {visibleItems.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
              {visibleItems.map((item) => (
                <div key={item.id} className={getContentAlignClass(item.image_position)}>
                  <div className="group relative rounded-lg overflow-hidden bg-card border border-border shadow-sm transition-transform hover:scale-[1.02] w-full max-w-lg">
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
                              <Play className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <div className="w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center">
                              <Play className="h-5 w-5 text-primary-foreground ml-0.5" />
                            </div>
                          </div>
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
                      <div className={`p-3 ${getTextAlignClass(item.text_align)}`}>
                        {item.title && (
                          <h3 className="font-medium text-sm text-foreground mb-0.5">{item.title}</h3>
                        )}
                        {item.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <ImageIcon className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No visible media items. Add some above!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
