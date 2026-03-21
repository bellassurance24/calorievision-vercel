import { memo, useState, useCallback } from 'react';
import { useHomeMedia } from '@/hooks/useHomeMedia';

interface HomeVideoProps {
  fallbackText: string;
}

// Optimized local poster for best LCP performance
const OPTIMIZED_POSTER = '/videos/poster-master-canva.webp';

// Memoized video component
// Portrait (9/16) on desktop + mobile, with visible native controls.
const HomeVideo = memo(function HomeVideo({ fallbackText }: HomeVideoProps) {
  const { videoUrl, updatedAt } = useHomeMedia();
  const [videoError, setVideoError] = useState(false);

  const mimeType = /\.webm(\?|$)/i.test(videoUrl) ? 'video/webm' : 'video/mp4';

  const handleVideoError = useCallback(() => {
    setVideoError(true);
  }, []);

  const handleVideoLoaded = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    // Hide the img overlay once video is ready
    const img = e.currentTarget.previousElementSibling as HTMLElement;
    if (img) img.style.display = 'none';
    setVideoError(false);
  }, []);

  // Safety fallback: if video fails to load, show poster image
  if (!videoUrl || videoError) {
    return (
      <div className="relative w-full max-w-sm mx-auto aspect-[9/16]">
        <img
          src={OPTIMIZED_POSTER}
          alt="CalorieVision app demo"
          fetchPriority="high"
          decoding="async"
          className="w-full h-full object-contain rounded-xl bg-black/5"
        />
      </div>
    );
  }

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
        preload="metadata"
        poster={OPTIMIZED_POSTER}
        controlsList="nodownload"
        onLoadedData={handleVideoLoaded}
        onError={handleVideoError}
      >
        <source src={videoUrl} type={mimeType} onError={handleVideoError} />
        <p className="text-center p-4 text-muted-foreground">{fallbackText}</p>
      </video>
    </div>
  );
}, () => true);

export default HomeVideo;
