import { useState, useEffect, useCallback } from 'react';

type AspectRatio = 'landscape' | 'portrait' | 'square';

interface HomeMedia {
  videoUrl: string;
  posterUrl: string;
  isFromSupabase: boolean;
  aspectRatio: AspectRatio;
  updatedAt: string; // Cache-buster key
}

// Video hosted on Supabase Storage (home-videos bucket)
const SUPABASE_VIDEO_URL =
  'https://ttjcfwspcpnxtxzqnfrh.supabase.co/storage/v1/object/public/home-videos/calorievision-video.mp4';
const DEFAULT_POSTER_URL = '/videos/poster-v5-perfect.webp';
const DEFAULT_POSTER_JPG = '/videos/poster-v5-perfect.jpg';

export function useHomeMedia() {
  const [media, setMedia] = useState<HomeMedia>({
    videoUrl: SUPABASE_VIDEO_URL,
    posterUrl: DEFAULT_POSTER_URL,
    isFromSupabase: true,
    aspectRatio: 'portrait',
    updatedAt: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const refetch = useCallback(() => {
    // Video is served directly from Supabase Storage, no DB lookup needed
    setMedia({
      videoUrl: SUPABASE_VIDEO_URL,
      posterUrl: DEFAULT_POSTER_URL,
      isFromSupabase: true,
      aspectRatio: 'portrait',
      updatedAt: '',
    });
  }, []);

  return { ...media, isLoading, refetch, defaultPosterJpg: DEFAULT_POSTER_JPG };
}
