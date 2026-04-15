import { memo, useState, useCallback } from 'react';

interface HomeVideoProps {
  fallbackText: string;
}

const OPTIMIZED_POSTER = '/videos/poster-master-canva.webp';
const LOCAL_VIDEO = '/videos/video-mp4-calorievision-v1.mp4';

// Clean poster with play button overlay. Click to play video WITH sound.
const HomeVideo = memo(function HomeVideo({ fallbackText }: HomeVideoProps) {
  const [videoError, setVideoError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

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
    <div className="relative w-full max-w-xs mx-auto aspect-[9/16] rounded-[2rem] overflow-hidden shadow-xl ring-1 ring-black/10">
      {/* Poster image — covers full container, hidden once video plays.
          Uses <img> instead of poster="" so object-fit: cover is respected. */}
      {!isPlaying && (
        <img
          src={OPTIMIZED_POSTER}
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
      )}
      <video
        className="w-full h-full object-cover"
        playsInline
        controls
        preload="metadata"
        controlsList="nodownload"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onError={handleVideoError}
      >
        <source src={LOCAL_VIDEO} type="video/mp4" onError={handleVideoError} />
        <p className="text-center p-4 text-muted-foreground">{fallbackText}</p>
      </video>
    </div>
  );
}, () => true);

export default HomeVideo;
