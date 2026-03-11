import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

type AspectRatio = 'landscape' | 'portrait' | 'square';

interface HomeMedia {
  videoUrl: string;
  posterUrl: string;
  isFromSupabase: boolean;
  aspectRatio: AspectRatio;
  updatedAt: string; // Cache-buster key
}

// Default static files as fallback
const DEFAULT_VIDEO_URL = '/videos/calorievision-video.mp4';
const DEFAULT_POSTER_URL = '/videos/video-poster.webp';
const DEFAULT_POSTER_JPG = '/videos/video-poster.jpg';

export function useHomeMedia() {
  const [media, setMedia] = useState<HomeMedia>({
    videoUrl: DEFAULT_VIDEO_URL,
    posterUrl: DEFAULT_POSTER_URL,
    isFromSupabase: false,
    aspectRatio: 'landscape',
    updatedAt: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchActiveMedia = useCallback(async () => {
    try {
      // Fetch active video from home_media table
      const { data: videoData } = await supabase
        .from('home_media')
        .select('storage_path, media_type, aspect_ratio, updated_at')
        .eq('is_active', true)
        .eq('media_type', 'video')
        .maybeSingle();

      // Fetch active poster from home_media table
      const { data: posterData } = await supabase
        .from('home_media')
        .select('storage_path, media_type, updated_at')
        .eq('is_active', true)
        .eq('media_type', 'poster')
        .maybeSingle();

      let videoUrl = DEFAULT_VIDEO_URL;
      // ALWAYS use the optimized local poster for best LCP performance
      const posterUrl = DEFAULT_POSTER_URL;
      let isFromSupabase = false;
      let aspectRatio: AspectRatio = 'landscape';
      let updatedAt = '';

      if (videoData?.storage_path) {
        const { data: publicUrl } = supabase.storage
          .from('home-videos')
          .getPublicUrl(videoData.storage_path);
        // Add cache-buster to force reload
        const timestamp = new Date(videoData.updated_at).getTime();
        videoUrl = `${publicUrl.publicUrl}?v=${timestamp}`;
        isFromSupabase = true;
        aspectRatio = (videoData.aspect_ratio as AspectRatio) || 'landscape';
        updatedAt = videoData.updated_at;
      }

      // Note: We intentionally skip posterData to always use the optimized local poster
      // This ensures consistent LCP performance (<100KB poster)

      setMedia({ videoUrl, posterUrl, isFromSupabase, aspectRatio, updatedAt });
    } catch (error) {
      console.error('Error fetching home media:', error);
      // Keep defaults on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveMedia();
  }, [fetchActiveMedia]);

  return { ...media, isLoading, refetch: fetchActiveMedia, defaultPosterJpg: DEFAULT_POSTER_JPG };
}
