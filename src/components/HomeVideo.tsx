import { memo, useState, useCallback } from 'react';
import { useHomeMedia } from '@/hooks/useHomeMedia';

interface HomeVideoProps {
  fallbackText: string;
}

// Optimized local poster for best LCP performance
const OPTIMIZED_POSTER = '/videos/poster-master-canva.webp';

/**
 * SmartphoneFrame — pure CSS iPhone-style frame wrapping the video.
 * Uses border-radius, bezels, notch, and side buttons for realism.
 */
function SmartphoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-[280px] md:max-w-[320px]">
      {/* Outer device shell */}
      <div
        className="relative rounded-[40px] md:rounded-[48px] bg-gradient-to-b from-[#1a1a2e] via-[#2d2d44] to-[#1a1a2e] p-[10px] md:p-[12px] shadow-2xl"
        style={{
          boxShadow:
            '0 0 0 1px rgba(255,255,255,0.08) inset, 0 25px 60px -12px rgba(0,0,0,0.5), 0 8px 20px -4px rgba(0,0,0,0.3)',
        }}
      >
        {/* Side buttons — left (silent + volume) */}
        <div className="absolute -left-[3px] top-[72px] w-[3px] h-[24px] rounded-l-sm bg-[#2d2d44]" />
        <div className="absolute -left-[3px] top-[108px] w-[3px] h-[40px] rounded-l-sm bg-[#2d2d44]" />
        <div className="absolute -left-[3px] top-[156px] w-[3px] h-[40px] rounded-l-sm bg-[#2d2d44]" />
        {/* Side button — right (power) */}
        <div className="absolute -right-[3px] top-[120px] w-[3px] h-[52px] rounded-r-sm bg-[#2d2d44]" />

        {/* Inner screen area */}
        <div className="relative rounded-[30px] md:rounded-[36px] overflow-hidden bg-black">
          {/* Dynamic Island / Notch */}
          <div className="absolute top-0 left-0 right-0 z-20 flex justify-center pt-[6px] md:pt-[8px]">
            <div className="w-[90px] md:w-[110px] h-[26px] md:h-[30px] bg-black rounded-full flex items-center justify-center gap-2">
              <div className="w-[8px] h-[8px] rounded-full bg-[#1a1a2e] ring-1 ring-gray-700" />
            </div>
          </div>

          {/* Screen content */}
          <div className="relative">
            {children}
          </div>

          {/* Home indicator bar */}
          <div className="absolute bottom-0 left-0 right-0 z-20 flex justify-center pb-[4px]">
            <div className="w-[100px] md:w-[120px] h-[4px] md:h-[5px] bg-white/30 rounded-full" />
          </div>
        </div>
      </div>

      {/* CalorieVision logo — floating top-left corner */}
      <div
        className="absolute -top-2 -left-2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white shadow-lg flex items-center justify-center ring-2 ring-white"
      >
        <img
          src="/gauge-logo.webp"
          alt="CalorieVision"
          className="w-7 h-7 md:w-8 md:h-8 object-contain"
          loading="lazy"
        />
      </div>
    </div>
  );
}

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
      <SmartphoneFrame>
        <div className="relative w-full aspect-[9/16]">
          <img
            src={OPTIMIZED_POSTER}
            alt="CalorieVision app demo"
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover"
          />
        </div>
      </SmartphoneFrame>
    );
  }

  return (
    <SmartphoneFrame>
      <div className="relative w-full aspect-[9/16]">
        {/* Poster image rendered as img for better LCP - shown until video loads */}
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
    </SmartphoneFrame>
  );
}, () => true);

export default HomeVideo;
