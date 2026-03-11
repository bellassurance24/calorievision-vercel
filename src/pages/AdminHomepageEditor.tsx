import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useHomepageEditor } from "@/hooks/useHomepageEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ColorPicker } from "@/components/ui/color-picker";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
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
  Save, 
  RotateCcw, 
  Upload, 
  Trash2, 
  Image as ImageIcon, 
  Palette, 
  Type, 
  Layout, 
  Info, 
  Sparkles, 
  Footprints,
  MousePointer2,
  Plus,
  GripVertical,
  Video,
  Play,
  Eye,
  Undo2,
  ArchiveRestore,
  Settings2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify
} from "lucide-react";
import MediaShowcasePreview from "@/components/admin/MediaShowcasePreview";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const FONT_OPTIONS = [
  "Inter",
  "Roboto",
  "Open Sans",
  "Montserrat",
  "Poppins",
  "Lato",
  "Nunito",
  "Raleway",
  "Playfair Display",
  "Merriweather",
];

interface DeletedItem {
  id: string;
  type: 'media' | 'section_item' | 'image';
  data: any;
  deletedAt: Date;
}

export default function AdminHomepageEditor() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const {
    localColors,
    localSections,
    localSiteSettings,
    sectionItems,
    images,
    isLoading,
    isSaving,
    hasChanges,
    updateColor,
    updateSection,
    updateSiteSettings,
    saveAllChanges,
    resetToDefaults,
    uploadImage,
    deleteImage,
    addSectionItem,
    updateSectionItem,
    deleteSectionItem,
    markAsChanged,
    refetch,
  } = useHomepageEditor();

  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  
  // Media Showcase state
  const [mediaShowcaseItems, setMediaShowcaseItems] = useState<any[]>([]);
  const [deletedMediaItems, setDeletedMediaItems] = useState<any[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  
  // Undo delete state (session-based)
  const [recentlyDeleted, setRecentlyDeleted] = useState<DeletedItem[]>([]);
  
  // Delete confirmation dialog
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'media' | 'permanent'; mediaUrl?: string } | null>(null);

  // Fetch media showcase items (excluding soft-deleted)
  const fetchMediaShowcaseItems = async () => {
    setLoadingMedia(true);
    try {
      const { data, error } = await supabase
        .from("media_showcase_items")
        .select("*")
        .is("deleted_at", null)
        .order("display_order");
      
      if (error) throw error;
      setMediaShowcaseItems(data || []);
      
      // Also fetch deleted items for trash
      const { data: deletedData } = await supabase
        .from("media_showcase_items")
        .select("*")
        .not("deleted_at", "is", null)
        .order("deleted_at", { ascending: false });
      
      setDeletedMediaItems(deletedData || []);
    } catch (error) {
      console.error("Error fetching media showcase items:", error);
    } finally {
      setLoadingMedia(false);
    }
  };

  // Compression state for media showcase
  const [compressingMedia, setCompressingMedia] = useState(false);
  const [mediaQuality, setMediaQuality] = useState<'high' | 'medium' | 'low'>('medium');
  const [compressionEnabled, setCompressionEnabled] = useState(true);
  const [customQuality, setCustomQuality] = useState(80);
  const [showFileSizes, setShowFileSizes] = useState(false);
  const [originalFileSize, setOriginalFileSize] = useState<number>(0);
  const [compressedFileSize, setCompressedFileSize] = useState<number>(0);

  // Compress image function with quality slider
  const compressImage = async (file: File, quality: number): Promise<{ file: File; originalSize: number; compressedSize: number }> => {
    const originalSize = file.size;
    
    // Create image element to process
    const img = document.createElement('img');
    const objectUrl = URL.createObjectURL(file);
    
    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.src = objectUrl;
    });

    const canvas = document.createElement('canvas');
    let targetWidth = img.naturalWidth;
    let targetHeight = img.naturalHeight;

    // Resize based on quality
    const maxDimension = quality >= 80 ? 1200 : quality >= 60 ? 1000 : 800;
    if (targetWidth > maxDimension) {
      const ratio = maxDimension / targetWidth;
      targetWidth = maxDimension;
      targetHeight = Math.round(targetHeight * ratio);
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    URL.revokeObjectURL(objectUrl);

    const dataUrl = canvas.toDataURL('image/webp', quality / 100);
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    
    const compressedFile = new File([blob], `image-${Date.now()}.webp`, { type: 'image/webp' });
    
    return {
      file: compressedFile,
      originalSize,
      compressedSize: compressedFile.size
    };
  };

  // Add media item with compression
  const handleAddMediaItem = async (file: File, mediaType: "image" | "video", compress: boolean = false) => {
    setUploadingMedia(true);
    setCompressingMedia(compress && mediaType === "image");
    setShowFileSizes(false);
    
    try {
      let processedFile = file;
      let compressionResult = { originalSize: file.size, compressedSize: file.size };
      
      // Compress image if requested
      if (compress && mediaType === "image" && compressionEnabled) {
        const result = await compressImage(file, customQuality);
        processedFile = result.file;
        compressionResult = result;
        setOriginalFileSize(result.originalSize);
        setCompressedFileSize(result.compressedSize);
        setShowFileSizes(true);
      }

      const fileExt = processedFile.name.split(".").pop();
      const fileName = `media-showcase-${Date.now()}.${fileExt}`;
      const filePath = `homepage/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("site-assets")
        .upload(filePath, processedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("site-assets")
        .getPublicUrl(filePath);

      const maxOrder = mediaShowcaseItems.reduce((max, item) => Math.max(max, item.display_order), 0);

      const { error: insertError } = await supabase
        .from("media_showcase_items")
        .insert({
          media_type: mediaType,
          media_url: publicUrl,
          display_order: maxOrder + 1,
          is_visible: true,
          aspect_ratio: "16:9",
          image_position: "center",
          text_align: "left",
          compression_enabled: compress && compressionEnabled,
          compression_quality: customQuality,
          image_auto_scale: true,
        });

      if (insertError) throw insertError;

      const sizeSaved = compress ? `${((compressionResult.originalSize - compressionResult.compressedSize) / 1024).toFixed(1)} KB saved` : '';
      toast.success(compress ? `Media compressed and added. ${sizeSaved}` : "Media added successfully");
      fetchMediaShowcaseItems();
    } catch (error) {
      console.error("Error adding media:", error);
      toast.error("Failed to add media");
    } finally {
      setUploadingMedia(false);
      setCompressingMedia(false);
    }
  };

  // Update media item (optimistic UI)
  const handleUpdateMediaItem = async (id: string, updates: any) => {
    // Update local state immediately so inputs/selects feel responsive
    setMediaShowcaseItems(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updates } : item))
    );
    setDeletedMediaItems(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updates } : item))
    );
    
    // Mark as changed to enable Save button
    markAsChanged();

    try {
      const { error } = await supabase
        .from("media_showcase_items")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating media item:", error);
      toast.error("Failed to update media item");
      // Re-sync from backend in case of failure
      fetchMediaShowcaseItems();
    }
  };

  // Soft delete media item (move to trash)
  const handleSoftDeleteMediaItem = async (id: string) => {
    try {
      const item = mediaShowcaseItems.find(i => i.id === id);
      if (item) {
        // Add to session undo stack
        setRecentlyDeleted(prev => [...prev, {
          id,
          type: 'media',
          data: item,
          deletedAt: new Date()
        }]);
      }

      const { error } = await supabase
        .from("media_showcase_items")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      
      toast.success("Media moved to trash. Click 'Undo' to restore.");
      fetchMediaShowcaseItems();
    } catch (error) {
      console.error("Error deleting media:", error);
      toast.error("Failed to delete media");
    }
  };

  // Restore media item from trash
  const handleRestoreMediaItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from("media_showcase_items")
        .update({ deleted_at: null })
        .eq("id", id);

      if (error) throw error;
      
      // Remove from session undo stack
      setRecentlyDeleted(prev => prev.filter(item => item.id !== id));
      
      toast.success("Media restored successfully");
      fetchMediaShowcaseItems();
    } catch (error) {
      console.error("Error restoring media:", error);
      toast.error("Failed to restore media");
    }
  };

  // Undo last delete
  const handleUndoLastDelete = async () => {
    if (recentlyDeleted.length === 0) {
      toast.info("Nothing to undo");
      return;
    }

    const lastDeleted = recentlyDeleted[recentlyDeleted.length - 1];
    
    if (lastDeleted.type === 'media') {
      await handleRestoreMediaItem(lastDeleted.id);
    }
  };

  // Permanent delete (with confirmation)
  const handlePermanentDelete = async (id: string, mediaUrl: string) => {
    try {
      // Extract file path and delete from storage
      const urlParts = mediaUrl.split("/");
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `homepage/${fileName}`;
      
      await supabase.storage.from("site-assets").remove([filePath]);

      const { error } = await supabase
        .from("media_showcase_items")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast.success("Media permanently deleted");
      fetchMediaShowcaseItems();
    } catch (error) {
      console.error("Error deleting media:", error);
      toast.error("Failed to delete media");
    }
  };

  // Confirm permanent delete
  const confirmPermanentDelete = (id: string, mediaUrl: string) => {
    setItemToDelete({ id, type: 'permanent', mediaUrl });
    setDeleteConfirmOpen(true);
  };

  // Load media items on mount
  useEffect(() => {
    fetchMediaShowcaseItems();
  }, []);

  // Format file size helper
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (authLoading || isLoading) {
    return (
      <AdminLayout forceDark>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/auth" replace />;
  }

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    sectionKey: string,
    settingsKey?: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(sectionKey);
    try {
      const url = await uploadImage(file, sectionKey);
      if (url && settingsKey) {
        updateSiteSettings({ [settingsKey]: url });
      }
      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(null);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "header" | "footer") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(type);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${type}-logo-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("site-assets")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("site-assets")
        .getPublicUrl(filePath);

      updateSiteSettings({ 
        [type === "header" ? "header_logo_url" : "footer_logo_url"]: publicUrl 
      });
      toast.success("Logo uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload logo");
    } finally {
      setUploadingImage(null);
    }
  };

  const handleDeleteLogo = (type: "header" | "footer") => {
    updateSiteSettings({ 
      [type === "header" ? "header_logo_url" : "footer_logo_url"]: null 
    });
  };

  return (
    <AdminLayout forceDark>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header with Undo Button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Homepage Editor</h1>
            <p className="text-muted-foreground">Customize your homepage content and appearance</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Undo Delete Button */}
            {recentlyDeleted.length > 0 && (
              <Button
                variant="outline"
                onClick={handleUndoLastDelete}
                className="gap-2 border-amber-500/50 text-amber-500 hover:bg-amber-500/10"
              >
                <Undo2 className="h-4 w-4" />
                Undo Delete ({recentlyDeleted.length})
              </Button>
            )}
            {hasChanges && (
              <span className="text-sm text-amber-500">Unsaved changes</span>
            )}
            <Button
              variant="outline"
              onClick={resetToDefaults}
              disabled={isSaving}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Default
            </Button>
            <Button
              onClick={saveAllChanges}
              disabled={isSaving || !hasChanges}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save All Changes"}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="logo" className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="logo" className="gap-2">
              <ImageIcon className="h-4 w-4" />
              Logo
            </TabsTrigger>
            <TabsTrigger value="colors" className="gap-2">
              <Palette className="h-4 w-4" />
              Colors
            </TabsTrigger>
            <TabsTrigger value="fonts" className="gap-2">
              <Type className="h-4 w-4" />
              Fonts
            </TabsTrigger>
            <TabsTrigger value="hero" className="gap-2">
              <Layout className="h-4 w-4" />
              Hero
            </TabsTrigger>
            <TabsTrigger value="media-showcase" className="gap-2">
              <Video className="h-4 w-4" />
              Media Showcase
            </TabsTrigger>
            <TabsTrigger value="about" className="gap-2">
              <Info className="h-4 w-4" />
              About
            </TabsTrigger>
            <TabsTrigger value="features" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Features
            </TabsTrigger>
            <TabsTrigger value="how-it-works" className="gap-2">
              <Footprints className="h-4 w-4" />
              How It Works
            </TabsTrigger>
            <TabsTrigger value="cta" className="gap-2">
              <MousePointer2 className="h-4 w-4" />
              CTA
            </TabsTrigger>
            <TabsTrigger value="footer" className="gap-2">
              <Layout className="h-4 w-4" />
              Footer
            </TabsTrigger>
            {deletedMediaItems.length > 0 && (
              <TabsTrigger value="trash" className="gap-2 text-amber-500">
                <ArchiveRestore className="h-4 w-4" />
                Trash ({deletedMediaItems.length})
              </TabsTrigger>
            )}
          </TabsList>

          {/* LOGO SECTION */}
          <TabsContent value="logo">
            <Card>
              <CardHeader>
                <CardTitle>Logo Settings</CardTitle>
                <CardDescription>Upload and manage your site logos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Header Logo */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Header Logo</Label>
                  {localSiteSettings.header_logo_url ? (
                    <div className="flex items-center gap-4">
                      <div className="relative w-40 h-20 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                        <img 
                          src={localSiteSettings.header_logo_url} 
                          alt="Header Logo" 
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Label htmlFor="header-logo-replace" className="cursor-pointer">
                          <Button variant="outline" size="sm" asChild>
                            <span>
                              <Upload className="h-4 w-4 mr-2" />
                              Replace
                            </span>
                          </Button>
                        </Label>
                        <input
                          id="header-logo-replace"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleLogoUpload(e, "header")}
                        />
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteLogo("header")}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="w-40 h-20 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <Label htmlFor="header-logo-upload" className="cursor-pointer">
                        <Button variant="outline" asChild disabled={uploadingImage === "header"}>
                          <span>
                            <Upload className="h-4 w-4 mr-2" />
                            {uploadingImage === "header" ? "Uploading..." : "Upload Logo"}
                          </span>
                        </Button>
                      </Label>
                      <input
                        id="header-logo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleLogoUpload(e, "header")}
                      />
                    </div>
                  )}
                </div>

                {/* Footer Logo */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Footer Logo</Label>
                  {localSiteSettings.footer_logo_url ? (
                    <div className="flex items-center gap-4">
                      <div className="relative w-40 h-20 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                        <img 
                          src={localSiteSettings.footer_logo_url} 
                          alt="Footer Logo" 
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Label htmlFor="footer-logo-replace" className="cursor-pointer">
                          <Button variant="outline" size="sm" asChild>
                            <span>
                              <Upload className="h-4 w-4 mr-2" />
                              Replace
                            </span>
                          </Button>
                        </Label>
                        <input
                          id="footer-logo-replace"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleLogoUpload(e, "footer")}
                        />
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteLogo("footer")}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="w-40 h-20 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <Label htmlFor="footer-logo-upload" className="cursor-pointer">
                        <Button variant="outline" asChild disabled={uploadingImage === "footer"}>
                          <span>
                            <Upload className="h-4 w-4 mr-2" />
                            {uploadingImage === "footer" ? "Uploading..." : "Upload Logo"}
                          </span>
                        </Button>
                      </Label>
                      <input
                        id="footer-logo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleLogoUpload(e, "footer")}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* COLORS SECTION */}
          <TabsContent value="colors">
            <Card>
              <CardHeader>
                <CardTitle>Color Settings</CardTitle>
                <CardDescription>
                  Customize all colors using the full-spectrum color picker. 
                  Each picker includes HEX, RGB, and opacity controls.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="space-y-4">
                  {/* Header Colors */}
                  <AccordionItem value="header">
                    <AccordionTrigger className="text-base font-medium">
                      Header Colors
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <ColorPicker
                          label="Header Background"
                          value={localColors.header_background || "#9b87f5"}
                          onChange={(color) => updateColor("header_background", color)}
                        />
                        <ColorPicker
                          label="Header Text"
                          value={localColors.header_text || "#ffffff"}
                          onChange={(color) => updateColor("header_text", color)}
                        />
                        <ColorPicker
                          label="Navigation Link"
                          value={localColors.nav_link || "#ffffff"}
                          onChange={(color) => updateColor("nav_link", color)}
                        />
                        <ColorPicker
                          label="Navigation Hover"
                          value={localColors.nav_hover || "#e0e0e0"}
                          onChange={(color) => updateColor("nav_hover", color)}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Hero Colors */}
                  <AccordionItem value="hero">
                    <AccordionTrigger className="text-base font-medium">
                      Hero Section Colors
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <ColorPicker
                          label="Hero Background"
                          value={localColors.hero_background || "#1A1F2C"}
                          onChange={(color) => updateColor("hero_background", color)}
                        />
                        <ColorPicker
                          label="Hero Overlay"
                          value={localColors.hero_overlay || "#000000"}
                          onChange={(color) => updateColor("hero_overlay", color)}
                        />
                        <ColorPicker
                          label="Hero Title"
                          value={localColors.hero_title || "#ffffff"}
                          onChange={(color) => updateColor("hero_title", color)}
                        />
                        <ColorPicker
                          label="Hero Subtitle"
                          value={localColors.hero_subtitle || "#9b87f5"}
                          onChange={(color) => updateColor("hero_subtitle", color)}
                        />
                        <ColorPicker
                          label="Hero Description"
                          value={localColors.hero_description || "#94a3b8"}
                          onChange={(color) => updateColor("hero_description", color)}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Button Colors */}
                  <AccordionItem value="buttons">
                    <AccordionTrigger className="text-base font-medium">
                      Button Colors
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <ColorPicker
                          label="Primary Button Background"
                          value={localColors.primary_button_bg || "#9b87f5"}
                          onChange={(color) => updateColor("primary_button_bg", color)}
                        />
                        <ColorPicker
                          label="Primary Button Text"
                          value={localColors.primary_button_text || "#ffffff"}
                          onChange={(color) => updateColor("primary_button_text", color)}
                        />
                        <ColorPicker
                          label="Primary Button Hover Background"
                          value={localColors.primary_button_hover_bg || "#7E69AB"}
                          onChange={(color) => updateColor("primary_button_hover_bg", color)}
                        />
                        <ColorPicker
                          label="Primary Button Hover Text"
                          value={localColors.primary_button_hover_text || "#ffffff"}
                          onChange={(color) => updateColor("primary_button_hover_text", color)}
                        />
                        <ColorPicker
                          label="Secondary Button Background"
                          value={localColors.secondary_button_bg || "transparent"}
                          onChange={(color) => updateColor("secondary_button_bg", color)}
                        />
                        <ColorPicker
                          label="Secondary Button Text"
                          value={localColors.secondary_button_text || "#9b87f5"}
                          onChange={(color) => updateColor("secondary_button_text", color)}
                        />
                        <ColorPicker
                          label="Secondary Button Hover Background"
                          value={localColors.secondary_button_hover_bg || "rgba(155, 135, 245, 0.1)"}
                          onChange={(color) => updateColor("secondary_button_hover_bg", color)}
                        />
                        <ColorPicker
                          label="Secondary Button Hover Text"
                          value={localColors.secondary_button_hover_text || "#9b87f5"}
                          onChange={(color) => updateColor("secondary_button_hover_text", color)}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Section Colors */}
                  <AccordionItem value="sections">
                    <AccordionTrigger className="text-base font-medium">
                      Section Colors
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <ColorPicker
                          label="Section Background"
                          value={localColors.section_background || "#1A1F2C"}
                          onChange={(color) => updateColor("section_background", color)}
                        />
                        <ColorPicker
                          label="Section Title"
                          value={localColors.section_title || "#ffffff"}
                          onChange={(color) => updateColor("section_title", color)}
                        />
                        <ColorPicker
                          label="Section Subtitle"
                          value={localColors.section_subtitle || "#9b87f5"}
                          onChange={(color) => updateColor("section_subtitle", color)}
                        />
                        <ColorPicker
                          label="Section Text"
                          value={localColors.section_text || "#94a3b8"}
                          onChange={(color) => updateColor("section_text", color)}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Card Colors */}
                  <AccordionItem value="cards">
                    <AccordionTrigger className="text-base font-medium">
                      Card Colors
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <ColorPicker
                          label="Card Background"
                          value={localColors.card_background || "#1E2330"}
                          onChange={(color) => updateColor("card_background", color)}
                        />
                        <ColorPicker
                          label="Card Border"
                          value={localColors.card_border || "#333333"}
                          onChange={(color) => updateColor("card_border", color)}
                        />
                        <ColorPicker
                          label="Card Shadow"
                          value={localColors.card_shadow || "rgba(0, 0, 0, 0.3)"}
                          onChange={(color) => updateColor("card_shadow", color)}
                        />
                        <ColorPicker
                          label="Card Hover Background"
                          value={localColors.card_hover_background || "#252a3a"}
                          onChange={(color) => updateColor("card_hover_background", color)}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Link Colors */}
                  <AccordionItem value="links">
                    <AccordionTrigger className="text-base font-medium">
                      Link Colors
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <ColorPicker
                          label="Link Color"
                          value={localColors.link_color || "#9b87f5"}
                          onChange={(color) => updateColor("link_color", color)}
                        />
                        <ColorPicker
                          label="Link Hover"
                          value={localColors.link_hover || "#7E69AB"}
                          onChange={(color) => updateColor("link_hover", color)}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Footer Colors */}
                  <AccordionItem value="footer-colors">
                    <AccordionTrigger className="text-base font-medium">
                      Footer Colors
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <ColorPicker
                          label="Footer Background"
                          value={localColors.footer_background || "#9b87f5"}
                          onChange={(color) => updateColor("footer_background", color)}
                        />
                        <ColorPicker
                          label="Footer Text"
                          value={localColors.footer_text || "#ffffff"}
                          onChange={(color) => updateColor("footer_text", color)}
                        />
                        <ColorPicker
                          label="Footer Link"
                          value={localColors.footer_link || "#ffffff"}
                          onChange={(color) => updateColor("footer_link", color)}
                        />
                        <ColorPicker
                          label="Footer Link Hover"
                          value={localColors.footer_link_hover || "#e0e0e0"}
                          onChange={(color) => updateColor("footer_link_hover", color)}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Other Colors */}
                  <AccordionItem value="other">
                    <AccordionTrigger className="text-base font-medium">
                      Other Colors
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <ColorPicker
                          label="Icon Color"
                          value={localColors.icon_color || "#9b87f5"}
                          onChange={(color) => updateColor("icon_color", color)}
                        />
                        <ColorPicker
                          label="Border Color"
                          value={localColors.border_color || "#333333"}
                          onChange={(color) => updateColor("border_color", color)}
                        />
                        <ColorPicker
                          label="Divider Color"
                          value={localColors.divider_color || "#333333"}
                          onChange={(color) => updateColor("divider_color", color)}
                        />
                        <ColorPicker
                          label="Input Background"
                          value={localColors.input_background || "#1E2330"}
                          onChange={(color) => updateColor("input_background", color)}
                        />
                        <ColorPicker
                          label="Input Border"
                          value={localColors.input_border || "#333333"}
                          onChange={(color) => updateColor("input_border", color)}
                        />
                        <ColorPicker
                          label="Input Text"
                          value={localColors.input_text || "#ffffff"}
                          onChange={(color) => updateColor("input_text", color)}
                        />
                        <ColorPicker
                          label="Input Focus Border"
                          value={localColors.input_focus_border || "#9b87f5"}
                          onChange={(color) => updateColor("input_focus_border", color)}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FONTS SECTION */}
          <TabsContent value="fonts">
            <Card>
              <CardHeader>
                <CardTitle>Font Settings</CardTitle>
                <CardDescription>Configure typography for your homepage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Heading Font</Label>
                    <Select
                      value={localSiteSettings.font_heading_family || "Inter"}
                      onValueChange={(value) => updateSiteSettings({ font_heading_family: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_OPTIONS.map((font) => (
                          <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                            {font}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="space-y-2">
                      <Label>Heading Size (H1)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={localSiteSettings.font_h1_size || 48}
                          onChange={(e) => updateSiteSettings({ font_h1_size: parseInt(e.target.value) })}
                          className="w-24"
                        />
                        <span className="text-muted-foreground">px</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-medium">Body Font</Label>
                    <Select
                      value={localSiteSettings.font_body_family || "Inter"}
                      onValueChange={(value) => updateSiteSettings({ font_body_family: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_OPTIONS.map((font) => (
                          <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                            {font}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="space-y-2">
                      <Label>Body Size</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={localSiteSettings.font_body_size || 16}
                          onChange={(e) => updateSiteSettings({ font_body_size: parseInt(e.target.value) })}
                          className="w-24"
                        />
                        <span className="text-muted-foreground">px</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* HERO SECTION */}
          <TabsContent value="hero">
            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
                <CardDescription>Configure the main hero section of your homepage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="hero-visible">Show Hero Section</Label>
                  <Switch
                    id="hero-visible"
                    checked={localSiteSettings.hero_show_section ?? true}
                    onCheckedChange={(checked) => updateSiteSettings({ hero_show_section: checked })}
                  />
                </div>

                {/* Text Content */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Hero Title</Label>
                    <Input
                      value={localSiteSettings.hero_title || ""}
                      onChange={(e) => updateSiteSettings({ hero_title: e.target.value })}
                      placeholder="Your main headline"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Hero Subtitle</Label>
                    <Input
                      value={localSiteSettings.hero_subtitle || ""}
                      onChange={(e) => updateSiteSettings({ hero_subtitle: e.target.value })}
                      placeholder="A catchy subtitle"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Hero Description</Label>
                    <Textarea
                      value={localSiteSettings.hero_description || ""}
                      onChange={(e) => updateSiteSettings({ hero_description: e.target.value })}
                      placeholder="Detailed description"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Buttons</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Primary Button Text</Label>
                      <Input
                        value={localSiteSettings.hero_primary_button_text || ""}
                        onChange={(e) => updateSiteSettings({ hero_primary_button_text: e.target.value })}
                        placeholder="Get Started"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Primary Button Link</Label>
                      <Input
                        value={localSiteSettings.hero_primary_button_link || ""}
                        onChange={(e) => updateSiteSettings({ hero_primary_button_link: e.target.value })}
                        placeholder="/analyze"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Secondary Button Text</Label>
                      <Input
                        value={localSiteSettings.hero_secondary_button_text || ""}
                        onChange={(e) => updateSiteSettings({ hero_secondary_button_text: e.target.value })}
                        placeholder="Learn More"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Secondary Button Link</Label>
                      <Input
                        value={localSiteSettings.hero_secondary_button_link || ""}
                        onChange={(e) => updateSiteSettings({ hero_secondary_button_link: e.target.value })}
                        placeholder="/analyze?capture=1"
                      />
                    </div>
                  </div>
                </div>

                {/* Hero Background */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Background</Label>
                  
                  <div className="space-y-2">
                    <Label>Background Image</Label>
                    {localSiteSettings.hero_bg_image_url ? (
                      <div className="flex items-center gap-4">
                        <div className="relative w-40 h-24 bg-muted rounded-lg overflow-hidden">
                          <img 
                            src={localSiteSettings.hero_bg_image_url} 
                            alt="Hero Background" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Label htmlFor="hero-bg-replace" className="cursor-pointer">
                            <Button variant="outline" size="sm" asChild>
                              <span>
                                <Upload className="h-4 w-4 mr-2" />
                                Replace
                              </span>
                            </Button>
                          </Label>
                          <input
                            id="hero-bg-replace"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(e, "hero", "hero_bg_image_url")}
                          />
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => updateSiteSettings({ hero_bg_image_url: null })}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <div className="w-40 h-24 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <Label htmlFor="hero-bg-upload" className="cursor-pointer">
                          <Button variant="outline" asChild disabled={uploadingImage === "hero"}>
                            <span>
                              <Upload className="h-4 w-4 mr-2" />
                              {uploadingImage === "hero" ? "Uploading..." : "Upload Image"}
                            </span>
                          </Button>
                        </Label>
                        <input
                          id="hero-bg-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, "hero", "hero_bg_image_url")}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Background Video URL</Label>
                    <Input
                      value={localSiteSettings.hero_bg_video_url || ""}
                      onChange={(e) => updateSiteSettings({ hero_bg_video_url: e.target.value })}
                      placeholder="https://example.com/video.mp4"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MEDIA SHOWCASE SECTION */}
          <TabsContent value="media-showcase">
            <div className="space-y-6">
              {/* Live Preview */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base">Live Preview</CardTitle>
                  </div>
                  <CardDescription className="text-xs">Real-time preview of how the section will appear on your homepage</CardDescription>
                </CardHeader>
                <CardContent>
                  <MediaShowcasePreview
                    items={mediaShowcaseItems}
                    title={localSiteSettings.media_showcase_title || ""}
                    description={localSiteSettings.media_showcase_description || ""}
                    show={localSiteSettings.media_showcase_show_section ?? true}
                  />
                </CardContent>
              </Card>

              {/* Settings Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Media Showcase Section</CardTitle>
                  <CardDescription>Add photos and videos to display between header and hero</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                {/* Section Settings */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="media-showcase-visible">Show Media Showcase</Label>
                  <Switch
                    id="media-showcase-visible"
                    checked={localSiteSettings.media_showcase_show_section ?? true}
                    onCheckedChange={(checked) => updateSiteSettings({ media_showcase_show_section: checked })}
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Section Title</Label>
                    <Input
                      value={localSiteSettings.media_showcase_title || ""}
                      onChange={(e) => updateSiteSettings({ media_showcase_title: e.target.value })}
                      placeholder="Enter section title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Section Description</Label>
                    <Textarea
                      value={localSiteSettings.media_showcase_description || ""}
                      onChange={(e) => updateSiteSettings({ media_showcase_description: e.target.value })}
                      placeholder="Enter section description"
                      rows={2}
                    />
                  </div>
                </div>

                {/* Compression Settings Panel */}
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="compression">
                    <AccordionTrigger className="text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Settings2 className="h-4 w-4" />
                        Image Compression Settings
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        <div className="flex items-center gap-3">
                          <Checkbox 
                            id="compression-enabled"
                            checked={compressionEnabled}
                            onCheckedChange={(checked) => setCompressionEnabled(checked as boolean)}
                          />
                          <Label htmlFor="compression-enabled">Enable compression</Label>
                        </div>
                        
                        {compressionEnabled && (
                          <>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label>Quality: {customQuality}%</Label>
                                <span className="text-xs text-muted-foreground">
                                  {customQuality >= 80 ? 'High' : customQuality >= 60 ? 'Medium' : 'Low'}
                                </span>
                              </div>
                              <Slider
                                value={[customQuality]}
                                onValueChange={(v) => setCustomQuality(v[0])}
                                min={10}
                                max={100}
                                step={5}
                                className="w-full"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Quick Presets</Label>
                              <div className="flex gap-2">
                                <Button 
                                  variant={customQuality >= 75 ? "default" : "outline"} 
                                  size="sm"
                                  onClick={() => setCustomQuality(80)}
                                >
                                  High (~80 KB)
                                </Button>
                                <Button 
                                  variant={customQuality >= 55 && customQuality < 75 ? "default" : "outline"} 
                                  size="sm"
                                  onClick={() => setCustomQuality(60)}
                                >
                                  Medium (~50 KB)
                                </Button>
                                <Button 
                                  variant={customQuality < 55 ? "default" : "outline"} 
                                  size="sm"
                                  onClick={() => setCustomQuality(40)}
                                >
                                  Low (~25 KB)
                                </Button>
                              </div>
                            </div>

                            {showFileSizes && (
                              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                                <div className="text-sm space-y-1">
                                  <p>Original: <span className="font-medium">{formatFileSize(originalFileSize)}</span></p>
                                  <p>Compressed: <span className="font-medium text-green-500">{formatFileSize(compressedFileSize)}</span></p>
                                  <p className="text-green-500">Saved: {formatFileSize(originalFileSize - compressedFileSize)} ({Math.round((1 - compressedFileSize / originalFileSize) * 100)}%)</p>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* Add Media */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Add Media</Label>
                  
                  <div className="flex flex-wrap gap-3">
                    <div>
                      <Label htmlFor="add-image" className="cursor-pointer">
                        <Button variant="outline" asChild disabled={uploadingMedia}>
                          <span>
                            <ImageIcon className="h-4 w-4 mr-2" />
                            {compressingMedia ? "Compressing..." : uploadingMedia ? "Uploading..." : compressionEnabled ? "Add Image (Compressed)" : "Add Image"}
                          </span>
                        </Button>
                      </Label>
                      <input
                        id="add-image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleAddMediaItem(file, "image", compressionEnabled);
                        }}
                      />
                    </div>
                    {compressionEnabled && (
                      <div>
                        <Label htmlFor="add-image-no-compress" className="cursor-pointer">
                          <Button variant="ghost" size="sm" asChild disabled={uploadingMedia}>
                            <span>
                              <ImageIcon className="h-4 w-4 mr-2" />
                              Add (no compress)
                            </span>
                          </Button>
                        </Label>
                        <input
                          id="add-image-no-compress"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleAddMediaItem(file, "image", false);
                          }}
                        />
                      </div>
                    )}
                    <div>
                      <Label htmlFor="add-video" className="cursor-pointer">
                        <Button variant="outline" asChild disabled={uploadingMedia}>
                          <span>
                            <Video className="h-4 w-4 mr-2" />
                            {uploadingMedia ? "Uploading..." : "Add Video"}
                          </span>
                        </Button>
                      </Label>
                      <input
                        id="add-video"
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleAddMediaItem(file, "video", false);
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Media Items List */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Media Items ({mediaShowcaseItems.length})</Label>
                  
                  {loadingMedia ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : mediaShowcaseItems.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                      <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p>No media items yet. Add images or videos above.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {mediaShowcaseItems.map((item, index) => (
                        <div key={item.id} className="border rounded-lg p-4 space-y-4">
                          <div className="flex items-start gap-4">
                            {/* Preview */}
                            <div className="w-32 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                              {item.media_type === "video" ? (
                                <div className="w-full h-full flex items-center justify-center bg-muted">
                                  <Play className="h-8 w-8 text-muted-foreground" />
                                </div>
                              ) : (
                                <img
                                  src={item.media_url}
                                  alt={item.title || "Media"}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            
                            {/* Info */}
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-1 rounded ${item.media_type === "video" ? "bg-purple-500/20 text-purple-300" : "bg-blue-500/20 text-blue-300"}`}>
                                  {item.media_type === "video" ? "Video" : "Image"}
                                </span>
                                <span className="text-xs text-muted-foreground">Order: {item.display_order}</span>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Input
                                  value={item.title || ""}
                                  onChange={(e) => handleUpdateMediaItem(item.id, { title: e.target.value })}
                                  placeholder="Title (optional)"
                                  className="h-8 text-sm"
                                />
                                <Input
                                  value={item.description || ""}
                                  onChange={(e) => handleUpdateMediaItem(item.id, { description: e.target.value })}
                                  placeholder="Description (optional)"
                                  className="h-8 text-sm"
                                />
                              </div>
                              
                              {/* Image Settings Panel */}
                              <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="image-settings" className="border-none">
                                  <AccordionTrigger className="py-2 text-xs text-muted-foreground hover:no-underline">
                                    <span className="flex items-center gap-1">
                                      <Settings2 className="h-3 w-3" />
                                      Image Settings
                                    </span>
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                                      {/* Dimensions */}
                                      <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Width (px)</Label>
                                        <Input
                                          type="number"
                                          value={item.image_width_custom || ""}
                                          onChange={(e) => handleUpdateMediaItem(item.id, { 
                                            image_width_custom: e.target.value ? parseInt(e.target.value) : null 
                                          })}
                                          placeholder="Auto"
                                          className="h-8 text-sm"
                                          disabled={item.image_auto_scale}
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Height (px)</Label>
                                        <Input
                                          type="number"
                                          value={item.image_height_custom || ""}
                                          onChange={(e) => handleUpdateMediaItem(item.id, { 
                                            image_height_custom: e.target.value ? parseInt(e.target.value) : null 
                                          })}
                                          placeholder="Auto"
                                          className="h-8 text-sm"
                                          disabled={item.image_auto_scale}
                                        />
                                      </div>
                                      <div className="space-y-1 flex items-end gap-2 pb-1">
                                        <Checkbox 
                                          id={`auto-scale-${item.id}`}
                                          checked={item.image_auto_scale ?? true}
                                          onCheckedChange={(checked) => handleUpdateMediaItem(item.id, { image_auto_scale: checked })}
                                        />
                                        <Label htmlFor={`auto-scale-${item.id}`} className="text-xs">Auto scale</Label>
                                      </div>
                                      <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Aspect Ratio</Label>
                                        <Select 
                                          value={item.aspect_ratio || "16:9"} 
                                          onValueChange={(v) => handleUpdateMediaItem(item.id, { aspect_ratio: v })}
                                        >
                                          <SelectTrigger className="h-8 text-sm">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                                            <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                                            <SelectItem value="1:1">1:1 (Square)</SelectItem>
                                            <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                                            <SelectItem value="auto">Auto</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              </Accordion>
                              
                              {/* Position & Text Settings */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <Label className="text-xs text-muted-foreground">Image Position</Label>
                                  <Select 
                                    value={item.image_position || "center"} 
                                    onValueChange={(v) => handleUpdateMediaItem(item.id, { image_position: v })}
                                  >
                                    <SelectTrigger className="h-8 text-sm">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="left">
                                        <span className="flex items-center gap-2">
                                          <AlignLeft className="h-3 w-3" /> Left
                                        </span>
                                      </SelectItem>
                                      <SelectItem value="center">
                                        <span className="flex items-center gap-2">
                                          <AlignCenter className="h-3 w-3" /> Center
                                        </span>
                                      </SelectItem>
                                      <SelectItem value="right">
                                        <span className="flex items-center gap-2">
                                          <AlignRight className="h-3 w-3" /> Right
                                        </span>
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs text-muted-foreground">Text Alignment</Label>
                                  <Select 
                                    value={item.text_align || "left"} 
                                    onValueChange={(v) => handleUpdateMediaItem(item.id, { text_align: v })}
                                  >
                                    <SelectTrigger className="h-8 text-sm">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="left">
                                        <span className="flex items-center gap-2">
                                          <AlignLeft className="h-3 w-3" /> Left
                                        </span>
                                      </SelectItem>
                                      <SelectItem value="center">
                                        <span className="flex items-center gap-2">
                                          <AlignCenter className="h-3 w-3" /> Center
                                        </span>
                                      </SelectItem>
                                      <SelectItem value="right">
                                        <span className="flex items-center gap-2">
                                          <AlignRight className="h-3 w-3" /> Right
                                        </span>
                                      </SelectItem>
                                      <SelectItem value="justify">
                                        <span className="flex items-center gap-2">
                                          <AlignJustify className="h-3 w-3" /> Justify
                                        </span>
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={item.is_visible}
                                onCheckedChange={(checked) => handleUpdateMediaItem(item.id, { is_visible: checked })}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSoftDeleteMediaItem(item.id)}
                                className="text-amber-500 border-amber-500/30 hover:bg-amber-500/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            </div>
          </TabsContent>

          {/* TRASH SECTION */}
          <TabsContent value="trash">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArchiveRestore className="h-5 w-5" />
                  Recently Deleted
                </CardTitle>
                <CardDescription>Items in trash can be restored or permanently deleted</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {deletedMediaItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ArchiveRestore className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p>Trash is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {deletedMediaItems.map((item) => (
                      <div key={item.id} className="border border-amber-500/30 rounded-lg p-4 bg-amber-500/5">
                        <div className="flex items-center gap-4">
                          <div className="w-24 h-16 bg-muted rounded overflow-hidden flex-shrink-0 opacity-60">
                            {item.media_type === "video" ? (
                              <div className="w-full h-full flex items-center justify-center">
                                <Play className="h-6 w-6 text-muted-foreground" />
                              </div>
                            ) : (
                              <img
                                src={item.media_url}
                                alt={item.title || "Media"}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{item.title || "Untitled"}</p>
                            <p className="text-xs text-muted-foreground">
                              Deleted: {new Date(item.deleted_at).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRestoreMediaItem(item.id)}
                              className="text-green-500 border-green-500/30 hover:bg-green-500/10"
                            >
                              <ArchiveRestore className="h-4 w-4 mr-1" />
                              Restore
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => confirmPermanentDelete(item.id, item.media_url)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete Forever
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABOUT SECTION */}
          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>About Section</CardTitle>
                <CardDescription>Configure the about section of your homepage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="about-visible">Show About Section</Label>
                  <Switch
                    id="about-visible"
                    checked={localSections.about?.is_visible ?? true}
                    onCheckedChange={(checked) => updateSection("about", { is_visible: checked })}
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Section Title</Label>
                    <Input
                      value={localSections.about?.title || ""}
                      onChange={(e) => updateSection("about", { title: e.target.value })}
                      placeholder="What is CalorieVision?"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Section Subtitle</Label>
                    <Input
                      value={localSections.about?.subtitle || ""}
                      onChange={(e) => updateSection("about", { subtitle: e.target.value })}
                      placeholder="Learn More About Us"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Section Description</Label>
                    <Textarea
                      value={localSections.about?.description || ""}
                      onChange={(e) => updateSection("about", { description: e.target.value })}
                      placeholder="Enter section description"
                      rows={4}
                    />
                  </div>
                </div>

                {/* About Section Image */}
                <div className="space-y-2">
                  <Label>Section Image</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-40 h-24 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <Label htmlFor="about-image-upload" className="cursor-pointer">
                      <Button variant="outline" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Image
                        </span>
                      </Button>
                    </Label>
                    <input
                      id="about-image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, "about")}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FEATURES SECTION */}
          <TabsContent value="features">
            <Card>
              <CardHeader>
                <CardTitle>Features Section</CardTitle>
                <CardDescription>Configure the features section of your homepage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="features-visible">Show Features Section</Label>
                  <Switch
                    id="features-visible"
                    checked={localSections.features?.is_visible ?? true}
                    onCheckedChange={(checked) => updateSection("features", { is_visible: checked })}
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Section Title</Label>
                    <Input
                      value={localSections.features?.title || ""}
                      onChange={(e) => updateSection("features", { title: e.target.value })}
                      placeholder="Features"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Section Subtitle</Label>
                    <Input
                      value={localSections.features?.subtitle || ""}
                      onChange={(e) => updateSection("features", { subtitle: e.target.value })}
                      placeholder="What We Offer"
                    />
                  </div>
                </div>

                {/* Feature Items */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Feature Items</Label>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => localSections.features && addSectionItem(localSections.features.id)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Feature
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {sectionItems
                      .filter(item => item.section_id === localSections.features?.id)
                      .map((item, index) => (
                        <div key={item.id} className="p-4 border rounded-lg space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Feature {index + 1}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteSectionItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Title</Label>
                              <Input
                                value={item.title || ""}
                                onChange={(e) => updateSectionItem(item.id, { title: e.target.value })}
                                placeholder="Feature title"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Icon</Label>
                              <div className="flex gap-2">
                                <Input
                                  value={item.icon_url || ""}
                                  onChange={(e) => updateSectionItem(item.id, { icon_url: e.target.value })}
                                  placeholder="Icon URL or upload"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                              value={item.description || ""}
                              onChange={(e) => updateSectionItem(item.id, { description: e.target.value })}
                              placeholder="Feature description"
                              rows={2}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* HOW IT WORKS SECTION */}
          <TabsContent value="how-it-works">
            <Card>
              <CardHeader>
                <CardTitle>How It Works Section</CardTitle>
                <CardDescription>Configure the step-by-step guide section</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="how-it-works-visible">Show How It Works Section</Label>
                  <Switch
                    id="how-it-works-visible"
                    checked={localSections["how-it-works"]?.is_visible ?? true}
                    onCheckedChange={(checked) => updateSection("how-it-works", { is_visible: checked })}
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Section Title</Label>
                    <Input
                      value={localSections["how-it-works"]?.title || ""}
                      onChange={(e) => updateSection("how-it-works", { title: e.target.value })}
                      placeholder="How It Works"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Section Subtitle</Label>
                    <Input
                      value={localSections["how-it-works"]?.subtitle || ""}
                      onChange={(e) => updateSection("how-it-works", { subtitle: e.target.value })}
                      placeholder="Simple Steps"
                    />
                  </div>
                </div>

                {/* Step Items */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Steps</Label>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => localSections["how-it-works"] && addSectionItem(localSections["how-it-works"].id)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Step
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {sectionItems
                      .filter(item => item.section_id === localSections["how-it-works"]?.id)
                      .map((item, index) => (
                        <div key={item.id} className="p-4 border rounded-lg space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Step {index + 1}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteSectionItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Step Title</Label>
                              <Input
                                value={item.title || ""}
                                onChange={(e) => updateSectionItem(item.id, { title: e.target.value })}
                                placeholder="Step title"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Step Description</Label>
                              <Textarea
                                value={item.description || ""}
                                onChange={(e) => updateSectionItem(item.id, { description: e.target.value })}
                                placeholder="Step description"
                                rows={2}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Step Image</Label>
                              <div className="flex items-center gap-4">
                                {item.image_url ? (
                                  <div className="relative w-24 h-24 bg-muted rounded-lg overflow-hidden">
                                    <img 
                                      src={item.image_url} 
                                      alt={`Step ${index + 1}`} 
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CTA SECTION */}
          <TabsContent value="cta">
            <Card>
              <CardHeader>
                <CardTitle>Call to Action Section</CardTitle>
                <CardDescription>Configure the CTA section of your homepage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="cta-visible">Show CTA Section</Label>
                  <Switch
                    id="cta-visible"
                    checked={localSections.cta?.is_visible ?? true}
                    onCheckedChange={(checked) => updateSection("cta", { is_visible: checked })}
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>CTA Title</Label>
                    <Input
                      value={localSections.cta?.title || ""}
                      onChange={(e) => updateSection("cta", { title: e.target.value })}
                      placeholder="Get Started Today"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>CTA Description</Label>
                    <Textarea
                      value={localSections.cta?.description || ""}
                      onChange={(e) => updateSection("cta", { description: e.target.value })}
                      placeholder="Start analyzing your meals with AI-powered calorie estimation."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>CTA Button Text</Label>
                      <Input
                        value={(localSections.cta?.metadata as any)?.button_text || ""}
                        onChange={(e) => updateSection("cta", { 
                          metadata: { 
                            ...(localSections.cta?.metadata || {}), 
                            button_text: e.target.value 
                          } 
                        })}
                        placeholder="Start Now"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>CTA Button Link</Label>
                      <Input
                        value={(localSections.cta?.metadata as any)?.button_link || ""}
                        onChange={(e) => updateSection("cta", { 
                          metadata: { 
                            ...(localSections.cta?.metadata || {}), 
                            button_link: e.target.value 
                          } 
                        })}
                        placeholder="/analyze"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FOOTER SECTION */}
          <TabsContent value="footer">
            <Card>
              <CardHeader>
                <CardTitle>Footer Settings</CardTitle>
                <CardDescription>Configure the footer section</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-base font-medium">Footer Logo</Label>
                  {localSiteSettings.footer_logo_url ? (
                    <div className="flex items-center gap-4">
                      <div className="relative w-40 h-20 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                        <img 
                          src={localSiteSettings.footer_logo_url} 
                          alt="Footer Logo" 
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Label htmlFor="footer-logo-replace-tab" className="cursor-pointer">
                          <Button variant="outline" size="sm" asChild>
                            <span>
                              <Upload className="h-4 w-4 mr-2" />
                              Replace
                            </span>
                          </Button>
                        </Label>
                        <input
                          id="footer-logo-replace-tab"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleLogoUpload(e, "footer")}
                        />
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteLogo("footer")}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="w-40 h-20 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <Label htmlFor="footer-logo-upload-tab" className="cursor-pointer">
                        <Button variant="outline" asChild disabled={uploadingImage === "footer"}>
                          <span>
                            <Upload className="h-4 w-4 mr-2" />
                            {uploadingImage === "footer" ? "Uploading..." : "Upload Logo"}
                          </span>
                        </Button>
                      </Label>
                      <input
                        id="footer-logo-upload-tab"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleLogoUpload(e, "footer")}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Floating Save Button */}
        {hasChanges && (
          <div className="fixed bottom-6 right-6 z-50">
            <Button
              size="lg"
              onClick={saveAllChanges}
              disabled={isSaving}
              className="shadow-lg"
            >
              <Save className="h-5 w-5 mr-2" />
              {isSaving ? "Saving..." : "Save All Changes"}
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the media item and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (itemToDelete) {
                  handlePermanentDelete(itemToDelete.id, itemToDelete.mediaUrl || '');
                }
                setDeleteConfirmOpen(false);
                setItemToDelete(null);
              }}
            >
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
