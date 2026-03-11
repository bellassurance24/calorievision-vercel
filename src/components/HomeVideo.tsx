import { memo } from 'react';
import { useHomeMedia } from '@/hooks/useHomeMedia';

interface HomeVideoProps {
  fallbackText: string;
}

// Optimized local poster for best LCP performance
const OPTIMIZED_POSTER = '/videos/video-poster.webp';

// Memoized video component
// Portrait (9/16) on desktop + mobile, with visible native controls.
// Uses updatedAt as key to force reload when video changes.
const HomeVideo = memo(function HomeVideo({ fallbackText }: HomeVideoProps) {
  const { videoUrl, updatedAt } = useHomeMedia();

  const mimeType = /\.webm(\?|$)/i.test(videoUrl) ? 'video/webm' : 'video/mp4';

  return (
    <div className="relative w-full max-w-sm mx-auto aspect-[9/16]">
      {/* Poster image rendered as img for better LCP - shown until video loads */}
      <img
        src={OPTIMIZED_POSTER}
        alt="Video preview"
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 w-full h-full object-contain rounded-xl bg-black/5 pointer-events-none"
        style={{ zIndex: 1 }}
      />
      <video
        key={updatedAt || 'default'}
        className="relative w-full h-full object-contain rounded-xl bg-black/5"
        style={{ zIndex: 2 }}
        controls
        playsInline
        preload="none"
        poster={OPTIMIZED_POSTER}
        controlsList="nodownload"
        onLoadedData={(e) => {
          // Hide the img overlay once video is ready
          const img = e.currentTarget.previousElementSibling as HTMLElement;
          if (img) img.style.display = 'none';
        }}
      >
        <source src={videoUrl} type={mimeType} />
        <p className="text-center p-4 text-muted-foreground">{fallbackText}</p>
      </video>
    </div>
  );
}, () => true);

export default HomeVideo;

