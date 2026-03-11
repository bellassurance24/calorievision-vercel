import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Image, 
  Upload, 
  RefreshCw, 
  Scissors, 
  Package, 
  Trash2, 
  Eye, 
  Download,
  Check,
  X,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import imageCompression from 'browser-image-compression';

interface FeaturedImageEditorProps {
  imageUrl: string;
  altText: string;
  onImageChange: (url: string) => void;
  onAltTextChange: (alt: string) => void;
}

interface ImageInfo {
  fileName: string;
  fileSize: number;
  width: number;
  height: number;
  isOptimized: boolean;
}

export function FeaturedImageEditor({
  imageUrl,
  altText,
  onImageChange,
  onAltTextChange,
}: FeaturedImageEditorProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  
  // Modal states
  const [replaceModalOpen, setReplaceModalOpen] = useState(false);
  const [compressModalOpen, setCompressModalOpen] = useState(false);
  const [resizeModalOpen, setResizeModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  
  // Replace modal state
  const [dragOver, setDragOver] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [autoCompress, setAutoCompress] = useState(true);
  const [convertToWebP, setConvertToWebP] = useState(true);
  const [maxWidth, setMaxWidth] = useState(false);
  const [maxWidthValue, setMaxWidthValue] = useState(1200);
  const [isUploading, setIsUploading] = useState(false);
  const [compressionStatus, setCompressionStatus] = useState<'idle' | 'compressing' | 'done'>('idle');
  const [compressionResult, setCompressionResult] = useState<{ originalSize: number; compressedSize: number } | null>(null);
  const [uploadQuality, setUploadQuality] = useState<'high' | 'medium' | 'low'>('medium');
  
  // Compress modal state
  const [compressQuality, setCompressQuality] = useState<60 | 70 | 80 | 90>(70);
  const [compressPreview, setCompressPreview] = useState<string | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [compressionEstimates, setCompressionEstimates] = useState<Record<number, number>>({});
  const [isCompressing, setIsCompressing] = useState(false);
  const [isGeneratingEstimates, setIsGeneratingEstimates] = useState(false);
  
  // Resize modal state
  const [resizePreset, setResizePreset] = useState<'medium' | 'large' | 'xlarge' | 'custom'>('medium');
  const [customWidth, setCustomWidth] = useState(800);
  const [customHeight, setCustomHeight] = useState(450);
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [resizePreview, setResizePreview] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState(false);

  const loadImageBlob = useCallback(async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch image');

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    const img = document.createElement('img');
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = objectUrl;
    });

    return { img, blob, objectUrl };
  }, []);

  // Load image info when URL changes
  const loadImageInfo = useCallback(async () => {
    if (!imageUrl) {
      setImageInfo(null);
      return;
    }

    setIsLoadingInfo(true);
    try {
      const { img, blob, objectUrl } = await loadImageBlob(imageUrl);
      try {
        const fileName = decodeURIComponent((imageUrl.split('/').pop() || 'image').split('?')[0]);
        const isOptimized = fileName.toLowerCase().endsWith('.webp') || blob.size < 100 * 1024;

        setImageInfo({
          fileName,
          fileSize: blob.size,
          width: img.naturalWidth,
          height: img.naturalHeight,
          isOptimized,
        });
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    } catch (error) {
      console.error('Error loading image info:', error);
      setImageInfo(null);
    } finally {
      setIsLoadingInfo(false);
    }
  }, [imageUrl, loadImageBlob]);

  // Load info when component mounts or URL changes
  useEffect(() => {
    loadImageInfo();
  }, [imageUrl, loadImageInfo]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Handle file drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
      setReplaceModalOpen(true);
    }
  };

  const handleFileSelect = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 5MB',
        variant: 'destructive',
      });
      return;
    }
    setUploadFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadReplace = async () => {
    if (!uploadFile) return;

    setIsUploading(true);
    setCompressionStatus('idle');
    setCompressionResult(null);
    
    try {
      const originalSize = uploadFile.size;
      let processedFile = uploadFile;

      // Compression based on selected quality
      setCompressionStatus('compressing');
      
      const qualitySettings = {
        high: { maxSizeMB: 0.08, maxWidthOrHeight: 1200, initialQuality: 0.8, label: '80 KB' },
        medium: { maxSizeMB: 0.05, maxWidthOrHeight: 1000, initialQuality: 0.6, label: '50 KB' },
        low: { maxSizeMB: 0.025, maxWidthOrHeight: 800, initialQuality: 0.4, label: '25 KB' },
      };
      
      const settings = qualitySettings[uploadQuality];
      
      const compressionOptions = {
        maxSizeMB: settings.maxSizeMB,
        maxWidthOrHeight: settings.maxWidthOrHeight,
        useWebWorker: true,
        fileType: 'image/webp' as const,
        initialQuality: settings.initialQuality,
      };

      try {
        processedFile = await imageCompression(uploadFile, compressionOptions);
        console.log('Compressed size:', processedFile.size / 1024, 'KB');
        
        // Convert to webp file with proper extension
        const webpBlob = new Blob([processedFile], { type: 'image/webp' });
        processedFile = new File([webpBlob], `image-${Date.now()}.webp`, { type: 'image/webp' });
        
        setCompressionStatus('done');
        setCompressionResult({
          originalSize,
          compressedSize: processedFile.size,
        });
      } catch (compressError) {
        console.warn('Compression failed, using canvas fallback:', compressError);
        
        // Fallback to canvas-based processing with aggressive compression
        const img = document.createElement('img');
        await new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.src = uploadPreview!;
        });

        const canvas = document.createElement('canvas');
        let targetWidth = img.naturalWidth;
        let targetHeight = img.naturalHeight;

        // Max width based on quality setting
        const maxWidth = qualitySettings[uploadQuality].maxWidthOrHeight;
        if (targetWidth > maxWidth) {
          const ratio = maxWidth / targetWidth;
          targetWidth = maxWidth;
          targetHeight = Math.round(targetHeight * ratio);
        }

        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        // Use quality based on selection
        const dataUrl = canvas.toDataURL('image/webp', settings.initialQuality);
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        processedFile = new File([blob], `image-${Date.now()}.webp`, { type: 'image/webp' });
        console.log('Fallback compressed size:', processedFile.size / 1024, 'KB');
        
        setCompressionStatus('done');
        setCompressionResult({
          originalSize,
          compressedSize: processedFile.size,
        });
      }

      // Upload to Supabase Storage
      const fileName = `featured-${Date.now()}.webp`;
      const { data, error } = await supabase.storage
        .from('blog-images')
        .upload(fileName, processedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      const { data: publicUrl } = supabase.storage
        .from('blog-images')
        .getPublicUrl(data.path);

      onImageChange(publicUrl.publicUrl);
      setReplaceModalOpen(false);
      setUploadFile(null);
      setUploadPreview(null);
      
      const compressedSizeKB = (processedFile.size / 1024).toFixed(1);
      toast({
        title: 'Image uploaded',
        description: `Compressed to ${compressedSizeKB} KB and saved`,
      });

      // Reload image info
      setTimeout(loadImageInfo, 500);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      // Reset compression status after a delay
      setTimeout(() => {
        setCompressionStatus('idle');
        setCompressionResult(null);
      }, 3000);
    }
  };

  // Generate all compression estimates when modal opens
  const generateCompressionEstimates = useCallback(async () => {
    if (!imageUrl) return;

    setIsGeneratingEstimates(true);
    try {
      const { img, objectUrl } = await loadImageBlob(imageUrl);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);

        const estimates: Record<number, number> = {};
        for (const q of [60, 70, 80, 90]) {
          const dataUrl = canvas.toDataURL('image/webp', q / 100);
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          estimates[q] = blob.size;
        }
        setCompressionEstimates(estimates);
        
        // Auto-generate preview for selected quality
        const selectedDataUrl = canvas.toDataURL('image/webp', compressQuality / 100);
        const selectedResponse = await fetch(selectedDataUrl);
        const selectedBlob = await selectedResponse.blob();
        setCompressedSize(selectedBlob.size);
        setCompressPreview(selectedDataUrl);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    } catch (error) {
      console.error('Compression estimates error:', error);
    } finally {
      setIsGeneratingEstimates(false);
    }
  }, [imageUrl, compressQuality, loadImageBlob]);

  const handleCompress = useCallback(async (quality: 60 | 70 | 80 | 90) => {
    if (!imageUrl) return;

    setIsCompressing(true);
    try {
      const { img, objectUrl } = await loadImageBlob(imageUrl);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);

        const dataUrl = canvas.toDataURL('image/webp', quality / 100);
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        setCompressedSize(blob.size);
        setCompressPreview(dataUrl);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    } catch (error) {
      console.error('Compression preview error:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate compression preview',
        variant: 'destructive',
      });
    } finally {
      setIsCompressing(false);
    }
  }, [imageUrl, loadImageBlob, toast]);

  const applyCompression = async () => {
    if (!compressPreview) return;

    setIsCompressing(true);
    try {
      const response = await fetch(compressPreview);
      const blob = await response.blob();
      const file = new File([blob], `compressed-${Date.now()}.webp`, { type: 'image/webp' });

      const { data, error } = await supabase.storage
        .from('blog-images')
        .upload(file.name, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      const { data: publicUrl } = supabase.storage
        .from('blog-images')
        .getPublicUrl(data.path);

      onImageChange(publicUrl.publicUrl);
      setCompressModalOpen(false);
      setCompressPreview(null);
      setCompressedSize(null);
      
      toast({
        title: 'Image compressed',
        description: 'Image has been compressed and saved',
      });

      setTimeout(loadImageInfo, 500);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save compressed image',
        variant: 'destructive',
      });
    } finally {
      setIsCompressing(false);
    }
  };

  const getResizeWidth = (): number => {
    switch (resizePreset) {
      case 'medium': return 800;
      case 'large': return 1200;
      case 'xlarge': return 1600;
      case 'custom': return customWidth;
    }
  };

  const handleResize = async () => {
    if (!imageUrl || !imageInfo) return;

    setIsResizing(true);
    try {
      const { img, objectUrl } = await loadImageBlob(imageUrl);
      try {
        const targetWidth = getResizeWidth();
        let targetHeight = customHeight;

        if (maintainAspect) {
          const ratio = img.naturalHeight / img.naturalWidth;
          targetHeight = Math.round(targetWidth * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        const dataUrl = canvas.toDataURL('image/webp', 0.85);
        setResizePreview(dataUrl);

        if (maintainAspect) {
          setCustomHeight(targetHeight);
        }
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    } catch (error) {
      console.error('Resize preview error:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate resize preview',
        variant: 'destructive',
      });
    } finally {
      setIsResizing(false);
    }
  };

  const applyResize = async () => {
    if (!resizePreview) return;

    setIsResizing(true);
    try {
      const response = await fetch(resizePreview);
      const blob = await response.blob();
      const file = new File([blob], `resized-${Date.now()}.webp`, { type: 'image/webp' });

      const { data, error } = await supabase.storage
        .from('blog-images')
        .upload(file.name, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      const { data: publicUrl } = supabase.storage
        .from('blog-images')
        .getPublicUrl(data.path);

      onImageChange(publicUrl.publicUrl);
      setResizeModalOpen(false);
      setResizePreview(null);
      
      toast({
        title: 'Image resized',
        description: 'Image has been resized and saved',
      });

      setTimeout(loadImageInfo, 500);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save resized image',
        variant: 'destructive',
      });
    } finally {
      setIsResizing(false);
    }
  };

  const handleRemove = () => {
    if (confirm('Are you sure you want to remove the featured image?')) {
      onImageChange('');
      setImageInfo(null);
      toast({
        title: 'Image removed',
        description: 'Featured image has been removed',
      });
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = imageInfo?.fileName || 'featured-image';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card/50 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image className="h-4 w-4 text-primary" />
          <Label className="font-semibold">Featured Image</Label>
        </div>
        <a 
          href="/admin/media" 
          target="_blank" 
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          Manage all media <ExternalLink className="h-3 w-3" />
        </a>
       </div>

      {/* Shared file input (used by upload zone + replace modal) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onClick={(e) => {
          (e.currentTarget as HTMLInputElement).value = '';
        }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleFileSelect(file);
            setReplaceModalOpen(true);
          }
        }}
      />

      {/* Image Preview or Upload Zone */}
      {imageUrl ? (
        <div 
          className="relative group"
          onMouseEnter={() => setShowToolbar(true)}
          onMouseLeave={() => setShowToolbar(false)}
        >
          {/* Image Preview */}
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted">
            <img
              src={imageUrl}
              alt={altText || 'Featured image'}
              className="w-full h-full object-cover"
              onLoad={loadImageInfo}
            />
            
            {/* Floating Toolbar */}
            <div 
              className={`absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-lg bg-background/90 backdrop-blur-sm border border-border p-1 shadow-lg transition-opacity duration-200 ${
                showToolbar ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Button 
                type="button"
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => setReplaceModalOpen(true)}
                title="Replace image"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button 
                type="button"
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => {
                  setResizeModalOpen(true);
                  if (imageInfo) {
                    setCustomWidth(imageInfo.width);
                    setCustomHeight(imageInfo.height);
                  }
                }}
                title="Resize image"
              >
                <Scissors className="h-4 w-4" />
              </Button>
              <Button 
                type="button"
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => setCompressModalOpen(true)}
                title="Compress image"
              >
                <Package className="h-4 w-4" />
              </Button>
              <Button 
                type="button"
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => setViewModalOpen(true)}
                title="View full size"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button 
                type="button"
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={handleDownload}
                title="Download image"
              >
                <Download className="h-4 w-4" />
              </Button>
              <div className="w-px h-5 bg-border mx-1" />
              <Button 
                type="button"
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                onClick={handleRemove}
                title="Remove image"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Image Info */}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {isLoadingInfo ? (
              <span className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading info...
              </span>
            ) : imageInfo ? (
              <>
                <span className="font-medium text-foreground">{imageInfo.fileName}</span>
                <span>|</span>
                <span>{formatFileSize(imageInfo.fileSize)}</span>
                <span>|</span>
                <span>{imageInfo.width}×{imageInfo.height}</span>
                <span>|</span>
                <span className={`flex items-center gap-1 ${imageInfo.isOptimized ? 'text-green-600' : 'text-amber-600'}`}>
                  {imageInfo.isOptimized ? (
                    <>
                      <Check className="h-3 w-3" />
                      Optimized
                    </>
                  ) : (
                    'Not optimized'
                  )}
                </span>
              </>
            ) : null}
           </div>

           {/* Action Buttons (always visible) */}
           <div className="mt-3 flex flex-wrap gap-2">
             <Button type="button" variant="outline" size="sm" onClick={() => setReplaceModalOpen(true)}>
               <RefreshCw className="mr-2 h-4 w-4" />
               Replace
             </Button>
             <Button
               type="button"
               variant="outline"
               size="sm"
               onClick={() => {
                 setResizeModalOpen(true);
                 if (imageInfo) {
                   setCustomWidth(imageInfo.width);
                   setCustomHeight(imageInfo.height);
                 }
               }}
             >
               <Scissors className="mr-2 h-4 w-4" />
               Resize
             </Button>
             <Button type="button" variant="outline" size="sm" onClick={() => setCompressModalOpen(true)}>
               <Package className="mr-2 h-4 w-4" />
               Compress
             </Button>
             <Button type="button" variant="destructive" size="sm" onClick={handleRemove}>
               <Trash2 className="mr-2 h-4 w-4" />
               Remove
             </Button>
           </div>
         </div>
      ) : (
        <div
          className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer ${
            dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div className="text-center">
            <p className="text-sm text-foreground">Drag & drop image here or click to browse</p>
            <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP (Max 5MB)</p>
          </div>
        </div>
      )}

      {/* Alt Text Input */}
      <div className="space-y-1">
        <Label htmlFor="alt-text" className="text-xs text-muted-foreground">
          Alt Text (SEO & Accessibility)
        </Label>
        <Input
          id="alt-text"
          value={altText}
          onChange={(e) => onAltTextChange(e.target.value)}
          placeholder="Describe the image for SEO and accessibility..."
          className="text-sm"
        />
      </div>

      {/* Replace Image Modal */}
      <Dialog open={replaceModalOpen} onOpenChange={(open) => {
        setReplaceModalOpen(open);
        if (!open) {
          setUploadFile(null);
          setUploadPreview(null);
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Replace Featured Image</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Drop Zone */}
            <div
              className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer ${
                dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadPreview ? (
                <img src={uploadPreview} alt="Preview" className="max-h-48 rounded-lg" />
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-sm text-foreground">Drag & drop image here or click to browse</p>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP (Max 5MB)</p>
                  </div>
                </>
              )}
            </div>

            {/* Quality Selector */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Compression Quality</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'high', label: 'High Quality', size: '~80 KB', desc: 'Best for featured images' },
                  { id: 'medium', label: 'Medium Quality', size: '~50 KB', desc: 'Recommended' },
                  { id: 'low', label: 'Low Quality', size: '~25 KB', desc: 'For thumbnails' },
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setUploadQuality(option.id as 'high' | 'medium' | 'low')}
                    className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all text-center ${
                      uploadQuality === option.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <span className="font-medium text-sm">{option.label}</span>
                    <span className="text-xs text-primary font-semibold">{option.size}</span>
                    <span className="text-xs text-muted-foreground mt-1">{option.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Compression Status */}
            {compressionStatus !== 'idle' && (
              <div className={`flex items-center gap-2 rounded-lg p-3 text-sm ${
                compressionStatus === 'compressing' 
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' 
                  : 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
              }`}>
                {compressionStatus === 'compressing' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Compressing image...</span>
                  </>
                ) : compressionResult ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>
                      ✓ Compressed: {(compressionResult.originalSize / 1024).toFixed(0)} KB → {(compressionResult.compressedSize / 1024).toFixed(1)} KB
                    </span>
                  </>
                ) : null}
              </div>
            )}

            {/* Max Width Option */}
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="max-width" 
                checked={maxWidth} 
                onCheckedChange={(checked) => setMaxWidth(!!checked)}
              />
              <label htmlFor="max-width" className="text-sm cursor-pointer">
                Override max width to {maxWidthValue}px
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setReplaceModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUploadReplace} disabled={!uploadFile || isUploading}>
                {isUploading ? (
                  compressionStatus === 'compressing' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Compressing...
                    </>
                  ) : (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  )
                ) : (
                  'Upload & Compress'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Compress Image Modal */}
      <Dialog open={compressModalOpen} onOpenChange={(open) => {
        setCompressModalOpen(open);
        if (open) {
          // Generate estimates when modal opens
          generateCompressionEstimates();
        } else {
          setCompressPreview(null);
          setCompressedSize(null);
          setCompressionEstimates({});
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Compress Image</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Current info */}
            <div className="text-sm text-muted-foreground">
              Current: {imageInfo?.fileName} ({formatFileSize(imageInfo?.fileSize || 0)})
            </div>

            {/* Before/After Preview */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Before</p>
                <div className="aspect-video rounded-lg border border-border overflow-hidden bg-muted">
                  <img src={imageUrl} alt="Before" className="w-full h-full object-cover" />
                </div>
                <p className="text-xs text-center font-medium">{formatFileSize(imageInfo?.fileSize || 0)}</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">After Preview</p>
                <div className="aspect-video rounded-lg border border-border overflow-hidden bg-muted relative">
                  {isGeneratingEstimates || isCompressing ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : compressPreview ? (
                    <img src={compressPreview} alt="After" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                      Generating preview...
                    </div>
                  )}
                </div>
                <p className="text-xs text-center font-medium text-green-600">
                  {compressedSize ? formatFileSize(compressedSize) : '—'}
                </p>
              </div>
            </div>

            {/* Compression Level */}
            <div className="space-y-2">
              <Label className="text-sm">Compression Level</Label>
              <RadioGroup
                value={String(compressQuality)}
                onValueChange={(val) => {
                  const quality = parseInt(val, 10) as 60 | 70 | 80 | 90;
                  setCompressQuality(quality);
                  handleCompress(quality);
                }}
                className="grid gap-2"
              >
                {[
                  { q: 90 as const, label: 'Low', desc: '90% quality', recommended: false },
                  { q: 80 as const, label: 'Medium', desc: '80% quality', recommended: false },
                  { q: 70 as const, label: 'High', desc: '70% quality', recommended: true },
                  { q: 60 as const, label: 'Maximum', desc: '60% quality', recommended: false },
                ].map((opt) => (
                  <div 
                    key={opt.q} 
                    className={`flex items-center space-x-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                      compressQuality === opt.q 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:bg-muted/40'
                    }`}
                    onClick={() => {
                      setCompressQuality(opt.q);
                      handleCompress(opt.q);
                    }}
                  >
                    <RadioGroupItem value={String(opt.q)} id={`compress-${opt.q}`} />
                    <label htmlFor={`compress-${opt.q}`} className="flex-1 cursor-pointer text-sm">
                      <span className="font-medium">{opt.label}</span>
                      <span className="text-muted-foreground ml-1">({opt.desc})</span>
                      {opt.recommended && (
                        <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-primary/10 text-primary rounded">Recommended</span>
                      )}
                    </label>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {isGeneratingEstimates ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : compressionEstimates[opt.q] ? (
                        formatFileSize(compressionEstimates[opt.q])
                      ) : '—'}
                    </span>
                  </div>
                ))}
              </RadioGroup>

              {compressedSize && imageInfo?.fileSize && compressedSize < imageInfo.fileSize ? (
                <div className="flex items-center gap-2 mt-3 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700 dark:text-green-400">
                    Savings: {formatFileSize(imageInfo.fileSize - compressedSize)} ({Math.round((1 - compressedSize / imageInfo.fileSize) * 100)}% smaller)
                  </span>
                </div>
              ) : null}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCompressModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={applyCompression} disabled={!compressPreview || isCompressing}>
                {isCompressing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Applying...
                  </>
                ) : (
                  'Apply Compression'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Resize Image Modal */}
      <Dialog open={resizeModalOpen} onOpenChange={(open) => {
        setResizeModalOpen(open);
        if (!open) {
          setResizePreview(null);
        } else if (imageUrl && imageInfo) {
          // Auto-generate preview when modal opens
          setTimeout(() => handleResize(), 100);
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Resize Image</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Current dimensions */}
            <div className="text-sm text-muted-foreground">
              Current dimensions: {imageInfo?.width} × {imageInfo?.height} pixels
            </div>

            {/* Presets */}
            <div className="space-y-2">
              <Label className="text-sm">Preset sizes:</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'medium', label: 'Medium (800px)', width: 800, recommended: true },
                  { id: 'large', label: 'Large (1200px)', width: 1200 },
                  { id: 'xlarge', label: 'XL (1600px)', width: 1600 },
                  { id: 'custom', label: 'Custom', width: customWidth },
                ].map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    className={`p-2 rounded-lg border text-left text-sm transition-colors ${
                      resizePreset === preset.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => {
                      setResizePreset(preset.id as typeof resizePreset);
                      setResizePreview(null); // Clear preview to trigger regeneration
                    }}
                  >
                    <span className="font-medium">{preset.label}</span>
                    {preset.recommended && (
                      <span className="block text-xs text-muted-foreground">Recommended for blog</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom dimensions */}
            {resizePreset === 'custom' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">Width (px)</Label>
                  <Input
                    type="number"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(parseInt(e.target.value) || 0)}
                    min={100}
                    max={4000}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Height (px)</Label>
                  <Input
                    type="number"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(parseInt(e.target.value) || 0)}
                    min={100}
                    max={4000}
                    disabled={maintainAspect}
                  />
                </div>
              </div>
            )}

            {/* Maintain aspect ratio */}
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="maintain-aspect" 
                checked={maintainAspect} 
                onCheckedChange={(checked) => setMaintainAspect(!!checked)}
              />
              <label htmlFor="maintain-aspect" className="text-sm cursor-pointer">
                Maintain aspect ratio
              </label>
            </div>

            {/* Preview */}
            {resizePreview && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Preview</p>
                <div className="rounded-lg border border-border overflow-hidden bg-muted p-4 flex justify-center">
                  <img src={resizePreview} alt="Resize preview" className="max-h-48 rounded" />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setResizeModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="outline" onClick={() => handleResize()} disabled={isResizing}>
                {isResizing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Preview'}
              </Button>
              <Button onClick={applyResize} disabled={!resizePreview || isResizing}>
                {isResizing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resizing...
                  </>
                ) : (
                  'Apply Resize'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Full Size Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Featured Image - Full Size</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <img 
              src={imageUrl} 
              alt={altText || 'Featured image'} 
              className="max-h-[70vh] rounded-lg"
            />
          </div>
          {imageInfo && (
            <div className="text-center text-sm text-muted-foreground">
              {imageInfo.fileName} | {formatFileSize(imageInfo.fileSize)} | {imageInfo.width}×{imageInfo.height}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
