import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Video, 
  Upload, 
  RefreshCw, 
  Trash2, 
  Eye, 
  Download,
  Check,
  X,
  Loader2,
  Image as ImageIcon,
  HardDrive,
  Clock,
  FileVideo,
  Monitor,
  Smartphone,
  Settings2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';


interface VideoInfo {
  fileName: string;
  fileSize: number;
  duration: number;
  width: number;
  height: number;
  mimeType: string;
}

interface PosterInfo {
  fileName: string;
  fileSize: number;
  width: number;
  height: number;
}

type AspectRatio = 'landscape' | 'portrait' | 'square';

const ASPECT_RATIOS: { value: AspectRatio; label: string; ratio: string; icon: React.ReactNode }[] = [
  { value: 'landscape', label: 'Paysage (16:9)', ratio: 'aspect-video', icon: <Monitor className="h-4 w-4" /> },
  { value: 'portrait', label: 'Vertical (9:16)', ratio: 'aspect-[9/16]', icon: <Smartphone className="h-4 w-4" /> },
  { value: 'square', label: 'Carré (1:1)', ratio: 'aspect-square', icon: <div className="h-4 w-4 border-2 border-current" /> },
];

export function HomeVideoManager() {
  const { toast } = useToast();
  const videoInputRef = useRef<HTMLInputElement>(null);
  const posterInputRef = useRef<HTMLInputElement>(null);
  
  // Current video state - will be loaded from Supabase
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [posterUrl, setPosterUrl] = useState<string>('');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [posterInfo, setPosterInfo] = useState<PosterInfo | null>(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState(true);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [currentPosterId, setCurrentPosterId] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('landscape');
  
  // Pending upload state (uploaded but not yet activated)
  const [pendingVideoId, setPendingVideoId] = useState<string | null>(null);
  const [pendingVideoUrl, setPendingVideoUrl] = useState<string | null>(null);
  const [pendingVideoInfo, setPendingVideoInfo] = useState<VideoInfo | null>(null);
  
  // Modal states
  const [replaceVideoModalOpen, setReplaceVideoModalOpen] = useState(false);
  const [replacePosterModalOpen, setReplacePosterModalOpen] = useState(false);
  const [viewVideoModalOpen, setViewVideoModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  
  // Upload states
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  
  // Poster upload states
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [autoCompress, setAutoCompress] = useState(true);
  const [convertToWebP, setConvertToWebP] = useState(true);
  

  // Load active media from Supabase on mount
  const loadActiveMedia = useCallback(async () => {
    setIsLoadingInfo(true);
    try {
      // Fetch active video
      const { data: videoData } = await supabase
        .from('home_media')
        .select('*')
        .eq('is_active', true)
        .eq('media_type', 'video')
        .maybeSingle();

      // Fetch active poster
      const { data: posterData } = await supabase
        .from('home_media')
        .select('*')
        .eq('is_active', true)
        .eq('media_type', 'poster')
        .maybeSingle();

      if (videoData) {
        const { data: publicUrl } = supabase.storage
          .from('home-videos')
          .getPublicUrl(videoData.storage_path);
        setVideoUrl(publicUrl.publicUrl);
        setCurrentVideoId(videoData.id);
        setVideoInfo({
          fileName: videoData.file_name,
          fileSize: videoData.file_size,
          duration: videoData.duration_seconds || 0,
          width: videoData.width || 0,
          height: videoData.height || 0,
          mimeType: videoData.mime_type,
        });
        // Load saved aspect ratio
        if (videoData.aspect_ratio) {
          setAspectRatio(videoData.aspect_ratio as AspectRatio);
        }
      } else {
        // Fall back to static file
        setVideoUrl('/videos/calorievision-video.mp4');
        setCurrentVideoId(null);
      }

      if (posterData) {
        const { data: publicUrl } = supabase.storage
          .from('home-videos')
          .getPublicUrl(posterData.storage_path);
        setPosterUrl(publicUrl.publicUrl);
        setCurrentPosterId(posterData.id);
        setPosterInfo({
          fileName: posterData.file_name,
          fileSize: posterData.file_size,
          width: posterData.width || 0,
          height: posterData.height || 0,
        });
      } else {
        // Fall back to static file
        setPosterUrl('/videos/video-poster.webp');
        setCurrentPosterId(null);
      }
    } catch (error) {
      console.error('Error loading active media:', error);
      // Fall back to static files
      setVideoUrl('/videos/calorievision-video.mp4');
      setPosterUrl('/videos/video-poster.webp');
    } finally {
      setIsLoadingInfo(false);
    }
  }, []);

  // Load video info from URL (for static files or refresh)
  const loadVideoInfo = useCallback(async () => {
    if (!videoUrl || currentVideoId) {
      // If we have a Supabase video, info is already loaded
      return;
    }

    setIsLoadingInfo(true);
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error('Failed to load video'));
        video.src = URL.createObjectURL(blob);
      });

      setVideoInfo({
        fileName: decodeURIComponent((videoUrl.split('/').pop() || 'video').split('?')[0]),
        fileSize: blob.size,
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        mimeType: blob.type || 'video/mp4',
      });

      URL.revokeObjectURL(video.src);
    } catch (error) {
      console.error('Error loading video info:', error);
      setVideoInfo(null);
    } finally {
      setIsLoadingInfo(false);
    }
  }, [videoUrl, currentVideoId]);

  // Load poster info from URL (for static files or refresh)
  const loadPosterInfo = useCallback(async () => {
    if (!posterUrl || currentPosterId) {
      // If we have a Supabase poster, info is already loaded
      return;
    }

    try {
      const response = await fetch(posterUrl);
      const blob = await response.blob();
      
      const img = document.createElement('img');
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(blob);
      });

      setPosterInfo({
        fileName: decodeURIComponent((posterUrl.split('/').pop() || 'poster').split('?')[0]),
        fileSize: blob.size,
        width: img.naturalWidth,
        height: img.naturalHeight,
      });

      URL.revokeObjectURL(img.src);
    } catch (error) {
      console.error('Error loading poster info:', error);
      setPosterInfo(null);
    }
  }, [posterUrl, currentPosterId]);

  useEffect(() => {
    loadActiveMedia();
  }, [loadActiveMedia]);

  // Load static file info if no Supabase media
  useEffect(() => {
    if (videoUrl && !currentVideoId) {
      loadVideoInfo();
    }
    if (posterUrl && !currentPosterId) {
      loadPosterInfo();
    }
  }, [videoUrl, posterUrl, currentVideoId, currentPosterId, loadVideoInfo, loadPosterInfo]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle video file drop
  const handleVideoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      handleVideoFileSelect(file);
      setReplaceVideoModalOpen(true);
    }
  };

  const handleVideoFileSelect = async (file: File) => {
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: 'Fichier trop volumineux',
        description: 'La taille maximum est de 50MB',
        variant: 'destructive',
      });
      return;
    }
    setUploadFile(file);
    setUploadPreview(URL.createObjectURL(file));
  };
  

  const handleVideoUpload = async () => {
    if (!uploadFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Upload original file directly (no compression to preserve audio)
      const fileExtension = uploadFile.name.split('.').pop() || 'mp4';
      const mimeType = uploadFile.type || 'video/mp4';
      
      // Get video metadata
      const video = document.createElement('video');
      video.preload = 'metadata';
      const videoMetadata = await new Promise<{ width: number; height: number; duration: number }>((resolve, reject) => {
        video.onloadedmetadata = () => {
          resolve({
            width: video.videoWidth,
            height: video.videoHeight,
            duration: video.duration,
          });
        };
        video.onerror = () => reject(new Error('Failed to load video metadata'));
        video.src = URL.createObjectURL(uploadFile);
      });
      URL.revokeObjectURL(video.src);

      // Simulate progress for UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const fileName = `homepage-video-${Date.now()}.${fileExtension}`;
      const { data, error } = await supabase.storage
        .from('home-videos')
        .upload(fileName, uploadFile, {
          cacheControl: '31536000',
          upsert: false,
        });

      clearInterval(progressInterval);

      if (error) throw error;

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Save metadata to home_media table with is_active: FALSE (pending)
      const fileSize = uploadFile.size;
      const { data: mediaRecord, error: insertError } = await supabase
        .from('home_media')
        .insert({
          file_name: uploadFile.name,
          file_size: fileSize,
          mime_type: mimeType,
          media_type: 'video',
          storage_path: data.path,
          width: videoMetadata.width,
          height: videoMetadata.height,
          duration_seconds: videoMetadata.duration,
          is_active: false, // NOT active until user clicks "Activer"
          uploaded_by: user?.id,
          aspect_ratio: aspectRatio,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const { data: publicUrl } = supabase.storage
        .from('home-videos')
        .getPublicUrl(data.path);

      setUploadProgress(100);
      
      // Store as pending (not yet active)
      setPendingVideoId(mediaRecord.id);
      setPendingVideoUrl(publicUrl.publicUrl);
      setPendingVideoInfo({
        fileName: uploadFile.name,
        fileSize: uploadFile.size,
        duration: videoMetadata.duration,
        width: videoMetadata.width,
        height: videoMetadata.height,
        mimeType: uploadFile.type || 'video/mp4',
      });
      
      setReplaceVideoModalOpen(false);
      setUploadFile(null);
      setUploadPreview(null);

      toast({
        title: 'Vidéo uploadée',
        description: 'Cliquez sur "Activer" pour remplacer la vidéo actuelle sur la page Home.',
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Erreur d\'upload',
        description: error.message || 'Échec de l\'upload de la vidéo',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Activate a pending video (make it the active one on the Home page)
  const handleActivatePendingVideo = async () => {
    if (!pendingVideoId) return;
    
    setIsActivating(true);
    try {
      // Deactivate current active video
      if (currentVideoId) {
        await supabase
          .from('home_media')
          .update({ is_active: false })
          .eq('id', currentVideoId);
      }
      
      // Activate the pending video
      await supabase
        .from('home_media')
        .update({ is_active: true, updated_at: new Date().toISOString() })
        .eq('id', pendingVideoId);
      
      // Update local state
      setVideoUrl(pendingVideoUrl!);
      setCurrentVideoId(pendingVideoId);
      setVideoInfo(pendingVideoInfo);
      
      // Clear pending state
      setPendingVideoId(null);
      setPendingVideoUrl(null);
      setPendingVideoInfo(null);
      
      toast({
        title: 'Vidéo activée',
        description: 'La nouvelle vidéo est maintenant affichée sur la page Home.',
      });
    } catch (error: any) {
      console.error('Activation error:', error);
      toast({
        title: 'Erreur d\'activation',
        description: error.message || 'Échec de l\'activation',
        variant: 'destructive',
      });
    } finally {
      setIsActivating(false);
    }
  };

  // Cancel pending video
  const handleCancelPendingVideo = async () => {
    if (!pendingVideoId) return;
    
    try {
      // Delete the pending record
      await supabase
        .from('home_media')
        .delete()
        .eq('id', pendingVideoId);
      
      setPendingVideoId(null);
      setPendingVideoUrl(null);
      setPendingVideoInfo(null);
      
      toast({
        title: 'Upload annulé',
        description: 'La vidéo uploadée a été supprimée.',
      });
    } catch (error: any) {
      console.error('Cancel error:', error);
    }
  };

  // Handle poster file select
  const handlePosterFileSelect = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Fichier trop volumineux',
        description: 'La taille maximum est de 5MB',
        variant: 'destructive',
      });
      return;
    }
    setPosterFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPosterPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePosterUpload = async () => {
    if (!posterFile || !posterPreview) return;

    setIsUploading(true);
    try {
      let processedFile = posterFile;
      let processedDataUrl = posterPreview;
      let imgWidth = 0;
      let imgHeight = 0;

      // Process image on client side
      const img = document.createElement('img');
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.src = posterPreview;
      });
      imgWidth = img.naturalWidth;
      imgHeight = img.naturalHeight;

      if (autoCompress || convertToWebP) {
        const canvas = document.createElement('canvas');
        canvas.width = imgWidth;
        canvas.height = imgHeight;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);

        const format = convertToWebP ? 'image/webp' : 'image/jpeg';
        const quality = autoCompress ? 0.8 : 0.95;
        processedDataUrl = canvas.toDataURL(format, quality);

        const response = await fetch(processedDataUrl);
        const blob = await response.blob();
        const ext = convertToWebP ? 'webp' : 'jpg';
        processedFile = new File([blob], `poster.${ext}`, { type: format });
      }

      const fileName = `video-poster-${Date.now()}.${convertToWebP ? 'webp' : 'jpg'}`;
      const { data, error } = await supabase.storage
        .from('home-videos')
        .upload(fileName, processedFile, {
          cacheControl: '31536000',
          upsert: false,
        });

      if (error) throw error;

      // Deactivate previous active poster
      if (currentPosterId) {
        await supabase
          .from('home_media')
          .update({ is_active: false })
          .eq('id', currentPosterId);
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Save metadata to home_media table
      const { data: mediaRecord, error: insertError } = await supabase
        .from('home_media')
        .insert({
          file_name: posterFile.name,
          file_size: processedFile.size,
          mime_type: processedFile.type,
          media_type: 'poster',
          storage_path: data.path,
          width: imgWidth,
          height: imgHeight,
          is_active: true,
          uploaded_by: user?.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const { data: publicUrl } = supabase.storage
        .from('home-videos')
        .getPublicUrl(data.path);

      setPosterUrl(publicUrl.publicUrl);
      setCurrentPosterId(mediaRecord.id);
      setPosterInfo({
        fileName: posterFile.name,
        fileSize: processedFile.size,
        width: imgWidth,
        height: imgHeight,
      });
      setReplacePosterModalOpen(false);
      setPosterFile(null);
      setPosterPreview(null);

      toast({
        title: 'Poster uploadé',
        description: 'Le poster de la vidéo a été remplacé avec succès',
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Erreur d\'upload',
        description: error.message || 'Échec de l\'upload du poster',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteVideo = async () => {
    try {
      // Deactivate in database
      if (currentVideoId) {
        await supabase
          .from('home_media')
          .update({ is_active: false })
          .eq('id', currentVideoId);
      }
      
      // Reset to static file
      setVideoUrl('/videos/calorievision-video.mp4');
      setCurrentVideoId(null);
      setVideoInfo(null);
      setDeleteConfirmOpen(false);
      
      // Reload info for static file
      setTimeout(loadVideoInfo, 100);
      
      toast({
        title: 'Vidéo désactivée',
        description: 'La vidéo Supabase a été désactivée. La vidéo statique par défaut sera utilisée.',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Échec de la suppression',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  // Save aspect ratio when it changes (if we have a current video)
  const handleAspectRatioChange = async (value: AspectRatio) => {
    setAspectRatio(value);
    
    if (currentVideoId) {
      try {
        await supabase
          .from('home_media')
          .update({ aspect_ratio: value })
          .eq('id', currentVideoId);
        
        toast({
          title: 'Orientation sauvegardée',
          description: `L'affichage est maintenant en mode ${ASPECT_RATIOS.find(a => a.value === value)?.label}`,
        });
      } catch (error) {
        console.error('Error saving aspect ratio:', error);
      }
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            <CardTitle>Vidéo Page Home</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadActiveMedia}
            disabled={isLoadingInfo}
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingInfo ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <CardDescription>
          Gérez la vidéo et le poster affichés sur la page d'accueil
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="video" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="video" className="flex items-center gap-2">
              <FileVideo className="h-4 w-4" />
              Vidéo
            </TabsTrigger>
            <TabsTrigger value="poster" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Poster
            </TabsTrigger>
          </TabsList>

          {/* Video Tab */}
          <TabsContent value="video" className="space-y-4">
            {/* Aspect Ratio Selector */}
            <div className="flex items-center gap-3">
              <Label className="text-sm font-medium">Orientation d'affichage:</Label>
              <Select value={aspectRatio} onValueChange={(v) => handleAspectRatioChange(v as AspectRatio)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASPECT_RATIOS.map((ar) => (
                    <SelectItem key={ar.value} value={ar.value}>
                      <div className="flex items-center gap-2">
                        {ar.icon}
                        <span>{ar.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Video Preview */}
            <div 
              className={`relative ${ASPECT_RATIOS.find(a => a.value === aspectRatio)?.ratio || 'aspect-video'} max-w-md mx-auto rounded-lg overflow-hidden bg-muted border border-border`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleVideoDrop}
            >
              {dragOver && (
                <div className="absolute inset-0 bg-primary/20 border-2 border-dashed border-primary z-10 flex items-center justify-center">
                  <p className="text-primary font-medium">Déposez la vidéo ici</p>
                </div>
              )}
              {videoUrl ? (
                <video
                  src={videoUrl}
                  poster={posterUrl}
                  className="w-full h-full object-cover"
                  controls
                  playsInline
                  controlsList="nodownload"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <Video className="h-12 w-12" />
                </div>
              )}
            </div>

            {/* Video Info */}
            {isLoadingInfo ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Chargement des informations...
              </div>
            ) : videoInfo ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Taille:</span>
                  <span className="font-medium">{formatFileSize(videoInfo.fileSize)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Durée:</span>
                  <span className="font-medium">{formatDuration(videoInfo.duration)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Résolution:</span>
                  <span className="font-medium">{videoInfo.width}×{videoInfo.height}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Format:</span>
                  <span className="font-medium">{videoInfo.mimeType.split('/')[1].toUpperCase()}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Aucune vidéo configurée</p>
            )}

            {/* Pending Video Section */}
            {pendingVideoId && pendingVideoUrl && (
              <div className="p-4 border-2 border-dashed border-primary/50 rounded-lg bg-primary/5 space-y-4">
                <div className="flex items-center gap-2 text-primary font-medium">
                  <Upload className="h-4 w-4" />
                  Nouvelle vidéo en attente d'activation
                </div>
                
                <div className={`relative ${ASPECT_RATIOS.find(a => a.value === aspectRatio)?.ratio || 'aspect-video'} max-w-xs rounded-lg overflow-hidden bg-muted border border-border`}>
                  <video
                    src={pendingVideoUrl}
                    className="w-full h-full object-cover"
                    controls
                    playsInline
                    controlsList="nodownload"
                  />
                </div>
                
                {pendingVideoInfo && (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-muted-foreground" />
                      <span>{formatFileSize(pendingVideoInfo.fileSize)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDuration(pendingVideoInfo.duration)}</span>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleActivatePendingVideo}
                    disabled={isActivating}
                    className="flex-1"
                  >
                    {isActivating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Activer sur la page Home
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancelPendingVideo}
                    disabled={isActivating}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Annuler
                  </Button>
                </div>
              </div>
            )}

            {/* Video Actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReplaceVideoModalOpen(true)}
                disabled={!!pendingVideoId}
              >
                <Upload className="h-4 w-4 mr-2" />
                {pendingVideoId ? 'Upload en cours...' : 'Remplacer'}
              </Button>
              {videoUrl && !pendingVideoId && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewVideoModalOpen(true)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Voir
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(videoUrl, videoInfo?.fileName || 'video.mp4')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteConfirmOpen(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                </>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleVideoFileSelect(file);
                  setReplaceVideoModalOpen(true);
                }
              }}
            />
          </TabsContent>

          {/* Poster Tab */}
          <TabsContent value="poster" className="space-y-4">
            {/* Poster Preview */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted border border-border">
              {posterUrl ? (
                <img
                  src={posterUrl}
                  alt="Video poster"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <ImageIcon className="h-12 w-12" />
                </div>
              )}
            </div>

            {/* Poster Info */}
            {posterInfo ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Taille:</span>
                  <span className="font-medium">{formatFileSize(posterInfo.fileSize)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Dimensions:</span>
                  <span className="font-medium">{posterInfo.width}×{posterInfo.height}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Fichier:</span>
                  <span className="font-medium truncate">{posterInfo.fileName}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Aucun poster configuré</p>
            )}

            {/* Poster Actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReplacePosterModalOpen(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Remplacer le poster
              </Button>
              {posterUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(posterUrl, posterInfo?.fileName || 'poster.webp')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </Button>
              )}
            </div>

            <input
              ref={posterInputRef}
              type="file"
              accept="image/webp,image/jpeg,image/png"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handlePosterFileSelect(file);
                  setReplacePosterModalOpen(true);
                }
              }}
            />
          </TabsContent>
        </Tabs>

        {/* Performance Tip */}
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-sm text-amber-600 dark:text-amber-400">
            <strong>Conseil performance:</strong> Pour améliorer le score PageSpeed, utilisez une vidéo optimisée 
            (max 5MB, codec H.264, 720p) et un poster WebP léger (~50KB).
          </p>
        </div>
      </CardContent>

      {/* Replace Video Modal */}
      <Dialog open={replaceVideoModalOpen} onOpenChange={setReplaceVideoModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Remplacer la vidéo</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {!uploadPreview ? (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragOver ? 'border-primary bg-primary/5' : 'border-border'
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleVideoDrop}
              >
                <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">
                  Glissez-déposez une vidéo ou
                </p>
                <Button
                  variant="outline"
                  onClick={() => videoInputRef.current?.click()}
                >
                  Choisir un fichier
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  MP4 ou WebM, max 50MB
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  <video
                    src={uploadPreview}
                    className="w-full h-full object-cover"
                    controls
                    playsInline
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">
                      {uploadFile?.name}
                    </span>
                    <span className="text-sm font-medium">
                      {formatFileSize(uploadFile?.size || 0)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setUploadFile(null);
                      setUploadPreview(null);
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Annuler
                  </Button>
                </div>
                
                {/* Info: fichier original préservé */}
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-sm text-green-600 dark:text-green-400">
                    ✓ La vidéo originale sera uploadée sans modification (son et taille préservés)
                  </p>
                </div>
              </div>
            )}

            {isUploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} />
                <p className="text-sm text-center text-muted-foreground">
                  Upload en cours... {uploadProgress}%
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setReplaceVideoModalOpen(false);
                setUploadFile(null);
                setUploadPreview(null);
              }}
              disabled={isUploading}
            >
              Annuler
            </Button>
            <Button
              onClick={handleVideoUpload}
              disabled={!uploadFile || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Upload...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Remplacer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Replace Poster Modal */}
      <Dialog open={replacePosterModalOpen} onOpenChange={setReplacePosterModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Remplacer le poster</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {!posterPreview ? (
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center border-border"
              >
                <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">
                  Glissez-déposez une image ou
                </p>
                <Button
                  variant="outline"
                  onClick={() => posterInputRef.current?.click()}
                >
                  Choisir un fichier
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  WebP, JPEG ou PNG, max 5MB
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  <img
                    src={posterPreview}
                    alt="Poster preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {posterFile?.name} ({formatFileSize(posterFile?.size || 0)})
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setPosterFile(null);
                      setPosterPreview(null);
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Annuler
                  </Button>
                </div>
              </div>
            )}

            {/* Processing options */}
            <div className="space-y-3 p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="compress-poster"
                  checked={autoCompress}
                  onCheckedChange={(checked) => setAutoCompress(!!checked)}
                />
                <Label htmlFor="compress-poster" className="text-sm cursor-pointer">
                  Compresser automatiquement (qualité 80%)
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="webp-poster"
                  checked={convertToWebP}
                  onCheckedChange={(checked) => setConvertToWebP(!!checked)}
                />
                <Label htmlFor="webp-poster" className="text-sm cursor-pointer">
                  Convertir en WebP (meilleure performance)
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setReplacePosterModalOpen(false);
                setPosterFile(null);
                setPosterPreview(null);
              }}
              disabled={isUploading}
            >
              Annuler
            </Button>
            <Button
              onClick={handlePosterUpload}
              disabled={!posterFile || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Upload...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Remplacer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Video Modal */}
      <Dialog open={viewVideoModalOpen} onOpenChange={setViewVideoModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Aperçu de la vidéo</DialogTitle>
          </DialogHeader>
          <div className="aspect-video rounded-lg overflow-hidden bg-black">
            <video
              src={videoUrl}
              poster={posterUrl}
              className="w-full h-full"
              controls
              playsInline
              controlsList="nodownload"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Êtes-vous sûr de vouloir supprimer la vidéo de la page Home ?
            Cette action est irréversible.
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteConfirmOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteVideo}>
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
