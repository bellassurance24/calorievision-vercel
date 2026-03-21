import { memo, useState, useCallback } from 'react';
import { useHomeMedia } from '@/hooks/useHomeMedia';

interface HomeVideoProps {
  fallbackText: string;
}

const OPTIMIZED_POSTER = '/videos/poster-master-canva.webp';

// Clean, minimal video component with a subtle device frame.
// The poster image handles all branding — no extra overlays.
const HomeVideo = memo(function HomeVideo({ fallbackText }: HomeVideoProps) {
  const { videoUrl, updatedAt } = useHomeMedia();
  const [videoError, setVideoError] = useState(false);

  const mimeType = /\.webm(\?|$)/i.test(videoUrl) ? 'video/webm' : 'video/mp4';

  const handleVideoError = useCallback(() => {
    setVideoError(true);
  }, []);

  const handleVideoLoaded = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const img = e.currentTarget.previousElementSibling as HTMLElement;
    if (img) img.style.display = 'none';
    setVideoError(false);
  }, []);

  if (!videoUrl || videoError) {
    return (
      <div className="relative w-full max-w-xs mx-auto aspect-[9/16] rounded-[2rem] overflow-hidden shadow-xl ring-1 ring-black/10">
        <img
          src={OPTIMIZED_POSTER}
          alt="CalorieVision app demo"
          fetchPriority="high"
          decoding="async"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-xs mx-auto aspect-[9/16] rounded-[2rem] overflow-hidden shadow-xl ring-1 ring-black/10 bg-black">
      <img
        src={OPTIMIZED_POSTER}
        alt="Video preview"
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{ zIndex: 1 }}
      />
      <video
        key={updatedAt || 'default'}
        className="relative w-full h-full object-cover"
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
