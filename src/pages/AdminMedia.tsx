import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AdminLayout from "@/components/layout/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Image,
  Upload,
  Trash2,
  Download,
  RefreshCw,
  Maximize2,
  Replace,
  Minimize2,
  CheckSquare,
  Square,
  Loader2,
  HardDrive,
  AlertTriangle,
  Zap,
  FileImage,
  X,
  Eye,
  Settings2,
} from "lucide-react";

interface BlogImage {
  id: string;
  storage_path: string;
  original_name: string;
  file_size: number;
  width: number | null;
  height: number | null;
  mime_type: string;
  is_optimized: boolean;
  blog_post_id: string | null;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
  url?: string;
  blog_post?: { title: string; slug: string } | null;
}

interface UploadOptions {
  autoCompress: boolean;
  autoWebP: boolean;
  maxWidth: number;
  quality: number;
}

export default function AdminMedia() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [images, setImages] = useState<BlogImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "size" | "name">("date");
  const [filterOptimized, setFilterOptimized] = useState<"all" | "optimized" | "not-optimized">("all");

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadOptions, setUploadOptions] = useState<UploadOptions>({
    autoCompress: true,
    autoWebP: true,
    maxWidth: 1200,
    quality: 80,
  });

  // Modal states
  const [viewImage, setViewImage] = useState<BlogImage | null>(null);
  const [replaceImage, setReplaceImage] = useState<BlogImage | null>(null);
  const [compressImage, setCompressImage] = useState<BlogImage | null>(null);
  const [resizeImage, setResizeImage] = useState<BlogImage | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<BlogImage | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  // Processing state
  const [processing, setProcessing] = useState(false);
  const [compressQuality, setCompressQuality] = useState(75);
  const [resizeDimensions, setResizeDimensions] = useState({ width: 800, height: 0, maintainAspectRatio: true });
  
  // Stats
  const [totalSize, setTotalSize] = useState(0);
  const [largestImages, setLargestImages] = useState<BlogImage[]>([]);
  const [nonWebpImages, setNonWebpImages] = useState<BlogImage[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (!authLoading && user && !isAdmin) {
      navigate("/");
    }
  }, [user, isAdmin, authLoading, navigate]);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch images with blog post info
      const { data, error } = await supabase
        .from("blog_images")
        .select(`
          *,
          blog_post:blog_posts(title, slug)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Add public URLs
      const imagesWithUrls = (data || []).map((img: BlogImage) => {
        const { data: urlData } = supabase.storage
          .from("blog-images")
          .getPublicUrl(img.storage_path);
        return { ...img, url: urlData.publicUrl };
      });

      setImages(imagesWithUrls);

      // Calculate stats
      const total = imagesWithUrls.reduce((sum, img) => sum + (img.file_size || 0), 0);
      setTotalSize(total);
      
      const sorted = [...imagesWithUrls].sort((a, b) => (b.file_size || 0) - (a.file_size || 0));
      setLargestImages(sorted.slice(0, 5));
      
      const nonWebp = imagesWithUrls.filter(img => img.mime_type !== "image/webp");
      setNonWebpImages(nonWebp);
    } catch (error) {
      console.error("Error fetching images:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les images",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchImages();
    }
  }, [user, isAdmin, fetchImages]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const totalFiles = files.length;
      let processedFiles = 0;

      for (const file of Array.from(files)) {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          toast({
            title: "Fichier ignoré",
            description: `${file.name} n'est pas une image`,
            variant: "destructive",
          });
          continue;
        }

        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "Fichier trop volumineux",
            description: `${file.name} dépasse 10MB`,
            variant: "destructive",
          });
          continue;
        }

        // Process image if options are enabled
        let processedFile = file;
        let finalMimeType = file.type;
        
        if (uploadOptions.autoCompress || uploadOptions.autoWebP || uploadOptions.maxWidth < 9999) {
          const processed = await processImageClient(file, {
            quality: uploadOptions.quality / 100,
            maxWidth: uploadOptions.maxWidth,
            convertToWebP: uploadOptions.autoWebP,
          });
          processedFile = processed.file;
          finalMimeType = processed.mimeType;
        }

        // Generate unique path
        const ext = uploadOptions.autoWebP ? "webp" : file.name.split(".").pop();
        const path = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from("blog-images")
          .upload(path, processedFile, {
            contentType: finalMimeType,
          });

        if (uploadError) throw uploadError;

        // Get dimensions
        const dimensions = await getImageDimensions(processedFile);

        // Save metadata
        const { error: metaError } = await supabase
          .from("blog_images")
          .insert({
            storage_path: path,
            original_name: file.name,
            file_size: processedFile.size,
            width: dimensions?.width || null,
            height: dimensions?.height || null,
            mime_type: finalMimeType,
            is_optimized: uploadOptions.autoCompress || uploadOptions.autoWebP,
            uploaded_by: user!.id,
          });

        if (metaError) throw metaError;

        processedFiles++;
        setUploadProgress((processedFiles / totalFiles) * 100);
      }

      toast({
        title: "Upload réussi",
        description: `${processedFiles} image(s) uploadée(s)`,
      });

      fetchImages();
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Erreur d'upload",
        description: "Une erreur est survenue lors de l'upload",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset input
      event.target.value = "";
    }
  };

  const processImageClient = async (
    file: File,
    options: { quality: number; maxWidth: number; convertToWebP: boolean }
  ): Promise<{ file: File; mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement("img");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      img.onload = () => {
        let { width, height } = img;

        // Resize if needed
        if (width > options.maxWidth) {
          height = (height * options.maxWidth) / width;
          width = options.maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        const mimeType = options.convertToWebP ? "image/webp" : file.type;
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const newFile = new File([blob], file.name.replace(/\.[^.]+$/, options.convertToWebP ? ".webp" : ""), {
                type: mimeType,
              });
              resolve({ file: newFile, mimeType });
            } else {
              reject(new Error("Failed to process image"));
            }
          },
          mimeType,
          options.quality
        );
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = URL.createObjectURL(file);
    });
  };

  const getImageDimensions = (file: File): Promise<{ width: number; height: number } | null> => {
    return new Promise((resolve) => {
      const img = document.createElement("img");
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => resolve(null);
      img.src = URL.createObjectURL(file);
    });
  };

  const handleDelete = async (image: BlogImage) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("blog-images")
        .remove([image.storage_path]);

      if (storageError) throw storageError;

      // Delete metadata
      const { error: metaError } = await supabase
        .from("blog_images")
        .delete()
        .eq("id", image.id);

      if (metaError) throw metaError;

      toast({
        title: "Image supprimée",
        description: `${image.original_name} a été supprimée`,
      });

      setDeleteConfirm(null);
      fetchImages();
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'image",
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedImages.size === 0) return;

    try {
      const imagesToDelete = images.filter((img) => selectedImages.has(img.id));
      const paths = imagesToDelete.map((img) => img.storage_path);

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("blog-images")
        .remove(paths);

      if (storageError) throw storageError;

      // Delete metadata
      const { error: metaError } = await supabase
        .from("blog_images")
        .delete()
        .in("id", Array.from(selectedImages));

      if (metaError) throw metaError;

      toast({
        title: "Images supprimées",
        description: `${selectedImages.size} image(s) supprimée(s)`,
      });

      setSelectedImages(new Set());
      setBulkDeleteConfirm(false);
      fetchImages();
    } catch (error) {
      console.error("Bulk delete error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer les images",
        variant: "destructive",
      });
    }
  };

  const handleReplace = async (originalImage: BlogImage, newFile: File) => {
    setProcessing(true);
    try {
      // Process new file with same options
      const processed = await processImageClient(newFile, {
        quality: 0.8,
        maxWidth: 1200,
        convertToWebP: originalImage.mime_type === "image/webp",
      });

      // Upload with same path (overwrite)
      const { error: uploadError } = await supabase.storage
        .from("blog-images")
        .upload(originalImage.storage_path, processed.file, {
          contentType: processed.mimeType,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get new dimensions
      const dimensions = await getImageDimensions(processed.file);

      // Update metadata
      const { error: metaError } = await supabase
        .from("blog_images")
        .update({
          file_size: processed.file.size,
          width: dimensions?.width || null,
          height: dimensions?.height || null,
          mime_type: processed.mimeType,
          updated_at: new Date().toISOString(),
        })
        .eq("id", originalImage.id);

      if (metaError) throw metaError;

      toast({
        title: "Image remplacée",
        description: "L'image a été remplacée avec succès",
      });

      setReplaceImage(null);
      fetchImages();
    } catch (error) {
      console.error("Replace error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de remplacer l'image",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleCompress = async (image: BlogImage) => {
    setProcessing(true);
    try {
      // Download current image
      const { data: fileData, error: downloadError } = await supabase.storage
        .from("blog-images")
        .download(image.storage_path);

      if (downloadError) throw downloadError;

      // Process with compression
      const file = new File([fileData], image.original_name, { type: image.mime_type });
      const processed = await processImageClient(file, {
        quality: compressQuality / 100,
        maxWidth: image.width || 9999,
        convertToWebP: false,
      });

      // Upload with same path
      const { error: uploadError } = await supabase.storage
        .from("blog-images")
        .upload(image.storage_path, processed.file, {
          contentType: processed.mimeType,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Update metadata
      const { error: metaError } = await supabase
        .from("blog_images")
        .update({
          file_size: processed.file.size,
          is_optimized: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", image.id);

      if (metaError) throw metaError;

      const savings = image.file_size - processed.file.size;
      const savingsPercent = ((savings / image.file_size) * 100).toFixed(1);

      toast({
        title: "Image compressée",
        description: `Économie de ${formatFileSize(savings)} (${savingsPercent}%)`,
      });

      setCompressImage(null);
      fetchImages();
    } catch (error) {
      console.error("Compress error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de compresser l'image",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleResize = async (image: BlogImage) => {
    setProcessing(true);
    try {
      // Download current image
      const { data: fileData, error: downloadError } = await supabase.storage
        .from("blog-images")
        .download(image.storage_path);

      if (downloadError) throw downloadError;

      // Process with resize
      const file = new File([fileData], image.original_name, { type: image.mime_type });
      const processed = await processImageClient(file, {
        quality: 0.9,
        maxWidth: resizeDimensions.width,
        convertToWebP: false,
      });

      // Get new dimensions
      const newDimensions = await getImageDimensions(processed.file);

      // Upload with same path
      const { error: uploadError } = await supabase.storage
        .from("blog-images")
        .upload(image.storage_path, processed.file, {
          contentType: processed.mimeType,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Update metadata
      const { error: metaError } = await supabase
        .from("blog_images")
        .update({
          file_size: processed.file.size,
          width: newDimensions?.width || null,
          height: newDimensions?.height || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", image.id);

      if (metaError) throw metaError;

      toast({
        title: "Image redimensionnée",
        description: `Nouvelles dimensions: ${newDimensions?.width}x${newDimensions?.height}`,
      });

      setResizeImage(null);
      fetchImages();
    } catch (error) {
      console.error("Resize error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de redimensionner l'image",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = (image: BlogImage) => {
    if (image.url) {
      const link = document.createElement("a");
      link.href = image.url;
      link.download = image.original_name;
      link.click();
    }
  };

  const handleConvertToWebP = async (image: BlogImage) => {
    setProcessing(true);
    try {
      // Download current image
      const { data: fileData, error: downloadError } = await supabase.storage
        .from("blog-images")
        .download(image.storage_path);

      if (downloadError) throw downloadError;

      // Process and convert to WebP
      const file = new File([fileData], image.original_name, { type: image.mime_type });
      const processed = await processImageClient(file, {
        quality: 0.85,
        maxWidth: image.width || 9999,
        convertToWebP: true,
      });

      // Generate new path with .webp extension
      const newPath = image.storage_path.replace(/\.[^.]+$/, ".webp");

      // Upload new WebP version
      const { error: uploadError } = await supabase.storage
        .from("blog-images")
        .upload(newPath, processed.file, {
          contentType: "image/webp",
        });

      if (uploadError) throw uploadError;

      // Delete old file if path changed
      if (newPath !== image.storage_path) {
        await supabase.storage.from("blog-images").remove([image.storage_path]);
      }

      // Update metadata
      const { error: metaError } = await supabase
        .from("blog_images")
        .update({
          storage_path: newPath,
          file_size: processed.file.size,
          mime_type: "image/webp",
          is_optimized: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", image.id);

      if (metaError) throw metaError;

      const savings = image.file_size - processed.file.size;
      toast({
        title: "Converti en WebP",
        description: `Économie de ${formatFileSize(savings)}`,
      });

      fetchImages();
    } catch (error) {
      console.error("Convert error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de convertir l'image",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleOptimizeAll = async () => {
    if (nonWebpImages.length === 0) {
      toast({
        title: "Rien à optimiser",
        description: "Toutes les images sont déjà au format WebP",
      });
      return;
    }

    setProcessing(true);
    let processed = 0;

    for (const image of nonWebpImages) {
      try {
        await handleConvertToWebP(image);
        processed++;
      } catch (error) {
        console.error("Error optimizing image:", error);
      }
    }

    toast({
      title: "Optimisation terminée",
      description: `${processed}/${nonWebpImages.length} images converties`,
    });

    setProcessing(false);
    fetchImages();
  };

  const toggleSelectImage = (id: string) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedImages(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedImages.size === filteredImages.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(filteredImages.map((img) => img.id)));
    }
  };

  // Filter and sort images
  const filteredImages = images
    .filter((img) => {
      const matchesSearch = img.original_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter =
        filterOptimized === "all" ||
        (filterOptimized === "optimized" && img.is_optimized) ||
        (filterOptimized === "not-optimized" && !img.is_optimized);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "size":
          return (b.file_size || 0) - (a.file_size || 0);
        case "name":
          return a.original_name.localeCompare(b.original_name);
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  if (authLoading || loading) {
    return (
      <AdminLayout forceDark>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <AdminLayout forceDark>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestionnaire de Médias</h1>
            <p className="text-muted-foreground">Gérez toutes les images du blog</p>
          </div>
          <Button onClick={fetchImages} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>

        <Tabs defaultValue="gallery">
          <TabsList>
            <TabsTrigger value="gallery">
              <Image className="h-4 w-4 mr-2" />
              Galerie ({images.length})
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="optimize">
              <Zap className="h-4 w-4 mr-2" />
              Optimisation
            </TabsTrigger>
          </TabsList>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-xs"
              />
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="size">Taille</SelectItem>
                  <SelectItem value="name">Nom</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterOptimized} onValueChange={(v) => setFilterOptimized(v as typeof filterOptimized)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les images</SelectItem>
                  <SelectItem value="optimized">Optimisées</SelectItem>
                  <SelectItem value="not-optimized">Non optimisées</SelectItem>
                </SelectContent>
              </Select>
              {selectedImages.size > 0 && (
                <div className="flex gap-2">
                  <Badge variant="secondary">{selectedImages.size} sélectionnée(s)</Badge>
                  <Button variant="destructive" size="sm" onClick={() => setBulkDeleteConfirm(true)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                </div>
              )}
              <Button variant="ghost" size="sm" onClick={toggleSelectAll}>
                {selectedImages.size === filteredImages.length ? (
                  <CheckSquare className="h-4 w-4 mr-2" />
                ) : (
                  <Square className="h-4 w-4 mr-2" />
                )}
                Tout sélectionner
              </Button>
            </div>

            {/* Image Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredImages.map((image) => (
                <div
                  key={image.id}
                  className={`relative group rounded-lg border overflow-hidden bg-card transition-all ${
                    selectedImages.has(image.id) ? "ring-2 ring-primary" : ""
                  }`}
                >
                  {/* Selection checkbox */}
                  <button
                    onClick={() => toggleSelectImage(image.id)}
                    className="absolute top-2 left-2 z-10 p-1 rounded bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {selectedImages.has(image.id) ? (
                      <CheckSquare className="h-4 w-4 text-primary" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>

                  {/* Image */}
                  <div className="aspect-square">
                    <img
                      src={image.url}
                      alt={image.original_name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => setViewImage(image)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => setReplaceImage(image)}>
                      <Replace className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => setCompressImage(image)}>
                      <Minimize2 className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => setResizeImage(image)}>
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => handleDownload(image)}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20 hover:text-destructive" onClick={() => setDeleteConfirm(image)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Info bar */}
                  <div className="p-2 border-t bg-card">
                    <p className="text-xs truncate font-medium">{image.original_name}</p>
                    <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
                      <span>{formatFileSize(image.file_size)}</span>
                      {image.width && image.height && (
                        <span>{image.width}×{image.height}</span>
                      )}
                    </div>
                    {image.is_optimized && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        Optimisé
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredImages.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <FileImage className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucune image trouvée</p>
              </div>
            )}
          </TabsContent>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="h-5 w-5" />
                  Options d'upload
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Checkbox
                    id="autoCompress"
                    checked={uploadOptions.autoCompress}
                    onCheckedChange={(checked) =>
                      setUploadOptions((prev) => ({ ...prev, autoCompress: !!checked }))
                    }
                  />
                  <Label htmlFor="autoCompress">Compresser automatiquement</Label>
                </div>
                <div className="flex items-center gap-4">
                  <Checkbox
                    id="autoWebP"
                    checked={uploadOptions.autoWebP}
                    onCheckedChange={(checked) =>
                      setUploadOptions((prev) => ({ ...prev, autoWebP: !!checked }))
                    }
                  />
                  <Label htmlFor="autoWebP">Convertir en WebP</Label>
                </div>
                <div className="space-y-2">
                  <Label>Largeur maximale: {uploadOptions.maxWidth}px</Label>
                  <Slider
                    value={[uploadOptions.maxWidth]}
                    onValueChange={([value]) =>
                      setUploadOptions((prev) => ({ ...prev, maxWidth: value }))
                    }
                    min={400}
                    max={2000}
                    step={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Qualité: {uploadOptions.quality}%</Label>
                  <Slider
                    value={[uploadOptions.quality]}
                    onValueChange={([value]) =>
                      setUploadOptions((prev) => ({ ...prev, quality: value }))
                    }
                    min={50}
                    max={100}
                    step={5}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Zone d'upload</CardTitle>
              </CardHeader>
              <CardContent>
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  {isUploading ? (
                    <div className="space-y-4 w-full px-12">
                      <Loader2 className="h-10 w-10 animate-spin mx-auto" />
                      <Progress value={uploadProgress} />
                      <p className="text-center text-sm text-muted-foreground">
                        Upload en cours... {Math.round(uploadProgress)}%
                      </p>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground">
                        Glissez-déposez des images ou cliquez pour sélectionner
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        PNG, JPG, GIF, WebP (max 10MB)
                      </p>
                    </>
                  )}
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                    disabled={isUploading}
                  />
                </label>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Optimize Tab */}
          <TabsContent value="optimize" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HardDrive className="h-5 w-5" />
                    Stockage total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{formatFileSize(totalSize)}</p>
                  <p className="text-sm text-muted-foreground">{images.length} images</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    Non WebP
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{nonWebpImages.length}</p>
                  <p className="text-sm text-muted-foreground">images à optimiser</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-green-500" />
                    Action rapide
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleOptimizeAll}
                    disabled={processing || nonWebpImages.length === 0}
                    className="w-full"
                  >
                    {processing ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Zap className="h-4 w-4 mr-2" />
                    )}
                    Tout convertir en WebP
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Largest images */}
            <Card>
              <CardHeader>
                <CardTitle>Images les plus volumineuses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {largestImages.map((image) => (
                    <div key={image.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50">
                      <img
                        src={image.url}
                        alt={image.original_name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{image.original_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(image.file_size)}
                          {image.width && image.height && ` • ${image.width}×${image.height}`}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setCompressImage(image)}>
                          <Minimize2 className="h-4 w-4" />
                        </Button>
                        {image.mime_type !== "image/webp" && (
                          <Button size="sm" variant="ghost" onClick={() => handleConvertToWebP(image)}>
                            <FileImage className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Non-WebP images */}
            {nonWebpImages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Images non WebP ({nonWebpImages.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {nonWebpImages.slice(0, 12).map((image) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.url}
                          alt={image.original_name}
                          className="w-full aspect-square object-cover rounded"
                        />
                        <button
                          onClick={() => handleConvertToWebP(image)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium"
                        >
                          Convertir
                        </button>
                      </div>
                    ))}
                  </div>
                  {nonWebpImages.length > 12 && (
                    <p className="text-sm text-muted-foreground mt-3 text-center">
                      et {nonWebpImages.length - 12} autres...
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* View Image Modal */}
        <Dialog open={!!viewImage} onOpenChange={() => setViewImage(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{viewImage?.original_name}</DialogTitle>
            </DialogHeader>
            {viewImage && (
              <div className="space-y-4">
                <div className="max-h-[60vh] overflow-auto flex items-center justify-center bg-muted rounded-lg">
                  <img src={viewImage.url} alt={viewImage.original_name} className="max-w-full h-auto" />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Taille</p>
                    <p className="font-medium">{formatFileSize(viewImage.file_size)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Dimensions</p>
                    <p className="font-medium">
                      {viewImage.width && viewImage.height
                        ? `${viewImage.width}×${viewImage.height}`
                        : "Inconnues"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Format</p>
                    <p className="font-medium">{viewImage.mime_type}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date d'upload</p>
                    <p className="font-medium">
                      {new Date(viewImage.created_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">URL</p>
                    <p className="font-mono text-xs break-all">{viewImage.url}</p>
                  </div>
                  {viewImage.blog_post && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Utilisée dans</p>
                      <p className="font-medium">{viewImage.blog_post.title}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Replace Image Modal */}
        <Dialog open={!!replaceImage} onOpenChange={() => setReplaceImage(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remplacer l'image</DialogTitle>
              <DialogDescription>
                Le nouveau fichier aura le même chemin, les liens existants resteront valides.
              </DialogDescription>
            </DialogHeader>
            {replaceImage && (
              <div className="space-y-4">
                <div className="flex gap-4 items-center">
                  <img
                    src={replaceImage.url}
                    alt={replaceImage.original_name}
                    className="w-24 h-24 object-cover rounded"
                  />
                  <div>
                    <p className="font-medium">{replaceImage.original_name}</p>
                    <p className="text-sm text-muted-foreground">{formatFileSize(replaceImage.file_size)}</p>
                  </div>
                </div>
                <div>
                  <Label>Nouvelle image</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleReplace(replaceImage, file);
                    }}
                    disabled={processing}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setReplaceImage(null)}>
                Annuler
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Compress Image Modal */}
        <Dialog open={!!compressImage} onOpenChange={() => setCompressImage(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Compresser l'image</DialogTitle>
            </DialogHeader>
            {compressImage && (
              <div className="space-y-4">
                <div className="flex gap-4 items-center">
                  <img
                    src={compressImage.url}
                    alt={compressImage.original_name}
                    className="w-24 h-24 object-cover rounded"
                  />
                  <div>
                    <p className="font-medium">{compressImage.original_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Taille actuelle: {formatFileSize(compressImage.file_size)}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Qualité: {compressQuality}%</Label>
                  <Slider
                    value={[compressQuality]}
                    onValueChange={([value]) => setCompressQuality(value)}
                    min={30}
                    max={95}
                    step={5}
                  />
                  <p className="text-xs text-muted-foreground">
                    Une qualité plus basse = fichier plus petit
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setCompressImage(null)}>
                Annuler
              </Button>
              <Button onClick={() => compressImage && handleCompress(compressImage)} disabled={processing}>
                {processing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Compresser
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Resize Image Modal */}
        <Dialog open={!!resizeImage} onOpenChange={() => setResizeImage(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Redimensionner l'image</DialogTitle>
            </DialogHeader>
            {resizeImage && (
              <div className="space-y-4">
                <div className="flex gap-4 items-center">
                  <img
                    src={resizeImage.url}
                    alt={resizeImage.original_name}
                    className="w-24 h-24 object-cover rounded"
                  />
                  <div>
                    <p className="font-medium">{resizeImage.original_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Dimensions actuelles:{" "}
                      {resizeImage.width && resizeImage.height
                        ? `${resizeImage.width}×${resizeImage.height}`
                        : "Inconnues"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button
                    variant={resizeDimensions.width === 400 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setResizeDimensions((prev) => ({ ...prev, width: 400 }))}
                  >
                    400px
                  </Button>
                  <Button
                    variant={resizeDimensions.width === 800 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setResizeDimensions((prev) => ({ ...prev, width: 800 }))}
                  >
                    800px
                  </Button>
                  <Button
                    variant={resizeDimensions.width === 1200 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setResizeDimensions((prev) => ({ ...prev, width: 1200 }))}
                  >
                    1200px
                  </Button>
                  <Button
                    variant={resizeDimensions.width === 1600 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setResizeDimensions((prev) => ({ ...prev, width: 1600 }))}
                  >
                    1600px
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>Largeur personnalisée: {resizeDimensions.width}px</Label>
                  <Slider
                    value={[resizeDimensions.width]}
                    onValueChange={([value]) =>
                      setResizeDimensions((prev) => ({ ...prev, width: value }))
                    }
                    min={100}
                    max={2000}
                    step={50}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setResizeImage(null)}>
                Annuler
              </Button>
              <Button onClick={() => resizeImage && handleResize(resizeImage)} disabled={processing}>
                {processing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Redimensionner
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer l'image ?</AlertDialogTitle>
              <AlertDialogDescription>
                {deleteConfirm?.blog_post ? (
                  <span className="text-destructive font-medium">
                    Attention: Cette image est utilisée dans l'article "{deleteConfirm.blog_post.title}".
                  </span>
                ) : (
                  "Cette action est irréversible."
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Bulk Delete Confirmation */}
        <AlertDialog open={bulkDeleteConfirm} onOpenChange={setBulkDeleteConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer {selectedImages.size} images ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Toutes les images sélectionnées seront supprimées.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleBulkDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Supprimer tout
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}