import { memo, useRef, useEffect, useState, useCallback } from 'react';

interface UGCHeroVideoProps {
  /** Supabase Storage URL for the AI spokesperson video */
  videoUrl?: string;
  /** Localized CTA text */
  ctaText: string;
  /** Click handler for CTA */
  onCtaClick: () => void;
}

/**
 * Autoplaying, muted AI UGC spokesperson video.
 * - Plays automatically when scrolled into view (IntersectionObserver)
 * - Starts muted (browser requirement for autoplay)
 * - Shows unmute button overlay
 * - 16:9 landscape format for spokesperson video
 * - Loops for continuous engagement
 * - Falls back gracefully if no video URL provided
 */
const UGCHeroVideo = memo(function UGCHeroVideo({
  videoUrl,
  ctaText,
  onCtaClick,
}: UGCHeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Autoplay when scrolled into view
  useEffect(() => {
    if (!videoUrl || !containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const video = videoRef.current;
        if (!video) return;

        if (entry.isIntersecting) {
          video.play().catch(() => {
            // Autoplay blocked — that's OK, poster shows
          });
        } else {
          video.pause();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [videoUrl]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  // Don't render if no video URL
  if (!videoUrl || hasError) return null;

  return (
    <div ref={containerRef} className="relative w-full max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-2xl group">
      {/* Video */}
      <video
        ref={videoRef}
        className="w-full aspect-video object-cover"
        muted
        playsInline
        loop
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => setHasError(true)}
      >
        <source src={videoUrl} type="video/mp4" />
      </video>

      {/* Mute/Unmute button — top-right */}
      <button
        onClick={toggleMute}
        className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        )}
      </button>

      {/* CTA overlay — bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent p-4 pt-12">
        <button
          onClick={onCtaClick}
          className="w-full py-3 px-6 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl text-sm md:text-base hover:shadow-lg hover:scale-[1.02] transition-all"
        >
          {ctaText}
        </button>
      </div>
    </div>
  );
});

export default UGCHeroVideo;
