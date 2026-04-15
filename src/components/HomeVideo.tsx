import { memo, useState, useCallback } from 'react';

interface HomeVideoProps {
  fallbackText: string;
}

const OPTIMIZED_POSTER = '/videos/poster-master-canva.png.png';
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
      <div className="relative w-full max-w-xs mx-auto aspect-[9/16] rounded-[2rem] overflow-hidden shadow-xl">
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
    <div className="relative w-full max-w-xs mx-auto aspect-[9/16] rounded-[2rem] overflow-hidden shadow-xl">
      {/* Poster image — always in DOM, hidden via display:none once video plays.
          absolute inset-0 overlays the video; pointer-events-none lets native
          video controls receive clicks even while the poster is visible. */}
      <img
        src={OPTIMIZED_POSTER}
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{ display: isPlaying ? 'none' : 'block', objectPosition: 'center top' }}
      />
      {/* Play button overlay — visible only when not playing */}
      {!isPlaying && (
        <div
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none
                     w-16 h-16 rounded-full bg-white/80 flex items-center justify-center
                     animate-pulse hover:scale-110 transition-transform duration-200 z-10"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="#0d9488"
            className="w-8 h-8 translate-x-0.5"
          >
            <path d="M8 5.14v14l11-7-11-7z" />
          </svg>
        </div>
      )}
      <video
        className="w-full h-full object-cover"
        playsInline
        controls
        autoPlay={false}
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
