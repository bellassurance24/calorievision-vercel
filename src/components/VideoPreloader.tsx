import { memo } from "react";
import { useHomeMedia } from "@/hooks/useHomeMedia";

/**
 * Keeps the homepage demo video warm in the browser cache across route navigation.
 * Rendered off-screen (not display:none) so browsers still fetch the media.
 * Now uses dynamic video URL from Supabase if available.
 * Uses updatedAt as key to force reload when video changes.
 */
const VideoPreloader = memo(function VideoPreloader() {
  const { videoUrl, updatedAt } = useHomeMedia();

  // Don't render if no video URL available
  if (!videoUrl) return null;

  const mimeType = /\.webm(\?|$)/i.test(videoUrl) ? "video/webm" : "video/mp4";

  return (
    <video
      key={updatedAt || 'default'} // Force remount when video changes
      className="fixed left-[-9999px] top-[-9999px] h-px w-px opacity-0 pointer-events-none"
      preload="none"
      muted
      playsInline
      aria-hidden="true"
      tabIndex={-1}
    >
      <source src={videoUrl} type={mimeType} />
    </video>
  );
});

export default VideoPreloader;
