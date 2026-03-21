import { memo, useState, useCallback } from 'react';

interface HomeVideoProps {
  fallbackText: string;
}

const OPTIMIZED_POSTER = '/videos/poster-master-canva.webp';
const LOCAL_VIDEO = '/videos/video-mp4-calorievision-v1.mp4';

// Clean, minimal video component. Single frame, no overlays.
// The Canva-edited video already has branding baked in.
const HomeVideo = memo(function HomeVideo({ fallbackText }: HomeVideoProps) {
  const [videoError, setVideoError] = useState(false);

  const handleVideoError = useCallback(() => {
    setVideoError(true);
  }, []);

  if (videoError) {
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
      <video
        className="w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster={OPTIMIZED_POSTER}
        controlsList="nodownload"
        onError={handleVideoError}
      >
        <source src={LOCAL_VIDEO} type="video/mp4" onError={handleVideoError} />
        <p className="text-center p-4 text-muted-foreground">{fallbackText}</p>
      </video>
    </div>
  );
}, () => true);

export default HomeVideo;
